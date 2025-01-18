import { removeFile, uploadFilesOnCloudinary } from '../../utils/cloudinary.utils.js';
import { Users } from '../../models/users.models.js';
import { ErrorHandler } from '../../errors/errorHandler.errors.js';
import { asyncErrorHandler } from '../../errors/asynHandler.error.js';
import { sendResponse } from '../../utils/sendResponse.js';
//controllers for user registrations
export const register = asyncErrorHandler(async (req, res, next) => {
  //registration process.
  const { firstname, lastname, email, password, username, middlename } =
    req.body;

  //step 1 : check user is already registered or not. that is already verified from userSchema.

  const existUser = await Users.findOne({email})
  if(existUser) return next(new ErrorHandler('User already registered', 400))
  
  const avatar = { public_id: '', url: '' };

  if(!req.file) return next(new ErrorHandler('file is required', 400));

  const uploadResponse = await uploadFilesOnCloudinary({files : [req.file] , folder : 'socialMedia'})
    console.log(uploadResponse)
  if(uploadResponse.success == false) {
    await removeFile({files : [req.file]})
    return next(new ErrorHandler("We get error during uploading files !", 400))
  }

  avatar.public_id = uploadResponse.results[0].public_id;
  avatar.url = uploadResponse.results[0].url;
  await removeFile({files : [req.file]})
  const userData = {
    firstname,
    lastname,
    email,
    password,
    username,
    avatar,
    middlename,
  };
  const user = await Users.create(userData);

  sendResponse({res , status : 201 , data : user , message : 'User registered successfully'})

});
