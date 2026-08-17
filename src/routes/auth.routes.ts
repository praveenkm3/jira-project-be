import { Router } from "express";

const authRouter=Router();


import { register ,login ,logout } from "../controllers/auth.controller.ts"; 


authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);



export default authRouter;