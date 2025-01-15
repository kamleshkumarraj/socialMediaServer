import { asyncErrorHandler } from "../../errors/asynHandler.error.js";
import { ErrorHandler } from "../../errors/errorHandler.errors.js";
import { users } from "../../models/users.models.js";
import { loginWithJWT } from "../../utils/login.js";

export const login = asyncErrorHandler(async (req , res , next) => {
    const {email , password} = req.body;
    if(!email || !password) return next(new ErrorHandler("please enter email and password" , 400))

    const user = await users.findOne({$or : [{ email : email} , {username : email}]}).select("+password")

    if(!user) return next(new ErrorHandler("Invalid email or password" , 400))

    if(!(await user.passwordCompare(password))) return next(new ErrorHandler("Invalid email or password !" , 400))

    loginWithJWT({res , user})

})