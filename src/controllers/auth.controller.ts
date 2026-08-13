import type { Request, Response, NextFunction } from "express";
import { registerService } from "../services/auth_services.ts";
import { AppError } from "../middlewares/errorMiddleware.ts";
import { loginService,refeshService} from "../services/auth_services.ts";
import "dotenv/config"

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.body) {
      throw new AppError(400, "Fields Not Provided");
    }
    const { name = "", email = "", password = "", role = "" } = req.body;
    if (!name || !email || !password || !role) {
      throw new AppError(400, "Fields Not Provided");
    }
    const response = await registerService(req.body);
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.body) {
      throw new AppError(400, "Fields Not Provided");
    }
    const { email = "", password = "" } = req.body;
    if (!email || !password) {
      throw new AppError(400, "Fields Not Provided");
    }
    const response = await loginService({ email, password });
    const [access_decrypt, refresh_decrypt, user] = response;

    res.cookie("accessToken", access_decrypt, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refresh_decrypt, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 5 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}
export async function logout(req: Request, res: Response) {
  res.clearCookie("accessToken", {
    httpOnly: true,
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
  });
  return res.status(200).json({ message: "Logout succussfully" });
}
export async function refresh(req: Request, res: Response,next: NextFunction) {
  const accessToken:string = req?.cookies?.accessToken;
  const refreshToken:string = req?.cookies?.refreshToken;
  const newToken=await refeshService(accessToken,refreshToken);
  res.cookie("accessToken", newToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
      });
  return res.status(200).json({message:"Access token expired ,new token created"});
}
