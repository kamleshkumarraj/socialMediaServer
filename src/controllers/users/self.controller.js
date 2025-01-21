import { Types } from "mongoose";
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
        _id: req.user.id,
      },
    },
    {
      $lookup: {
        from: "Follower",
        localField: "_id",
        foreignField: "followers",
        as: "Followers",
      },
    },
    {
      $lookup: {
        from: "Follower",
        localField: "_id",
        foreignField: "following",
        as: "Following",
      },
    },
    {
      $addFields: {
        followers: { $size: "$Followers" },
        following: { $size: "$Following" },
      },
    },
    {
      $project: {
        Followers: 1,
        Following: 1,
        firstname: 1,
        lastname: 1,
        email: 1,
        username: 1,
        avatar: 1,
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
