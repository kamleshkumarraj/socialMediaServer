import { Router } from "express";
import { followId } from "../../controllers/users/followers.controller.js";

export const userRouter = Router();

userRouter.route('/follow/:id').post(followId);