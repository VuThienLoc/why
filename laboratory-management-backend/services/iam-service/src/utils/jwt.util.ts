import type { Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


const generateJWT = (res: Response, userId: string, email: string, role: string[]) => {

  const accessToken = jwt.sign({ userId: userId, email: email, role: role }, process.env.JWT_SECRET_KEY as string, { expiresIn: process.env.JWT_EXPIRY } as SignOptions);
  const refreshToken = jwt.sign({ userId: userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY,
  } as SignOptions);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV?.toLowerCase() === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV?.toLowerCase() === "production",
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "strict",
  });
};

const refreshJWT = (res: Response, userId: string) => {
  const newAccessToken = jwt.sign({ userId: userId }, process.env.JWT_SECRET_KEY as string, {
    expiresIn: process.env.JWT_EXPIRY,
  } as SignOptions);

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV?.toLowerCase() === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });
  console.log("New access Token has been assigned");
};

const clearJWT = (res: Response) => {
  res.cookie("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV?.toLowerCase() === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });

  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV?.toLowerCase() === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });
};

export { generateJWT, clearJWT, refreshJWT };
