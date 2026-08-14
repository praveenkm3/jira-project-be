import type { Request, Response, NextFunction } from "express";
import { getNotificationsService } from "../services/notification_services.ts";



export const getNotifications = async(req:Request,res:Response,next:NextFunction)=>{
try {
    const userId=req.user?.id as string;
    const response=await getNotificationsService(userId);
    return res.status(200).json(response);
} catch (error) {
    next(error);
}
}