import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/common/dialog';
import type { TestResult } from '@/pages/labuser/types/TestResultTypes';
import Badge from '@/components/common/badge';
import { FileText, User, TestTube, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TestResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  testResult: TestResult | null;
}

const TestResultModal: React.FC<TestResultModalProps> = ({ isOpen, onClose, testResult }) => {
  const { t } = useTranslation();
  
  if (!testResult) return null;

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal':
        return {
          variant: 'default' as const,
          className: 'bg-green-600',
          label: t('testResult.status.normal')
        };
      case 'high':
        return {
          variant: 'default' as const,
          className: 'bg-red-600',
          label: t('testResult.status.high')
        };
      case 'low':
        return {
          variant: 'default' as const,
          className: 'bg-amber-600',
          label: t('testResult.status.low')
        };
      case 'abnormal':
        return {
          variant: 'default' as const,
          className: 'bg-amber-600',
          label: t('testResult.status.abnormal')
        };
      case 'critical':
        return {
          variant: 'destructive' as const,
          className: '',
          label: t('testResult.status.critical')
        };
      default:
        return {
          variant: 'outline' as const,
          className: '',
          label: status
        };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-gray-50">
        <div className="p-6 bg-white border-b sticky top-0 z-10">
          <DialogHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl text-black-700">
                <FileText className="w-6 h-6" />
                {t('testResult.resultModal.title')}
              </DialogTitle>
            </div>
            <DialogDescription className="text-base">
              {t('testResult.resultModal.description')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-8">
          {/* Patient Info Card */}
          <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
              <User className="w-4 h-4 text-blue-600" />
              {t('testResult.resultModal.patientInfo')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">{t('testResult.resultModal.patientName')}</span>
                <p className="text-lg font-medium text-gray-900 mt-1">{testResult.patientName}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">{t('testResult.resultModal.totalTests')}</span>
                <p className="text-lg font-medium text-gray-900 mt-1">{testResult.totalTests}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">{t('testResult.resultModal.testDate')}</span>
                <p className="text-lg font-medium text-gray-900 mt-1">
                  {new Date().toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>

          {/* Test Results Section */}
          <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
              <Activity className="w-4 h-4 text-blue-600" />
              {t('testResult.resultModal.resultDetails')}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('testResult.resultModal.stt')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('testResult.resultModal.testName')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('testResult.resultModal.code')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('testResult.resultModal.result')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('testResult.resultModal.unit')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('testResult.resultModal.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {testResult.results.map((result, index) => {
                    const statusConfig = getStatusConfig(result.resultStatus);
                    return (
                      <tr 
                        key={result.testItemId} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-gray-900">{result.name}</p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-mono text-xs">{result.code}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-gray-900">{result.resultValue}</p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {result.unit}
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={statusConfig.variant}
                            className={statusConfig.className}
                          >
                            <TestTube className="w-3 h-3 mr-1" style={{color:'white'}}/>
                            <div style={{color:'white'}}>{statusConfig.label}</div>
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
            <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {t('testResult.resultModal.note')}
            </h4>
            <p className="text-sm text-amber-800">
              {t('testResult.resultModal.noteContent')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestResultModal;