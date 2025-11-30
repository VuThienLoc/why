export interface AuthenticatedUser {
  _id: string;
  email: string;
  fullName: string;
  identityNumber: string;
  gender: string;
  age: number;
  dateOfBirth: Date;
  phoneNumber: string;
  address: string;
  role: string[];
  isActive: boolean;
  isDeleted: boolean;
}