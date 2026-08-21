import type { Request, Response, NextFunction } from "express";

import { addCommentService, deleteCommentService, editCommentService,getCommentService,getCommentsByUserService } from "../services/comment_services.ts";
import { AppError } from "../middlewares/errorMiddleware.ts";

export const addComment =async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId=req.user?.id as string;
    const {issueId}=req.params;
    const {comment}=req.body;
    if(!comment){
      throw new AppError(400,"comment required");
    }
    const result=await addCommentService(issueId as string,userId,comment);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
export const editComment =async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId=req.user?.id as string;
    const {commentId}=req.params;
    const {message}=req.body;
    if(!commentId){
      throw new AppError(400,"commentId required");
    }
    if(!message){
      throw new AppError(400,"comment required");
    }
    const result=await editCommentService(commentId as string,userId,message);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
export const deleteComment =async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId=req.user?.id as string;
    const {commentId}=req.params;
    if(!commentId){
      throw new AppError(400,"commentId required");
    }
    const result=await deleteCommentService(commentId as string,userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
export const getComment =async (req: Request, res: Response, next: NextFunction) => {
  try { 
    const {issueId}=req.params;  
    const result=await getCommentService(issueId as string);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getUserComments =async (req: Request, res: Response, next: NextFunction) => {
  try { 
    const userId=req.user?.id;
    const result=await getCommentsByUserService(userId as string);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};