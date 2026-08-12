import type { Request, Response, NextFunction } from "express";
import { AppError } from "../middlewares/errorMiddleware.ts";
import {
  createProjectService,
  editProjectService,
  deleteProjectService,
  specificProjectService,
  allProjectsService
} from "../services/project_services.ts";

export async function createProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = req.body;
    const user = req.user;
    if (user?.role !== "admin") {
      throw new AppError(400, "Not allowed to create project");
    }
    if (!data) {
      throw new AppError(400, "Fields Not Provided");
    }
    const {
      project_name = "",
      project_key = "",
      project_description = "",
      project_status = "",
    } = data;
    if (
      !project_name ||
      !project_key ||
      !project_description ||
      !project_status
    ) {
      throw new AppError(400, "Fields Not Provided");
    }
    const response = await createProjectService(data, user?.id);

    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}
export async function editProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { pid = "" } = req.params;
    const data = req.body;
    const user = req.user;
    if (!user || !pid) {
      throw new AppError(400, "UnAuthorized");
    }
    if (!data) {
      throw new AppError(400, "Fields Not Provided");
    }
    const response = await editProjectService(data, user?.id, pid as string);

    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}
export async function deleteProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { pid = "" } = req.params;
    const user = req.user;
    if (!user || !pid) {
      throw new AppError(400, "Unauthorized ,Not Allowed To Delete");
    }
    const response = await deleteProjectService(user?.id, pid as string);

    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}
export async function getSpecificProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { pid = "" } = req.params;
    const user = req.user;
    const role=user?.role;
    
    const response = await specificProjectService(user?.id as string, pid as string,role as string);

    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}
export async function getAllProjects(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user;
    const response = await allProjectsService(user?.id as string,user?.role as string);
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}