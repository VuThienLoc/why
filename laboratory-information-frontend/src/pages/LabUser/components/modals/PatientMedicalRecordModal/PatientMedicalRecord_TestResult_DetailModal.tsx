import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common/dialog';
import type { TestResult, TestResultDetail } from '@/pages/labuser/types/TestResultTypes';
import { Label } from '@/components/common/label';

interface TestResultDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  testResult: TestResult | null;
}

const TestResultDetailModal: React.FC<TestResultDetailModalProps> = ({ isOpen, onClose, testResult }) => {
  const { t } = useTranslation();

  if (!testResult) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'abnormal':
        return 'bg-red-100 text-red-800';
      case 'critical':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal':
        return t('testResult.detailModal.status.normal');
      case 'abnormal':
        return t('testResult.detailModal.status.abnormal');
      case 'critical':
        return t('testResult.detailModal.status.critical');
      default:
        return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('testResult.detailModal.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thông tin chung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm text-gray-600">{t('testResult.detailModal.patientName')}</Label>
              <p className="text-lg font-semibold mt-1">{testResult.patientName}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">{t('testResult.detailModal.totalResults')}</Label>
              <p className="text-lg font-semibold mt-1">{testResult.totalTests}</p>
            </div>
          </div>

          {/* Bảng kết quả xét nghiệm */}
          <div>
            <Label className="text-sm text-gray-600 mb-3 block">{t('testResult.detailModal.resultsList')}</Label>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('testResult.detailModal.table.no')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('testResult.detailModal.table.testName')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('testResult.detailModal.table.testCode')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('testResult.detailModal.table.result')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('testResult.detailModal.table.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {testResult.results.map((result: TestResultDetail, index: number) => (
                    <tr key={result.testItemId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{result.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{result.code}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {result.resultValue} {result.unit}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.resultStatus)}`}>
                          {getStatusLabel(result.resultStatus)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestResultDetailModal;
