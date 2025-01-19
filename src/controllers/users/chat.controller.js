import mongoose from "mongoose";
import { asyncErrorHandler } from "../../errors/asynHandler.error.js";
import { Chats } from "../../models/chat.models.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const createGroupChat = asyncErrorHandler(async (req, res, next) => {
  const { sendMembers = [], creator, chatName } = req.body;

  const members = Set(sendMembers);

  if (creator != req.user.id.toString())
    return next(
      new ErrorHandler("You are not allowed to create group chat !", 400)
    );

  if (!members.includes(creator)) members.push(req.user.id);

  if (members.length < 3)
    return next(
      new ErrorHandler("Group chat should have atleast 3 members !", 400)
    );

  await Chats.create({ chatname: chatName, members, creator, groupChat: true });

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
    member: chat?.members?.map((member) => ({
      _id: member._id,
      name: member.firstname + " " + member.lastname,
    })),
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
      member : chat.members
    };
  });

  sendResponse({res , data : transformData , status : 200 , message : 'My chats fetched successfully !'})
});

export const getMyCreatedChats = asyncErrorHandler(async (req, res, next) => {
    const myChats = await Chats.find({creator : req.user.id}).populate('members' , 'firstname lastname avatar');
    const secondMember = (chat) => chat.members.find(member => member._id.toString() != req.user.id.toString())
    const transformData = myChats.map(chat => ({
        _id : chat._id,
        chatName : chat.groupChat ? chat.chatname : secondMember()?.firstname + " " + secondMember()?.lastname,
        groupChat : chat.groupChat,
        creator : chat.creator,
        avatar : chat.groupChat ?  chat?.members?.map(member => member?.avatar?.url) : secondMember(chat.members)?.avatar?.url,
        member : chat.members
    })) 
});

export const leaveGroupChat = asyncErrorHandler(async (req, res, next) => {
    const chatId = req.params.id 

    // check sending groupChat id is valid or not.
    if(mongoose.isValidObjectId(chatId) === false) return next(new ErrorHandler('Please send valid chat id !' , 400))

    const chat = await Chats.findById(chatId);

    if(chat.groupChat === false) return next(new ErrorHandler('You can not leave private chat !' , 400));

    if(chat.members.length < 3) return next(new ErrorHandler('You can not leave group chat because it should have atleast 3 members !' , 400))

    chat.members = chat.members.filter(member => member.toString() !== req.user.id.toString())

    if(chat.creator.toString() === req.user.id.toString()) chat.creator = chat.members[0];

    await chat.save();

    sendResponse({res , status : 200 , data : null , message : 'Group chat left successfully !'})
})
