import { Router } from "express";
import {
  createPost,
  deletePost,
  getPosts,
  getSinglePost
} from "../../controllers/users/posts.controller.js";
import { uploads } from "../../utils/files.utils.js";
import {
  createPostValidate,
  validateResult,
} from "../../validators/validator.js";

export const postsRouter = Router();

postsRouter
  .route("/create")
  .post(
    uploads.single("cover"),
    createPostValidate(),
    validateResult,
    createPost
  );
postsRouter.route("/delete/:id").delete(deletePost);
postsRouter.route("/get/all").get(getPosts);
postsRouter.route("/get/:id").get(getSinglePost);
