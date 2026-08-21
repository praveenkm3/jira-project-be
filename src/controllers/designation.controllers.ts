import type { Request, Response, NextFunction } from "express";
import { addDesignationService } from "../services/designation_services.ts";

export async function addDesignation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user_id = req.user?.id;
    const { designation = "" } = req.body;
    const response = await addDesignationService(
      user_id as string,
      designation,
    );
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}
