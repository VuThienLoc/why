import { Users, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent } from '../../../components/common/card';
import type { UserStatistics as UserStatisticsType } from '../types/ManagerTypes';
import { useTranslation } from 'react-i18next';
interface UserStatisticsProps {
  statistics: UserStatisticsType;
}

export function UserStatistics({ statistics }: UserStatisticsProps) {
  const { t } = useTranslation();
  const stats = [
    {
      title: t('manager.totalUsers'),
      value: statistics.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: t('manager.activeUsers'),
      value: statistics.active,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: t('manager.lockedUsers'),
      value: statistics.inactive,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md">
          <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-600 mb-1 sm:mb-1.5 md:mb-2 tracking-wide">
                  {stat.title}
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <div className="w-6 sm:w-8 md:w-10 lg:w-12 h-0.5 sm:h-0.5 md:h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>
              <div className={`p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl ${stat.bgColor} ml-2 sm:ml-3 md:ml-4 lg:ml-6 shadow-lg flex-shrink-0`}>
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

