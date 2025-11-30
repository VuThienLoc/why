import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/card';
import { Label } from '@/components/common/label';
import { Eye } from 'lucide-react';
import type { EventLog } from '@/service/eventLogService';
import { useTranslation } from 'react-i18next';

interface OperatorInfoCardProps {
  log: EventLog;
}

export const OperatorInfoCard: React.FC<OperatorInfoCardProps> = ({ log }) => {
  const { t } = useTranslation();
  const formatDate = (iso?: string) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleString('vi-VN');
    } catch {
      return iso;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          {t('eventLog.operatorInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm text-gray-600">{t('eventLog.iam.fullName')}</Label>
            <p className="text-lg mt-1">{log.operator_name || '-'}</p>
          </div>
          <div>
            <Label className="text-sm text-gray-600">{t('eventLog.iam.email')}</Label>
            <p className="text-lg mt-1">{log.operator_gmail || '-'}</p>
          </div>
          <div>
            <Label className="text-sm text-gray-600">{t('eventLog.executionTime')}</Label>
            <p className="text-lg mt-1">{formatDate(log.occurred_at)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
