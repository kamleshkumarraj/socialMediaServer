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
        }],
        like : [{
            creator : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "user"
            },
            likeType : {
                type : String,
                enum : ["like" , "dislike" , "none"],
                default : "none"
            }
        }]
    }],
    postId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Posts"
    }
}, {timestamps : true})

export const Comments = mongoose.model('Comment' , commentSchema) 