import type { Request, Response, NextFunction } from "express";
import { addMembersToProjectService,deleteMembersFromProjectService ,editProjectMembersService} from "../services/members_services.ts";
import { AppError } from "../middlewares/errorMiddleware.ts";


export async function addMembersToProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data: string[] = req?.body?.data;
    const { pid } = req?.params;
    if (!pid) {
      throw new AppError(403, "Unauthorized , To Add Members To Project");
    }
    if (!req.body) {
      throw new AppError(400, "No Members To Add");
    }
    const response = await addMembersToProjectService(
      data,
      pid as string,
    );
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
export async function deleteMembersFromProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {pid,userId}=req.params;
    const response=await deleteMembersFromProjectService(pid as string,userId as string);
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
export async function editMembersToProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data: string[] = req?.body?.data;
    const { pid } = req?.params;
    const userId=req.user?.id
    if (!pid) {
      throw new AppError(403, "Unauthorized ,to add Members into project");
    }
    if (!req.body) {
      throw new AppError(400, "No Members To Add");
    }
    const response = await editProjectMembersService(
      data,
      pid as string,
      userId as string
    );
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}