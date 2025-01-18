import { asyncErrorHandler } from "../../errors/asynHandler.error.js";
import { ErrorHandler } from "../../errors/errorHandler.errors.js";
import { Users } from "../../models/users.models.js";
import { removeFile, removeMultipleFileFromCloudinary, uploadFilesOnCloudinary } from "../../utils/cloudinary.utils.js";
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
        isFollow: {
          $cond: {
            if: { $in: [req.user.id, "$Followers.follower"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        password: 0,
        Followers: 1,
        Following: 1,
        isFollow: 1,
      },
    },
  ]);
  if(!myBio) return next(new ErrorHandler("please send valid user id !",404))

  sendResponse({res , status : 200 , data : myBio , message : 'User bio fetched successfully !'})
}); 

export const updateBio = asyncErrorHandler(async (req , res , next) => {
    const content = req.body;
    const bio = await Users.findByIdAndUpdate(req.user.id , content , {new : true , runValidators : true});

    if(!bio) return next(new ErrorHandler("please send valid user id !",404))

    sendResponse({res , status : 200 , data : bio , message : 'User bio updated successfully !'})
})

export const updateBioAvatar = asyncErrorHandler(async (req, res, next) => {
    const imageFile = req.file;
    if(!imageFile) return next(new ErrorHandler("Thumbnail is required for bio avatar !" , 400))

    const {error , results , success} = await uploadFilesOnCloudinary({files : [imageFile] , folder : 'socialMedia'})

    if(!success) {
        await removeFile({files : [imageFile]})
        return next(new ErrorHandler(error.message || "Error while uploading the thumbnail !" , 400))
    }

    const image = {public_id : results[0].public_id , url : results[0].url}

    const {success : removeSuccess , error : removeError } = await removeMultipleFileFromCloudinary({files : [req.user.avatar]})

    if(!removeSuccess) {
        await removeFile({files : [imageFile]})
        return next(new ErrorHandler(removeError.message || "Error while removing the previous thumbnail !" , 400))
    }

    const bio = await Users.findByIdAndUpdate(req.user.id , {avatar : image} , {new : true , runValidators : true});

    sendResponse({res , status : 200 , data : bio , message : 'User bio avatar updated successfully !'})
})

export const updatePassword = asyncErrorHandler(async (req, res, next) => {
    const {password , confirmPassword , oldPassword} = req.body;

    //check password and confirm password are same or not.
    if(password !== confirmPassword) return next(new ErrorHandler("Password and Confirm Password must be same !" , 400))

    const user = await Users.findById(req.user.id).select("+password");
    
    //first check old password is correct or not.   
    if(!(await user.passwordCompare(oldPassword))) return next(new ErrorHandler("Old password is not correct !" , 400))

    // now we update the password.
    user.password = password;
    await user.save({validateBeforeSave : false});

    sendResponse({res , status : 200 , data : user , message : 'User password updated successfully !'})
})


