import { Router } from "express";
import { getProgressCounts,getStatusCounts ,getPriorityCounts,getTypeCounts} from "../controllers/dashboard.controllers.ts";


const boardRouter=Router();

boardRouter.get('/progress-counts',getProgressCounts);
boardRouter.get('/status-counts',getStatusCounts);
boardRouter.get('/priority-counts',getPriorityCounts);
boardRouter.get('/type-counts',getTypeCounts);



export default boardRouter;
