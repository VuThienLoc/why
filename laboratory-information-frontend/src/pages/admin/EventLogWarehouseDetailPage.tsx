import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/card';
import { Label } from '@/components/common/label';
import { Clock } from 'lucide-react';
import type { EventLog } from '@/service/eventLogService';
import { OperatorInfoCard } from './components/EventLog/OperatorInfoCard';
import { EventInfoCard } from './components/EventLog/EventInfoCard';
import { useTranslation } from 'react-i18next';

interface EventLogWarehouseDetailPageProps {
  log: EventLog;
}

interface WarehouseSnapshot {
  instrument_code?: string;
  instrument_name?: string;
  instrument_type?: string;
  manufacturer?: string;
  location?: string;
  status?: string;
  // Reagent fields
  code?: string;
  name?: string;
  type?: string;
  quantityCurrent?: number;
  unitOfMeasure?: string;
  storageLocation?: string;
  expirationDate?: string;
  receivedDate?: string;
}

export const EventLogWarehouseDetailPage: React.FC<EventLogWarehouseDetailPageProps> = ({ log }) => {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeData = (data: any): WarehouseSnapshot | null => {
    if (!data) return null;
    
    // If data has snapshot property (like in DELETE old_values), use it
    if (data.snapshot) {
      const snap = data.snapshot;
      return {
        instrument_code: snap.code || snap.instrument_code,
        instrument_name: snap.name || snap.instrument_name,
        instrument_type: snap.type || snap.instrument_type,
        manufacturer: snap.manufacturer,
        location: snap.location,
        status: snap.status,
        // Reagent fields
        code: snap.code,
        name: snap.name,
        type: snap.type,
        quantityCurrent: snap.quantityCurrent,
        unitOfMeasure: snap.unitOfMeasure,
        storageLocation: snap.storageLocation,
        expirationDate: snap.expirationDate,
        receivedDate: snap.receivedDate,
      };
    }

    // Otherwise use direct properties (like in CREATE new_values)
    return {
      instrument_code: data.instrument_code || data.code,
      instrument_name: data.instrument_name || data.name,
      instrument_type: data.instrument_type || data.type,
      manufacturer: data.manufacturer,
      location: data.location,
      status: data.status,
      // Reagent fields
      code: data.code,
      name: data.name,
      type: data.type,
      quantityCurrent: data.quantityCurrent,
      unitOfMeasure: data.unitOfMeasure,
      storageLocation: data.storageLocation,
      expirationDate: data.expirationDate,
      receivedDate: data.receivedDate,
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderReagentInfo = (data: any, title: string) => {
    const snapshot = normalizeData(data);
    if (!snapshot) return null;

    return (
      <div className="space-y-4">
        {title && <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">{title}</h3>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {snapshot.code && (
            <div>
              <p className="text-gray-500">{t('reagent.table.code')}</p>
              <p className="font-medium">{snapshot.code}</p>
            </div>
          )}
          {snapshot.name && (
            <div>
              <p className="text-gray-500">{t('reagent.table.name')}</p>
              <p className="font-medium">{snapshot.name}</p>
            </div>
          )}
          {snapshot.type && (
            <div>
              <p className="text-gray-500">{t('reagent.formModal.type')}</p>
              <p className="font-medium">{snapshot.type}</p>
            </div>
          )}
          {snapshot.status && (
            <div>
              <p className="text-gray-500">{t('reagent.table.status')}</p>
              <p className="font-medium">{t(`reagent.status.${snapshot.status}`, { defaultValue: snapshot.status })}</p>
            </div>
          )}
          {snapshot.quantityCurrent !== undefined && (
            <div>
              <p className="text-gray-500">{t('reagent.table.quantity')}</p>
              <p className="font-medium">{snapshot.quantityCurrent}</p>
            </div>
          )}
          {snapshot.unitOfMeasure && (
            <div>
              <p className="text-gray-500">{t('reagent.formModal.unit')}</p>
              <p className="font-medium">{snapshot.unitOfMeasure}</p>
            </div>
          )}
          {snapshot.storageLocation && (
            <div>
              <p className="text-gray-500">{t('reagent.table.storageLocation')}</p>
              <p className="font-medium">{snapshot.storageLocation}</p>
            </div>
          )}
          {snapshot.expirationDate && (
            <div>
              <p className="text-gray-500">{t('reagent.table.expiryDate')}</p>
              <p className="font-medium">{formatDateOnly(snapshot.expirationDate)}</p>
            </div>
          )}
          {snapshot.receivedDate && (
            <div>
              <p className="text-gray-500">{t('reagent.detailModal.receivedDate')}</p>
              <p className="font-medium">{formatDateOnly(snapshot.receivedDate)}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReagentUpdate = (values: unknown) => {
    if (!values || typeof values !== 'object') return <p className="text-gray-500 italic">{t('eventLog.empty')}</p>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = values as Record<string, any>;

    const fields = [
      { key: 'reagent_name', label: t('reagent.table.name') },
      { key: 'reagent_type', label: t('reagent.formModal.type') },
      { key: 'quantity_current', label: t('reagent.table.quantity') },
      { key: 'unit_of_measure', label: t('reagent.formModal.unit') },
      { key: 'expiration_date', label: t('reagent.table.expiryDate'), isDate: true },
      { key: 'received_date', label: t('reagent.detailModal.receivedDate'), isDate: true },
      { key: 'low_stock_threshold', label: t('reagent.formModal.lowStockThreshold') },
      { key: 'storage_location', label: t('reagent.table.storageLocation') },
    ];

    const hasData = fields.some(f => data[f.key] !== undefined);
    if (!hasData) return <p className="text-gray-500 italic">{t('eventLog.empty')}</p>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {fields.map(({ key, label, isDate }) => {
          if (data[key] !== undefined) {
            return (
              <div key={key}>
                <p className="text-gray-500">{label}</p>
                <p className="font-medium">
                  {isDate ? formatDateOnly(data[key]) : (data[key] || '-')}
                </p>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderInstrumentInfo = (data: any, title: string) => {
    const snapshot = normalizeData(data);
    if (!snapshot) return null;

    return (
      <div className="space-y-4">
        {title && <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">{title}</h3>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {snapshot.instrument_code && (
            <div>
              <p className="text-gray-500">{t('eventLog.warehouse.instrumentCode')}</p>
              <p className="font-medium">{snapshot.instrument_code}</p>
            </div>
          )}
          {snapshot.instrument_name && (
            <div>
              <p className="text-gray-500">{t('eventLog.warehouse.instrumentName')}</p>
              <p className="font-medium">{snapshot.instrument_name}</p>
            </div>
          )}
          {snapshot.instrument_type && (
            <div>
              <p className="text-gray-500">{t('eventLog.warehouse.instrumentType')}</p>
              <p className="font-medium">{snapshot.instrument_type}</p>
            </div>
          )}
          {snapshot.manufacturer && (
            <div>
              <p className="text-gray-500">{t('eventLog.warehouse.manufacturer')}</p>
              <p className="font-medium">{snapshot.manufacturer}</p>
            </div>
          )}
          {snapshot.location && (
            <div>
              <p className="text-gray-500">{t('eventLog.warehouse.location')}</p>
              <p className="font-medium">{snapshot.location}</p>
            </div>
          )}
          {snapshot.status && (
            <div>
              <p className="text-gray-500">{t('eventLog.warehouse.status')}</p>
              <p className="font-medium">{t(`status.${snapshot.status}`, { defaultValue: snapshot.status })}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEventContent = () => {
    const action = String(log.action ?? '').toUpperCase();
    const message = String(log.event_message ?? '').toLowerCase();
    
    if (action === 'CREATE') {
      if (message.includes('reagent created')) {
        return renderReagentInfo(log.new_values, t('reagent.detailModal.title'));
      }
      return renderInstrumentInfo(log.new_values, t('eventLog.warehouse.createdInstrument'));
    } else if (action === 'DELETE') {
      if (message.includes('reagent deleted')) {
        return renderReagentInfo(log.old_values, t('reagent.deleteModal.title'));
      }
      return renderInstrumentInfo(log.old_values, t('eventLog.warehouse.deletedInstrument'));
    } else if (action === 'UPDATE') {
      if (message.includes('reagent updated')) {
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-r pr-4">
                <h3 className="font-semibold text-lg text-gray-900 border-b pb-2 mb-4">{t('eventLog.iam.oldData')}</h3>
                {renderReagentUpdate(log.old_values)}
              </div>
              <div className="pl-4">
                <h3 className="font-semibold text-lg text-gray-900 border-b pb-2 mb-4">{t('eventLog.iam.newData')}</h3>
                {renderReagentUpdate(log.new_values)}
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-r pr-4">
              <h3 className="font-semibold text-lg text-gray-900 border-b pb-2 mb-4">{t('eventLog.iam.oldData')}</h3>
              {renderInstrumentInfo(log.old_values, '')}
            </div>
            <div className="pl-4">
              <h3 className="font-semibold text-lg text-gray-900 border-b pb-2 mb-4">{t('eventLog.iam.newData')}</h3>
              {renderInstrumentInfo(log.new_values, '')}
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
