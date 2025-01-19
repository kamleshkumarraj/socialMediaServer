import { Router } from "express";
import { addMemberInGroupChat, createGroupChat, deleteChats, getMyChats, getMyCreatedChats, getMyGroupChats, leaveGroupChat, removeGroupMember, renameGroupName } from "../../controllers/users/chat.controller.js";
import { isLoggedIn } from "../../middlewares/auth/isLoggedIn.middleware";

export const chatsRouter = Router();

chatsRouter.use(isLoggedIn)
chatsRouter.route('/create-group').post(createGroupChat)
chatsRouter.route('/delete-chat/:id').delete(deleteChats)
chatsRouter.route('/add-member/:id').post(addMemberInGroupChat);
chatsRouter.route('/leave-chat/:id').delete(leaveGroupChat)
chatsRouter.route('/remove-member/:id').delete(removeGroupMember);
chatsRouter.route('/get-my-created-chats').get(getMyCreatedChats);
chatsRouter.route('/get-my-chats').get(getMyChats);
chatsRouter.route('/get-group-chat').get(getMyGroupChats);
chatsRouter.route('/rename-group/:id').patch(renameGroupName)
