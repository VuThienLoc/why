import React from 'react';
import Badge from '../../../components/common/badge';
import { Clock, PlayCircle, CheckCircle } from 'lucide-react';
import type { TestOrder } from '../types/TestOrderTypes';

export const getStatusBadge = (status: string, t: (key: string) => string): React.JSX.Element => {
  const statusLower = status.toLowerCase();

  switch (statusLower) {
    case 'pending':
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-500">
          <Clock className="w-3 h-3 mr-1" />
          {t('testOrder.pending')}
        </Badge>
      );
    case 'processing':
      return (
        <Badge variant="secondary" className="bg-blue-600 text-white">
          <PlayCircle className="w-3 h-3 mr-1" />
          {t('testOrder.processing')}
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="secondary" className="bg-green-600 text-white">
          <CheckCircle className="w-3 h-3 mr-1" />
          {t('testOrder.completed')}
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};



export const calculateStats = (orders: TestOrder[]) => {
  return {
    pending: orders.filter(o => o.status === 'Pending').length,
    processing: orders.filter(o => o.status === 'Processing').length,
    completed: orders.filter(o => o.status === 'Completed').length,
  };
};

export const filterTestOrders = (
  orders: TestOrder[],
  searchTerm: string,
  statusFilter: string
): TestOrder[] => {
  let filtered = orders;

  if (searchTerm) {
    filtered = filtered.filter(order =>
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.test_type.toLowerCase().includes(searchTerm.toLowerCase()) 
    );
  }

  if (statusFilter !== 'All') {
    filtered = filtered.filter(order => order.status === statusFilter);
  }

  return filtered;
};

/**
 * Helper function to translate test type from backend to localized string
 * Maps Vietnamese test type values to translation keys
 * @param testType - Test type string from backend
 * @param t - Translation function from useTranslation hook
 * @returns Translated test type string
 */
export const translateTestType = (testType: string, t: (key: string) => string): string => {
  if (!testType) return testType;

  // Mapping from backend test type values to translation keys
  const testTypeMap: Record<string, string> = {
    'Sinh hóa máu': 'testOrder.biochemistry',
    'Huyết học tổng quát': 'testOrder.generalHematology',
    'Vi sinh': 'testOrder.microbiology',
    'Miễn dịch': 'testOrder.immunology',
    'Nội tiết': 'testOrder.endocrinology',
    'Ung thư học': 'testOrder.oncology',
    // Also support English values if backend sends them
    'Biochemistry': 'testOrder.biochemistry',
    'General Hematology': 'testOrder.generalHematology',
    'Microbiology': 'testOrder.microbiology',
    'Immunology': 'testOrder.immunology',
    'Endocrinology': 'testOrder.endocrinology',
    'Oncology': 'testOrder.oncology',
  };

  const translationKey = testTypeMap[testType];
  
  if (translationKey) {
    return t(translationKey);
  }

  // Fallback: return original value if no mapping found
  return testType;
};

export const validateDueDate = (dueDate: string, t?: (key: string, options?: Record<string, unknown>) => string): string | null => {
  if (!dueDate) {
    return t ? t('testOrder.selectDueDate') : 'Chọn hạn hoàn thành';
  }
  
  const now = new Date();
  // Get local date string in YYYY-MM-DD format
  const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  
  if (dueDate < todayStr) {
    return t 
      ? t('testOrder.dueDateCannotBeInPast', { defaultValue: "Hạn hoàn thành không được ở trong quá khứ" }) 
      : "Hạn hoàn thành không được ở trong quá khứ";
  }
  
  return null;
};

