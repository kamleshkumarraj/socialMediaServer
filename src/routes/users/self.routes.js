import { Router } from "express";
import { getBio, getBioForUser, getFollowBackUsers, getSuggestUser, myFollowers, myFollowing, searchUser, updateBio, updateBioAvatar } from "../../controllers/users/self.controller.js";
import { followId, unFollowId } from "../../controllers/users/followers.controller.js";

export const selfRouter = Router();

selfRouter.route('/suggested-user').get(getSuggestUser); 
selfRouter.route('/update-bio-avatar').put(updateBioAvatar);
selfRouter.route('/update-bio').put(updateBio);
selfRouter.route('/my-bio').get(getBio);
selfRouter.route('/get-bio/:id').get(getBioForUser);
selfRouter.route('/get-follow-back-users').get(getFollowBackUsers)
selfRouter.route("/get-my-followers").get(myFollowers);
selfRouter.route("/get-my-following").get(myFollowing);
selfRouter.route('/search-user').get(searchUser)
selfRouter.route('/follow/:id').post(followId);
selfRouter.route('/un-follow/:id').delete(unFollowId);