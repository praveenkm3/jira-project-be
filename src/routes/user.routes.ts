import { Router } from "express";

const userRouter=Router();

import { getUsers,getSpecificUsers } from "../controllers/users.controllers.ts";


userRouter.get('/users',getUsers);
userRouter.get('/users/:uid',getSpecificUsers);



export default userRouter;