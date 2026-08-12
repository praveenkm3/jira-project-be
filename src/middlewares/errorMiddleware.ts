import type{ Request, Response, NextFunction } from "express";

export class AppError extends Error{
    status:number
    constructor(status:number,message:string){
        super(message);
        this.status=status
        Object.setPrototypeOf(this,AppError.prototype)
    }
}

export const errorHandler=((err:AppError, req:Request, res:Response, next:NextFunction) => {
  res.status(err.status || 500).json({
    status:'error' ,
    message: err.message || 'Something went wrong!',
  });
});