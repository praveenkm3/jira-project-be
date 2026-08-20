import { Router } from "express";

const designationRouter=Router();


import { addDesignation } from "../controllers/designation.controllers.ts";

 
designationRouter.post('/create',addDesignation);



export default designationRouter;
