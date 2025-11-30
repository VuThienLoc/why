import type { NextFunction, Request, Response } from "express";
import { EmailService } from "../services/email.service.js";
import { AppError } from "../utils/error.util.js";

const emailService = new EmailService();

const sendEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Email Service']
    #swagger.description = ''
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'User email',
      required: true,
      schema: {
        email: 'string@example.com'
      }
    }
    #swagger.responses[200] = {
      description: 'Log retrieved successfully',
      schema: {
        message: 'Email sent successfully!',
      }
    }
    #swagger.responses[400] = { description: 'Email is required' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[404] = { description: 'User not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const email = req.body.email;
    if (!email) {
      throw new AppError(400, "Email is required");
    }

    await emailService.requestPasswordReset(email);
    res.status(200).json({
        message: "Email sent successfully"
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Email Service']
    #swagger.description = 'Reset password'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'User data',
      required: true,
      schema: {
        dedicatedToken: 'string',
        password: 'string',
      }
    }
    #swagger.responses[200] = {
      description: 'Password reset successfully',
      schema: {
        message: 'Password reset successfully!',
      }
    }
    #swagger.responses[400] = { description: 'Password and token are required' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[404] = { description: 'User not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const password = req.body.password;
    const token = req.body.dedicatedToken;
    if (!password || !token) {
      throw new AppError(400, "Password and token are required");
    }

    await emailService.confirmPasswordReset(
      token,
      password,
    );
    res.status(200).json({
      message: "Reset password successfully!",
    });
  } catch (error) {
    next(error);
  }
};

export { sendEmail, resetPassword };
