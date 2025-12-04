import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/card';
import { Label } from '@/components/common/label';
import { Clock } from 'lucide-react';
import type { EventLog } from '@/service/eventLogService';
import { OperatorInfoCard } from './components/EventLog/OperatorInfoCard';
import { EventInfoCard } from './components/EventLog/EventInfoCard';
import { useTranslation } from 'react-i18next';

interface EventLogTestOrderDetailPageProps {
  log: EventLog;
}

interface ReagentUsage {
  reagent_name?: string;
  quantity_used?: number;
}

interface TestOrderSnapshot {
  patient_name?: string;
  test_type?: string;
  instrument_name?: string;
  reagent_usages?: ReagentUsage[];
  test_item_names?: string[];
  status?: string;
  due_date?: string;
  notes?: string;
}

export const EventLogTestOrderDetailPage: React.FC<EventLogTestOrderDetailPageProps> = ({ log }) => {
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
  const normalizeData = (data: any): TestOrderSnapshot | null => {
    if (!data) return null;

    return {
      patient_name: data.patient_name,
      test_type: data.test_type,
      instrument_name: data.instrument_name,
      reagent_usages: data.reagent_usages,
      test_item_names: data.test_item_names,
      status: data.status,
      due_date: data.due_date,
      notes: data.notes,
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTestOrderInfo = (data: any, title: string) => {
    const snapshot = normalizeData(data);
    if (!snapshot) return null;

    return (
      <div className="space-y-4">
        {title && <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">{title}</h3>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {snapshot.patient_name && (
            <div>
              <p className="text-gray-500">{t('eventLog.testOrder.patientName')}</p>
              <p className="font-medium">{snapshot.patient_name}</p>
            </div>
          )}
          {snapshot.test_type && (
            <div>
              <p className="text-gray-500">{t('eventLog.testOrder.testType')}</p>
              <p className="font-medium">{snapshot.test_type}</p>
            </div>
          )}
          {snapshot.instrument_name && (
            <div>
              <p className="text-gray-500">{t('eventLog.testOrder.instrumentName')}</p>
              <p className="font-medium">{snapshot.instrument_name}</p>
            </div>
          )}
           {snapshot.reagent_usages && snapshot.reagent_usages.length > 0 && (
            <div>
              <p className="text-gray-500">{t('eventLog.testOrder.reagentName')}</p>
              <div className="flex flex-col gap-1">
                {snapshot.reagent_usages.map((r, idx) => (
                    <div key={idx} className="font-medium">
                        {r.reagent_name} <span className="text-gray-500 text-xs">({t('eventLog.testOrder.quantity')}: {r.quantity_used})</span>
                    </div>
                ))}
              </div>
            </div>
          )}
          {snapshot.test_item_names && snapshot.test_item_names.length > 0 && (
            <div>
              <p className="text-gray-500">{t('eventLog.testOrder.testItemName')}</p>
               <p className="font-medium">{snapshot.test_item_names.join(', ')}</p>
            </div>
          )}
          {snapshot.status && (
            <div>
              <p className="text-gray-500">{t('eventLog.testOrder.status')}</p>
              <p className="font-medium">{t(`status.${snapshot.status}`, { defaultValue: snapshot.status })}</p>
            </div>
          )}
          {snapshot.due_date && (
            <div>
              <p className="text-gray-500">{t('eventLog.testOrder.dueDate')}</p>
              <p className="font-medium">{formatDateOnly(snapshot.due_date)}</p>
            </div>
          )}
           {snapshot.notes && (
            <div className="md:col-span-2">
              <p className="text-gray-500">{t('eventLog.testOrder.notes')}</p>
              <p className="font-medium">{snapshot.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTestOrderCreate = (data: any) => {
    const snapshot = data?.snapshot;
    if (!snapshot) return renderTestOrderInfo(data, t('eventLog.testOrder.createdOrder'));

    const order = snapshot.order || {};
    const user = snapshot.user || {};

    return (
      <div className="space-y-6">
        {/* New Section: Patient Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">
             {t('eventLog.testOrder.patientInfo')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">{t('eventLog.testOrder.patientName')}</p>
              <p className="font-medium">{user.fullName || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{user.email || '-'}</p>
            </div>
          </div>
        </div>

        {/* Existing Section: Test Order Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">{t('eventLog.testOrder.createdOrder')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            
            {order.testType && (
              <div>
                <p className="text-gray-500">{t('eventLog.testOrder.testType')}</p>
                <p className="font-medium">{order.testType}</p>
              </div>
            )}
            {order.instrumentName && (
              <div>
                <p className="text-gray-500">{t('eventLog.testOrder.instrumentName')}</p>
                <p className="font-medium">{order.instrumentName}</p>
              </div>
            )}
            {order.status && (
              <div>
                <p className="text-gray-500">{t('eventLog.testOrder.status')}</p>
                <p className="font-medium">{t(`status.${order.status}`, { defaultValue: order.status })}</p>
              </div>
            )}
            {order.dueDate && (
              <div>
                <p className="text-gray-500">{t('eventLog.testOrder.dueDate')}</p>
                <p className="font-medium">{formatDateOnly(order.dueDate)}</p>
              </div>
            )}
            {order.notes && (
              <div className="md:col-span-2">
                <p className="text-gray-500">{t('eventLog.testOrder.notes')}</p>
                <p className="font-medium">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTestOrderUpdate = (log: EventLog) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snapshot = (log.new_values as any)?.snapshot;
    const order = snapshot?.order || {};
    const user = snapshot?.user || {};

    return (
      <div className="space-y-6">
        {/* Test Order Information Summary */}
        {snapshot && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">
              {t('eventLog.testOrder.orderInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">{t('eventLog.testOrder.patientName')}</p>
                <p className="font-medium">{user.fullName || '-'}</p>
              </div>
              {order.barcode && (
                <div>
                  <p className="text-gray-500">Barcode</p>
                  <p className="font-medium">{order.barcode}</p>
                </div>
              )}
              {/* {order.testType && (
                <div>
                  <p className="text-gray-500">{t('eventLog.testOrder.testType')}</p>
                  <p className="font-medium">{order.testType}</p>
                </div>
              )}
              {order.instrumentName && (
                <div>
                  <p className="text-gray-500">{t('eventLog.testOrder.instrumentName')}</p>
                  <p className="font-medium">{order.instrumentName}</p>
                </div>
              )}
              {order.status && (
                <div>
                  <p className="text-gray-500">{t('eventLog.testOrder.status')}</p>
                  <p className="font-medium">{t(`status.${order.status}`, { defaultValue: order.status })}</p>
                </div>
              )}
              {order.dueDate && (
                <div>
                  <p className="text-gray-500">{t('eventLog.testOrder.dueDate')}</p>
                  <p className="font-medium">{formatDateOnly(order.dueDate)}</p>
                </div>
              )}
              {order.notes && (
                <div className="md:col-span-2">
                  <p className="text-gray-500">{t('eventLog.testOrder.notes')}</p>
                  <p className="font-medium">{order.notes}</p>
                </div>
              )} */}
            </div>
          </div>
        )}

        {/* Comparison Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-r pr-4">
              <h3 className="font-semibold text-lg text-gray-900 border-b pb-2 mb-4">{t('eventLog.iam.oldData')}</h3>
              {renderTestOrderInfo(log.old_values, '')}
            </div>
            <div className="pl-4">
              <h3 className="font-semibold text-lg text-gray-900 border-b pb-2 mb-4">{t('eventLog.iam.newData')}</h3>
              {renderTestOrderInfo(log.new_values, '')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTestOrderStatusUpdate = (log: EventLog) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snapshot = (log.new_values as any)?.snapshot;
    const order = snapshot?.order || {};
    const user = snapshot?.user || {};

    return (
      <div className="space-y-6">
        {/* Test Order Information Summary */}
        {snapshot && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">
              {t('eventLog.testOrder.statusUpdateInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">{t('eventLog.testOrder.patientName')}</p>
                <p className="font-medium">{user.fullName || '-'}</p>
              </div>
              {order.barcode && (
                <div>
                  <p className="text-gray-500">Barcode</p>
                  <p className="font-medium">{order.barcode}</p>
                </div>
              )}
              {order.testType && (
                <div>
                  <p className="text-gray-500">{t('eventLog.testOrder.testType')}</p>
                  <p className="font-medium">{order.testType}</p>
                </div>
              )}
              {order.instrumentName && (
                <div>
                  <p className="text-gray-500">{t('eventLog.testOrder.instrumentName')}</p>
                  <p className="font-medium">{order.instrumentName}</p>
                </div>
              )}
              {/* {order.status && (
                <div>
                  <p className="text-gray-500">{t('eventLog.testOrder.status')}</p>
                  <p className="font-medium">{t(`status.${order.status}`, { defaultValue: order.status })}</p>
                </div>
              )} */}
              {order.dueDate && (
                <div>
                  <p className="text-gray-500">{t('eventLog.testOrder.dueDate')}</p>
                  <p className="font-medium">{formatDateOnly(order.dueDate)}</p>
                </div>
              )}
              {order.notes && (
                <div className="md:col-span-2">
                  <p className="text-gray-500">{t('eventLog.testOrder.notes')}</p>
                  <p className="font-medium">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comparison Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-r pr-4">
              <h3 className="font-semibold text-lg text-gray-900 border-b pb-2 mb-4">{t('eventLog.iam.oldData')}</h3>
              {renderTestOrderInfo(log.old_values, '')}
            </div>
            <div className="pl-4">
              <h3 className="font-semibold text-lg text-gray-900 border-b pb-2 mb-4">{t('eventLog.iam.newData')}</h3>
              {renderTestOrderInfo(log.new_values, '')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTestOrderDelete = (data: any) => {
    const snapshot = data?.snapshot;
    if (!snapshot) return renderTestOrderInfo(data, t('eventLog.testOrder.deletedOrder'));

    const order = snapshot.order || {};
    const user = snapshot.user || {};

    return (
      <div className="space-y-6">
        {/* New Section: Patient Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">
             {t('eventLog.testOrder.patientInfo')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">{t('eventLog.testOrder.patientName')}</p>
              <p className="font-medium">{user.fullName || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{user.email || '-'}</p>
            </div>
          </div>
        </div>

        {/* Existing Section: Test Order Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">{t('eventLog.testOrder.deletedOrder')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            
            {order.testType && (
              <div>
                <p className="text-gray-500">{t('eventLog.testOrder.testType')}</p>
                <p className="font-medium">{order.testType}</p>
              </div>
            )}
            {order.instrumentName && (
              <div>
                <p className="text-gray-500">{t('eventLog.testOrder.instrumentName')}</p>
                <p className="font-medium">{order.instrumentName}</p>
              </div>
            )}
            {order.status && (
              <div>
                <p className="text-gray-500">{t('eventLog.testOrder.status')}</p>
                <p className="font-medium">{t(`status.${order.status}`, { defaultValue: order.status })}</p>
              </div>
            )}
            {order.dueDate && (
              <div>
                <p className="text-gray-500">{t('eventLog.testOrder.dueDate')}</p>
                <p className="font-medium">{formatDateOnly(order.dueDate)}</p>
              </div>
            )}
            {order.notes && (
              <div className="md:col-span-2">
                <p className="text-gray-500">{t('eventLog.testOrder.notes')}</p>
                <p className="font-medium">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEventContent = () => {
    const action = String(log.action ?? '').toUpperCase();
    const message = log.event_message || '';
    
    if (action === 'CREATE' && message === 'Test order created') {
       return renderTestOrderCreate(log.new_values);
    }

    if (action === 'DELETE' && message === 'Test order soft deleted') {
       return renderTestOrderDelete(log.old_values);
    }

    if (action === 'UPDATE' && message === 'Test order updated') {
       return renderTestOrderUpdate(log);
    }

    if (action === 'UPDATE' && message.startsWith('Test order status updated to')) {
       return renderTestOrderStatusUpdate(log);
    }
    
    if (action === 'CREATE') {
      return renderTestOrderInfo(log.new_values, t('eventLog.testOrder.createdOrder'));
    } else if (action === 'DELETE') {
      return renderTestOrderInfo(log.old_values, t('eventLog.testOrder.deletedOrder'));
    } else if (action === 'UPDATE') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-r pr-4">
              <h3 className="font-semibold text-lg text-gray-900 border-b pb-2 mb-4">{t('eventLog.iam.oldData')}</h3>
              {renderTestOrderInfo(log.old_values, '')}
            </div>
            <div className="pl-4">
              <h3 className="font-semibold text-lg text-gray-900 border-b pb-2 mb-4">{t('eventLog.iam.newData')}</h3>
              {renderTestOrderInfo(log.new_values, '')}
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
