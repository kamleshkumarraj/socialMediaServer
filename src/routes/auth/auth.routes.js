import { Router } from "express";
import { register } from "../../controllers/auth/register.controller.js";
import { login } from "../../controllers/auth/login.controller.js";

export const authRouter = Router();

authRouter.post('/register' , register);
authRouter.post('/login' , login);

