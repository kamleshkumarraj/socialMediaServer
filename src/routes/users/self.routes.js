import { Router } from "express";
import { getSuggestUser } from "../../controllers/users/self.controller.js";

export const selfRouter = Router();

selfRouter.route('/suggested-user').get(getSuggestUser); 