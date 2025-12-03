import type { Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


const isProduction = process.env.NODE_ENV?.toLowerCase() === "production";
const isSecure = isProduction || !!process.env.RENDER_EXTERNAL_HOSTNAME || process.env.HTTPS === 'true';

const generateJWT = (res: Response, userId: string, email: string, role: string[]) => {

  const accessToken = jwt.sign({ userId: userId, email: email, role: role }, process.env.JWT_SECRET_KEY as string, { expiresIn: process.env.JWT_EXPIRY } as SignOptions);
  const refreshToken = jwt.sign({ userId: userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY,
  } as SignOptions);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
    partitioned: true,
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isSecure,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: isProduction ? "none" : "lax",
    partitioned: true,
  });

  return {
    accessToken,
    refreshToken,
  }
};

const refreshJWT = (res: Response, userId: string) => {
  const newAccessToken = jwt.sign({ userId: userId }, process.env.JWT_SECRET_KEY as string, {
    expiresIn: process.env.JWT_EXPIRY,
  } as SignOptions);

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
    partitioned: true,
    path: "/",
  });

  return {
    newAccessToken,
  }
};

const clearJWT = (res: Response) => {
  res.cookie("accessToken", "", {
    httpOnly: true,
    secure: isSecure,
    sameSite: isProduction ? "none" : "lax",
    expires: new Date(0),
    partitioned: true,
    path: "/",
  });

  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: isSecure,
    sameSite: isProduction ? "none" : "lax",
    expires: new Date(0),
    partitioned: true,
    path: "/",
  });
};

export { generateJWT, clearJWT, refreshJWT };
