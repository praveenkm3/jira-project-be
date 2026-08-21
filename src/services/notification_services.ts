import { AppError } from "../middlewares/errorMiddleware.ts";
import { notifyRepo } from "../config/repos.ts";

export const getNotificationsService = async (userId: string) => {
  try {
    const result = await notifyRepo.find({
      where: {
        reciever: {
          id: userId,
        },
        is_read:false
      },
      order:{
        createdAt:"DESC"
      }
    });
    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DB Error ,Unable to fetch noifications"); 
  }
};
export const setReadNotificationsService = async (userId:string,notification_id:string) => {
  try {
    const result = await notifyRepo.findOne({
      where: {
        notification_id:notification_id,
        reciever:{
          id:userId
        }
      }});
    if(!result){
      throw new AppError(400,"Not Allowed or you are not the reciever");
    }
    result.is_read=true
    await notifyRepo.save(result)
    return {
      message:"Notification marked as read"
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DB Error ,Unable to fetch noifications"); 
  }
};