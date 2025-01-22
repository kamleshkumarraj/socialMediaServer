import mongoose, { Types } from "mongoose";
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
    postId: postId,
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
      postId: postId,
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

  const existLike = await Comments.findOne({
    _id: commentId,
    comment: {
      $elemMatch: {
        _id: innerCommentId,
        like: { $elemMatch: { creator: req.user.id } },
      },
    },
  });

  if (existLike) {
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
        $set: { "comment.$.like.$[innerReply].likeType": likeType },
      },
      {
        arrayFilters: [{ "innerReply.creator": req.user.id }],
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

  sendResponse({
    res,
    data: null,
    message: "Like created successfully !",
    status: 200,
  });
});

export const replyComment = asyncErrorHandler(async (req, res, next) => {
  const { commentMessage, innerCommentId } = req.body;
  const commentId = req.params.id;
  if (mongoose.isValidObjectId(commentId) == false)
    return next(new ErrorHandler("Please send valid comment id !", 400));

  if (!commentMessage || !innerCommentId)
    return next(
      new ErrorHandler(
        "Please send comment message and inner comment id !",
        400
      )
    );

  const alreadyReplied = await Comments.findOne({
    _id: commentId,
    comment: {
      $elemMatch: {
        _id: innerCommentId,
        reply: { $elemMatch: { creator: req.user.id } },
      },
    },
  });

  if (alreadyReplied) {
    await Comments.updateOne(
      {
        _id: commentId,
        comment: {
          $elemMatch: {
            _id: innerCommentId,
            reply: { $elemMatch: { creator: req.user.id } },
          },
        },
      },
      {
        $push: { "comment.$.reply.$[innerReply].replyComment": commentMessage },
      },
      {
        arrayFilters: [{ "innerReply.creator": req.user.id }],
      }
    );
  } else {
    await Comments.updateOne(
      { _id: commentId, "comment._id": innerCommentId },
      {
        $push: {
          "comment.$.reply": {
            creator: req.user.id,
            replyComment: commentMessage,
          },
        },
      }
    );
  }
  sendResponse({
    res,
    data: null,
    message: "Reply created successfully !",
    status: 200,
  });
});

export const getTotalLikesDetailsForPost = asyncErrorHandler(
  async (req, res, next) => {
    const postId = req.params.id;

    if (mongoose.isValidObjectId(postId) == false)
      return next(new ErrorHandler("Please send valid post id !", 400));

    const totalLikesDetails = await Posts.aggregate([
      { $match: { _id: new Types.ObjectId(postId) } },
      {
        $unwind: "$reactions",
      },
      {
        $lookup: {
          from: "users",
          localField: "reactions.creator",
          foreignField: "_id",
          as: "likeCreator",
          pipeline: [
            {
              $project: {
                name: { $concat: ["$firstname", " ", "$lastname"] },
                avatar: "$avatar.url",
                username: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$likeCreator",
      },
      {
        $group: {
          _id: "$reactions.reactionType",
          count: { $sum: 1 },
          likeCreator: { $push: "$likeCreator" },
        },
      },
      {
        $project: {
          _id: 0,
          likeCreator: 1,
          reactions: "$_id",
          count: 1,
        },
      },
    ]);
    sendResponse({
      res,
      data: totalLikesDetails,
      status: 200,
      message: "Total likes details fetched successfully !",
    });
  }
);

export const getTotalSharesForPost = asyncErrorHandler(async (req, res, next) => {
  const {id : postId} = req.params;
  if(!mongoose.isValidObjectId(postId)) return next(new ErrorHandler("Please send valid post id !", 400));

  const totalShares = await Posts.aggregate([
    {
      $match : {_id : new Types.ObjectId(postId)}
    },
    {
      $unwind : "$shares"
    },
    {
      $lookup : {
        from : 'users',
        localField : "shares.creator",
        foreignField : "_id",
        as : "shareCreator",
        pipeline : [
          {$project : {
            name : {$concat : ["$firstname", " ", "$lastname"]},
            avatar : "$avatar.url",
            username : 1
          }}
        ]
      }
    },
    {
      $project : {
        _id : 0,
        shareDetails : 1,
        count : {$sum : "$shares.count"}
      }
    }
  ])
})
