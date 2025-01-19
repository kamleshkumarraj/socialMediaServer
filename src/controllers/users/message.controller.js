import mongoose from "mongoose";
import { asyncErrorHandler } from "../../errors/asynHandler.error.js";
import { ErrorHandler } from "../../errors/errorHandler.errors.js";
import { Messages } from "../../models/messages.models.js";
import { removeFile, removeMultipleFileFromCloudinary, uploadFilesOnCloudinary } from "../../utils/cloudinary.utils";
import { sendResponse } from "../../utils/sendResponse.js";

export const createMessage = asyncErrorHandler(async (req, res, next) => {
    const {chatId , content , attachments = [] , members = []} = req.body;
    
    const sendingMembers = members.filter(member => member.toString() !== req.user.id.toString()) 

    await Messages.create({chatId , sender : req.user.id , receiver : sendingMembers , content , attachments})

    sendResponse({res , status : 200 , data : null , message : 'Message sent successfully !'})
})

export const sendAttachment = asyncErrorHandler(async (req, res, next) => {
    const {chatId , members = [], content} = req.body;

    const attachmentsFile = req.files || [];

    if(attachments.length < 1 && attachments.length > 5) return next(new ErrorHandler("You can not send more than 5 attachments less than 1 attachments !",400))

    
    const {success, results, error} = await uploadFilesOnCloudinary({files : attachmentsFile})
    if(!success) return next(new ErrorHandler(error.message || "Error while uploading the attachments !",400))

    const attachmentForDB = results.map(result => ({publicIid : result.public_id , url : result.url}))

    const dbMessage = {
        chatId : chatId,
        sender : req.user.id,
        receiver : members,
        content : content,
        attachments : attachmentForDB
    }

    const messageWithAttachment = await Messages.create(dbMessage);
    await removeFile({files : attachmentsFile})

    sendResponse({res , status : 200 , data : messageWithAttachment , message : 'Message sent successfully !'})
})

export const deleteMessage = asyncErrorHandler(async (req, res, next) => {
    const messageId = req.params.id;

    if(mongoose.isValidObjectId(messageId) == false) return next(new ErrorHandler('Please send valid message id !' , 400))

    const message = await Messages.findById(messageId);

    if(message.attachments.length > 0){
        const attachments = message.attachments;
        const {success , error} = await removeMultipleFileFromCloudinary({files : attachments})

        if(!success) return next(new ErrorHandler(error.message || 'Error while deleting the attachments !' , 400))
    }

    await Messages.findByIdAndDelete(messageId);

    sendResponse({res , status : 200 , data : null , message : 'Message deleted successfully !'})

    
})
