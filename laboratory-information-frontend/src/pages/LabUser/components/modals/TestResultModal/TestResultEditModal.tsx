import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/common/button';
import { Input } from '@/components/common/input';
import { Textarea } from '@/components/common/textarea';
import { testResultService } from '@/service/testResultService';
import { toast } from 'sonner';
import type { TestResultDetail } from '@/pages/labuser/types/TestResultTypes';

interface TestResultEditModalProps {
  result: TestResultDetail | null;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

const TestResultEditModal: React.FC<TestResultEditModalProps> = ({
  result,
  patientName,
  isOpen,
  onClose,
  onUpdateSuccess,
}) => {
  const { t } = useTranslation();
  const [resultValue, setResultValue] = useState<number>(0);
  const [reviewerComment, setReviewerComment] = useState('');
  const [updating, setUpdating] = useState(false);

  // Initialize form values when result changes
  useEffect(() => {
    if (result) {
      setResultValue(result.resultValue);
      setReviewerComment(result.reviewerComment || '');
    }
  }, [result]);

  if (!isOpen || !result) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await testResultService.updateTestResult(result.id, {
        result_value: resultValue,
        reviewer_comment: reviewerComment,
      });
      toast.success(t('testResult.updateSuccess'));
      onUpdateSuccess();
      onClose();
    } catch {
      toast.error(t('testResult.updateFailed'));
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setResultValue(result.resultValue);
    setReviewerComment(result.reviewerComment || '');
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300 border border-gray-200">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold">
              {t('testResult.modal.editTitle')}
            </h2>
            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-sm text-gray-600">{t('testResult.modal.patient')}</p>
                  <p className="font-medium">{patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('testResult.modal.testType')}</p>
                  <p className="font-medium">{result.test_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('testResult.modal.testItem')}</p>
                  <p className="font-medium">{result.name} ({result.code})</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('testResult.modal.result')}</p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={resultValue}
                      onChange={(e) => setResultValue(parseFloat(e.target.value))}
                      className="w-full sm:w-32"
                    />
                    <span className="font-medium text-gray-700">{result.unit}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('testResult.modal.status')}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${result.resultStatus === 'normal' ? 'bg-green-100 text-green-800' :
                    result.resultStatus === 'abnormal' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {result.resultStatus === 'normal' ? t('testResult.status.normal') :
                      result.resultStatus === 'abnormal' ? t('testResult.status.abnormal') : t('testResult.status.critical')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('testResult.modal.createdAt')}</p>
                  <p className="font-medium">{formatDateTime(result.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">{t('testResult.modal.reviewerComment')}</p>
              <Textarea
                value={reviewerComment}
                onChange={(e) => setReviewerComment(e.target.value)}
                placeholder={t('testResult.modal.commentPlaceholder')}
                rows={4}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end mt-4 sm:mt-6 gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={updating}
              className="w-full sm:w-auto"
            >
              {t('testResult.cancel')}
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              {updating ? t('testResult.updating') : t('testResult.update')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResultEditModal;

