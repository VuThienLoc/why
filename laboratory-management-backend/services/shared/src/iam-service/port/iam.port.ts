import { AuthenticatedUser } from "../../types/authenticatedUser.type.js";

export interface IIamClient {
  getUserById(id: string): Promise<AuthenticatedUser | null>;
  validateUser(id: string): Promise<boolean>;
}