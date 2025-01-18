import { Router } from "express";
import { register } from "../../controllers/auth/register.controller.js";
import { login } from "../../controllers/auth/login.controller.js";
import { uploads } from "../../utils/files.utils.js";

export const authRouter = Router();

authRouter.route('/register').post(uploads.single('avatar') ,  register);
authRouter.route('/login').post(login);

