
import type { UserFormData, ValidationErrors } from './ManagerTypes';
import { userService } from '../../../service/userService';

// Align frontend validation with backend Joi schema in iam-service/src/validators/user.validator.ts

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Phone must be exactly 10 digits (backend expects /^[0-9]{10}$/)
export function isValidPhone(phone: string): boolean {
  // Allow formatted input like +84-901-234-567 or spaces/dashes; strip non-digits
  const digits = (phone || '').replace(/\D/g, '');
  return digits.length === 10;
}

// Identity number: digits only, length between 9 and 12 (backend requires min 9, max 12)
export function isValidIdentifyNumber(identify_number: string): boolean {
  return /^\d{9,12}$/.test(identify_number);
}

// Password: backend requires minimum 6 characters for create; keep simple check here
export function validatePassword(password: string): string {
  if (!password || password.length === 0) return 'Mật khẩu là bắt buộc';
  if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
  if (!/[A-Z]/.test(password)) return 'Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa';
  if (!/\d/.test(password)) return 'Mật khẩu phải chứa ít nhất 1 chữ số';
  return '';
}

export async function validateUserForm(formData: UserFormData, mode: 'create' | 'edit' | 'view', excludeUserId?: string): Promise<ValidationErrors> {
  const errors: ValidationErrors = {};

  if (mode === 'view') return errors;

  if (!formData.fullName?.trim()) {
    errors.fullName = 'Họ tên là bắt buộc';
  }

  if (!formData.email?.trim()) {
    errors.email = 'Email là bắt buộc';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Email không hợp lệ';
  } else if (mode === 'create' || mode === 'edit') {
    // Kiểm tra email trùng lặp khi tạo mới hoặc chỉnh sửa (bỏ qua chính user khi chỉnh sửa)
    try {
      const emailExists = await userService.checkEmailExists(formData.email, excludeUserId);
      if (emailExists) {
        errors.email = 'Email đã đăng kí';
      }
    } catch (error) {
      console.warn('Không thể kiểm tra email:', error);
    }
  }

  // Password required for create, optional for edit
  if (mode === 'create' || (formData.password && formData.password.length > 0)) {
    const passwordError = validatePassword(formData.password || '');
    if (passwordError) errors.password = passwordError;
  }

  if (!formData.phone_number?.trim()) {
    errors.phone_number = 'Số điện thoại là bắt buộc';
  } else if (!isValidPhone(formData.phone_number)) {
    errors.phone_number = 'Số điện thoại phải có đúng 10 chữ số';
  }

  if (!formData.identify_number?.trim()) {
    errors.identify_number = 'Số CMND/CCCD là bắt buộc';
  } else if (!isValidIdentifyNumber(formData.identify_number)) {
    errors.identify_number = 'CMND/CCCD phải là số và có độ dài từ 9 đến 12 ký tự';
  } else if (mode === 'create' || mode === 'edit') {
    // Kiểm tra CMND/CCCD trùng lặp khi tạo mới hoặc chỉnh sửa (bỏ qua chính user khi chỉnh sửa)
    try {
      const exists = await userService.checkIdentityNumberExists(formData.identify_number, excludeUserId);
      if (exists) {
        errors.identify_number = 'CMND/CCCD đã đăng kí';
      }
    } catch (error) {
      console.warn('Không thể kiểm tra CMND/CCCD:', error);
    }
  }

  if (!formData.date_of_birth) {
    errors.date_of_birth = 'Ngày sinh là bắt buộc';
  } else {
    const d = new Date(formData.date_of_birth);
    if (isNaN(d.getTime())) {
      errors.date_of_birth = 'Ngày sinh không hợp lệ';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dateStr = formData.date_of_birth.includes('T') ? formData.date_of_birth.split('T')[0] : formData.date_of_birth;
      const parts = dateStr.split('-');
      
      let inputDate = d;
      if (parts.length === 3) {
         inputDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }

      if (inputDate > today) {
        errors.date_of_birth = 'Ngày sinh không hợp lệ';
      }
    }
  }

  if (!formData.address?.trim()) {
    errors.address = 'Địa chỉ là bắt buộc';
  }

  // Gender must be one of allowed values
  if (!['Male', 'Female', 'Other'].includes(formData.gender)) {
    errors.gender = 'Giới tính không hợp lệ';
  }

  return errors;
}
