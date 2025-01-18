import { Router } from "express";
import { isLoggedIn } from "../../middlewares/auth/isLoggedIn.middleware.js";
import {
  createPost,
  deletePost,
} from "../../controllers/users/posts.controller.js";

export const postsRouter = Router();

postsRouter.use(isLoggedIn);
postsRouter.route("/create").post(createPost);
postsRouter.route("/delete").delete(deletePost);
