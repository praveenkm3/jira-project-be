import { Router } from "express";

const authRouter=Router();


import { register ,login ,logout ,getRoles} from "../controllers/auth.controller.ts"; 


authRouter.get('/roles',getRoles);
authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);



export default authRouter;