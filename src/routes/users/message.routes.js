import { Router } from "express";
import {
  deleteMultipleMessage,
  sendAttachment,
} from "../../controllers/users/message.controller";

export const messageRouter = Router();

messageRouter.route("/send-attachment").post(sendAttachment);
messageRouter.route("/delete-message/:id").delete(deleteMultipleMessage);
