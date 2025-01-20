import { asyncErrorHandler } from "../../errors/asynHandler.error.js";
import jwt from 'jsonwebtoken';
import { ErrorHandler } from "../../errors/errorHandler.errors.js";

export const directLogin = asyncErrorHandler(async (req, res, next) => {
    const {token} = req.cookies;
    if(!token) return next(new ErrorHandler("Please login to access this resource !",402))
    
    try {
        const decodeData = jwt.verify(token , process.env.JWT_SECRET);
        const userData = await Users.findById(decodeData.id)
        if(!userData) return next(new ErrorHandler("Please send valid token !",404))
        res.json({
            success : true,
            data : userData,
            message : "User logged in successfully."
        })
    } catch (error) {
        return next(new ErrorHandler("Please login to access this resource !",402))
    }
})