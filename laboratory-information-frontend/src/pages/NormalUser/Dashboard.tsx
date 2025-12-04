import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { Card, CardContent } from '../../components/common/card';
import { ClipboardList, Clock, CheckCircle, PlayCircle } from 'lucide-react';
import { testOrderService } from '../../service/testOrderService';
import type { TestOrder } from '../labuser/types/TestOrderTypes';
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const [testOrders, setTestOrders] = useState<TestOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestOrders = async () => {
      if (user?.id) {
        try {
          const orders = await testOrderService.getTestOrdersByUserId(user.id);
          setTestOrders(orders);
        } catch (error) {
          console.error('Failed to fetch test orders', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTestOrders();
  }, [user?.id]);

  const total = testOrders.length;
  const pending = testOrders.filter(t => t.status === 'Pending').length;
  const processing = testOrders.filter(t => t.status === 'Processing').length;
  const completed = testOrders.filter(t => t.status === 'Completed').length;

  const getGreeting = (name: string | undefined): string => {
    if (!name) return t('dashboard.welcomeBack');
    return t('dashboard.welcomeBackUser', { name });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Completed': return t('status.Completed');
      case 'Processing': return t('status.Processing');
      case 'Pending': return t('status.Pending');
      default: return status;
    }
  };

  const getTestTypeLabel = (testType: string) => {
    switch (testType) {
      case 'Sinh hóa máu': return t('testOrder.biochemistry');
      case 'Huyết học tổng quát': return t('testOrder.generalHematology');
      case 'Vi sinh': return t('testOrder.microbiology');
      case 'Miễn dịch': return t('testOrder.immunology');
      case 'Nội tiết': return t('testOrder.endocrinology');
      case 'Ung thư học': return t('testOrder.oncology');
      default: return testType;
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('dashboard.loading')}</div>;
  }

  return (
    <div className="space-y-6">

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          {getGreeting(user?.name)}
        </h1>
        <p className="text-sm text-gray-500">{t('dashboard.overview')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.totalTests')}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{total}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('dashboard.all')}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.pendingTests')}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{pending}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('dashboard.pending')}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.processingTests')}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{processing}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('dashboard.processing')}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <PlayCircle className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.completedTests')}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{completed}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('dashboard.completedSuccess')}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('dashboard.recentResults')}
              <p className="text-sm text-gray-600 font-normal mt-1">
                {t('dashboard.recentResultsDesc')}
              </p>
            </h2>

            <div className="space-y-4">
              {testOrders.slice(0, 3).map((test) => (
                <div key={test._id} className="flex items-start space-x-4">
                  <div className="mt-1">
                    {test.status === 'Completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : test.status === 'Processing' ? (
                      <PlayCircle className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-orange-500" />
                    )}
                  </div>

                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{getTestTypeLabel(test.test_type)}</h3>
                        <div className="mt-1 text-sm text-gray-600">
                          <p>
                            {t('dashboard.orderDate')}: {formatDate(test.created_at)}
                            {test.status === 'Completed' && test.updated_at && (
                              <span> | {t('dashboard.completionDate')}: {formatDate(test.updated_at)}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 text-sm font-medium rounded-full ${getStatusColor(test.status)}`}
                      >
                        {getStatusLabel(test.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {testOrders.length === 0 && (
                <p className="text-gray-500 text-center py-4">{t('dashboard.noResults')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
