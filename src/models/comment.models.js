import mongoose from "mongoose";



const commentSchema = new mongoose.Schema({
    creator : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    comment : [{
        content : {
            type : String
        },
        reply : [{
            creator : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "user"
            },
            replyComment : []
        }]
    }]
})

export const Comments = mongoose.model('Comment' , commentSchema) 