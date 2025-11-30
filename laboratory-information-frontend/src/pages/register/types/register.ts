export type IconName = 
  | 'mail' 
  | 'lock' 
  | 'user' 
  | 'phone' 
  | 'calendar' 
  | 'id' 
  | 'address';

export interface RegisterInputFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: IconName;
  required?: boolean;
  inputSize?: 'sm' | 'md';
}

export interface RegisterFormProps {
  onBackToLogin: () => void;
  onBackToHome?: () => void;
}

export interface PersonalInfoFieldsProps {
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  passwordError: string;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface AdditionalInfoFieldsProps {
  phone: string;
  setPhone: (value: string) => void;
  gender: 'Male' | 'Female' | 'Other';
  setGender: (value: 'Male' | 'Female' | 'Other') => void;
  dob: string;
  setDob: (value: string) => void;
  idNumber: string;
  setIdNumber: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
}

export interface FooterActionsProps {
	onBackToLogin: () => void;
	onBackToHome?: () => void;
}

// API Types
export interface RegisterRequest {
  email: string;
  fullName: string;
  identityNumber: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  dateOfBirth: string;
  password: string;
  phoneNumber: string;
  address: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

export interface ApiError {
  message: string;
  status: number;
}