import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string[]; // or roles
}

const refreshTokenValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {

    const decodedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
      userId: string;
    };

    console.log("[AUTH MIDDLEWARE] Refresh Token authentication successful");
    (req as any).userId = decodedToken.userId;

    next();
  } catch (error) {
    console.error("Refresh Token authentication failed:", error);

    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies.accessToken ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET_KEY;
    if (!secret) {
      // config error – log & fail fast
      console.error("JWT secret not configured");
      return res.status(500).json({ message: "Auth config error" });
    }

    const decoded = jwt.verify(token, secret) as AuthTokenPayload;

    (req as any).auth = decoded;      // or (req as any).user = decoded;
    // e.g. { userId, email, role }

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Server error during authentication" });
  }
};

export default {
  authenticateUser,
  refreshTokenValidation,
};
