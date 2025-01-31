import { asyncErrorHandler } from "../../errors/asynHandler.error.js";
import jwt from 'jsonwebtoken'
import { Users } from "../../models/users.models.js";
import { ErrorHandler } from "../../errors/errorHandler.errors.js";
export const isLoggedIn = asyncErrorHandler(async (req , res , next) => {
    const token = req.cookies.token;

    if(!token) return next(new ErrorHandler("please login first !" , 401))

    try {
        const decodeData = jwt.verify(token , process.env.JWT_SECRET);
        const userData = await Users.findById(decodeData.id)
        if(!userData) return next(new ErrorHandler("Please send valid token !",404))
        req.user = userData;
        next();
    } catch (error) {
        return next(new ErrorHandler("please login to access this resource !",402))
    }
})