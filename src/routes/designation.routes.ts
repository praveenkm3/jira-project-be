import { Router } from "express";

const designationRouter = Router();

import { addDesignation,deleteDesignation,updateDesignation } from "../controllers/designation.controllers.ts";

designationRouter.post("/create", addDesignation);
designationRouter.put("/update/:designation_id", updateDesignation);
designationRouter.delete("/delete/:designation_id", deleteDesignation);

export default designationRouter;
