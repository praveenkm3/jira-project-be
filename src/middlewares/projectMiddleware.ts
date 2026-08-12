import type { Request, Response, NextFunction } from "express";
import { projectRepo } from "../config/repos.ts";
import { AppError } from "./errorMiddleware.ts";
export async function checkProjectAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req?.user;
  if(!user){
    throw new AppError(403,"Unauthorized to create or modify project");
  }
  if(user?.role !== 'admin'){
    throw new AppError(403,"developers are not allowed to modify project");
  }
  const { pid } = req?.params;

  const project = await projectRepo.existsBy({
    project_id: pid as string,
    created_by: {
      id: user.id,
    },
  });

  if (!project) {
    throw new AppError(404,"Project not found , or You are not allowed to this project");
  }
  next();
}
