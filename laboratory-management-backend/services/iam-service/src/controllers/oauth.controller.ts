import type { NextFunction, Request, Response } from "express";
import passport from "../config/oauth.config.js";
import { generateJWT } from "../utils/jwt.util.js";
import { AppError } from "../utils/error.util.js";
import type { IUser } from "../db/models/User.model.js";
import { OAuthService } from "../services/oauth.service.js";
import jwt from "jsonwebtoken";

const oauthService = new OAuthService();

const googleLogin = (req: Request, res: Response, next: NextFunction): void => {
  /*
    #swagger.auto = false
    #swagger.tags = ['OAuth Authentication']
    #swagger.description = 'Initiate Google OAuth login'
    #swagger.responses[302] = {
      description: 'Redirect to Google OAuth'
    }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const returnTo = (req.query.returnTo as string) || "/";

    const stateToken = jwt.sign(
      { returnTo, timestamp: Date.now() },
      process.env.OAUTH_SECRET!,
      { expiresIn: "10m" }
    );

    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: stateToken,
    })(req, res);
  } catch (error) {
    next(error);
  }
};

const googleCallback = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  /*
    #swagger.auto = false
    #swagger.tags = ['OAuth Authentication']
    #swagger.description = 'Handle Google OAuth callback'
    #swagger.responses[200] = {
      description: 'OAuth login successful',
      schema: {
        message: 'Google login successful!',
        accessToken: 'string',
        refreshToken: 'string',
        user: {
          id: 'string',
          email: 'string',
          fullName: 'string',
          role: 'string',
          provider: 'string'
        },
        redirectTo: 'string'
      }
    }
    #swagger.responses[401] = {
      description: 'OAuth authentication failed',
      schema: {
        message: 'Google authentication failed'
      }
    }
    #swagger.responses[500] = { description: 'Internal server error' }
  */

  passport.authenticate(
    "google",
    {
      session: false,
    },
    async (err: any, user: IUser | false, info: any) => {
      try {
        if (err || !user) {
          console.error("Google OAuth error:", err || "No user returned");
          return res.status(401).json({
            message: "Google authentication failed",
            error: err?.message || "No user returned",
          });
        }

        const { accessToken, refreshToken } = generateJWT(
          res,
          user._id as string,
          user.email as string,
          user.role as string[]
        );

        let returnTo = "/";
        if (req.query.state) {
          try {
            const decodedState = jwt.verify(
              req.query.state as string,
              process.env.OAUTH_SECRET!
            ) as any;
            returnTo = decodedState.returnTo || "/";
          } catch (stateError) {
            console.warn("Failed to decode OAuth state:", stateError);
          }
        }

        const frontendUrl = new URL(`${process.env.FRONTEND_URL}/auth/google/callback`);
        frontendUrl.hash = new URLSearchParams({
          accessToken: accessToken,
          refreshToken: refreshToken,
          user: JSON.stringify({
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            provider: user.provider || "google",
            avatar: user.avatar,
          })
        }).toString();

        res.redirect(frontendUrl.toString());
      } catch (error) {
        console.error("Error in Google callback:", error);
        next(error);
      }
    }
  )(req, res, next);
};

const getOAuthStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['OAuth Authentication']
    #swagger.description = 'Get current user OAuth status'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.responses[200] = {
      description: 'OAuth status retrieved',
      schema: {
        isOAuthUser: 'boolean',
        provider: 'string',
        hasPassword: 'boolean'
      }
    }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const user = req.user as any;
    if (!user) {
      throw new AppError(401, "Authentication required");
    }

    const status = await oauthService.getOAuthUserStatus(user._id);

    res.status(200).json(status);
  } catch (error) {
    next(error);
  }
};

const linkOAuthAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['OAuth Authentication']
    #swagger.description = 'Link OAuth account to existing local account'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'OAuth linking data',
      required: true,
      schema: {
        provider: 'string',
        providerId: 'string',
        email: 'string'
      }
    }
    #swagger.responses[200] = {
      description: 'OAuth account linked successfully'
    }
    #swagger.responses[400] = {
      description: 'Bad request - missing data or account already linked'
    }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const user = req.user as any;
    const { provider, providerId, email } = req.body;

    if (!user || !provider || !providerId) {
      throw new AppError(400, "Missing required data");
    }

    await oauthService.linkOAuthAccount(user, {
      email: email || user.email,
      fullName: user.fullName,
      provider: provider as "google",
      providerId,
    });

    res.status(200).json({ message: "OAuth account linked successfully" });
  } catch (error) {
    next(error);
  }
};

export { googleLogin, googleCallback, getOAuthStatus, linkOAuthAccount };
