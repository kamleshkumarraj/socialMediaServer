import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    members : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    }],
    groupChat : {
        type : Boolean,
        default : false
    },
    creator : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    chatname : {
        type : String,
        required : [true , "chatname must be required !"]
    }
} , {timestamps : true})

export const Chats = mongoose.model('chat' , chatSchema )