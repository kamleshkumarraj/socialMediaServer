import mongoose from "mongoose";
import { asyncErrorHandler } from "../../errors/asynHandler.error.js";
import { Posts } from "../../models/posts.models.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { Comments } from "../../models/comment.models.js";
import { ErrorHandler } from "../../errors/errorHandler.errors.js";

export const createReactions = asyncErrorHandler(async (req, res, next) => {
  const postId = req.params.id;
  const reactions = req.body.reactions || "like";

  if (mongoose.isValidObjectId(postId) == false)
    return next(new ErrorHandler("Please send valid post id !", 400));

  const post = await Posts.findById(postId);

  if (!post) return next(new ErrorHandler("Please send valid post id !", 400));

  if (
    post.reactions.find(
      (reaction) => reaction.creator.toString() == req.user.id.toString()
    )
  ) {
    await Posts.updateOne(
      { _id: postId, reactions: { $elemMatch: { creator: req.user.id } } },
      { $set: { "reactions.$.reactionType": reactions } }
    );
  } else {
    await Posts.updateOne(
      { _id: postId },
      {
        $push: { reactions: { creator: req.user.id, reactionType: reactions } },
      }
    );
  }

  sendResponse({
    res,
    status: 200,
    data: null,
    message: "Reaction created successfully !",
  });
});

export const createShare = asyncErrorHandler(async (req, res, next) => {
  const postId = req.params.id;
  if (mongoose.isValidObjectId(postId) == false)
    return next(new ErrorHandler("Please send valid post id !", 400));

  const post = await Posts.findById(postId);

  if (!post) return next(new ErrorHandler("Please send valid post id !", 400));

  if (
    post.shares.find(
      (share) => share.creator.toString() == req.user.id.toString()
    )
  ) {
    await Posts.updateOne(
      { _id: postId, shares: { $elemMatch: { creator: req.user.id } } },
      { $set: { $inc: { "shares.$.count": 1 } } }
    );
  } else {
    await Posts.updateOne(
      { _id: postId },
      { $push: { shares: { creator: req.user.id, count: 1 } } }
    );
  }

  sendResponse({
    res,
    status: 200,
    data: null,
    message: "Share created successfully !",
  });
});

export const createComment = asyncErrorHandler(async (req, res, next) => {
  const { commentMessage } = req.body;

  const postId = req.params.id;

  if (mongoose.isValidObjectId(postId) == false)
    return next(new ErrorHandler("Please send valid post id !", 400));

  const existComment = await Comments.findOne({
    creator: req.user.id,
    post: postId,
  });

  if (existComment) {
    await Comments.updateOne(
      {
        _id: existComment._id,
      },
      {
        $push: { comment: { content: commentMessage, reply: [], like: [] } },
      }
    );
  } else {
    await Comments.create({
      creator: req.user.id,
      comment: { content: commentMessage, reply: [], like: [] },
      post: postId,
    });
  }

  sendResponse({
    res,
    data: null,
    message: "Comment created successfully !",
    status: 200,
  });
});

export const deleteComment = asyncErrorHandler(async (req, res, next) => {
  const commentId = req.params.id;

  if (mongoose.isValidObjectId(commentId) == false)
    return next(new ErrorHandler("Please send valid comment id !", 400));

  const comment = await Comments.findById(commentId);

  if (comment.creator.toString() != req.user.id)
    return next(
      new ErrorHandler(
        "You are not allowed to delete comment of other person !",
        401
      )
    );

  await Comments.findByIdAndDelete(commentId);

  sendResponse({
    res,
    status: 200,
    data: null,
    message: "Comment deleted successfully !",
  });
});

export const likeAComment = asyncErrorHandler(async (req, res, next) => {
  const commentId = req.params.id;
  const innerCommentId = req.body.innerCommentId;
  const likeType = req.body.likeType;

  if (mongoose.isValidObjectId(commentId) == false)
    return next(new ErrorHandler("Please send valid comment id !", 400));

  const comment = await Comments.findById(commentId);

  if (
    comment.comment.find((comm) => {
      return comm.like.find((like) => {
        return like.creator.toString() == req.user.id.toString();
      });
    })
  ) {
    await Comments.updateOne(
      {
        _id: commentId,
        comment: {
          $elemMatch: {
            _id: innerCommentId,
            like: { $elemMatch: { creator: req.user.id } },
          },
        },
      },
      {
        $set: { "comment.$.like.$.likeType": likeType },
      }
    );
  } else {
    await Comments.updateOne(
      { _id: commentId, "comment._id": innerCommentId },
      {
        $push: {
          "comment.$.like": { creator: req.user.id, likeType: likeType },
        },
      }
    );
  }
});
