import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || "your-secret-key";

interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

class AuthenticateUser {
  authenticateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Try to get token from cookie first, then from Authorization header
      let token = req.cookies?.accessToken;
      
      // If no token in cookie, check Authorization header
      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7); // Remove 'Bearer ' prefix
        }
      }

      if (!token) {
        res.status(401).json({ message: "No token provided. Authentication required." });
        return;
      }

      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      
      // Attach userId to request object
      (req as any).userId = decoded.userId;

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
