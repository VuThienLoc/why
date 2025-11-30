import type { User } from "./User";


export interface LoginFormProps {
  onLogin: (user: User) => void; 
  // onShowForgotPassword: () => void;
  onBackToHome: () => void;
  onShowRegister: () => void;
}

export interface LoginType {
  onShowLogin: () => void;
}


export interface RegisterType {
  onShowRegister: () => void;
}

// Dùng cho component có cả hai
export interface LoginAndRegisterType extends LoginType, RegisterType {}
