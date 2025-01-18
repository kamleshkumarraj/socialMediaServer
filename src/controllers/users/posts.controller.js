import { asyncErrorHandler } from "../../errors/asynHandler.error.js";
import { ErrorHandler } from "../../errors/errorHandler.errors.js";
import { Posts } from "../../models/posts.models.js";
import { removeFile, uploadFilesOnCloudinary } from "../../utils/cloudinary.utils.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const createPost = asyncErrorHandler(async (req, res, next) => {
  const imageFile = req.file;
  if(!imageFile) return next(new ErrorHandler("Thumbnail is required for post !" , 400))

  const {success, results, error} = await uploadFilesOnCloudinary({files : [imageFile] , folder : 'socialMedia'})

  if(!success) return next(new ErrorHandler(error.message || "Error while uploading the thumbnail !" , 400))

  const image = {public_id : results[0].public_id , url : results[0].url}
  const post = await Posts.create({creator : req.user.id , images : image , ...req.body})

  await removeFile({files : [imageFile]})

  sendResponse({res , status : 201 , data : post , message : 'Post created successfully !'})
})