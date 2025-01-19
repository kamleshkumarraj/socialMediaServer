import { asyncErrorHandler } from "../../errors/asynHandler.error.js";
import { Posts } from "../../models/posts.models.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const createReactions = asyncErrorHandler(async (req, res, next) => {
  const postId = req.params.id;
  const reactions = req.body.reactions || "like";

  if (mongoose.isValidObjectId(postId) == false)
    return next(new ErrorHandler("Please send valid post id !", 400));

  const post = await Posts.findById(postId);

  if (!post) return next(new ErrorHandler("Please send valid post id !", 400));

  if (post.reactions.find((reaction) => reaction.creator.toString() == req.user.id.toString())) {
    await Posts.updateOne(
      { _id: postId, reactions: { $elemMatch: { creator: req.user.id } } },
      { $set: { "reactions.$.reactionType": reactions } }
    );
  }
  else {
    await Posts.updateOne(
      { _id: postId },
      { $push: { reactions: { creator: req.user.id, reactionType: reactions } } }
    );
  }

  sendResponse({res , status : 200 , data : null , message : 'Reaction created successfully !'})
});
