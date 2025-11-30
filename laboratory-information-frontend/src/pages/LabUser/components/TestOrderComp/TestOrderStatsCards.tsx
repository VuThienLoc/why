import React from 'react';
import { Card, CardContent } from '../../../../components/common/card';
import { Clock, PlayCircle, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/common/skeleton';
import {useTranslation} from 'react-i18next'
interface TestOrderStatsCardsProps {
  stats: {
    pending: number;
    processing: number;
    completed: number;
  };
  loading?: boolean;
}

const TestOrderStatsCards: React.FC<TestOrderStatsCardsProps> = ({ stats, loading }) => {
  const {t} = useTranslation();
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 sm:p-6 bg-white">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 sm:h-10 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Chờ xử lý */}
      <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-4">{t('testOrder.pending')}</p>
              <p className="text-3xl sm:text-4xl font-semibold text-orange-500">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 ml-2">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Đang xử lý */}
      <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-4">{t('testOrder.processing')}</p>
              <p className="text-3xl sm:text-4xl font-semibold text-blue-500">{stats.processing}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 ml-2">
              <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hoàn thành */}
      <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-4">{t('testOrder.completed')}</p>
              <p className="text-3xl sm:text-4xl font-semibold text-green-500">{stats.completed}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 ml-2">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestOrderStatsCards;

