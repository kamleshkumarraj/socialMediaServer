import { Mongoose } from "mongoose";
import { asyncErrorHandler } from "../../errors/asynHandler.error.js";
import { Notifications } from "../../models/notifications.model.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const createNotifications = asyncErrorHandler(async (req, res, next) => {
    const {sender = req.uer.id , receiver , notificationMessage , notificationType} = req.body;

    const notifications = await Notifications.create({sender , receiver
    , notificationType, notificationMessage});

    sendResponse({res, status : 201 , data : notifications , message : 'Notifications created successfully !'})
})

export const deleteNotifications = asyncErrorHandler(async (req, res, next) => {
    const notificationsId = req.params.id;

    if(Mongoose.isValidObjectId(notificationsId) == false) return next(new ErrorHandler("Please send valid notifications id !", 400));

    await Notifications.findByIdAndDelete(notificationsId);

    sendResponse({res, status : 200 , data : null , message : 'Notifications deleted successfully !'})
})

export const getMyNotifications = asyncErrorHandler(async (req, res, next) => {
    const myNotifications = await Notifications.find({receiver : req.user.id});

    sendResponse({res, status : 200 , data : myNotifications , message : 'Notifications fetched successfully !'})
})