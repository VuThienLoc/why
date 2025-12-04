import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/card';
import Button from '../../components/common/button';
import { Input } from '../../components/common/input';
import { Label } from '../../components/common/label';
import Pagination from '../../components/common/pagination';
import {
  Search,
  FlaskConical,
  X,
  ChevronDown
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../hooks/useAuthContext';
import { testResultService } from '../../service/testResultService';
import { Skeleton } from '../../components/common/skeleton';
import { FormattedText } from '../../components/common/FormattedText';
import type { TestResult, TestResultDetail } from '../labuser/types/TestResultTypes';



// Read-only View Detail Modal
const ViewDetailModal: React.FC<{
  result: TestResultDetail | null;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({ result, patientName, isOpen, onClose }) => {
  const { t } = useTranslation();

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
  const getTranslatedTestType = (testType: string) => {
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
                  <p className="font-medium">{getTranslatedTestType(result.test_type)}</p>
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
              {result.reviewerComment ? (
                <FormattedText 
                  text={result.reviewerComment} 
                  className="text-gray-800 whitespace-pre-wrap" 
                />
              ) : (
                <p className="text-gray-400 italic">{t('testResult.modal.noComment')}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-4 sm:mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              {t('testResult.close')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestResults: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthContext();

  const getTranslatedTestType = (testType: string) => {
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

  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<{
    result: TestResultDetail;
    patientName: string;
  } | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 3;

  const loadTestResults = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await testResultService.getResultsByUserId(user.id, currentPage, itemsPerPage);
      setResults(response.data);
      setTotalPages(response.pagination.totalPages);
      
    } catch (error) {
      console.error('Error loading test results:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentPage]);

  useEffect(() => {
    loadTestResults();
  }, [loadTestResults]);

  const filteredResults = useMemo(() => {
    if (!searchTerm) return results;
    const searchLower = searchTerm.toLowerCase().trim();
    return results.filter(result =>
      result.patientName.toLowerCase().includes(searchLower) ||
      result.testOrderId.toLowerCase().includes(searchLower) ||
      result.test_type.toLowerCase().includes(searchLower)
    );
  }, [results, searchTerm]);

  const handleViewDetail = (result: TestResultDetail, patientName: string) => {
    setSelectedResult({ result, patientName });
    setViewModalOpen(true);
  };

  const toggleRow = (testOrderId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testOrderId)) {
        newSet.delete(testOrderId);
      } else {
        newSet.add(testOrderId);
      }
      return newSet;
    });
  };

  if (loading && results.length === 0) {
     return (
      <div className="p-6 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
             <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <div className="space-y-2 p-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-medium text-gray-900 mb-1">
          {t('testResult.title')}
        </h1>
        <p className="text-sm text-gray-500">{t('testResult.subtitle')}</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700">
                {t('testResult.search')}
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  type="text"
                  placeholder={t('testResult.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FlaskConical className="w-5 h-5 mr-2" />
            {t('testResult.resultsList')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <FlaskConical className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('testResult.noResults')}</h3>
              <p className="text-gray-500">
                {searchTerm
                  ? t('testResult.noResultsSearch')
                  : t('testResult.noResultsEmpty')
                }
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 p-4">
                {filteredResults.map((result) => {
                  const isExpanded = expandedRows.has(result.testOrderId);
                  return (
                    <div
                      key={result.testOrderId}
                      className={`border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${isExpanded ? 'bg-blue-50 border-blue-200' : 'bg-white'
                        }`}
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() => toggleRow(result.testOrderId)}
                      >
                        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                          <div className="flex justify-between items-start sm:items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                {t('testResult.testType')}: {getTranslatedTestType(result.test_type)}
                              </h3>
                              
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                               <ChevronDown
                                className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${isExpanded
                                  ? 'transform rotate-180 text-blue-500'
                                  : 'text-gray-400'
                                  }`}
                              />
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-600">
                            <span>{t('testResult.totalTests')}: <span className="font-medium text-gray-900">{result.totalTests}</span></span>
                            <span className="hidden sm:inline text-gray-400">|</span>
                            <span>
                              {new Date(result.createdAt).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                          }`}
                      >
                        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3">{t('testResult.testDetails')}:</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                              {result.results.map((detail, idx) => (
                                <div
                                  key={idx}
                                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-300 transition-all gap-2 sm:gap-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetail(detail, result.patientName);
                                  }}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-xs sm:text-sm text-gray-800 mb-1">{detail.name} ({detail.code})</p>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                      {t('testResult.result')}: <span className="font-bold text-gray-900">{detail.resultValue} {detail.unit}</span>
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 sm:ml-4">
                                    <span className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${detail.resultStatus === 'normal' ? 'bg-green-100 text-green-700 border border-green-200' :
                                      detail.resultStatus === 'abnormal' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                        'bg-red-100 text-red-700 border border-red-200'
                                      }`}>
                                      {detail.resultStatus === 'normal' ? t('testResult.status.normal') :
                                        detail.resultStatus === 'abnormal' ? t('testResult.status.abnormal') : t('testResult.status.critical')}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center p-3 sm:p-4 border-t border-gray-200">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {selectedResult && (
        <ViewDetailModal
          result={selectedResult.result}
          patientName={selectedResult.patientName}
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
        />
      )}
    </div>
  );
};

export default TestResults;
