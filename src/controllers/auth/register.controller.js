import { uploadFilesOnCloudinary } from '../../utils/cloudinary.utils.js';
import { users } from '../../models/users.models.js';
import { ErrorHandler } from '../../errors/errorHandler.errors.js';
import { asyncErrorHandler } from '../../errors/asynHandler.error.js';
import { sendResponse } from '../../utils/sendResponse.js';
//controllers for user registrations
export const register = asyncErrorHandler(async (req, res, next) => {
  //registration process.
  const { firstname, lastname, email, password, username, middlename } =
    req.body;

  //step 1 : check user is already registered or not. that is already verified from userSchema.

  const existUser = await users.findOne({email})
  if(existUser) return next(new ErrorHandler('User already registered', 400))
  
  const avatar = { public_id: '', url: '' };

  if(!req.file) return next(new ErrorHandler('file is required', 400));

  const uploadResponse = await uploadFilesOnCloudinary({files : [req.file] , folder : 'socialMedia'})
    console.log(uploadResponse)
  if(uploadResponse.success == false) return next(new ErrorHandler("We get error during uploading files !", 400))

  avatar.public_id = uploadResponse.results[0].public_id;
  avatar.url = uploadResponse.results[0].secure_url;

  const userData = {
    firstname,
    lastname,
    email,
    password,
    username,
    avatar,
    middlename,
  };
  const user = await users.create(userData);

  sendResponse({res , status : 201 , data : user , message : 'User registered successfully'})

});
