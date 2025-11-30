import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../../../components/common/button';
import { ArrowLeft, ArrowRight, Search, X } from 'lucide-react';
import type { Instrument } from '../../../service/types/Instrument';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '../../../../components/common/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/common/table';
import { Input } from '../../../../components/common/input';
import { instrumentsService } from '../../../../service/instrumentsService';
import Badge from '../../../../components/common/badge';
import Pagination from '../../../../components/common/pagination';
import { useTranslation } from 'react-i18next';

interface SelectedInstrument {
  instrumentId: string;
  quantity: number;
  instrument: Instrument;
}

interface LocationState {
  formData: Record<string, unknown>;
}

const SelectInstrumentsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  // Detect current route base path (service, labuser, or admin)
  const getBasePath = () => {
    if (location.pathname.startsWith('/service')) {
      return '/service';
    }
    if (location.pathname.startsWith('/admin')) {
      return '/admin';
    }
    return '/labuser';
  };

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInstruments, setSelectedInstruments] = useState<Record<string, SelectedInstrument>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalInstruments, setTotalInstruments] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!state?.formData) {
      toast.error(t('testOrder.missingFormData'));
      const basePath = getBasePath();
      navigate(`${basePath}/create-test-order`);
    }
  }, [state, navigate, t]);

  // Load instruments from API
  useEffect(() => {
    const loadInstruments = async () => {
      setIsLoading(true);
      try {
        // Only fetch instruments with status 'Ready'
        const response = await instrumentsService.getAllInstruments(currentPage, itemsPerPage, 'Ready');
        setInstruments(response.data || []);
        setTotalInstruments(response.total || 0);
        
        // Update selected instruments if they exist in the new page
        // Note: Since we only allow 1 selection, we might want to keep it even if not on current page
        // But the original code was trying to update the instrument details in selectedInstruments
        setSelectedInstruments(prev => {
          const updated = { ...prev };
          (response.data || []).forEach(inst => {
            if (updated[inst._id]) {
              updated[inst._id] = {
                ...updated[inst._id],
                instrument: inst,
              };
            }
          });
          return updated;
        });

        if (response.page && response.page !== currentPage) {
          setCurrentPage(response.page);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : t('testOrder.cannotLoadInstruments');
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadInstruments();
  }, [currentPage, t]);

  const handleToggleSelect = (instrument: Instrument) => {
    setSelectedInstruments(prev => {
      // If the clicked instrument is already selected, deselect it
      if (prev[instrument._id]) {
        return {};
      }
      
      // Otherwise, select ONLY this instrument (replace any existing selection)
      return {
        [instrument._id]: {
          instrumentId: instrument._id,
          quantity: 1,
          instrument,
        }
      };
    });
  };

  
 

  const handleNext = () => {
    if (!state?.formData) {
      toast.error('Thiếu thông tin form');
      return;
    }

    if (Object.keys(selectedInstruments).length === 0) {
      toast.error(t('testOrder.pleaseSelectAtLeastOneInstrument'));
      return;
    }

    // Navigate to select reagents page with form data and selected instruments
    const basePath = getBasePath();
    navigate(`${basePath}/select-reagents`, {
      state: {
        formData: state.formData,
        instruments: Object.values(selectedInstruments).map(({ instrumentId, quantity }) => ({
          instrumentId,
          quantity,
        })),
      },
    });
  };

  // Filter instruments based on search query
  const filteredInstruments = useMemo(() => {
    const readinessPriority: Record<Instrument['status'], number> = {
      Ready: 0,
      Processing: 1,
      Inactive: 2,
    };

    const query = searchQuery.toLowerCase().trim();
    const baseList = !query
      ? instruments
      : instruments.filter((instrument) => {
          return (
            instrument.instrument_name.toLowerCase().includes(query) ||
            instrument.instrument_code.toLowerCase().includes(query) ||
            instrument._id.toLowerCase().includes(query) ||
            instrument.instrument_type.toLowerCase().includes(query)
          );
        });

    return [...baseList].sort((a, b) => {
      const diff =
        (readinessPriority[a.status] ?? 99) -
        (readinessPriority[b.status] ?? 99);
      if (diff !== 0) return diff;
      return a.instrument_name.localeCompare(b.instrument_name);
    });
  }, [instruments, searchQuery]);

  const statusConfig = (status: Instrument['status']) => {
    switch (status) {
      case 'Ready':
        return { label: t('testOrder.statusReady'), variant: 'default' as const };
      case 'Processing':
        return { label: t('testOrder.statusProcessing'), variant: 'secondary' as const };
      default:
        return { label: t('testOrder.statusInactive'), variant: 'outline' as const };
    }
  };

  // Get selected instruments with full details
  const selectedInstrumentsList = useMemo(() => {
    return Object.values(selectedInstruments).map((selected) => ({
      ...selected.instrument,
      quantity: selected.quantity,
    }));
  }, [selectedInstruments]);

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Step Indicator */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
        <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-8 flex-wrap">
          {/* Step 1 - Completed */}
          <div className="flex flex-col items-center gap-2 sm:gap-4 min-w-[100px] sm:min-w-[140px]">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-lg sm:text-xl md:text-2xl shadow-lg ring-2 sm:ring-4 ring-blue-100">
                1
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-blue-700">{t('testOrder.createOrder')}</p>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 hidden sm:block mt-1">{t('testOrder.newTestOrder')}</p>
            </div>
          </div>

          {/* Connector 1 - Completed */}
          <div className="hidden sm:block flex-1 min-w-[30px] sm:min-w-[50px] max-w-[60px] sm:max-w-[100px] h-1 sm:h-1.5 bg-gradient-to-r from-blue-600 to-blue-600 rounded-full mt-[-24px] sm:mt-[-32px]"></div>

          {/* Step 2 - Active */}
          <div className="flex flex-col items-center gap-2 sm:gap-4 min-w-[100px] sm:min-w-[140px]">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-lg sm:text-xl md:text-2xl shadow-lg ring-2 sm:ring-4 ring-blue-100 animate-pulse">
                2
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-blue-700">{t('testOrder.selectInstrument')}</p>
            </div>
          </div>

          {/* Connector 2 - Inactive */}
          <div className="hidden sm:block flex-1 min-w-[30px] sm:min-w-[50px] max-w-[60px] sm:max-w-[100px] h-1 sm:h-1.5 bg-gray-300 rounded-full mt-[-24px] sm:mt-[-32px]"></div>

          {/* Step 3 - Inactive */}
          <div className="flex flex-col items-center gap-2 sm:gap-4 min-w-[100px] sm:min-w-[140px]">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-lg sm:text-xl md:text-2xl border-2 border-gray-300">
              3
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-500">{t('testOrder.selectReagent')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const basePath = getBasePath();
              navigate(`${basePath}/create-test-order`, { state });
            }}
            className="flex items-center gap-2 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('testOrder.back')}
          </Button>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
              {t('testOrder.selectInstrumentTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {t('testOrder.selectInstrumentDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Instruments Table */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <h3 className="text-base sm:text-lg font-semibold">{t('testOrder.instrumentList')}</h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1 sm:justify-end sm:max-w-md">
              <div className="relative flex-1 sm:flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('testOrder.searchInstrumentPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2 w-full text-sm sm:text-base"
                />
              </div>
              {searchQuery && (
                <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                  {t('testOrder.foundInstruments', { count: filteredInstruments.length })}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 sm:w-12 text-xs sm:text-sm">{t('testOrder.select')}</TableHead>
                    <TableHead className="text-xs sm:text-sm">{t('testOrder.instrumentName')}</TableHead>
                    <TableHead className="text-xs sm:text-sm">{t('testOrder.status')}</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">{t('testOrder.location')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                        {t('testOrder.loadingInstruments')}
                      </TableCell>
                    </TableRow>
                  ) : filteredInstruments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                        {t('testOrder.noInstrumentsFound')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInstruments.map((instrument) => {
                      const isSelected = !!selectedInstruments[instrument._id];
                      const { label, variant } = statusConfig(instrument.status);

                      return (
                        <TableRow key={instrument._id}>
                          <TableCell>
                            <button
                              type="button"
                              onClick={() => handleToggleSelect(instrument)}
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'border-gray-300 hover:border-blue-400'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />}
                            </button>
                          </TableCell>
                          <TableCell className="font-medium text-xs sm:text-sm">
                            <div className="truncate max-w-[150px] sm:max-w-none">{instrument.instrument_name}</div>
                            <div className="sm:hidden text-xs text-gray-500 mt-1">{instrument.location || t('testOrder.notUpdated')}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={variant} className="text-xs">{label}</Badge>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                            {instrument.location || t('testOrder.notUpdated')}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(totalInstruments / itemsPerPage))}
            onPageChange={setCurrentPage}
            className="justify-end"
          />
        </CardContent>
      </Card>

      {/* Selected Instruments Panel */}
      <Card>
        <CardHeader className="pb-3 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold">{t('testOrder.selectedInstruments')}</h3>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {selectedInstrumentsList.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-xs sm:text-sm text-gray-500">
                {t('testOrder.noInstrumentsSelected')}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {t('testOrder.selectFromList')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedInstrumentsList.map((instrument) => (
                <div
                  key={instrument._id}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">
                      {instrument.instrument_name}
                    </p>
                    <p className="text-xs text-gray-500 font-mono mt-1 truncate">
                      {instrument.instrument_code}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {t('testOrder.quantity')}: <span className="font-semibold text-blue-600">1</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSelect(instrument)}
                    className="ml-2 p-1 hover:bg-red-100 rounded-full transition-colors flex-shrink-0"
                    title={t('testOrder.cancel')}
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const basePath = getBasePath();
            navigate(`${basePath}/create-test-order`, { state });
          }}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          {t('testOrder.cancel')}
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={Object.keys(selectedInstruments).length === 0}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('testOrder.next')}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SelectInstrumentsPage;