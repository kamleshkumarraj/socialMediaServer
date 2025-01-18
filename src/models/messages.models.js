import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    chatId : {
        type : mongoose.Schema.ObjectId,
        ref : "Chat"
    },
    sender : {
        type : mongoose.Schema.ObjectId,
        ref : "user"
    },
    receiver : {
        type : mongoose.Schema.ObjectId,
        ref : "user"
    },
    content : {
        type : String,
        required : [true , "message must be required !"]
    },
    attachments : [{
        url : {
            type : String,
            required : [true , "attachment url must be required !"]
        },
        publicId : {
            type : String,
            required : [true , "attachment publicId must be required !"]
        }
    }]
})

export const Messages = mongoose.model("Message" , messageSchema)