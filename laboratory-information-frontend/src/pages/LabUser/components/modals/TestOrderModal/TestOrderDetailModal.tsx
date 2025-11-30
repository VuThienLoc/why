import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../../components/common/dialog';
import Button from '../../../../../components/common/button';
import Badge from '../../../../../components/common/badge';
import { Clock, User, TestTube, Microscope, FlaskConical, List } from 'lucide-react';
import type { TestOrder } from '../../../types/TestOrderTypes';
import { testItemService, type TestItem } from '../../../../../service/testItemService';
import { useTranslation } from 'react-i18next';

interface TestOrderDetailModalProps {
  order: TestOrder | null;
  isOpen: boolean;
  onDelete?: (order: TestOrder) => void; 
  onEdit?: (order: TestOrder) => void; 
  onClose: () => void;
}

const TestOrderDetailModal: React.FC<TestOrderDetailModalProps> = ({
  order,
  isOpen,
  onDelete,
  onEdit,
  onClose,
}) => {
  const { t } = useTranslation();
  const [testItems, setTestItems] = useState<TestItem[]>([]);
  const [loadingTestItems, setLoadingTestItems] = useState(false);

  useEffect(() => {
    const loadTestItems = async () => {
      if (!order?.test_item_ids || order.test_item_ids.length === 0) {
        setTestItems([]);
        return;
      }

      try {
        setLoadingTestItems(true);
        const items = await Promise.all(
          order.test_item_ids.map(id => testItemService.getTestItemById(id))
        );
        setTestItems(items.filter((item): item is TestItem => item !== null));
      } catch (error) {
        console.error('Error loading test items:', error);
        setTestItems([]);
      } finally {
        setLoadingTestItems(false);
      }
    };

    if (isOpen && order) {
      loadTestItems();
    }
  }, [isOpen, order]);

  if (!order) return null;

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />{t('testOrder.detail.pending')}</Badge>;
      case 'processing':
        return <Badge variant="default"><TestTube className="w-3 h-3 mr-1" />{t('testOrder.detail.processing')}</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-600" ><TestTube className="w-3 h-3 mr-1" style={{color:'white'}}/><div style={{color:'white'}}>{ t('testOrder.detail.completed')}</div></Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-gray-50">
        <div className="p-6 bg-white border-b sticky top-0 z-10">
          <DialogHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl text-blue-700">
                <TestTube className="w-6 h-6" />
                {t('testOrder.detail.title')}
              </DialogTitle>
              {getStatusBadge(order.status)}
            </div>
            <DialogDescription className="text-base">
              {t('testOrder.detail.description')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-8">
          {/* Order Summary Card */}
          <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã phiếu (Barcode)</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-2xl font-bold text-gray-900 tracking-tight">{order.barcode || order._id}</span>
              </div>
            </div>
            <div className="flex gap-8">
              {order.created_at && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('testOrder.detail.sampleDate')}</span>
                  <p className="font-medium text-gray-900 mt-1">{order.created_at}</p>
                </div>
              )}
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('testOrder.detail.dueDate')}</span>
                <p className="font-medium text-gray-900 mt-1">{order.due_date}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Info Card */}
            <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                <User className="w-4 h-4 text-blue-600" />
                {t('testOrder.detail.patientInfo')}
              </h4>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">{t('testOrder.detail.patientName')}</span>
                <p className="text-lg font-medium text-gray-900 mt-1">{order.patient_name}</p>
              </div>
            </div>

            {/* Test Info Card */}
            <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                <FlaskConical className="w-4 h-4 text-blue-600" />
                {t('testOrder.detail.testInfo')}
              </h4>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">{t('testOrder.detail.testType')}</span>
                <p className="text-lg font-medium text-gray-900 mt-1">{order.test_type}</p>
              </div>
            </div>
          </div>

          {/* Test Items Section */}
          {order.test_item_ids && order.test_item_ids.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <List className="w-5 h-5 text-blue-600" />
                {t('testOrder.detail.testItems')}
              </h4>

              {loadingTestItems ? (
                <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed">
                  {t('testOrder.detail.loading')}
                </div>
              ) : testItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testItems.map((item) => (
                    <div key={item._id} className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-gray-900">{item.name}</h5>
                        <Badge variant="outline" className="font-mono text-xs">{item.code}</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        {item.unit && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t('testOrder.detail.unit')}</span>
                            <span className="font-medium">{item.unit}</span>
                          </div>
                        )}
                        {(item.ref_min !== undefined || item.ref_max !== undefined) && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t('testOrder.detail.referenceValue')}</span>
                            <span className="font-medium text-blue-600">
                              {item.ref_min !== undefined && item.ref_max !== undefined
                                ? `${item.ref_min} - ${item.ref_max}`
                                : item.ref_min !== undefined
                                  ? `≥ ${item.ref_min}`
                                  : `≤ ${item.ref_max}`}
                            </span>
                          </div>
                        )}
                        {item.method && (
                          <div className="flex justify-between pt-1 border-t mt-2">
                            <span className="text-gray-500">{t('testOrder.detail.method')}:</span>
                            <span className="font-medium">{item.method}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed">
                  {t('testOrder.detail.noTestItems')}
                </div>
              )}
            </div>
          )}

          {/* Instrument & Reagents Grid */}
          {(order.instrument || (order.reagents && order.reagents.length > 0)) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Instrument */}
              {order.instrument && (
                <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                    <Microscope className="w-4 h-4 text-blue-600" />
                    {t('testOrder.detail.instrumentInfo')}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{t('testOrder.detail.instrumentName')}</span>
                      <span className="font-medium">{order.instrument.instrument_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{t('testOrder.detail.instrumentCode')}</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{order.instrument.instrument_code}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{t('testOrder.status')}</span>
                      <Badge variant={order.instrument.status === 'Ready' ? 'default' : 'secondary'}>
                        {order.instrument.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Reagents */}
              {order.reagents && order.reagents.length > 0 && (
                <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                    <FlaskConical className="w-4 h-4 text-blue-600" />
                    {t('testOrder.detail.reagentInfo')}
                  </h4>
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                    {order.reagents.map((reagent, index) => (
                      <div key={reagent.reagent_id || index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{reagent.reagent_name}</p>
                          <p className="text-xs text-gray-500">{reagent.reagent_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{reagent.quantity_used}</p>
                          <span className={`text-xs ${reagent.status === 'Available' ? 'text-green-600' : 'text-gray-500'}`}>
                            {reagent.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
            <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {t('testOrder.detail.notes')}
            </h4>
            <p className="text-sm text-amber-800">
              {order.notes?.trim() ? order.notes : t('testOrder.detail.noNotes')}
            </p>
          </div>

        </div>

        <div className="p-6 bg-white border-t sticky bottom-0 z-10">
          <DialogFooter className="flex items-center justify-end gap-3">
            {onEdit && (
              <Button
                variant="default"
                onClick={() => {
                  onEdit(order);
                  onClose();
                }}
                className="px-6"
              >
                {t('testOrder.detail.update')}
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(order);
                  onClose();
                }}
                className="px-6"
              >
                {t('testOrder.detail.delete')}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestOrderDetailModal;

