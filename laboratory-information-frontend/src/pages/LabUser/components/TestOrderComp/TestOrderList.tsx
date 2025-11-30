import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/common/card';
import Button from '../../../../components/common/button';
import { Progress } from '../../../../components/common/progress';
import { TestTube, PlayCircle, Pause, CheckCircle } from 'lucide-react';
import type { TestOrder } from '../../types/TestOrderTypes';
import { getStatusBadge, translateTestType } from '../../utils/testOrderUtils';
import Pagination from '../../../../components/common/pagination';
import { useTranslation } from 'react-i18next';
interface TestOrderListProps {
  orders: TestOrder[];
  onOrderClick: (order: TestOrder) => void;
  onStatusChange: (orderId: string, newStatus: 'Pending' | 'Processing' | 'Completed') => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

const TestOrderList: React.FC<TestOrderListProps> = ({
  orders,
  onOrderClick,
  onStatusChange,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false
}) => {

  const {t} = useTranslation();
  return (
    <Card className="glass-strong hover-lift">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <TestTube className="w-4 h-4 sm:w-5 sm:h-5" />
          {t('testOrder.testOrderList')}
          {isLoading && (
            <span className="ml-2 text-xs sm:text-sm text-gray-500 animate-pulse">{t('testOrder.loading')}</span>
          )}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {t('testOrder.subTestOrderList')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {orders.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="p-3 sm:p-4 border rounded-lg bg-white/50 hover:bg-white/80 transition-colors cursor-pointer"
                onClick={() => onOrderClick(order)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-mono text-xs sm:text-sm truncate">{order.barcode || order._id}</h4>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600">
                      <p className="truncate">{t('testOrder.patient')}: <span className="text-gray-900 font-medium">{order.patient_name}</span></p>
                      <p className="truncate">{t('testOrder.testType')}: <span className="text-gray-900 font-medium">{translateTestType(order.test_type, t)}</span></p>
                      <p className="truncate sm:col-span-2">{t('testOrder.deadline')}: <span className="text-gray-900 font-medium">{order.due_date}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
                    {order.status.toLowerCase() === 'pending' && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(order._id, 'Processing');
                        }}
                        className="text-xs sm:text-sm"
                      >
                        <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{t('testOrder.start')}</span>
                        <span className="sm:hidden">{t('testOrder.start')}</span>
                      </Button>
                    )}
                    {order.status.toLowerCase() === 'processing' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(order._id, 'Pending');
                          }}
                          className="text-xs sm:text-sm"
                        >
                          <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">{t('testOrder.stop')}</span>
                          <span className="sm:hidden">{t('testOrder.stop')}</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(order._id, 'Completed');
                          }}
                          className="text-xs sm:text-sm"
                        > 
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">{t('testOrder.complete')}</span>
                          <span className="sm:hidden">{t('testOrder.complete')}</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {order.status.toLowerCase() === "processing" && order.processing !== undefined && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                      <span className="text-gray-600">{t('testOrder.progress')}</span>
                      <span className={order.processing === 100 ? "text-green-600" : "text-blue-600"}>
                        {order.processing}%
                      </span>
                    </div>
                    <Progress value={order.processing} className="h-1.5 sm:h-2" />
                  </div>
                )}



              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 text-gray-500">
            <TestTube className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
            <p className="text-sm sm:text-base">{t('testOrder.nothing')}</p>
          </div>
        )}
        
        {/* Pagination */}
        {currentPage !== undefined && totalPages !== undefined && onPageChange && totalPages > 0 && (
          <div className="mt-4 sm:mt-6 pt-4 border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestOrderList;

