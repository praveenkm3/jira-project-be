import { Router } from "express";

const notifyRouter=Router();

import { getNotifications } from "../controllers/notification.controllers.ts";


notifyRouter.get('/',getNotifications);




export default notifyRouter;