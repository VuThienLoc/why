import { AppError } from "../utils/error.util.js";
import { userRepository } from "../repositories/index.js";
import { sendResetPasswordEmail } from "../utils/email.util.js";
import { UserService } from "./user.service.js";
import jwt, { SignOptions } from "jsonwebtoken";
import { logEvent } from "../utils/logging.util.js";

const userSerivce = new UserService();

const recentResetRequests = new Map<string, number>();
const RESET_REQUEST_COOLDOWN = 5000;

export class EmailService {
  async requestPasswordReset(email: string): Promise<void> {
    try {
      if (!email) throw new AppError(400, "Email is required");

      const user = await userRepository.findOne({ email });
      if (!user) throw new AppError(400, "User with given email doesn't exist");

      const dedicatedToken = jwt.sign(
        { userId: user._id, changedDate: user.lastResetPassword?.getTime() ?? 0 },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: process.env.JWT_EXPIRY } as SignOptions
      );

      await sendResetPasswordEmail(user.email, dedicatedToken);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async confirmPasswordReset(token: string, password: string): Promise<void> {
    try {
      if (!token) throw new AppError(400, "Dedicated token is required");

      const now = Date.now();
      const lastRequestTime = recentResetRequests.get(token);
      if (lastRequestTime && (now - lastRequestTime) < RESET_REQUEST_COOLDOWN) {
        console.log("Duplicate password reset request detected, ignoring");
        return;
      }
      recentResetRequests.set(token, now);

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY as string
      ) as {
        userId: string;
        changedDate: number;
      };

      const userFound = await userRepository.findById(decoded.userId);
      if (!userFound) throw new AppError(400, "User ID doesn't exist");

      if (
        (userFound.lastResetPassword?.getTime() ?? 0) !== decoded.changedDate
      ) {
        throw new AppError(400, "Password already changed with current link");
      }

      await userSerivce.updateUser(userFound._id, {
        password: password,
        lastPasswordChange: new Date(),
      });

      recentResetRequests.delete(token);

      await logEvent({
        eventCode: "E_00024",
        action: "UPDATE",
        eventMessage: `User ${userFound?.fullName} changed password through email successfully`,
        performedBy: userFound._id,
        serviceName: "IAM_SERVICE",
        entityId: userFound._id,
        newValues: { passwordChanged: true } as Record<string, unknown>,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
