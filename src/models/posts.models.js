import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    creator : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    content : {
        type : String,
        required : [true, "Content is required"],
        max : [200, "Content must be at most 200 characters long"],
        min : [10, "Content must be at least 10 characters long"]
    },
    reactions : [
        {
            creator : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "user"
            },
            reactionType : {
                type : String,
                enum : ["like" , "unlike"],
                default : "unlike"
            }
        }
    ],
    
    shares : [{
        creator : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "user"
        },
        count : {
            type : Number,
            default : 1
        }
    }],
    comments : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Comment"
    },
    images : {
        publicId : {
            type : String,
            required : [true, "Public ID is required"],
        },
        url : {
            type : String,
            required : [true, "URL is required"],
        }
    },
    visibility : {
        type : String,
        enum : ["public" , "private"],
        default : "public"
    },
    views : [{
        creator : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    }]

    
},{timestamps : true})


export const Posts = mongoose.model('Post' , postSchema)