import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import iamServiceClient from "../services/iamService/client/index.js";

const resolveJwtSecret = (): string => {
  const fromJwtSecret = process.env.JWT_SECRET?.trim();
  if (fromJwtSecret && fromJwtSecret.length > 0) {
    return fromJwtSecret;
  }
  const fromLegacySecret = process.env.JWT_SECRET_KEY?.trim();
  if (fromLegacySecret && fromLegacySecret.length > 0) {
    return fromLegacySecret;
  }
  return "your-secret-key";
};

interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
  email?: string;
}

const extractTokenFromRequest = (req: Request): string | undefined => {
  const cookieToken = req.cookies?.accessToken;
  if (typeof cookieToken === "string" && cookieToken.length > 0) {
    return cookieToken;
  }

  const authHeader = req.headers?.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  const headerToken = req.headers?.["x-access-token"];
  if (typeof headerToken === "string" && headerToken.length > 0) {
    return headerToken;
  }

  return undefined;
};

class AuthenticateUser {
  authenticateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = extractTokenFromRequest(req);

      if (!token) {
        res.status(401).json({ message: "No token provided. Authentication required." });
        return;
      }

  const decoded = jwt.verify(token, resolveJwtSecret()) as JWTPayload;
      
      // Attach userId to request object
      (req as any).userId = decoded.userId;

      if (decoded.email) {
        (req as any).userEmail = decoded.email;
      } else {
        try {
          const user = await iamServiceClient.getUserById(decoded.userId);
          if (user?.email) {
            (req as any).userEmail = user.email;
          }
        } catch (fetchError) {
          console.warn("[AuthenticateUser] Unable to resolve user email", fetchError);
        }
      }

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: "Token expired. Please refresh your token." });
        return;
      }

      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ message: "Invalid token. Authentication failed." });
        return;
      }

      console.error("Authentication error:", error);
      res.status(500).json({ message: "Internal server error during authentication." });
    }
  };
}

export default new AuthenticateUser();
