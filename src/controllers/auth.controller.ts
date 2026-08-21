import type { Request, Response, NextFunction } from "express";
import {
  getDesignationService,
  registerService,
} from "../services/auth_services.ts";
import { AppError } from "../middlewares/errorMiddleware.ts";
import { loginService, getRoleService } from "../services/auth_services.ts";
import "dotenv/config";
import { decryptToken, encryptToken } from "../utils/hashCookie.ts";
import {
  generateAccessToken,
  validateAccessToken,
  validateRefreshToken,
} from "../utils/tokens.ts";
import type { tokenObject } from "../types/auth.types.ts";

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
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refresh_decrypt, {
      secure: process.env.NODE_ENV === "production",
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

export async function refresh(req: Request, res: Response) {
  const accessToken = req?.cookies?.accessToken;
  const refreshToken = req?.cookies?.refreshToken;
  const accessTokenDecrypt = decryptToken(accessToken);
  const verifyAccess = validateAccessToken(accessTokenDecrypt);
  if (verifyAccess[0]) {
    return res.status(201).json(verifyAccess[1]);
  } else {
    const refreshTokenDecrypt = decryptToken(refreshToken);
    const verifyRefresh = validateRefreshToken(refreshTokenDecrypt);
    if (verifyRefresh[0]) {
      const payload = verifyRefresh[1];
      const newAccess = await generateAccessToken(payload as tokenObject);
      const accessTokenEncrypt = encryptToken(newAccess);
      res.cookie("accessToken", accessTokenEncrypt, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
      });

      return res.status(201).json(payload);
    } else {
      return res.status(401).json({ message: "Tokens Expired" });
    }
  }
}
export async function getRoles(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const response = await getRoleService();
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}
export async function getDesignations(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const response = await getDesignationService();
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}
