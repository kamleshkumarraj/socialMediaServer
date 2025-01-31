import mongoose from "mongoose";
import { asyncErrorHandler } from "../../errors/asynHandler.error.js";
import { Chats } from "../../models/chat.models.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { Messages } from "../../models/messages.models.js";
import { removeMultipleFileFromCloudinary } from "../../utils/cloudinary.utils.js";
import { ErrorHandler } from "../../errors/errorHandler.errors.js";

export const createGroupChat = asyncErrorHandler(async (req, res, next) => {
  const { sendMembers = [], creator = req.user.id, chatName } = req.body;

  const members = new Set(sendMembers);
  
  if (creator != req.user.id.toString())
    return next(
      new ErrorHandler("You are not allowed to create group chat !", 400)
    );

  if (!members.has(creator.toString())) members.add(req.user.id);

  if (members.size < 3)
    return next(
      new ErrorHandler("Group chat should have atleast 3 members !", 400)
    );
  
  await Chats.create({ chatname: chatName, members : Array.from(members), creator, groupChat: true });

  sendResponse({
    res,
    status: 201,
    data: null,
    message: "Group chat created successfully !",
  });
});

export const getMyGroupChats = asyncErrorHandler(async (req, res, next) => {
  const myChats = await Chats.find({
    members: { $in: [req.user.id.toString()] },
    groupChat: true,
  }).populate("members", "firstname lastname avatar");

  const transformData = myChats.map((chat) => ({
    _id: chat._id,
    chatName: chat.chatname,
    groupChat: true,
    creator: chat.creator,
    avatar: chat?.members?.map((member) => member?.avatar?.url),
    member: chat.members.reduce((acc = [], curr) => { 
      return [...acc , curr.id] 
    } , []),
  }));

  sendResponse({
    res,
    status: 200,
    data: transformData,
    message: "My chats fetched successfully !",
  });
});

export const getMyChats = asyncErrorHandler(async (req, res, next) => {
  const myChats = await Chats.find({
    members: { $in: [req.user.id.toString()] },
    groupChat: false,
  }).populate("members", "firstname lastname avatar");
  const getSecondMember = (members = []) =>
    members.filter((member) => member._id.toString() != req.user.id.toString());

  const transformData = myChats.map((chat) => {
    const [secondMember] = getSecondMember(chat.members);
    return {
      _id: chat._id,
      chatName: secondMember?.firstname + " " + secondMember?.lastname,
      groupChat: false,
      creator: chat.creator,
      avatar: secondMember?.avatar?.url,
      member: chat.members.reduce((acc = [], curr) => { 
        return [...acc , curr.id] 
      } , []),
    };
  });

  sendResponse({
    res,
    data: transformData,
    status: 200,
    message: "My chats fetched successfully !",
  });
});

export const getMyCreatedChats = asyncErrorHandler(async (req, res, next) => {
  const myChats = await Chats.find({ creator: req.user.id }).populate(
    "members",
    "firstname lastname avatar"
  );
  const secondMember = (chat) =>
    chat.members.find(
      (member) => member._id.toString() != req.user.id.toString()
    );
  const transformData = myChats.map((chat) => ({
    _id: chat._id,
    chatName: chat.groupChat
      ? chat.chatname
      : secondMember()?.firstname + " " + secondMember()?.lastname,
    groupChat: chat.groupChat,
    creator: chat.creator,
    avatar: chat.groupChat
      ? chat?.members?.map((member) => member?.avatar?.url)
      : secondMember(chat.members)?.avatar?.url,
    member: chat.members.reduce((acc = [], curr) => { 
      return [...acc , curr.id] 
    } , []),
  }));
  sendResponse({res , data : transformData , message : "You get your created chat successfully." , status : 200})
});

export const leaveGroupChat = asyncErrorHandler(async (req, res, next) => {
  const chatId = req.params.id;

  // check sending groupChat id is valid or not.
  if (mongoose.isValidObjectId(chatId) === false)
    return next(new ErrorHandler("Please send valid chat id !", 400));

  const chat = await Chats.findById(chatId);

  if (chat.groupChat === false)
    return next(new ErrorHandler("You can not leave private chat !", 400));

  if (chat.members.length-1 < 3)
    return next(
      new ErrorHandler(
        "You can not leave group chat because it should have atleast 3 members !",
        400
      )
    );

  chat.members = chat.members.filter(
    (member) => member.toString() !== req.user.id.toString()
  );

  if (chat.creator.toString() === req.user.id.toString())
    chat.creator = chat.members[0];

  await chat.save();

  sendResponse({
    res,
    status: 200,
    data: null,
    message: "Group chat left successfully !",
  });
});

export const renameGroupName = asyncErrorHandler(async (req, res, next) => {
  const chatId = req.params.id;
  if(mongoose.isValidObjectId(chatId) === false)
    return next(new ErrorHandler("Please send valid chat id !", 400));
  const chat = await Chats.findById(chatId);

  if (chat.groupChat === false)
    return next(new ErrorHandler("You can not rename private chat !", 400));

  if (chat.creator.toString() !== req.user.id.toString())
    return next(
      new ErrorHandler("Only admin can change group chat name !", 400)
    );

  chat.chatname = req.body.chatName;

  await chat.save({ validateBeforeSave: false });

  sendResponse({
    res,
    status: 200,
    data: null,
    message: "Group chat name changed successfully !",
  });
});

export const removeGroupMember = asyncErrorHandler(async (req, res, next) => {
  const chatId = req.params.id;
  const memberId = req.body.memberId;

  // check sending groupChat id is valid or not.
  if (mongoose.isValidObjectId(chatId) === false)
    return next(new ErrorHandler("Please send valid chat id !", 400));

  const chat = await Chats.findById(chatId);
  if(!chat) return next(new ErrorHandler("Chat not found !", 404));
  if (chat.groupChat === false)
    return next(
      new ErrorHandler("You can not remove member from private chat !", 400)
    );

  if (chat.creator.toString() !== req.user.id.toString())
    return next(
      new ErrorHandler("Only admin can remove member from group chat !", 400)
    );

  chat.members = chat.members.filter(
    (member) => member.toString() !== memberId.toString()
  );

  if(memberId.includes(req.user.id.toString())){
    chat.creator = chat.members[0];
  }

  await chat.save({ validateBeforeSave: false });

  sendResponse({
    res,
    status: 200,
    data: null,
    message: "Member removed from group chat successfully !",
  });
});

export const addMemberInGroupChat = asyncErrorHandler(
  async (req, res, next) => {
    const chatId = req.params.id;
    const memberId = req.body.memberId || [];

    if(mongoose.isValidObjectId(chatId) === false) return next(new ErrorHandler("Please send valid chat id !", 400));
    const chat = await Chats.findById(chatId);

    if (chat.groupChat === false)
      return next(
        new ErrorHandler("You can not add member to private chat !", 400)
      );

    if (chat.creator.toString() !== req.user.id.toString())
      return next(
        new ErrorHandler("Only admin can add member to group chat !", 400)
      );

    if (chat.members.length + memberId.length > 100)
      return next(
        new ErrorHandler(
          "You can not add more than 100 members in group chat !",
          400
        )
      );

    const addableMember = [...chat.members.map((member) => member.toString()), ...memberId];
    const distinctMember = new Set(addableMember);
    console.log(distinctMember)
    chat.members = Array.from(distinctMember);
    await chat.save({ validateBeforeSave: false });
    sendResponse({
      res,
      status: 200,
      data: null,
      message: "Member added to group chat successfully !",
    });
  }
);

export const deleteChats = asyncErrorHandler(async (req, res, next) => {
  const chatId = req.params.id;
  if (mongoose.isValidObjectId(chatId) === false)
    return next(new ErrorHandler("Please send valid chat id !", 400));

  const chat = await Chats.findById(chatId);

  if (chat.groupChat) {
    if (chat.creator.toString() !== req.user.id.toString())
      return next(new ErrorHandler("Only admin can delete group chat !", 400));
  }

  const messages = await Messages.find({ chatId: chatId });

  if (messages.length > 0) {
    const attachments = messages.flatMap((message) => message.attachments);
    if (attachments.length > 0) {
      const { success, error } = await removeMultipleFileFromCloudinary({
        files: attachments,
      });

      if (!success)
        return next(
          new ErrorHandler(
            error.message || "Error while deleting the attachments !",
            400
          )
        );
    }
    await Messages.deleteMany({
      _id: { $in: messages.map((message) => message._id) },
    });
  }

  await Chats.findByIdAndDelete(chatId);
  sendResponse({
    res,
    status: 200,
    data: null,
    message: "Chat deleted successfully !",
  });
});
