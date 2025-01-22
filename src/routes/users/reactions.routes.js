import { Router } from "express";
import {
  createComment,
  createReactions,
  createShare,
  deleteComment,
  getTotalLikesDetailsForPost,
  getTotalSharesForPost,
  likeAComment,
  replyComment,
} from "../../controllers/users/reactions.controller.js";

export const reactionsRouter = Router();

reactionsRouter.route("/create-reaction/:id").post(createReactions);
reactionsRouter.route("/create-comment/:id").post(createComment);
reactionsRouter.route("/delete-comment/:id").post(deleteComment);
reactionsRouter.route("/create-share/:id").post(createShare);
reactionsRouter.route("/reply-comment/:id").post(replyComment);
reactionsRouter.route("/like-comment/:id").post(likeAComment);
reactionsRouter.route("/get-total-likes-post/:id").get(getTotalLikesDetailsForPost);
reactionsRouter.route('/get-total-shares-post/:id').get(getTotalSharesForPost)
// reactionsRouter.route('/create-view/:id').post(createView)
