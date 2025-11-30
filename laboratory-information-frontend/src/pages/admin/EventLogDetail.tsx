import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/common/button';
import { ArrowLeft } from 'lucide-react';
import { eventLogService, type EventLog } from '@/service/eventLogService';
import EventLogPatientDetailPage from './EventLogPatientDetailPage';
import { EventLogIAMDetailPage } from './EventLogIAMDetailPage';
import { EventLogWarehouseDetailPage } from './EventLogWarehouseDetailPage';
import { EventLogTestOrderDetailPage } from './EventLogTestOrderDetailPage';
import { useTranslation } from 'react-i18next';

const EventLogDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [log, setLog] = useState<EventLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await eventLogService.getById(id);
        if (data) {
          setLog(data);
        } else {
          setError('Không tìm thấy nhật ký');
        }
      } catch (e) {
        console.error(e);
        setError('Không thể tải chi tiết nhật ký');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error || 'Không tìm thấy nhật ký'}</p>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    );
  }

  const renderDetailContent = () => {
    switch (log.service_name) {
      case 'IAM_SERVICE':
        return <EventLogIAMDetailPage log={log} />;
      case 'WAREHOUSE_SERVICE':
        return <EventLogWarehouseDetailPage log={log} />;
      case 'PATIENT_SERVICE':
        return <EventLogPatientDetailPage log={log} />;
      case 'TEST_ORDER_SERVICE':
        return <EventLogTestOrderDetailPage log={log} />;  
      default:
        return <EventLogPatientDetailPage log={log} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{t('eventLog.eventLogDetailTitle')}</h1>
            <p className="text-gray-600">{t('eventLog.eventLogDetailSubtitle')}</p>
          </div>
        </div>
      </div>

      {renderDetailContent()}
    </div>
  );
};

export default EventLogDetailPage;
