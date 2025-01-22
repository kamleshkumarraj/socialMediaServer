// Import required modules and utilities
import mongoose, { Types } from "mongoose";
import { asyncErrorHandler } from "../../errors/asynHandler.error.js";
import { Posts } from "../../models/posts.models.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { Comments } from "../../models/comment.models.js";
import { ErrorHandler } from "../../errors/errorHandler.errors.js";

// Controller to create or update reactions for a post
export const createReactions = asyncErrorHandler(async (req, res, next) => 
  {
  const postId = req.params.id; // Get post ID from request parameters
  const reactions = req.body.reactions || "like"; // Default reaction is 'like' if none provided

  // Validate post ID
  if (mongoose.isValidObjectId(postId) == false)
    return next(new ErrorHandler("Please send valid post id !", 400));

  // Check if post exists
  const post = await Posts.findById(postId);
  if (!post) return next(new ErrorHandler("Please send valid post id !", 400));

  // Check if user already reacted to the post
  if (
    post.reactions.find(
      (reaction) => reaction.creator.toString() == req.user.id.toString()
    )
  ) {
    // Update the reaction type if it exists
    await Posts.updateOne(
      { _id: postId, reactions: { $elemMatch: { creator: req.user.id } } },
      { $set: { "reactions.$.reactionType": reactions } }
    );
  } else {
    // Add a new reaction
    await Posts.updateOne(
      { _id: postId },
      {
        $push: { reactions: { creator: req.user.id, reactionType: reactions } },
      }
    );
  }

  // Send success response
  sendResponse({
    res,
    status: 200,
    data: null,
    message: "Reaction created successfully !",
  });
});

// Controller to create or update shares for a post
export const createShare = asyncErrorHandler(async (req, res, next) => {
  const postId = req.params.id; // Get post ID from request parameters

  // Validate post ID
  if (mongoose.isValidObjectId(postId) == false)
    return next(new ErrorHandler("Please send valid post id !", 400));

  // Check if post exists
  const post = await Posts.findById(postId);
  if (!post) return next(new ErrorHandler("Please send valid post id !", 400));

  // Check if user has already shared the post
  const alreadyShared = await Posts.findOne({
    _id: new Types.ObjectId(postId),
    shares: { $elemMatch: { creator: req.user.id } },
  });
  if (alreadyShared) {
    // Increment share count if already shared
    await Posts.updateOne(
      {
        _id: new Types.ObjectId(postId),
        shares: { $elemMatch: { creator: req.user.id } },
      },
      { $inc: { "shares.$.count": 1 } }
    );
  } else {
    // Add a new share record
    await Posts.updateOne(
      { _id: new Types.ObjectId(postId) },
      { $push: { shares: { creator: req.user.id, count: 1 } } }
    );
  }

  // Send success response
  sendResponse({
    res,
    status: 200,
    data: null,
    message: "Share created successfully !",
  });
});

// Controller to create a comment or update an existing one
export const createComment = asyncErrorHandler(async (req, res, next) => {
  const { commentMessage } = req.body; // Extract comment message from request body
  const postId = req.params.id; // Get post ID from request parameters

  // Validate post ID
  if (mongoose.isValidObjectId(postId) == false)
    return next(new ErrorHandler("Please send valid post id !", 400));

  // Check if user has already commented on the post
  const existComment = await Comments.findOne({
    creator: req.user.id,
    postId: postId,
  });

  if (existComment) {
    // Add a new comment to the existing comment thread
    await Comments.updateOne(
      {
        _id: existComment._id,
      },
      {
        $push: { comment: { content: commentMessage, reply: [], like: [] } },
      }
    );
  } else {
    // Create a new comment record
    await Comments.create({
      creator: req.user.id,
      comment: { content: commentMessage, reply: [], like: [] },
      postId: postId,
    });
  }

  // Send success response
  sendResponse({
    res,
    data: null,
    message: "Comment created successfully !",
    status: 200,
  });
});

// Controller to create views for a post
export const createViews = asyncErrorHandler(async (req, res, next) => {
  const { id: postId } = req.params; // Get post ID from request parameters

  // Validate post ID
  if (mongoose.isValidObjectId(postId) == false)
    return next(new ErrorHandler("Please send valid post id !", 400));

  // Check if post exists
  const post = await Posts.findById(postId);
  if (!post) return next(new ErrorHandler("Please send valid post id !", 400));

  // Check if user has already viewed the post
  const alreadyViewed = await Posts.findOne({
    _id: postId,
    views: { $elemMatch: { creator: req.user.id } },
  });

  // If already viewed, send success response
  if (alreadyViewed)
    return sendResponse({
      res,
      status: 200,
      data: null,
      message: "You have already viewed this post !",
    });

  // Add a new view record
  await Posts.updateOne(
    {
      _id: new Types.ObjectId(postId),
    },
    { $push: { views: { creator: req.user.id } } }
  );

  sendResponse({
    res,
    data: null,
    message: "View created successfully !",
    status: 200,
  });
});

// Controller to delete a comment
export const deleteComment = asyncErrorHandler(async (req, res, next) => {
  const commentId = req.params.id; // Get comment ID from request parameters

  // Validate comment ID
  if (mongoose.isValidObjectId(commentId) == false)
    return next(new ErrorHandler("Please send valid comment id !", 400));

  // Check if comment exists and belongs to the user
  const comment = await Comments.findById(commentId);
  if (comment.creator.toString() != req.user.id)
    return next(
      new ErrorHandler(
        "You are not allowed to delete comment of other person !",
        401
      )
    );

  // Delete the comment
  await Comments.findByIdAndDelete(commentId);

  // Send success response
  sendResponse({
    res,
    status: 200,
    data: null,
    message: "Comment deleted successfully !",
  });
});

// Controller to like or update a like on a comment
export const likeAComment = asyncErrorHandler(async (req, res, next) => {
  const commentId = req.params.id; // Get comment ID from request parameters
  const innerCommentId = req.body.innerCommentId; // Get inner comment ID from request body
  const likeType = req.body.likeType; // Get like type from request body

  // Validate comment ID
  if (mongoose.isValidObjectId(commentId) == false)
    return next(new ErrorHandler("Please send valid comment id !", 400));

  // Check if user already liked the comment
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
    // Update the like type
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
    // Add a new like
    await Comments.updateOne(
      { _id: commentId, "comment._id": innerCommentId },
      {
        $push: {
          "comment.$.like": { creator: req.user.id, likeType: likeType },
        },
      }
    );
  }

  // Send success response
  sendResponse({
    res,
    data: null,
    message: "Like created successfully !",
    status: 200,
  });
});

// Controller to reply to a comment
export const replyComment = asyncErrorHandler(async (req, res, next) => {
  const { commentMessage, innerCommentId } = req.body; // Extract data from request body
  const commentId = req.params.id; // Get comment ID from request parameters

  // Validate comment ID
  if (mongoose.isValidObjectId(commentId) == false)
    return next(new ErrorHandler("Please send valid comment id !", 400));

  // Ensure both comment message and inner comment ID are provided
  if (!commentMessage || !innerCommentId)
    return next(
      new ErrorHandler(
        "Please send comment message and inner comment id !",
        400
      )
    );

  // Check if user already replied to the comment
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
    // Update the existing reply
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
        $set: {
          "comment.$.reply.$[innerReply].content": commentMessage,
        },
      },
      {
        arrayFilters: [{ "innerReply.creator": req.user.id }],
      }
    );
  } else {
    // Add a new reply
    await Comments.updateOne(
      { _id: commentId, "comment._id": innerCommentId },
      {
        $push: {
          "comment.$.reply": { creator: req.user.id, content: commentMessage },
        },
      }
    );
  }

  // Send success response
  sendResponse({
    res,
    data: null,
    message: "Comment replied successfully !",
    status: 200,
  });
});


// Controller to get total likes for a post
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

// Controller to get total shares for a post
export const getTotalSharesForPost = asyncErrorHandler(
  async (req, res, next) => {
    const { id: postId } = req.params;
    if (!mongoose.isValidObjectId(postId))
      return next(new ErrorHandler("Please send valid post id !", 400));

    const [totalShares] = await Posts.aggregate([
      {
        $match: { _id: new Types.ObjectId(postId) },
      },
      {
        $unwind: "$shares",
      },
      {
        $lookup: {
          from: "users",
          localField: "shares.creator",
          foreignField: "_id",
          as: "shareCreator",
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
        $unwind: "$shareCreator",
      },

      {
        $facet: {
          totalShares: [
            {
              $project: {
                _id: 0,
                shareCreator: 1,
                count: { $sum: "$shares.count" },
              },
            },
          ],
          totalSharesCount: [
            {
              $group: {
                _id: null,
                total: { $sum: "$shares.count" },
              },
            },
            {
              $project: {
                _id: 0,
                totalSharesCount: "$total",
              },
            },
          ],
        },
      },
    ]);

    sendResponse({
      res,
      data: totalShares,
      status: 200,
      message: "Total shares fetched successfully !",
    });
  }
);

// Controller to get total views for a post
export const getTotalViewsForPost = asyncErrorHandler(
  async (req, res, next) => {
    const { id: postId } = req.params;
    if (!mongoose.isValidObjectId(postId))
      return next(new ErrorHandler("Please send valid post id !", 400));

    const [totalViews] = await Posts.aggregate([
      {
        $match: { _id: new Types.ObjectId(postId) },
      },
      {
        $unwind: "$views",
      },
      {
        $lookup: {
          from: "users",
          localField: "views.creator",
          foreignField: "_id",
          as: "viewCreator",
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
        $unwind: "$viewCreator",
      },

      {
        $facet: {
          totalViewsDetails: [
            {
              $project: {
                _id: 0,
                viewCreator: 1,
              },
            },
          ],
          totalViewsCount: [
            {
              $count: "totalCounts",
            },
            {
              $project: {
                _id: 0,
                totalViewsCount: "$totalCounts",
              },
            },
          ],
        },
      },
    ]);
    sendResponse({
      res,
      data: totalViews,
      status: 200,
      message: "Total views fetched successfully !",
    });
  }
);

// Controller for get total comments for a post