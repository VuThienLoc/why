import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/common/card';
import { FileText, Download, Eye, Trash2, Shield, Database, Search } from 'lucide-react';
import Button from '../../components/common/button';
import { Input } from '../../components/common/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/common/select';
import { eventLogService, type EventLog } from '../../service/eventLogService';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function AdminAuditReportsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name?: string } | null>(null);

  // Derived state from URL
  const page = parseInt(searchParams.get('page') || '1');
  const searchTerm = searchParams.get('search') || '';
  const serviceFilter = (searchParams.get('service') || 'all') as 'all' | 'IAM_SERVICE' | 'PATIENT_SERVICE' | 'TEST_ORDER_SERVICE' | 'WAREHOUSE_SERVICE';
  const actionFilter = (searchParams.get('action') || 'all') as 'all' | 'CREATE' | 'DELETE' | 'UPDATE';
  const sortOrder = (searchParams.get('sort') || 'newest') as 'newest' | 'oldest';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  const updateFilters = (newValues: Record<string, string | number | undefined>) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...newValues };
    
    if (Number(merged.page) === 1) delete merged.page;
    if (!merged.search) delete merged.search;
    if (merged.service === 'all') delete merged.service;
    if (merged.action === 'all') delete merged.action;
    if (merged.sort === 'newest') delete merged.sort;
    if (!merged.startDate) delete merged.startDate;
    if (!merged.endDate) delete merged.endDate;

    // Remove undefined values
    Object.keys(merged).forEach(key => {
      if (merged[key] === undefined) {
        delete merged[key];
      }
    });

    setSearchParams(merged as Record<string, string>, { replace: true });
  };

  const setPage = (p: number | ((prev: number) => number)) => {
    const val = typeof p === 'function' ? p(page) : p;
    updateFilters({ page: val });
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // Use client-side logic if searching OR sorting by oldest (since backend only supports newest)
        const useClientSideLogic = searchTerm.trim().length > 0 || sortOrder === 'oldest' || !!startDate || !!endDate;
        
        const limit = useClientSideLogic ? 1000 : 10;
        const apiPage = useClientSideLogic ? 1 : page;

        let apiStartDate = startDate;
        let apiEndDate = endDate;

        if (startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
          const startLocal = new Date(`${startDate}T00:00:00`);
          if (!isNaN(startLocal.getTime())) {
            apiStartDate = startLocal.toISOString();
          }
        }

        if (endDate && /^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
          const endLocal = new Date(`${endDate}T23:59:59.999`);
          if (!isNaN(endLocal.getTime())) {
            apiEndDate = endLocal.toISOString();
          }
        }

        const res = await eventLogService.getAll({
          page: apiPage,
          limit,
          search: searchTerm,
          service_name: serviceFilter,
          action: actionFilter,
          sort: sortOrder,
          startDate: apiStartDate,
          endDate: apiEndDate
        });
        if (!mounted) return;

        let logs = res.logs || [];

        if (useClientSideLogic) {
          // Client-side filtering
          if (searchTerm.trim().length > 0) {
            const term = searchTerm.toLowerCase();
            logs = logs.filter(log => {
              const operator = `${log.operator_name ?? ''} ${log.operator_gmail ?? ''}`.toLowerCase();
              return operator.includes(term);
            });
          }

          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const startTime = start.getTime();
            logs = logs.filter(log => {
              const logDate = log.occurred_at ? new Date(log.occurred_at).getTime() : 0;
              return logDate >= startTime;
            });
          }

          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            const endTime = end.getTime();
            logs = logs.filter(log => {
              const logDate = log.occurred_at ? new Date(log.occurred_at).getTime() : 0;
              return logDate <= endTime;
            });
          }

          // Client-side sorting
          logs.sort((a, b) => {
            const ta = a.occurred_at ? new Date(a.occurred_at).getTime() : 0;
            const tb = b.occurred_at ? new Date(b.occurred_at).getTime() : 0;
            return sortOrder === 'newest' ? tb - ta : ta - tb;
          });

          // Update pagination state based on filtered results
          setTotalLogs(logs.length);
          setTotalPages(Math.ceil(logs.length / 10) || 1);

          // Slice for current page view
          const startIndex = (page - 1) * 10;
          const endIndex = startIndex + 10;
          setEventLogs(logs.slice(startIndex, endIndex));
        } else {
          // Standard server-side pagination
          setEventLogs(logs);
          if (res.totalPages) setTotalPages(Number(res.totalPages));
          if (typeof res.total === 'number') setTotalLogs(res.total);
        }
      } catch (e) {
        console.error('Failed to load event logs', e);
        if (mounted) setError(t('eventLog.error'));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [page, searchTerm, serviceFilter, actionFilter, sortOrder, startDate, endDate, t]);

  const getActionIcon = (action: string) => {
    switch (String(action).toLowerCase()) {
      case 'login': return <Shield className="h-4 w-4" />;
      case 'create': return <Database className="h-4 w-4" />;
      case 'update': return <FileText className="h-4 w-4" />;
      case 'delete': return <Trash2 className="h-4 w-4" />;
      case 'view': return <Eye className="h-4 w-4" />;
      case 'export': return <Download className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getServiceDisplayName = (serviceName: string) => {
    switch (serviceName) {
      case 'PATIENT_SERVICE': return t('eventLog.services.PATIENT_SERVICE');
      case 'IAM_SERVICE': return t('eventLog.services.IAM_SERVICE');
      case 'TEST_ORDER_SERVICE': return t('eventLog.services.TEST_ORDER_SERVICE');
      case 'WAREHOUSE_SERVICE': return t('eventLog.services.WAREHOUSE_SERVICE');
      case 'MONITORING_SERVICE': return t('eventLog.services.MONITORING_SERVICE');
      case 'CHAT_SERVICE': return t('eventLog.services.CHAT_SERVICE');
      default: return serviceName || '—';
    }
  };

  const getEventMessage = (message: string) => {
    if (!message) return '';
    
    if (message.includes('Test order soft deleted')) return t('eventLog.messages.testOrderSoftDeleted');
    if (message.includes('Instrument updated')) {
      const details = message.replace('Instrument updated', '').trim();
      return t('eventLog.messages.instrumentUpdated', { details });
    }
    if (message.includes('Test order updated')) return t('eventLog.messages.testOrderUpdated');
    if (message.includes('User deleted successfully!')) return t('eventLog.messages.userDeleted');
    if (message.includes('Test order created')) return t('eventLog.messages.testOrderCreated');
    if (message.includes('Patient record soft deleted by user ID')) return t('eventLog.messages.patientRecordSoftDeletedByUser');
    if (message.includes('Patient record soft deleted')) return t('eventLog.messages.patientRecordSoftDeleted');
    if (message.includes('Patient record created')) return t('eventLog.messages.patientRecordCreated');
    if (message.includes('User created successfully!')) return t('eventLog.messages.userCreated');
    if (message.includes('Test order status updated to')) {
      const status = message.replace('Test order status updated to', '').trim();
      return t('eventLog.messages.testOrderStatusUpdated', { status });
    }
    if (message.includes('Medical record soft deleted')) return t('eventLog.messages.medicalRecordSoftDeleted');
    if (message.includes('Medical record created')) return t('eventLog.messages.medicalRecordCreated');
    if (message.includes('Instrument created')) return t('eventLog.messages.instrumentCreated');
    if (message.includes('Instrument deleted')) return t('eventLog.messages.instrumentDeleted');
    if (message.includes('User updated successfully!')) return t('eventLog.messages.userUpdated');
    if (message.includes('Patient record updated')) {
      const details = message.replace('Patient record updated', '').trim();
      return t('eventLog.messages.patientRecordUpdated', { details });
    }
    if (message.includes('Reagent updated')) {
      const details = message.replace('Reagent updated', '').trim();
      return t('eventLog.messages.reagentUpdated', { details });
    }
    if (message.includes('Reagent created')) return t('eventLog.messages.reagentCreated');
    if (message.includes('Reagent deleted')) return t('eventLog.messages.reagentDeleted');
    if (message.includes('Medical record updated')) {
      const details = message.replace('Medical record updated', '').replace(/^:/, '').trim();
      return t('eventLog.messages.medicalRecordUpdated', { details });
    }

    return message;
  };

  const getBasePath = () => {
    if (location.pathname.startsWith('/service')) {
      return '/service';
    }
    return '/admin';
  };

  const renderPaginationButtons = () => {
    const items: (number | string)[] = [];
    let rangeStart = page - 2;
    let rangeEnd = page + 2;

    if (rangeStart <= 2) {
      rangeStart = 1;
      rangeEnd = 5;
    }

    if (rangeEnd >= totalPages - 1) {
      rangeEnd = totalPages;
      rangeStart = Math.max(1, totalPages - 4);
    }
    
    if (totalPages <= 5) {
      rangeStart = 1;
      rangeEnd = totalPages;
    }

    const uniquePages = new Set<number>([1, totalPages]);
    for (let i = rangeStart; i <= rangeEnd; i++) {
      if (i > 0 && i <= totalPages) uniquePages.add(i);
    }
    
    const sortedPages = Array.from(uniquePages).sort((a, b) => a - b);

    for (let i = 0; i < sortedPages.length; i++) {
      const p = sortedPages[i];
      if (i > 0) {
        const prev = sortedPages[i - 1];
        if (p - prev > 1) {
          items.push('...');
        }
      }
      items.push(p);
    }
    
    return items.map((item, index) => {
      if (item === '...') {
        return (
          <span key={`ellipsis-${index}`} className="px-2 py-1">...</span>
        );
      }
      const pageNum = item as number;
      return (
        <button
          key={pageNum}
          className={`px-3 py-1 rounded border ${page === pageNum ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
          onClick={() => setPage(pageNum)}
        >
          {pageNum}
        </button>
      );
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('eventLog.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">{t('eventLog.subtitle')}</p>
        </div>
        <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('eventLog.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => updateFilters({ search: e.target.value, page: 1 })}
              className="pl-10 w-full sm:w-64 md:w-80"
            />
          </div>
      </div>
      {loading && (
        <div className="text-sm text-gray-500">{t('eventLog.loading')}</div>
      )}
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
              {/* Service filter */}
              <div className="w-full">
                <Select value={serviceFilter} onValueChange={(v) => updateFilters({ service: v, page: 1 })}>
                  <SelectTrigger className="bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500 w-full">
                    <SelectValue placeholder={t('eventLog.service')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    <SelectItem value="all">{t('eventLog.allServices')}</SelectItem>
                    <SelectItem value="IAM_SERVICE">{t('eventLog.services.IAM_SERVICE')}</SelectItem>
                    <SelectItem value="PATIENT_SERVICE">{t('eventLog.services.PATIENT_SERVICE')}</SelectItem>
                    <SelectItem value="TEST_ORDER_SERVICE">{t('eventLog.services.TEST_ORDER_SERVICE')}</SelectItem>
                    <SelectItem value="WAREHOUSE_SERVICE">{t('eventLog.services.WAREHOUSE_SERVICE')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action filter */}
              <div className="w-full">
                <Select value={actionFilter} onValueChange={(v) => updateFilters({ action: v, page: 1 })}>
                  <SelectTrigger className="bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500 w-full">
                    <SelectValue placeholder={t('eventLog.action')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    <SelectItem value="all">{t('eventLog.allActions')}</SelectItem>
                    <SelectItem value="CREATE">{t('eventLog.actions.CREATE')}</SelectItem>
                    <SelectItem value="DELETE">{t('eventLog.actions.DELETE')}</SelectItem>
                    <SelectItem value="UPDATE">{t('eventLog.actions.UPDATE')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort by time */}
              <div className="w-full">
                <Select value={sortOrder} onValueChange={(v) => updateFilters({ sort: v, page: 1 })}>
                  <SelectTrigger className="bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500 w-full">
                    <SelectValue placeholder={t('eventLog.time')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    <SelectItem value="newest">{t('eventLog.newest')}</SelectItem>
                    <SelectItem value="oldest">{t('eventLog.oldest')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="flex items-center gap-2 w-full">
                <span className="text-sm font-medium whitespace-nowrap">{t('eventLog.startDate')}:</span>
                <div className="flex-1">
                  <Input
                    type={startDate ? "date" : "text"}
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => { 
                      if (!e.target.value) e.target.type = "text"; 
                    }}
                    value={startDate}
                    onChange={(e) => {
                      updateFilters({ startDate: e.target.value, page: 1 });
                    }}
                    className="w-full"
                    placeholder={t('eventLog.startDate')}
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="flex items-center gap-2 w-full">
                <span className="text-sm font-medium whitespace-nowrap">{t('eventLog.endDate')}:</span>
                <div className="flex-1">
                  <Input
                    type={endDate ? "date" : "text"}
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => { 
                      if (!e.target.value) e.target.type = "text"; 
                    }}
                    value={endDate}
                    onChange={(e) => {
                      updateFilters({ endDate: e.target.value, page: 1 });
                    }}
                    className="w-full"
                    placeholder={t('eventLog.endDate')}
                  />
                </div>
              </div>

              {(searchTerm || serviceFilter !== 'all' || actionFilter !== 'all' || sortOrder !== 'newest' || startDate || endDate) && (
                <div className="col-span-1 sm:col-span-2 lg:col-span-5 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => updateFilters({
                      search: '',
                      service: 'all',
                      action: 'all',
                      sort: 'newest',
                      startDate: '',
                      endDate: '',
                      page: 1
                    })}
                    className="w-full sm:w-auto"
                  >
                    {t('eventLog.clearFilter')}
                  </Button>
                </div>
              )}
            </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">{t('eventLog.title')} ({totalLogs})</CardTitle>
          <CardDescription className="text-sm sm:text-base">{t('eventLog.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="hidden lg:block overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="w-full border-collapse table-fixed min-w-[1000px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 sm:bg-transparent">
                    <th className="w-[20%] text-left py-3 px-4 font-semibold text-xs sm:text-sm text-gray-700">{t('eventLog.table.user')}</th>
                    <th className="w-[15%] text-left py-3 px-4 font-semibold text-xs sm:text-sm text-gray-700">{t('eventLog.table.service')}</th>
                    <th className="w-[40%] text-left py-3 px-4 font-semibold text-xs sm:text-sm text-gray-700">{t('eventLog.table.actionAndMessage')}</th>
                    <th className="w-[15%] text-left py-3 px-4 font-semibold text-xs sm:text-sm text-gray-700">{t('eventLog.table.time')}</th>
                    <th className="w-[10%] text-center py-3 px-4 font-semibold text-xs sm:text-sm text-gray-700">{t('eventLog.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {eventLogs.map((log) => {
                    const rowKey = (log.event_id || log._id || log.id || log.operator_id || Math.random().toString());
                    return (
                      <tr key={rowKey} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {log.operator_avatar ? (
                              <img 
                                src={log.operator_avatar} 
                                alt={log.operator_name || 'User'} 
                                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                {String(log.operator_name ?? log.operator_gmail ?? 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="truncate">
                              <div className="font-medium text-gray-900 truncate">{log.operator_name || t('eventLog.unknown')}</div>
                              {log.operator_gmail && <div className="text-xs text-gray-500 truncate">{log.operator_gmail}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm truncate" title={log.service_name}>{getServiceDisplayName(log.service_name || "")}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5 flex-shrink-0">{getActionIcon(String(log.action))}</div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {log.action ? t(`eventLog.actions.${String(log.action).toUpperCase()}`) : '—'}
                              </div>
                              {log.event_message && <div className="text-xs text-gray-500 break-words whitespace-normal">{getEventMessage(log.event_message)}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm" title={log.occurred_at ? new Date(log.occurred_at).toLocaleString('vi-VN') : ''}>
                          {log.occurred_at ? new Date(log.occurred_at).toLocaleString('vi-VN') : '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t('eventLog.viewDetail')}
                              disabled={!log.event_id}
                              onClick={() => {
                                const basePath = getBasePath();
                                navigate(`${basePath}/audit-reports/${log.event_id}`);}}
                              className="h-8 w-8"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t('eventLog.delete')}
                              className="text-red-600 hover:text-red-700 h-8 w-8"
                              disabled={!log.event_id}
                              onClick={() => setDeleteTarget({ id: (log.event_id || ''), name: log.operator_name })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {eventLogs.map((log) => (
              <div key={log.event_id || log._id || Math.random()} className="bg-white border rounded-lg p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {log.operator_avatar ? (
                      <img 
                        src={log.operator_avatar} 
                        alt={log.operator_name || 'User'} 
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {String(log.operator_name ?? log.operator_gmail ?? 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">{log.operator_name || t('eventLog.unknown')}</div>
                      {log.operator_gmail && <div className="text-xs text-gray-500 truncate">{log.operator_gmail}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const basePath = getBasePath();
                        navigate(`${basePath}/audit-reports/${log.event_id}`);
                      }}
                      className="h-8 w-8 text-gray-500"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 h-8 w-8"
                      onClick={() => setDeleteTarget({ id: (log.event_id || ''), name: log.operator_name })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">{t('eventLog.table.service')}</div>
                  <div className="font-medium text-right truncate">{getServiceDisplayName(log.service_name || "")}</div>
                  
                  <div className="text-gray-500">{t('eventLog.table.actionAndMessage')}</div>
                  <div className="flex items-center justify-end gap-2">
                    {getActionIcon(String(log.action))}
                    <span className="font-medium">{log.action ? t(`eventLog.actions.${String(log.action).toUpperCase()}`) : '—'}</span>
                  </div>
                </div>

                {log.event_message && (
                  <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 break-words">
                    {getEventMessage(log.event_message)}
                  </div>
                )}

                <div className="text-xs text-gray-400 text-right border-t pt-2 mt-1">
                  {log.occurred_at ? new Date(log.occurred_at).toLocaleString('vi-VN') : '—'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          className="px-2 py-1 rounded border disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          aria-label="Trang trước"
        >
          ‹
        </button>
        {renderPaginationButtons()}
        <button
          className="px-2 py-1 rounded border disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          aria-label="Trang sau"
        >
          ›
        </button>
      </div>

      {/* Delete confirm */}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        itemName={deleteTarget?.name}
        title={t('eventLog.deleteConfirmTitle')}
        description={t('eventLog.deleteConfirmDescription')}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            const ok = await eventLogService.delete(deleteTarget.id);
            if (ok) {
              // Reload current page data after successful deletion
              toast.success(t('eventLog.deleteSuccess'));
              const res = await eventLogService.getAll({ page, limit: 10, search: searchTerm });
              setEventLogs(res.logs || []);
              if (res.totalPages) setTotalPages(Number(res.totalPages));
              if (typeof res.total === 'number') setTotalLogs(res.total);
            } else {
              toast.error(t('eventLog.deleteError'));
            }
          } catch (err) {
            console.error('Failed to delete event log', err);
            toast.error(t('eventLog.deleteError'));
          } finally {
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
