export function isValidEmail(email: string) {
  return /.+@.+\..+/.test(email);
}

export function isValidPhone(phone: string) {
  return /^\d{10,11}$/.test(phone);
}

export function validatePassword(password: string) {
  if (password.length === 0) return '';
  if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
  if (password.length > 12) return 'Mật khẩu không được vượt quá 12 ký tự';
  if (!/[A-Z]/.test(password)) return 'Mật khẩu phải chứa ít nhất 1 chữ hoa';
  if (!/[a-z]/.test(password)) return 'Mật khẩu phải chứa ít nhất 1 chữ thường';
  if (!/\d/.test(password)) return 'Mật khẩu phải chứa ít nhất 1 chữ số';
  return '';
}
