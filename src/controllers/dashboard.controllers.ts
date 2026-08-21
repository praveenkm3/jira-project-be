import type { Request, Response, NextFunction } from "express";
import {
  progressCountServices,
  statusCountServices,
  priorityCountServices,
  typeCountServices,
} from "../services/dashboard_services.ts";
import type { progressCountType } from "../types/boards.types.ts";

export const getProgressCounts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const response: progressCountType = await progressCountServices(
      userId as string,
      role as string,
    );
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
export const getStatusCounts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const response = await statusCountServices(
      userId as string,
      role as string,
    );
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
export const getPriorityCounts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const response = await priorityCountServices(
      userId as string,
      role as string,
    );
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getTypeCounts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const response = await typeCountServices(userId as string, role as string);
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
