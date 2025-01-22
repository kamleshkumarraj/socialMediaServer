import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    sender : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    receiver : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    notificationMessage : {
        type : String,

    },
    notificationType : {
        type : String,
        enum : ["like" , "comment" , "post" , "follow" , "users"],
        default : "like"
    }

})

export const Notifications = mongoose.model('Notification' , notificationSchema);