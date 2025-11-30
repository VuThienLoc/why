import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/card';
import { Label } from '@/components/common/label';
import { Hash } from 'lucide-react';
import type { EventLog } from '@/service/eventLogService';
import { useTranslation } from 'react-i18next';

interface EventInfoCardProps {
  log: EventLog;
}

export const EventInfoCard: React.FC<EventInfoCardProps> = ({ log }) => {
  const { t } = useTranslation();
  const getEventMessage = (message: string) => {
    if (!message) return '';
    
    if (message.includes('Test order soft deleted')) return t('eventLog.messages.testOrderSoftDeleted');
    if (message.includes('Instrument updated')) {
      const details = message.replace('Instrument updated', '').trim();
      return t('eventLog.messages.instrumentUpdated', { details });
    }
    if (message.includes('Test order updated')) return t('eventLog.messages.testOrderUpdated');
    if (message.includes('User deleted successfully!')) return t('eventLog.messages.userDeleted');
    if (message.includes('Test order created')) return t('eventLog.messages.testOrderCreated');
    if (message.includes('Patient record soft deleted by user ID')) return t('eventLog.messages.patientRecordSoftDeletedByUser');
    if (message.includes('Patient record soft deleted')) return t('eventLog.messages.patientRecordSoftDeleted');
    if (message.includes('Patient record created')) return t('eventLog.messages.patientRecordCreated');
    if (message.includes('User created successfully!')) return t('eventLog.messages.userCreated');
    if (message.includes('Test order status updated to')) {
      const status = message.replace('Test order status updated to', '').trim();
      return t('eventLog.messages.testOrderStatusUpdated', { status });
    }
    if (message.includes('Medical record soft deleted')) return t('eventLog.messages.medicalRecordSoftDeleted');
    if (message.includes('Medical record created')) return t('eventLog.messages.medicalRecordCreated');
    if (message.includes('Instrument created')) return t('eventLog.messages.instrumentCreated');
    if (message.includes('Instrument deleted')) return t('eventLog.messages.instrumentDeleted');
    if (message.includes('User updated successfully!')) return t('eventLog.messages.userUpdated');
    if (message.includes('Patient record updated')) {
      const details = message.replace('Patient record updated', '').trim();
      return t('eventLog.messages.patientRecordUpdated', { details });
    }
    if (message.includes('Reagent updated')) {
      const details = message.replace('Reagent updated', '').trim();
      return t('eventLog.messages.reagentUpdated', { details });
    }
    if (message.includes('Reagent created')) return t('eventLog.messages.reagentCreated');
    if (message.includes('Reagent deleted')) return t('eventLog.messages.reagentDeleted');
    if (message.includes('Medical record updated')) {
      const details = message.replace('Medical record updated', '').replace(/^:/, '').trim();
      return t('eventLog.messages.medicalRecordUpdated', { details });
    }

    return message;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Hash className="w-5 h-5 mr-2" />
          {t('eventLog.eventInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm text-gray-600">{t('eventLog.eventCode')}</Label>
            <p className="text-lg font-semibold mt-1">{log.event_code || '-'}</p>
          </div>
          <div>
            <Label className="text-sm text-gray-600">{t('eventLog.service')}</Label>
            <p className="text-lg mt-1">
              {log.service_name ? t(`eventLog.services.${log.service_name}`) : '-'}
            </p>
          </div>
          <div>
            <Label className="text-sm text-gray-600">{t('eventLog.action')}</Label>
            <p className="text-lg mt-1">
              {log.action ? t(`eventLog.actions.${String(log.action).toUpperCase()}`) : '-'}
            </p>
          </div>
          <div className="md:col-span-2">
            <Label className="text-sm text-gray-600">{t('eventLog.content')}</Label>
            <p className="text-lg mt-1">{log.event_message ? getEventMessage(log.event_message) : '-'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
