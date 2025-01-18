import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    sender : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    receiver : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    status : {
        type : String,
        enum : ["pending" , "accepted" , "rejected"],
        default : "pending"
    },
    
} , {timestamps : true})