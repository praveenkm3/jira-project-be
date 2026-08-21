import { Router } from "express";

const notifyRouter = Router();

import {
  getNotifications,
  readNotifications,
} from "../controllers/notification.controllers.ts";

notifyRouter.get("/", getNotifications);
notifyRouter.patch("/:notification_id", readNotifications);

export default notifyRouter;
