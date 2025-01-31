import { Router } from "express";
import {
  createComment,
  createReactions,
  createShare,
  createViews,
  deleteComment,
  getTotalCommentsForPost,
  getTotalLikesDetailsForPost,
  getTotalSharesForPost,
  getTotalViewsForPost,
  likeAComment,
  replyComment,
} from "../../controllers/users/reactions.controller.js";

export const reactionsRouter = Router();

reactionsRouter.route("/create-reaction/:id").post(createReactions);
reactionsRouter.route("/create-comment/:id").post(createComment);
reactionsRouter.route("/create-view/:id").post(createViews)
reactionsRouter.route("/delete-comment/:id").post(deleteComment);
reactionsRouter.route("/create-share/:id").post(createShare);
reactionsRouter.route("/reply-comment/:id").post(replyComment);
reactionsRouter.route("/like-comment/:id").post(likeAComment);
reactionsRouter.route("/get-total-likes-post/:id").get(getTotalLikesDetailsForPost);
reactionsRouter.route('/get-total-shares-post/:id').get(getTotalSharesForPost)
reactionsRouter.route('/get-total-views-post/:id').get(getTotalViewsForPost)
reactionsRouter.route('/get-total-comments-post/:id').get(getTotalCommentsForPost)
// reactionsRouter.route('/create-view/:id').post(createView)
