
import { Input } from '../../components/common/input';
import { Label } from '../../components/common/label';
import { Mail, Lock, User, Phone, Calendar, IdCard, MapPin, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { RegisterInputFieldProps } from './types/register';

export function RegisterInputField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  required = true,
}: RegisterInputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const Icon =
    icon === 'mail' ? Mail :
    icon === 'lock' ? Lock :
    icon === 'user' ? User :
    icon === 'phone' ? Phone :
    icon === 'calendar' ? Calendar :
    icon === 'id' ? IdCard :
    icon === 'address' ? MapPin :
    null;

  const heightClass = 'h-11';
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />}
        <Input
          id={id}
          type={inputType}
          placeholder={placeholder}
          className={`${Icon ? 'pl-10' : 'pl-3'} ${isPasswordField ? 'pr-10' : 'pr-3'} ${heightClass} border-gray-200 focus:border-blue-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100`}
          value={value}
          onChange={onChange}
          required={required}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
