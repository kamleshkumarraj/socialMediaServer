import { asyncErrorHandler } from "../../errors/asynHandler.error.js";
import { Followers } from "../../models/followers.models.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const followId = asyncErrorHandler(async (req, res, next) => {
    const following = req.user.id;
    const followers = req.params.id;

    await Followers.create({following , follower : followers});

    sendResponse({res , status : 201 , data : null , message : 'Followed successfully !'})
})