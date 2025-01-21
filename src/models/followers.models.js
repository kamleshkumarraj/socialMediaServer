import mongoose from "mongoose"

const followerSchema = new mongoose.Schema({
    follow : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    followedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    }
} , {timestamps : true})    

export const Followers = mongoose.model('Follower' , followerSchema)