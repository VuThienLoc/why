import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/card';
import Button from '../../components/common/button';
import { Input } from '../../components/common/input';
import { Label } from '../../components/common/label';
import Pagination from '../../components/common/pagination';
import { toast } from 'sonner';
import {
  Search,
  FlaskConical,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TestResult, TestResultDetail } from './types/TestResultTypes';
import { testResultService } from '../../service/testResultService';
import { Skeleton } from '@/components/common/skeleton';
import TestResultDetailModal from './components/modals/TestResultModal/TestResultDetailModal';
import TestResultEditModal from './components/modals/TestResultModal/TestResultEditModal';


// Main Component
const TestResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const [allResults, setAllResults] = useState<TestResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<{
    result: TestResultDetail;
    patientName: string;
  } | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [deleteConfirm, setDeleteConfirm] = useState<{
    testOrderId: string;
    patientName: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadTestResults = useCallback(async () => {
    try {
      setLoading(true);
      const data = await testResultService.getAllTestResults();
      setAllResults(data);
    } catch {
      toast.error(t('testResult.cannotLoadResults'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Load data on mount
  useEffect(() => {
    loadTestResults();
  }, [loadTestResults]);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter results when search changes
  useEffect(() => {
    let filtered = allResults;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(result =>
        result.patientName.toLowerCase().includes(searchLower) ||
        result.testOrderId.toLowerCase().includes(searchLower)
      );
    }

    setFilteredResults(filtered);
  }, [allResults, searchTerm]);

  const totalPages = useMemo(() => {
    if (filteredResults.length === 0) return 1;
    return Math.ceil(filteredResults.length / itemsPerPage);
  }, [filteredResults.length, itemsPerPage]);

  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredResults.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredResults, currentPage, itemsPerPage]);

  const handleViewDetail = (result: TestResultDetail, patientName: string) => {
    setSelectedResult({ result, patientName });
    setViewModalOpen(true);
  };

  // Function to refresh data and update selected result after AI review
  const handleRefreshAndUpdateResult = async (resultId: string, newComment: string) => {
    try {
      // Reload all test results and wait for it to complete
      setLoading(true);
      const refreshedData = await testResultService.getAllTestResults();
      setAllResults(refreshedData);
      setLoading(false);
      
      // Find the updated result from refreshed data
      const updatedResult = refreshedData
        .flatMap(r => r.results)
        .find(r => r.id === resultId);
      
      if (updatedResult && selectedResult) {
        // Update selectedResult with the new data including the new comment
        setSelectedResult({
          result: {
            ...updatedResult,
            reviewerComment: newComment, // Use the new comment from AI
          },
          patientName: selectedResult.patientName,
        });
      }
    } catch (error) {
      console.error('Error refreshing and updating result:', error);
      setLoading(false);
      // Fallback: just reload data
      await loadTestResults();
    }
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

  const handleDeleteClick = (e: React.MouseEvent, testOrderId: string, patientName: string) => {
    e.stopPropagation();
    setDeleteConfirm({ testOrderId, patientName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      setDeleting(true);
      await testResultService.deleteTestResult(deleteConfirm.testOrderId);
      toast.success(t('testResult.deleteSuccess'));
      setDeleteConfirm(null);
      await loadTestResults();
    } catch {
      toast.error(t('testResult.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>

        {/* Filter section skeleton */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Table skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-5 w-1/5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2 p-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{t('testResult.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600">{t('testResult.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <FlaskConical className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          <span className="text-xs sm:text-sm text-gray-500">
            {t('testResult.resultsCount', { current: filteredResults.length, total: allResults.length })}
            {searchTerm && ` ${t('testResult.foundResults', { found: filteredResults.length, total: allResults.length })}`}
          </span>
        </div>
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

      {/* Test Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FlaskConical className="w-5 h-5 mr-2" />
            {t('testResult.resultsList')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {paginatedResults.length === 0 ? (
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
                {paginatedResults.map((result) => {
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
                            {/* Left content (2 dòng) */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                {t('testResult.patientName')}: {result.patientName}
                              </h3>
                              <h3 className="text-xs sm:text-sm font-medium text-gray-700 mt-1">
                                {t('testResult.testType')}: {result.test_type}
                              </h3>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => handleDeleteClick(e, result.testOrderId, result.patientName)}
                                className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title={t('testResult.delete')}
                              >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
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
                                    {detail.reviewerComment && (
                                      <p className="text-xs text-gray-500 mt-2 italic bg-blue-50 p-2 rounded break-words">{t('testResult.comment')}: {detail.reviewerComment}</p>
                                    )}
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

      {/* Modals */}
      {selectedResult && (
        <>
          <TestResultDetailModal
          result={selectedResult.result}
          patientName={selectedResult.patientName}
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          onUpdateSuccess={loadTestResults}
            onRefreshAndUpdateResult={handleRefreshAndUpdateResult}
            onEdit={() => {
              setViewModalOpen(false);
              setEditModalOpen(true);
            }}
          />
          <TestResultEditModal
            result={selectedResult.result}
            patientName={selectedResult.patientName}
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              // Refresh data after edit
              loadTestResults();
            }}
            onUpdateSuccess={loadTestResults}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[60] p-3 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-3 sm:mx-4 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 sm:gap-3 text-red-600 mb-3 sm:mb-4">
              <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{t('testResult.deleteConfirm.title')}</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {t('testResult.deleteConfirm.description', { 
                testName: deleteConfirm.patientName, 
                patientName: deleteConfirm.patientName 
              })}
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={cancelDelete}
                disabled={deleting}
                className="w-full sm:w-auto"
              >
                {t('testResult.cancel')}
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
              >
                {deleting ? t('testResult.deleting') : t('testResult.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultsPage;
