import type { Request, Response, NextFunction } from "express";
import { addDesignationService,updateDesignationService,deleteDesignationService} from "../services/designation_services.ts";

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
export async function updateDesignation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try { 
    const user_role=req.user?.role;
    if(!user_role || user_role !== 'admin'){
      return {
        message:"Only Admin can update designations"
      }
    }
    const { designation_name = "" } = req.body;
    const{designation_id=""}=req.params;
    const response = await updateDesignationService( 
      designation_id as string,
      designation_name as string,
    );
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}
export async function deleteDesignation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try { 
    const user_role=req.user?.role;
    if(!user_role || user_role !== 'admin'){
      return {
        message:"Only Admin can delete designations"
      }
    } 
    const{designation_id=""}=req.params;
    const response = await deleteDesignationService( 
      designation_id as string
    );
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}