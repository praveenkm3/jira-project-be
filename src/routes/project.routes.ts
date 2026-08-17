import { Router } from "express";
import { getAllProjectMembers,createProject,editProject,deleteProject,getSpecificProject,getAllProjects ,getAllProjectsForSearch} from "../controllers/project.controller.ts";
import { checkProjectAdmin } from "../middlewares/projectMiddleware.ts";


const projectRouter=Router();


projectRouter.get('/all-projects',getAllProjects);
projectRouter.get('/my-projects',getAllProjectsForSearch);
projectRouter.get('/by/:pid/members',getAllProjectMembers);
projectRouter.post('/create/',createProject);
projectRouter.put('/update/:pid',checkProjectAdmin,editProject);
projectRouter.get('/:pid',getSpecificProject);
projectRouter.delete('/delete/:pid',checkProjectAdmin,deleteProject);



export default projectRouter;