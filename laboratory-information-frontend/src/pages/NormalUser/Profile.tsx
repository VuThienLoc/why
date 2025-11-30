import React, { useMemo } from 'react';
import { Card, CardContent } from '../../components/common/card';

interface ProfileData {
  id: string;
  email: string;
  name: string;
  identify_number?: string;
  gender?: string;
  age?: number;
  date_of_birth?: string;
}

const ReadonlyField: React.FC<{ label: string; value?: string | number; colSpan?: string }> = ({
  label,
  value,
  colSpan,
}) => {
  return (
    <div className={colSpan ?? 'col-span-12 md:col-span-6'}>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <div className="w-full rounded-lg border bg-white px-3 py-2 text-gray-800 shadow-sm">
        {value ?? '—'}
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  // ✅ Dữ liệu tĩnh (mẫu)
  const data: ProfileData = {
    id: 'USER001',
    email: 'example.user@gmail.com',
    name: 'Nguyễn Văn A',
    identify_number: '079123456789',
    gender: 'Nam',
    age: 25,
    date_of_birth: '2000-05-14',
  };

  const genderLabel = useMemo(() => {
    const g = data?.gender?.toLowerCase();
    if (g === 'male' || g === 'nam') return 'Nam';
    if (g === 'female' || g === 'nữ' || g === 'nu') return 'Nữ';
    if (g) return g;
    return '—';
  }, [data]);

  const ageLabel = data?.age ? `${data.age} tuổi` : '—';

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-medium text-gray-900 mb-1">
          Thông tin cá nhân
        </h1>
        <p className="text-sm text-gray-500">Chi tiết hồ sơ cơ bản của bạn</p>
      </div>

      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-12 gap-4">
            <ReadonlyField label="Họ tên đầy đủ" value={data.name} colSpan="col-span-12" />
            <ReadonlyField label="Mã người dùng" value={data.id} />
            <ReadonlyField label="Email" value={data.email} />
            <ReadonlyField label="Giới tính" value={genderLabel} />
            <ReadonlyField label="Tuổi" value={ageLabel} />
            <ReadonlyField label="Ngày sinh" value={data.date_of_birth} />
            <ReadonlyField label="Số CCCD" value={data.identify_number} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
