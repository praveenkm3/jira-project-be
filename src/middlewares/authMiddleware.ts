import type { Request, Response, NextFunction } from "express";
import { AppError } from "./errorMiddleware.ts";
import { decryptToken } from "../utils/hashCookie.ts";
import { validateAccessToken } from "../utils/tokens.ts";
import type { tokenObject } from "../types/auth.types.ts";
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req?.cookies?.accessToken;
    const decrypt = await decryptToken(accessToken);
    const verifyUser = validateAccessToken(decrypt);
    if (verifyUser[0]) {
      req.user = verifyUser[1] as tokenObject;
      return next();
    } else {
      throw new AppError(401, "Access Token Expired");
    }
  } catch (error) {
    next(error);
  }
};
