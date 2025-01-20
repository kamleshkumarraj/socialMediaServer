import { Router } from "express";
import { getSuggestUser } from "../../controllers/users/self.controller";

export const selfRouter = Router();

selfRouter.route('/suggested-user').get(getSuggestUser); 