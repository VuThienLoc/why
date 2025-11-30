import React, { useState } from 'react';
import { Input } from '../../components/common/input';
import { Label } from '../../components/common/label';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import {useTranslation} from 'react-i18next';

interface Props {
  id: string;
  label: string;
    type?: string;
    placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: 'mail' | 'lock';
}

export function LoginInputField({ id, label, type = 'text', placeholder, value, onChange, icon }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();
  const Icon = icon === 'mail' ? Mail : icon === 'lock' ? Lock : null;
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm text-gray-700">
        {label}
      </Label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />}
        <Input
          id={id}
          type={inputType}
          placeholder={placeholder}
          className={`${Icon ? 'pl-10' : 'pl-3'} ${isPasswordField ? 'pr-10' : 'pr-3'} h-12 border-gray-200 focus:border-blue-400 rounded-lg`}
          value={value}
          onChange={onChange}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
