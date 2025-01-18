import { isValidObjectId } from "mongoose";
import { asyncErrorHandler } from "../../errors/asynHandler.error.js";
import { ErrorHandler } from "../../errors/errorHandler.errors.js";
import { Posts } from "../../models/posts.models.js";
import {
  removeFile,
  uploadFilesOnCloudinary,
} from "../../utils/cloudinary.utils.js";
import { sendResponse } from "../../utils/sendResponse.js";

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

export const getMyPost = asyncErrorHandler(async (req, res, next) => {
  const myPost = await Posts.find({ creator: req.user.id }).sort({
    createdAt: -1,
  });

  sendResponse({
    res,
    status: 200,
    data: myPost,
    message: "Posts fetched successfully !",
  });
});

export const getAllPost = asyncErrorHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.params;
  const skip = (page - 1) * limit;
  const allPost = await Posts.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  sendResponse({
    res,
    status: 200,
    data: allPost,
    message: "Posts fetched successfully !",
  });
});

export const getSinglePost = asyncErrorHandler(async (req, res, next) => {
  const postId = req.params.id;
  // check given post id is valid or not.
  if (isValidObjectId(postId))
    return next(new ErrorHandler("please send valid post id !", 404));

  const post = await Posts.findById(postId);
  if (!post) return next(new ErrorHandler("please send valid post id !", 404));

  sendResponse({
    res,
    status: 200,
    data: post,
    message: "Post fetched successfully !",
  });
})