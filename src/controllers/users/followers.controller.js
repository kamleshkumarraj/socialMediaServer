import { asyncErrorHandler } from "../../errors/asynHandler.error.js";
import { emit } from "../../helper/emt.js";
import { Chats } from "../../models/chat.models.js";
import { Followers } from "../../models/followers.models.js";
import { Users } from "../../models/users.models.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const followId = asyncErrorHandler(async (req, res, next) => {
    const followedBy = req.user.id;
    const follow = req.params.id;
    const followersDetails = await Users.findById(follow)
    await Followers.create({followedBy , follow});

    emit({message : `${req.user.username} follow you ` , members : [follow] , req})

    //now we write code for creating chat between these users!
    const chatMessage = {
        chatname : `${req.user.username} - ${followersDetails.username}`,
        creator : req.user.id,
        members : [follow , followedBy],
        groupChat : false
    }

    await Chats.create(chatMessage);

    sendResponse({res , status : 201 , data : null , message : 'Followed successfully !'});
})

export const unFollowId = asyncErrorHandler(async (req, res, next) => {
    const followedBy = req.user.id;
    const follow = req.params.id;

    await Followers.deleteOne({followedBy , follow});

    sendResponse({res , status : 200 , data : null , message : 'Unfollowed successfully !'})
})

