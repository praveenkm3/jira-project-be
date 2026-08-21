import type { Request, Response, NextFunction } from "express";
import { getNotificationsService,setReadNotificationsService } from "../services/notification_services.ts";



export const getNotifications = async(req:Request,res:Response,next:NextFunction)=>{
try {
    const userId=req.user?.id as string;
    const response=await getNotificationsService(userId);
    return res.status(200).json(response);
} catch (error) {
    next(error);
}
}
export const readNotifications = async(req:Request,res:Response,next:NextFunction)=>{
try {
    const userId=req.user?.id as string;
    const {notification_id=""}=req.params;
    const response=await setReadNotificationsService(userId,notification_id as string);
    return res.status(200).json(response);
} catch (error) {
    next(error);
}
}