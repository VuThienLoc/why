import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/card';
import { Label } from '@/components/common/label';
import { Clock } from 'lucide-react';
import type { EventLog } from '@/service/eventLogService';
import { OperatorInfoCard } from './components/EventLog/OperatorInfoCard';
import { EventInfoCard } from './components/EventLog/EventInfoCard';
import { useTranslation } from 'react-i18next';

interface EventLogIAMDetailPageProps {
  log: EventLog;
}

interface IAMUserSnapshot {
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  role?: string[];
  isActive?: boolean;
  gender?: string;
  dateOfBirth?: string;
  identityNumber?: string;
  avatar?: string;
}

export const EventLogIAMDetailPage: React.FC<EventLogIAMDetailPageProps> = ({ log }) => {
  const { t } = useTranslation();

  const formatDateOnly = (iso?: string) => {
    if (!iso) return '-';
    try {
      const date = new Date(iso);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: t('manager.admin') || 'Quản trị viên',
      MANAGER: t('manager.manager') || 'Quản lý',
      LAB_USER: t('manager.labUser') || 'Nhân viên phòng lab',
      SERVICE: t('manager.service') || 'Dịch vụ',
      USER: t('manager.user') || 'Người dùng',
    };
    return labels[role] || role;
  };

  const renderUserInfo = (snapshot: IAMUserSnapshot | null, title: string, options: { hideRole?: boolean } = {}) => {
    if (!snapshot) return null;

    return (
      <div className="space-y-4">
        {title && <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">{title}</h3>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {snapshot.fullName && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.fullName')}</p>
              <p className="font-medium">{snapshot.fullName}</p>
            </div>
          )}
          {snapshot.avatar && (
            <div>
              <p className="text-gray-500">{t('userProfile.personalInfo')}</p>
              <p className="font-medium">Avatar</p>
              <img 
                src={snapshot.avatar} 
                alt="Avatar" 
                className="w-16 h-16 rounded-full object-cover border border-gray-200 mt-1"
              />
            </div>
          )}
          {snapshot.email && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.email')}</p>
              <p className="font-medium">{snapshot.email}</p>
            </div>
          )}
          {snapshot.phoneNumber && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.phone')}</p>
              <p className="font-medium">{snapshot.phoneNumber}</p>
            </div>
          )}
          {snapshot.address && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.address')}</p>
              <p className="font-medium">{snapshot.address}</p>
            </div>
          )}
          {snapshot.gender && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.gender')}</p>
              <p className="font-medium">{snapshot.gender === 'male' ? t('eventLog.iam.male') : snapshot.gender === 'female' ? t('eventLog.iam.female') : snapshot.gender}</p>
            </div>
          )}
          {snapshot.dateOfBirth && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.dob')}</p>
              <p className="font-medium">{formatDateOnly(snapshot.dateOfBirth)}</p>
            </div>
          )}
          {snapshot.identityNumber && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.identityNumber')}</p>
              <p className="font-medium">{snapshot.identityNumber}</p>
            </div>
          )}
          {!options.hideRole && snapshot.role && snapshot.role.length > 0 && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.role')}</p>
              <p className="font-medium">
                {snapshot.role.map((r) => getRoleLabel(r)).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEventContent = () => {
    const action = String(log.action ?? '').toUpperCase();
    
    if (action === 'CREATE') {
      const snapshot = log.new_values as IAMUserSnapshot;
      return renderUserInfo(snapshot, t('eventLog.iam.createdUser'));
    } else if (action === 'DELETE') {
      // For DELETE, usually old_values contains the deleted data
      const snapshot = (log.old_values || log.new_values) as IAMUserSnapshot;
      return renderUserInfo(snapshot, t('eventLog.iam.deletedUser'));
    } else if (action === 'UPDATE') {
      const oldSnapshot = log.old_values as IAMUserSnapshot;
      const newSnapshot = log.new_values as IAMUserSnapshot;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-r pr-4">
              <h3 className="font-semibold text-lg text-gray-900 border-b pb-2 mb-4">{t('eventLog.iam.oldData')}</h3>
              {renderUserInfo(oldSnapshot, '')}
            </div>
            <div className="pl-4">
              <h3 className="font-semibold text-lg text-gray-900 border-b pb-2 mb-4">{t('eventLog.iam.newData')}</h3>
              {renderUserInfo(newSnapshot, '')}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-gray-600">{t('eventLog.oldValue')}</Label>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-64 mt-1">
            {log.old_values ? JSON.stringify(log.old_values, null, 2) : t('eventLog.empty')}
          </pre>
        </div>
        <div>
          <Label className="text-sm text-gray-600">{t('eventLog.newValue')}</Label>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-64 mt-1">
            {log.new_values ? JSON.stringify(log.new_values, null, 2) : t('eventLog.empty')}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <OperatorInfoCard log={log} />
      <EventInfoCard log={log} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            {t('eventLog.changedData')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderEventContent()}
        </CardContent>
      </Card>
    </div>
  );
};
