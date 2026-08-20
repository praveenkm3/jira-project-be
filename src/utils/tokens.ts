import "dotenv/config";
import jwt from "jsonwebtoken";
 
const ACCESS_SECRET=process.env.ACCESS_SECRET || "";
const REFRESH_SECRET=process.env.REFRESH_SECRET || "";

import type{ tokenObject } from "../types/auth.types.ts";

export function generateAccessToken({email,role,id}:tokenObject){
    const accessToken=jwt.sign({email,role,id},ACCESS_SECRET,{expiresIn:"15m"});
    return accessToken;
}

export function generateRefreshToken({email,role,id}:tokenObject){
    const refreshToken=jwt.sign({email,role,id},REFRESH_SECRET,{expiresIn:"5d"});
    return refreshToken;
}

export function validateAccessToken(accessToken:string):[boolean, tokenObject | null]{
    try{
        const payload=jwt.verify(accessToken,ACCESS_SECRET);
        return [true,payload as tokenObject]
    }catch{
        return [false,null];
    }
}

export function validateRefreshToken(refreshToken:string){
    try{
        const payload=jwt.verify(refreshToken,REFRESH_SECRET);
            return [true,payload]
    }catch{
        return [false,null];
    }
}
