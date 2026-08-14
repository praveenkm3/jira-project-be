import type { NextFunction,Request,Response } from "express";
import { getSpecificUserService, getUsersService } from "../services/user_services.ts";
 



export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId=req.user?.id as string;
    const users=await getUsersService(userId);
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}
export async function getSpecificUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId=req.user?.id as string;
    const{uid}=req.params;
    const specificUser=await getSpecificUserService (uid as string);
    return res.status(200).json(specificUser);
  } catch (error) {
    next(error);
  }
}
export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId=req.user?.id as string;
    const specificUser=await getSpecificUserService (userId);
    return res.status(200).json(specificUser);
  } catch (error) {
    next(error);
  }
}