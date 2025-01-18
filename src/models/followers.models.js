import mongoose from "mongoose"

const followerSchema = new mongoose.Schema({
    follower : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    following : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    }
} , {timestamps : true})    

export const Followers = mongoose.model('Follower' , followerSchema)