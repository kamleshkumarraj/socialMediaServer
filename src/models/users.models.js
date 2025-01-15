import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    firstname : {
        type : String,
        required  :[true , "please enter firstname"],
        minlength : [3 , "firstname must be at least 3 characters"]
    },
    lastname : {
        type : String,
        required :   [true , "please enter lastname"],
        minlength : [3 , "lastname must be at least 3 characters"]
    },
    username : {
        type  :String,
        required : [true , "please enter username"],
        unique : [true , "username must be unique"],
        minlength : [3 , "username must be at least 3 characters"]
    },
    email : {
        type: String,
        required: true,
        unique: [true,"email must be unique"],
        match: /^\S+@\S+\.\S+$/,
        lowercase: true, 
        
    },
    password : {
        type : String,
        minlength : [8 , "password must be at least 8 characters"],
        required : [true , "password must be required"],
        select : false
    },
    avatar : {
        public_id : {
            type : String,
            required : ['true' , "please enter public_id"],
            default : 'jndkjwbe7gwf8g7tcg6r6cf'
        },
        url : {
            type : String,
            required : ['true' , "please enter url"],
            default : 'https://myImage/image.png'
        }
    },
    roles : {
        type : String,
        default : 'user'
    },
    resetPasswordTocken : String,
    resetPasswordExpiry : Date
},{timestamps : true})

// method for bcrypt the password if password is changed.
userSchema.pre('save' , async function(next){
    if(!this.isModified('password')){
        return next()
    }
    this.password = await bcrypt.hash(this.password , 10)
})

//method for creating new jwt token
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id : this._id},process.env.JWT_SECRET , {
        expiresIn : process.env.JWT_EXPIRE
    })
}

// Method for comparing the password in hash form.
userSchema.methods.passwordCompare = async function(password){
    let status =  await bcrypt.compare(password , this.password)
    return status;
}

//method for generating resetPassword token.

userSchema.methods.generateResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString("hex")

    const hashResetToken = crypto.createHash('sha256').update(resetToken).digest("hex")

    this.resetPasswordToken = hashResetToken;
    this.resetPasswordExpiry = Date.now() + 15*60*1000;

    return resetToken;
}

export const users = mongoose.model('user' , userSchema)



