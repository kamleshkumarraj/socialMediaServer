import { Router } from "express";
import {
  createNotifications,
  deleteNotifications,
  getMyNotifications,
} from "../../controllers/users/notifications.controller.js";

export const notificationRouter = Router();

notificationRouter.route("/create").post(createNotifications);
notificationRouter.route("/delete/:id").delete(deleteNotifications);
notificationRouter.route("/get-my-notifications").get(getMyNotifications);
