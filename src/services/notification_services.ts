import { AppError } from "../middlewares/errorMiddleware.ts";
import { notifyRepo } from "../config/repos.ts";

export const getNotificationsService = async (userId: string) => {
  try {
    const result = await notifyRepo.find({
      where: {
        reciever: {
          id: userId,
        },
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
