import mongoose, { isValidObjectId } from "mongoose";
import { asyncErrorHandler } from "../../errors/asynHandler.error.js";
import { ErrorHandler } from "../../errors/errorHandler.errors.js";
import { Posts } from "../../models/posts.models.js";
import {
  removeFile,
  uploadFilesOnCloudinary,
} from "../../utils/cloudinary.utils.js";
import { sendResponse } from "../../utils/sendResponse.js";

//this function act as helper function for find post query
const findPostQuery = ({ match, limit, skip }) => {
  return [
    {
      $match: {
        ...match,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "creatorDetails",
        pipeline: [
          {
            $project: {
              _id: 1,
              creatorName: { $concat: ["$firstname", " ", "$lastname"] },
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "postId",
        as: "comments",
      },
    },
    {
      $unwind: "$creatorDetails",
    },
    {
      $project: {
        comments: 1,
        creatorDetails: 1,
        content: 1,
        _id: 1,
        createdAt: 1,
        updatedAt: 1,
        images: 1,
        like: 1,
        share: 1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ];
};

export const createPost = asyncErrorHandler(async (req, res, next) => {
  console.log("Create post is running !");
  const imageFile = req.file;
  if (!imageFile)
    return next(new ErrorHandler("Thumbnail is required for post !", 400));

  const { success, results, error } = await uploadFilesOnCloudinary({
    files: [imageFile],
    folder: "socialMedia",
  });

  if (!success)
    return next(
      new ErrorHandler(
        error.message || "Error while uploading the thumbnail !",
        400
      )
    );

  const image = { publicId: results[0].public_id, url: results[0].url };
  const post = await Posts.create({
    creator: req.user.id,
    images: image,
    ...req.body,
  });

  await removeFile({ files: [imageFile] });

  // sendResponse({res , status : 201 , data : post , message : 'Post created successfully !'})
  res.status(200).json({
    success: true,
    message: "Post created successfully !",
    data: post,
  });
});

export const deletePost = asyncErrorHandler(async (req, res, next) => {
  const postId = req.params.id;
  // check given post id is valid or not.
  if (isValidObjectId(postId))
    return next(new ErrorHandler("please send valid post id !", 404));

  const post = await Posts.findById(postId);
  if (!post) return next(new ErrorHandler("please send valid post id !", 404));

  // check given post is created by logged in user or not.
  if (post.creator.toString() !== req.user.id)
    return next(
      new ErrorHandler("you are not allowed to delete this post !", 403)
    );

  const { success, error } = await removeMultipleFileFromCloudinary({
    files: [post.images],
  });
  if (!success)
    return next(
      new ErrorHandler(error.message || "Error while deleting the post !", 400)
    );

  await Posts.findByIdAndDelete(postId);

  sendResponse({
    res,
    status: 200,
    data: null,
    message: "Post deleted successfully !",
  });
});

export const getPosts = asyncErrorHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.params;
  const skip = (page - 1) * limit;
  const [allPosts] = await Posts.aggregate(
    [
    {
      $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "creatorDetails",
        pipeline: [
          {
            $project: {
              _id: 1,
              creatorName: { $concat: ["$firstname", " ", "$lastname"] },
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "postId",
        as: "comments",
        pipeline : [
          {
            $addFields : {
              commentCounts : {$size : "$comment"}
            }
          },
          {
            $project : {
              commentCounts : 1,
              _id : 0
            }
          }
      ]
      },
    },
    {
      $unwind: {
        path : "$creatorDetails",
        preserveNullAndEmptyArrays : true
      },
    },
    {
      $project: {
        commentsCounts : {$sum : "$comments.commentCounts"},
        creatorDetails: 1,
        content: 1,
        _id: 1,
        createdAt: 1,
        updatedAt: 1,
        images: 1,
        likesCounts : {$size : "$reactions"},
        sharesCount: {$sum : "$shares.count"},
      },
    },
    {
      $facet: {
        allPosts: [
          {
            $match: {},
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
        ],
        myCreatedPost: [
          {
            $match: { "creatorDetails._id" : new mongoose.Types.ObjectId(req?.user?.id) },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
        ],
      },
    },
  ]);
  sendResponse({
    res,
    status: 200,
    data: allPosts,
    message: "Posts fetched successfully !",
  });
});

export const getSinglePost = asyncErrorHandler(async (req, res, next) => {
  const postId = req.params.id;
  // check given post id is valid or not.
  if (!isValidObjectId(postId))
    return next(new ErrorHandler("please send valid post id !", 404));

  const post = await Posts.aggregate(
    findPostQuery({
      match: { _id: new mongoose.Types.ObjectId(postId) },
      skip: 0,
      limit: 1,
    })
  );

  sendResponse({
    res,
    status: 200,
    data: post,
    message: "Post fetched successfully !",
  });
});
