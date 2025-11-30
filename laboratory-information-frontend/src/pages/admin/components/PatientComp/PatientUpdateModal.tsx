import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../components/common/button';
import { Input } from '../../../../components/common/input';
import { Label } from '../../../../components/common/label';
// import { Select } from '../../../components/common/select';
import type { PatientDetail, PatientModalMode } from '../../hooks/usePatientModal';

interface PatientModalProps {
  isOpen: boolean;
  mode: PatientModalMode;
  patient: PatientDetail | null;
  onClose: () => void;
  onSubmit?: (data: Partial<PatientDetail>) => Promise<void>;
}

interface PatientFormState {
  patient_code?: string;
  fullName?: string;
  email?: string;
  identityNumber?: string;
  phoneNumber?: string;
  gender?: string;
  age?: number | string;
  dateOfBirth?: string;
  address?: string;
  emergency_name?: string;
  emergency_phone?: string;
  created_by?: string;
  created_at?: string;
}

export const Patient_UpdateModal: React.FC<PatientModalProps> = ({ isOpen, mode, patient, onClose, onSubmit }) => {
  const [formState, setFormState] = useState<PatientFormState>({});

  const isReadOnly = mode === 'view';

  const title = mode === 'create' ? 'Thêm bệnh nhân mới' : mode === 'edit' ? 'Chỉnh sửa bệnh nhân' : 'Chi tiết bệnh nhân';

  const isFieldDisabled = (field: string) => {
    if (mode === 'view') return true;
    if (mode === 'create') return false;
    // mode === 'edit' -> only emergency fields are editable
    return !(field === 'emergency_name' || field === 'emergency_phone');
  };

  useEffect(() => {
    if (patient && (mode === 'view' || mode === 'edit')) {
      // Format date of birth to YYYY-MM-DD
      const dateOfBirth = patient.user?.dateOfBirth ? new Date(patient.user.dateOfBirth).toISOString().split('T')[0] : '';
      
      setFormState({
        patient_code: patient.patient_code ?? '',
        fullName: patient.user?.fullName ?? '',
        email: patient.user?.email ?? '',
        identityNumber: patient.user?.identityNumber ?? '',
        phoneNumber: patient.user?.phoneNumber ?? '',
        gender: patient.user?.gender ?? '',
        age: patient.user?.age ?? '',
        dateOfBirth,
        address: patient.user?.address ?? '',
        emergency_name: patient.emergency_contact?.name ?? '',
        emergency_phone: patient.emergency_contact?.phone ?? '',
        created_by: patient.created_by ?? '',
        created_at: patient.created_at ?? '',
      });
    } else if (mode === 'create') {
      setFormState({});
    }
  }, [patient, mode]);

  const handleChange = (field: keyof PatientFormState, value: string | number) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (onSubmit) await onSubmit(formState);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 sm:h-10 sm:w-10">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 [&_label]:mb-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="sm:col-span-2">
              <Label htmlFor="fullName" className="text-sm sm:text-base">Họ và tên</Label>
              <Input
                id="fullName"
                value={formState.fullName ?? ''}
                onChange={(e) => handleChange('fullName', e.target.value)}
                disabled={isFieldDisabled('fullName')}
                className="text-sm sm:text-base"
              />
            </div>

            <div>
              <Label htmlFor="patient_code" className="text-sm sm:text-base">Mã bệnh nhân</Label>
              <Input id="patient_code" value={formState.patient_code ?? ''} disabled className="text-sm sm:text-base" />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
              <Input
                id="email"
                type="email"
                value={formState.email ?? ''}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={isFieldDisabled('email')}
                className="text-sm sm:text-base"
              />
            </div>

            <div>
              <Label htmlFor="identityNumber" className="text-sm sm:text-base">CMND/CCCD</Label>
              <Input
                id="identityNumber"
                value={formState.identityNumber ?? ''}
                onChange={(e) => handleChange('identityNumber', e.target.value)}
                disabled={isFieldDisabled('identityNumber')}
                className="text-sm sm:text-base"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber" className="text-sm sm:text-base">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                value={formState.phoneNumber ?? ''}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                disabled={isFieldDisabled('phoneNumber')}
                className="text-sm sm:text-base"
              />
            </div>

            <div>
              <Label htmlFor="gender" className="text-sm sm:text-base">Giới tính</Label>
              <select
                id="gender"
                value={formState.gender ?? ''}
                onChange={(e) => handleChange('gender', e.target.value)}
                disabled={isFieldDisabled('gender')}
                className="flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm sm:text-base"
              >
                <option value="">Chọn</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <Label htmlFor="age" className="text-sm sm:text-base">Tuổi</Label>
              <Input id="age" type="number" value={formState.age ?? ''} onChange={(e) => handleChange('age', e.target.value)} disabled={isFieldDisabled('age')} className="text-sm sm:text-base" />
            </div>

            <div>
              <Label htmlFor="dateOfBirth" className="text-sm sm:text-base">Ngày sinh</Label>
              <Input id="dateOfBirth" type="date" value={formState.dateOfBirth ?? ''} onChange={(e) => handleChange('dateOfBirth', e.target.value)} disabled={isFieldDisabled('dateOfBirth')} className="text-sm sm:text-base" />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="address" className="text-sm sm:text-base">Địa chỉ</Label>
              <Input id="address" value={formState.address ?? ''} onChange={(e) => handleChange('address', e.target.value)} disabled={isFieldDisabled('address')} className="text-sm sm:text-base" />
            </div>

            <div className="sm:col-span-2">
              <h3 className="font-medium text-sm sm:text-base">Thông tin liên hệ khẩn cấp</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="emergency_name" className="text-sm sm:text-base">Tên liên hệ</Label>
                  <Input id="emergency_name" value={formState.emergency_name ?? ''} onChange={(e) => handleChange('emergency_name', e.target.value)} disabled={isFieldDisabled('emergency_name')} className="text-sm sm:text-base" />
                </div>
                <div>
                  <Label htmlFor="emergency_phone" className="text-sm sm:text-base">Số điện thoại</Label>
                  <Input id="emergency_phone" value={formState.emergency_phone ?? ''} onChange={(e) => handleChange('emergency_phone', e.target.value)} disabled={isFieldDisabled('emergency_phone')} className="text-sm sm:text-base" />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto text-sm sm:text-base">{isReadOnly ? 'Đóng' : 'Hủy'}</Button>
          {!isReadOnly && (
            <Button type="submit" onClick={handleSubmit} className="w-full sm:w-auto text-sm sm:text-base">{mode === 'create' ? 'Thêm bệnh nhân' : 'Cập nhật'}</Button>
          )}
        </div>
      </div>
    </div>
  );
};
