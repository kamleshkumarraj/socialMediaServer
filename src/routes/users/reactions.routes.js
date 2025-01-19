import { Router } from "express";
import {
  createComment,
  createReactions,
  createShare,
  deleteComment,
  likeAComment,
  replyComment,
} from "../../controllers/users/reactions.controller.js";

export const reactionsRouter = Router();

reactionsRouter.route("/create-like/:id").post(createReactions);
reactionsRouter.route("/create-comment/:id").post(createComment);
reactionsRouter.route("/delete-comment/:id").post(deleteComment);
reactionsRouter.route("/create-share/:id").post(createShare);
reactionsRouter.route("/reply-comment/:id").post(replyComment);
reactionsRouter.route("/like-comment/:id").post(likeAComment);
// reactionsRouter.route('/create-view/:id').post(createView)
