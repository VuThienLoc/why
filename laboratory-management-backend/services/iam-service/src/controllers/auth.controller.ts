import type { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import type { IUser } from "../db/models/User.model.ts";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { AppError } from "../utils/error.util.js";
import { clearJWT, generateJWT, refreshJWT } from "../utils/jwt.util.js";
import patientServiceClient from "../services/patientService.client.js";
import { ROLE_CODES } from "../constants/roles.constant.js";
dotenv.config();

const userService = new UserService();

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Authentication']
    #swagger.description = 'Register a new user account'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'User registration data',
      required: true,
      schema: {
        email: 'string',
        fullName: 'string',
        identityNumber: 'string',
        gender: 'string',
        age: 'number',
        dateOfBirth: 'string',
        password: 'string',
        phoneNumber: 'string',
        address: 'string'
      }
    }
    #swagger.responses[200] = {
      description: 'User registered successfully',
      schema: {
        message: 'User created successfully!'
      }
    }
    #swagger.responses[400] = {
      description: 'Bad request - missing required fields or user already exists',
      schema: {
        message: 'Missing required fields!' | 'Email already exists!' | 'Identity number already exists!'
      }
    }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const {
      email,
      fullName,
      identityNumber,
      gender,
      age,
      phoneNumber,
      dateOfBirth,
      password,
      address,
    } = req.body;

    const existingEmail = await userService.getUserByEmail(email);
    const existingPhoneNumber = await userService.getUserByPhoneNumber(
      phoneNumber
    );
    if (existingEmail || existingPhoneNumber) {
      throw new AppError(
        400,
        existingEmail ? "Email already exists!" : "Phone number already exists!"
      );
    }

    const newUser = await userService.createUser(
      {
        email,
        fullName,
        identityNumber,
        gender,
        age,
        dateOfBirth: new Date(dateOfBirth),
        password: password,
        phoneNumber,
        address,
      },
      undefined
    );

    console.log("[AuthController] Created user role:", newUser.role);
    // Auto-create patient record only for normal users
    if (!newUser.role || newUser.role[0] === ROLE_CODES.USER) {
      console.log("[AuthController] Auto-creating patient for user role USER");
      await patientServiceClient.createPatientForUser(String(newUser._id), {
        id: String(newUser._id),
        email: newUser.email,
      });
    }

    res.status(200).json({
      message: "User created successfully!",
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Authentication']
    #swagger.description = 'Login with email and password'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Login credentials',
      required: true,
      schema: {
        identifier: 'string',
        password: 'string'
      }
    }
    #swagger.responses[200] = {
      description: 'Login successful',
      schema: {
        message: 'Login successful!',
        user: {
          id: 'string',
          email: 'string',
          fullName: 'string',
          role: 'string'
        }
      }
    }
    #swagger.responses[400] = {
      description: 'Bad request - missing credentials, user not found, or invalid password',
      schema: {
        message: 'Missing credentials' | 'User not found!' | 'Invalid password!'
      }
    }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      throw new AppError(400, "Missing credentials");
    }

    const isEmail = /\S+@\S+\.\S+/.test(identifier);

    const user: IUser | null = isEmail
      ? await userService.getUserByEmail(identifier)
      : await userService.getUserByPhoneNumber(identifier);
    if (!user) {
      throw new AppError(400, "User not found!");
    }

    if (user.lockedUntil && Date.now() < user.lockedUntil.getTime()) {
      throw new AppError(429, "Try again later");
    }

    const latestPwEntry = await userService.getLatestPasswordHistory(user._id);
    const expired = user.lastPasswordChange || user.lastResetPassword
      ? Date.now() - (user.lastPasswordChange?.getTime() ?? user.lastResetPassword?.getTime() ?? 0) > 90 * 86400000
      : !latestPwEntry;
    if (expired) throw new AppError(401, "Password expired");

    const lastSeen: Date | undefined =
      user.lastLogin ?? (user as any).updatedAt ?? (user as any).createdAt;

    const shouldCheckInactivity = !!lastSeen;
    const inactive =
      shouldCheckInactivity && Date.now() - lastSeen.getTime() > 30 * 86400000;

    if (inactive) {
      await userService.updateUserInternal(
        user._id,
        { isActive: false },
        user._id
      );
      throw new AppError(401, "Your account has been locked due to inactivity");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const nextAttempts = (user.failedLoginAttempts ?? 0) + 1;

      let lockMinutes = 0;
      if (nextAttempts >= 5 && nextAttempts < 7) lockMinutes = 5;
      else if (nextAttempts >= 7 && nextAttempts < 10) lockMinutes = 15;
      else if (nextAttempts >= 10) lockMinutes = 60;

      const update: Partial<IUser> = {
        failedLoginAttempts: nextAttempts as any,
        lastFailedAt: new Date() as any,
        ...(lockMinutes > 0
          ? { lockedUntil: new Date(Date.now() + lockMinutes * 60_000) as any }
          : {}),
      };
      try {
        await userService.updateUserInternal(user._id, update as any, user._id);
      } catch (_) {}
      throw new AppError(400, "Invalid password!");
    }

    try {
      await userService.updateUserInternal(
        user._id,
        {
          failedLoginAttempts: 0 as any,
          lastFailedAt: undefined as any,
          lockedUntil: undefined as any,
          lastLogin: Date.now(),
        } as any,
        user._id
      );
    } catch (_) {}

    generateJWT(
      res,
      user._id as string,
      user.email as string,
      user.role as string[]
    );

    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Authentication']
    #swagger.description = 'Logout user and clear JWT tokens'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.responses[200] = {
      description: 'Logout successful',
      schema: {
        message: 'Logout successful!'
      }
    }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    clearJWT(res);
    if (req.user) {
    }

    res.status(200).json({ message: "Logout successful!" });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Authentication']
    #swagger.description = 'Refresh access token using refresh token'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.responses[200] = {
      description: 'Token refreshed successfully',
      schema: {
        message: 'Refresh token successful!'
      }
    }
    #swagger.responses[401] = {
      description: 'Unauthorized - no refresh token provided or invalid token',
      schema: {
        message: 'No refresh token provided' | 'Failed to refresh token'
      }
    }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const userId = (req as any).userId;
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError(401, "No refresh token provided");
    }

    // Generate new access token
    refreshJWT(res, userId);

    res.status(200).json({ message: "Refresh token successful!" });
  } catch (error) {
    next(error);
  }
};

export { registerUser, loginUser, logoutUser, refreshToken };
