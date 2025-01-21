import mongoose, { Types } from "mongoose";
import { asyncErrorHandler } from "../../errors/asynHandler.error.js";
import { ErrorHandler } from "../../errors/errorHandler.errors.js";
import { Users } from "../../models/users.models.js";
import {
  removeFile,
  removeMultipleFileFromCloudinary,
  uploadFilesOnCloudinary,
} from "../../utils/cloudinary.utils.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const getBio = asyncErrorHandler(async (req, res, next) => {
  const myBio = await Users.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(req.user.id),
      },
    },
    // join the users and follower model and get followers
    {
      $lookup: {
        from: "followers",
        localField: "_id",
        foreignField: "follow",
        as: "Followers",
      },
    },
    // join the users and follower model and get following
    {
      $lookup: {
        from: "followers",
        localField: "_id",
        foreignField: "followedBy",
        as: "Following",
      },
    },

    //join the users from post and also get the post
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "creator",
        as: "posts",
        //after getting post we join the user for getting the creators details.
        pipeline: [
          // we get the creators details
          // {
          //   $lookup: {
          //     from: "users",
          //     localField: "creator",
          //     foreignField: "_id",
          //     as: "creatorDetails",
          //     pipeline: [
          //       {
          //         $project: {
          //           _id: 1,
          //           creatorName: { $concat: ["$firstname", " ", "$lastname"] },
          //           username: 1,
          //           avatar: 1,
          //         },
          //       },
          //     ],
          //   },
          // },
          // we get comments
          {
            $lookup: {
              from: "comments",
              localField: "_id",
              foreignField: "postId",
              as: "comments",
              pipeline: [
                {
                  $addFields: {
                    commentCounts: { $size: "$comment" },
                  },
                },
              ],
            },
          },
          // {
          //   $unwind: "$creatorDetails",
          // },
          // now we find the like count share count and comment count for a post.
          {
            $project: {
              _id: 1,
              // creatorDetails: 1,
              content: 1,
              images: 1,
              likesCount: { $size: "$reactions" },
              shareCount: { $size: "$shares" },
              viewsCount: { $size: "$views" },
              commentCount: { $sum: "$comments.commentCounts" },
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
      },
    },

    {
      $addFields: {
        followersSize: { $size: "$Followers" },
        followingSize: { $size: "$Following" },
      },
    },
    {
      $project: {
        followersSize: 1,
        followingSize: 1,
        firstname: 1,
        lastname: 1,
        email: 1,
        username: 1,
        avatar: 1,
        posts: 1,
        totalPost : { $size: "$posts" },
      },
    },
  ]);

  if (!myBio) return next(new ErrorHandler("please send valid user id !", 404));

  sendResponse({
    res,
    status: 200,
    data: myBio,
    message: "User bio fetched successfully !",
  });
});

export const updateBio = asyncErrorHandler(async (req, res, next) => {
  const content = req.body;
  const bio = await Users.findByIdAndUpdate(req.user.id, content, {
    new: true,
    runValidators: true,
  });

  if (!bio) return next(new ErrorHandler("please send valid user id !", 404));

  sendResponse({
    res,
    status: 200,
    data: bio,
    message: "User bio updated successfully !",
  });
});

export const updateBioAvatar = asyncErrorHandler(async (req, res, next) => {
  const imageFile = req.file;
  if (!imageFile)
    return next(
      new ErrorHandler("Thumbnail is required for bio avatar !", 400)
    );

  const { error, results, success } = await uploadFilesOnCloudinary({
    files: [imageFile],
    folder: "socialMedia",
  });

  if (!success) {
    await removeFile({ files: [imageFile] });
    return next(
      new ErrorHandler(
        error.message || "Error while uploading the thumbnail !",
        400
      )
    );
  }

  const image = { public_id: results[0].public_id, url: results[0].url };

  const { success: removeSuccess, error: removeError } =
    await removeMultipleFileFromCloudinary({ files: [req.user.avatar] });

  if (!removeSuccess) {
    await removeFile({ files: [imageFile] });
    return next(
      new ErrorHandler(
        removeError.message || "Error while removing the previous thumbnail !",
        400
      )
    );
  }

  const bio = await Users.findByIdAndUpdate(
    req.user.id,
    { avatar: image },
    { new: true, runValidators: true }
  );

  sendResponse({
    res,
    status: 200,
    data: bio,
    message: "User bio avatar updated successfully !",
  });
});

export const updatePassword = asyncErrorHandler(async (req, res, next) => {
  const { password, confirmPassword, oldPassword } = req.body;

  //check password and confirm password are same or not.
  if (password !== confirmPassword)
    return next(
      new ErrorHandler("Password and Confirm Password must be same !", 400)
    );

  const user = await Users.findById(req.user.id).select("+password");

  //first check old password is correct or not.
  if (!(await user.passwordCompare(oldPassword)))
    return next(new ErrorHandler("Old password is not correct !", 400));

  // now we update the password.
  user.password = password;
  await user.save({ validateBeforeSave: false });

  sendResponse({
    res,
    status: 200,
    data: user,
    message: "User password updated successfully !",
  });
});

export const getSuggestUser = asyncErrorHandler(async (req, res, next) => {
  // now we get that friends that is not in my following list. and i am not his followers.
  const { limit = 10, page = 1 } = req.params;
  const skip = (page - 1) * limit;
  const users = await Users.aggregate([
    {
      $lookup: {
        from: "followers",
        localField: "_id",
        foreignField: "followedBy",
        as: "following",
      },
    },
    {
      $lookup: {
        from: "followers",
        localField: "_id",
        foreignField: "follow",
        as: "followers",
      },
    },

    {
      $addFields: {
        followers: {
          $ifNull: [
            {
              $map: {
                input: "$followers",
                as: "followDoc",
                in: "$$followDoc.followedBy",
              },
            },
            [],
          ],
        },
        following: {
          $ifNull: [
            {
              $map: {
                input: "$following",
                as: "followDoc",
                in: "$$followDoc.follow",
              },
            },
            [],
          ],
        },
      },
    },
    // other method for finding the following and followers.
    // you can also use this with handling the null value.
    // {
    //   $addFields : {
    //     followers : "$followers.followedBy",
    //     following : "$following.follow"
    //   }
    // },

    {
      $match: {
        _id: { $ne: new Types.ObjectId(req.user.id) },
        $and: [
          { followers: { $ne: new Types.ObjectId(req.user.id) } },
          { following: { $ne: new Types.ObjectId(req.user.id) } },
        ],
      },
    },

    {
      $project: {
        _id: 1,
        firstname: 1,
        lastname: 1,
        email: 1,
        username: 1,
        avatar: 1,
        followers: 1,
        following: 1,
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
  ]);
  // const users = await Users.find().limit(10)
  sendResponse({
    res,
    data: users,
    message: "Suggested users fetched successfully !",
    status: 200,
  });
});

// get a single user with details.
export const getBioForUser = asyncErrorHandler(async (req, res, next) => {
  const userId=  req.params.id;

  if(mongoose.isValidObjectId(userId)) return next(new ErrorHandler("Please send valid user id !", 404));

  const myBio = await Users.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(userId),
      },
    },
    // join the users and follower model and get followers
    {
      $lookup: {
        from: "followers",
        localField: "_id",
        foreignField: "follow",
        as: "Followers",
      },
    },
    // join the users and follower model and get following
    {
      $lookup: {
        from: "followers",
        localField: "_id",
        foreignField: "followedBy",
        as: "Following",
      },
    },

    //join the users from post and also get the post
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "creator",
        as: "posts",
        //after getting post we join the user for getting the creators details.
        pipeline: [
          
          // we get comments
          {
            $lookup: {
              from: "comments",
              localField: "_id",
              foreignField: "postId",
              as: "comments",
              pipeline: [
                {
                  $addFields: {
                    commentCounts: { $size: "$comment" },
                  },
                },
              ],
            },
          },
          // {
          //   $unwind: "$creatorDetails",
          // },
          // now we find the like count share count and comment count for a post.
          {
            $project: {
              _id: 1,
              // creatorDetails: 1,
              content: 1,
              images: 1,
              likesCount: { $size: "$reactions" },
              shareCount: { $size: "$shares" },
              viewsCount: { $size: "$views" },
              commentCount: { $sum: "$comments.commentCounts" },
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
      },
    },

    {
      $addFields: {
        followersSize: { $size: "$Followers" },
        followingSize: { $size: "$Following" },
      },
    },
    {
      $project: {
        followersSize: 1,
        followingSize: 1,
        firstname: 1,
        lastname: 1,
        email: 1,
        username: 1,
        avatar: 1,
        posts: 1,
        totalPost : { $size: "$posts" },
      },
    },
  ]);

  if (!myBio) return next(new ErrorHandler("please send valid user id !", 404));

  sendResponse({
    res,
    status: 200,
    data: myBio,
    message: "User bio fetched successfully !",
  });
});