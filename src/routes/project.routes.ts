import { Router } from "express";
import { createProject,editProject,deleteProject,getSpecificProject,getAllProjects } from "../controllers/project.controller.ts";
import { checkProjectAdmin } from "../middlewares/projectMiddleware.ts";


const projectRouter=Router();


projectRouter.get('/all-projects',getAllProjects);
projectRouter.post('/create/',createProject);
projectRouter.put('/update/:pid',checkProjectAdmin,editProject);
projectRouter.get('/:pid',getSpecificProject);
projectRouter.delete('/delete/:pid',checkProjectAdmin,deleteProject);



export default projectRouter;