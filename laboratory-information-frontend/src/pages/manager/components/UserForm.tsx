import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../components/common/button';
import { Input } from '../../../components/common/input';
import { Label } from '../../../components/common/label';
import type { UserFormData, ValidationErrors, ManagerUser } from '../types/ManagerTypes';
import { validateUserForm } from '../types/validators';
import { useTranslation } from 'react-i18next';
interface UserFormProps {
  mode: 'create' | 'edit' | 'view';
  user?: ManagerUser | null;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
}

export function UserForm({ mode, user, onSubmit, onCancel }: UserFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<UserFormData>({
    fullName: '',
    email: '',
    password: '',
    role: ['USER'],
    phone_number: '',
    identify_number: '',
    gender: 'Male',
    date_of_birth: '',
    address: '',
    active: true,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (user && (mode === 'edit' || mode === 'view')) {
      setFormData({
        fullName: user.name || '',
        email: user.email,
        password: '',
        role: user.role,
        phone_number: user.phone_number || '',
        identify_number: user.identify_number || '',
        gender: (user.gender as 'Male' | 'Female' | 'Other') || 'Male',
        date_of_birth: user.date_of_birth || '',
        age: user.age,
        address: user.address || '',
        active: user.active,
      });
    }
  }, [user, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;

    try {
  const validationErrors = await validateUserForm(formData, mode, user?.id);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length === 0) {
        try {
          await onSubmit(formData);
        } catch (error) {
          if (error instanceof Error) {
            // Kiểm tra lỗi từ MongoDB (E11000 duplicate key error)
            if (error.message.includes('E11000')) {
              if (error.message.includes('email_1 dup key')) {
                setErrors(prev => ({ ...prev, email: 'Email đã đăng kí' }));
              } else if (error.message.includes('identityNumber')) {
                setErrors(prev => ({ ...prev, identify_number: 'CMND/CCCD đã đăng kí' }));
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const handleChange = (field: keyof UserFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const isReadOnly = mode === 'view';

  const getTitle = () => {
    switch (mode) {
        case 'create': return t('manager.createUser');
      case 'edit': return t('manager.editUser');
      case 'view': return t('manager.viewUser');
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-3 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-3xl w-full my-auto max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 pr-2 break-words">{getTitle()}</h2>
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 flex-shrink-0">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-140px)] [&_label]:mb-1.5 sm:[&_label]:mb-2 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {/* Full Name */}
            <div className="md:col-span-2">
              <Label htmlFor="fullName" className="text-xs sm:text-sm md:text-base">{t('manager.fullName')}</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Nguyễn Văn A"
                disabled={isReadOnly}
                aria-invalid={!!errors.fullName}
                className="text-xs sm:text-sm md:text-base h-9 sm:h-10"
              />
              {errors.fullName && <p className="mt-1 sm:mt-1.5 md:mt-2 text-xs sm:text-sm text-red-500">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-xs sm:text-sm md:text-base">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@example.com"
                disabled={isReadOnly || mode === 'edit'}
                aria-invalid={!!errors.email}
                className="text-xs sm:text-sm md:text-base h-9 sm:h-10"
              />
              {errors.email && <p className="mt-1 sm:mt-1.5 md:mt-2 text-xs sm:text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            {mode !== 'view' && (
              <div>
                <Label htmlFor="password" className="text-xs sm:text-sm md:text-base">{t('manager.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder={mode === 'edit' ? 'Để trống nếu không đổi' : '••••••••'}
                  aria-invalid={!!errors.password}
                  className="text-xs sm:text-sm md:text-base h-9 sm:h-10"
                />  
                {errors.password && <p className="mt-1 sm:mt-1.5 md:mt-2 text-xs sm:text-sm text-red-500">{errors.password}</p>}
              </div>
            )}

            {/* Role */}
            <div>
              <Label htmlFor="role" className="text-xs sm:text-sm md:text-base">{t('manager.role')}</Label>
              <select
                id="role"
                value={Array.isArray(formData.role) ? formData.role[0] : 'USER'}
                onChange={(e) => {
                  const selectedRole = e.target.value as 'ADMIN' | 'MANAGER' | 'SERVICE' | 'LAB_USER' | 'USER';
                  setFormData((prev) => ({ ...prev, role: [selectedRole] }));
                  if (errors.role) {
                    setErrors((prev) => {
                      const updated = { ...prev };
                      delete updated.role;
                      return updated;
                    });
                  }
                }}
                disabled={isReadOnly}
                className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-input-background px-2.5 sm:px-3 py-1 text-xs sm:text-sm md:text-base"
              >
                <option value="USER">{t('manager.user')}</option>
                <option value="LAB_USER">{t('manager.labUser')}</option>
                <option value="SERVICE">{t('manager.service')}</option>
                <option value="MANAGER">{t('manager.manager')}</option>
                <option value="ADMIN">{t('manager.admin')}</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone_number" className="text-xs sm:text-sm md:text-base">{t('manager.phoneNumber')}</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => handleChange('phone_number', e.target.value)}
                placeholder="+84-901-234-567"
                disabled={isReadOnly}
                aria-invalid={!!errors.phone_number}
                className="text-xs sm:text-sm md:text-base h-9 sm:h-10"
              />
              {errors.phone_number && <p className="mt-1 sm:mt-1.5 md:mt-2 text-xs sm:text-sm text-red-500">{errors.phone_number}</p>}
            </div>

            {/* Identify */}
            <div>
              <Label htmlFor="identify_number" className="text-xs sm:text-sm md:text-base">{t('manager.identifyNumber')}</Label>
              <Input
                id="identify_number"
                value={formData.identify_number}
                onChange={(e) => handleChange('identify_number', e.target.value)}
                placeholder="079089001234"
                disabled={isReadOnly}
                aria-invalid={!!errors.identify_number}
                className="text-xs sm:text-sm md:text-base h-9 sm:h-10"
              />
              {errors.identify_number && <p className="mt-1 sm:mt-1.5 md:mt-2 text-xs sm:text-sm text-red-500">{errors.identify_number}</p>}
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="gender" className="text-xs sm:text-sm md:text-base">{t('manager.gender')}</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                disabled={isReadOnly}
                className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-input-background px-2.5 sm:px-3 py-1 text-xs sm:text-sm md:text-base"
              >
                <option value="Male">{t('manager.male')}</option>
                <option value="Female">{t('manager.female')}</option>
                <option value="Other">{t('manager.other')}</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date_of_birth" className="text-xs sm:text-sm md:text-base">{t('manager.dateOfBirth')}</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleChange('date_of_birth', e.target.value)}
                disabled={isReadOnly}
                aria-invalid={!!errors.date_of_birth}
                className="text-xs sm:text-sm md:text-base h-9 sm:h-10"
              />
              {errors.date_of_birth && <p className="mt-1 sm:mt-1.5 md:mt-2 text-xs sm:text-sm text-red-500">{errors.date_of_birth}</p>}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <Label htmlFor="address" className="text-xs sm:text-sm md:text-base">{t('manager.address')}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder=""
                disabled={isReadOnly}
                aria-invalid={!!errors.address}
                className="text-xs sm:text-sm md:text-base h-9 sm:h-10"
              />
              {errors.address && <p className="mt-1 sm:mt-1.5 md:mt-2 text-xs sm:text-sm text-red-500">{errors.address}</p>}
            </div>

            {/* Active */}
            {mode !== 'create' && (
              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => handleChange('active', e.target.checked)}
                  disabled={isReadOnly}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <Label htmlFor="active" className="text-xs sm:text-sm md:text-base">Tài khoản hoạt động</Label>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 border-t border-gray-200 flex-shrink-0">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto text-xs sm:text-sm md:text-base order-2 sm:order-1">
            {mode === 'view' ? t('manager.close') : t('manager.cancel')}
          </Button>
          {mode !== 'view' && (
            <Button type="submit" onClick={handleSubmit} className="w-full sm:w-auto text-xs sm:text-sm md:text-base order-1 sm:order-2">
              {mode === 'create' ? t('manager.createUser') : t('manager.updateUser')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
