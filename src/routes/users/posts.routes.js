import { Router } from "express";
import { isLoggedIn } from "../../middlewares/auth/isLoggedIn.middleware.js";
import {
  createPost,
  deletePost,
  getAllPost,
  getMyPost,
  getSinglePost,
} from "../../controllers/users/posts.controller.js";
import { uploads } from "../../utils/files.utils.js";
import {
  createPostValidate,
  validateResult,
} from "../../validators/validator.js";

export const postsRouter = Router();

postsRouter.use(isLoggedIn);
postsRouter
  .route("/create")
  .post(
    uploads.single("cover"),
    createPostValidate(),
    validateResult,
    createPost
  );
postsRouter.route("/delete/:id").delete(deletePost);
postsRouter.route("/get/my-created").get(getMyPost);
postsRouter.route("/get/all").get(getAllPost);
postsRouter.route("/get/:id").get(getSinglePost);
