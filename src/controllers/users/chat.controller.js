import { asyncErrorHandler } from "../../errors/asynHandler.error.js";
import { Chats } from "../../models/chat.models.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const createGroupChat = asyncErrorHandler(async (req, res, next) => {
    const {sendMembers = [], creator, chatName} = req.body;

    const members = Set(sendMembers);

    if(creator != req.user.id.toString()) return next(new ErrorHandler("You are not allowed to create group chat !", 400));

    if(!members.includes(creator)) members.push(req.user.id)

    if(members.length < 3) return next(new ErrorHandler("Group chat should have atleast 3 members !", 400));

    await Chats.create({chatname : chatName , members , creator , groupChat : true});

    sendResponse({res , status : 201 , data : null , message : 'Group chat created successfully !'})
})

export const getMyChats = asyncErrorHandler(async (req, res, next) => {
    const myChats = await Chats.find({members : {$in : [req.user.id.toString()]}});

    sendResponse({res , status : 200 , data : myChats , message : 'My chats fetched successfully !'})
})

