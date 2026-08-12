import { Router } from "express";
import { addMembersToProject,deleteMembersFromProject,editMembersToProject } from "../controllers/members.controllers.ts";
import { checkProjectAdmin } from "../middlewares/projectMiddleware.ts";

const memberRouter=Router();


memberRouter.post("/:pid/members",checkProjectAdmin, addMembersToProject);
memberRouter.put("/:pid/members",checkProjectAdmin,editMembersToProject)
memberRouter.delete("/:pid/members/:userId",checkProjectAdmin,deleteMembersFromProject)

export default memberRouter;