import React, { useState, useEffect } from 'react';
import { X, Sparkles, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/common/button';
import { FormattedText } from '@/components/common/FormattedText';
import { sendMessage } from '@/service/chatBoxService';
import { testResultService } from '@/service/testResultService';
import { toast } from 'sonner';
import type { TestResultDetail } from '@/pages/labuser/types/TestResultTypes';

interface TestResultDetailModalProps {
  result: TestResultDetail | null;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess: () => void;
  onRefreshAndUpdateResult?: (resultId: string, newComment: string) => Promise<void>;
  onEdit: () => void;
}

const TestResultDetailModal: React.FC<TestResultDetailModalProps> = ({
  result,
  patientName,
  isOpen,
  onClose,
  onUpdateSuccess,
  onRefreshAndUpdateResult,
  onEdit,
}) => {
  const { t } = useTranslation();
  const [reviewerComment, setReviewerComment] = useState('');
  const [aiReviewing, setAiReviewing] = useState(false);

  // Initialize form values when result changes
  useEffect(() => {
    if (result) {
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

  const handleAIReview = async () => {
    if (!result) return;
    
    try {
      setAiReviewing(true);
      
      // Format message: "Test Item: {name} ({code}), Result: {resultValue} {unit}"
      const message = `Test Item: ${result.name} (${result.code}), Result: ${result.resultValue} ${result.unit}`;
      
      // Call chat API
      const chatResponse = await sendMessage(message);
      
      // Get the response text
      const aiComment = chatResponse.data.response || '';
      
      if (!aiComment) {
        toast.error(t('testResult.aiReviewFailed') || 'Không nhận được phản hồi từ AI');
        return;
      }
      
      // Update reviewer_comment using testResultService
      await testResultService.updateTestResult(result.id, {
        reviewer_comment: aiComment,
      });
      
      // Update local state immediately
      setReviewerComment(aiComment);
      
      // Show success message
      toast.success(t('testResult.aiReviewSuccess') || 'AI đã tạo nhận xét thành công');
      
      // Refresh data and update selected result
      if (onRefreshAndUpdateResult) {
        await onRefreshAndUpdateResult(result.id, aiComment);
      } else {
        // Fallback: just refresh data
        onUpdateSuccess();
      }
    } catch (error) {
      console.error('Error in AI review:', error);
      toast.error(t('testResult.aiReviewFailed') || 'Không thể tạo nhận xét từ AI');
    } finally {
      setAiReviewing(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300 border border-gray-200">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold">
              {t('testResult.modal.detailTitle')}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
                  <p className="font-medium">{result.resultValue} {result.unit}</p>
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
              {(reviewerComment || result.reviewerComment) ? (
                <FormattedText 
                  text={reviewerComment || result.reviewerComment || ''} 
                  className="text-gray-800 whitespace-pre-wrap" 
                />
              ) : (
                <p className="text-gray-400 italic">{t('testResult.modal.noComment')}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end mt-4 sm:mt-6 gap-2 sm:gap-3">
            <Button
              onClick={handleAIReview}
              disabled={aiReviewing}
              className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {aiReviewing ? (t('testResult.aiReviewing') || 'Đang xử lý...') : (t('testResult.aiReview') || 'AI Review')}
            </Button>
            <Button
              onClick={onEdit}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              <Edit className="w-4 h-4 mr-2" />
              {t('testResult.update')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResultDetailModal;

