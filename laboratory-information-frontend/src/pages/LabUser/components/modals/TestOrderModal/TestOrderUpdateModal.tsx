import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../../components/common/dialog';
import { Input } from '../../../../../components/common/input';
import { Label } from '../../../../../components/common/label';
import Button from '../../../../../components/common/button';
import { Edit3, FileText, User, Microscope, ClipboardList, Clock, TestTube, FlaskConical } from 'lucide-react';
import type { TestOrder } from '../../../types/TestOrderTypes';
import Badge from '../../../../../components/common/badge';

import { useAuthContext } from '../../../../../hooks/useAuthContext';
import { patientService, type PatientOption } from '../../../../../service/patientService';
import { instrumentsService } from '../../../../../service/instrumentsService';
import { reagentService } from '../../../../../service/reagentService';
import type { Instrument } from '../../../../service/types/Instrument';
import type { Reagent } from '../../../types/Reagent.ts';
import { SearchableDropdown } from '../../common/SearchableDropdown.tsx';
import { SearchableMultiSelect } from '../../common/SearchableMultiSelect.tsx';
import { toast } from 'sonner';
import { testOrderService } from '../../../../../service/testOrderService';
import { testItemService, type TestItem } from '../../../../../service/testItemService';
import { TestItemMultiSelect } from '../../common/TestItemMultiSelect.tsx';
import { validateDueDate } from '../../../utils/testOrderUtils.tsx';

interface TestOrderFormModalProps {
  order: TestOrder | null;
  isOpen: boolean;
  onClose: () => void;
  /** Called with a orderData that can be used directly to CREATE or UPDATE */
  onSubmit: (order: Omit<TestOrder, 'id'> | Partial<TestOrder>) => Promise<void>;
  isEdit: boolean;
}

/* --------------------------------------------------------------------- */
/*  Helper – normalise status coming from the API (lower-case variants)  */
/* --------------------------------------------------------------------- */
const normalizeStatus = (
  status: string
): 'Pending' | 'Processing' | 'Completed' => {
  const lower = status.toLowerCase();
  if (lower === 'processing') return 'Processing';
  if (lower === 'completed') return 'Completed';
  return 'Pending';
};
/* --------------------------------------------------------------------- */
const TestOrderFormModal: React.FC<TestOrderFormModalProps> = ({
  order,
  isOpen,
  onClose,
  onSubmit,
  isEdit,
}) => {
  const { user } = useAuthContext();
  const testTypes = [
    "Sinh hóa máu",
    "Huyết học tổng quát",
    "Vi sinh",
    "Miễn dịch",
    "Nội tiết",
    "Ung thư học"
  ];
  const [formData, setFormData] = useState<Omit<TestOrder, '_id'>>({
    patient_id: '',
    patient_name: '',
    barcode: '',
    test_type: '',
    status: 'Pending',
    created_by: user?.name ?? '',
    updated_by: user?.name ?? '',
    due_date: '',
    notes: '',
    is_deleted: false,
    deleted_at: '',
    deleted_by: '',
    processing: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loadingInstruments, setLoadingInstruments] = useState(false);
  const [reagents, setReagents] = useState<Reagent[]>([]);
  const [loadingReagents, setLoadingReagents] = useState(false);
  const [instrumentId, setInstrumentId] = useState<string>('');
  const [reagentUsages, setReagentUsages] = useState<Array<{ reagent_id: string; quantity_used: number }>>([]);
  const [testItems, setTestItems] = useState<TestItem[]>([]);
  const [loadingTestItems, setLoadingTestItems] = useState(false);
  const [selectedTestItemIds, setSelectedTestItemIds] = useState<string[]>([]);

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Chờ xử lý</Badge>;
      case 'processing':
        return <Badge variant="default"><TestTube className="w-3 h-3 mr-1" />Đang thực hiện</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-600" ><TestTube className="w-3 h-3 mr-1" style={{ color: 'white' }} /><div style={{ color: 'white' }}>Hoàn thành</div></Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  /* =================== RESET KHI MỞ MODAL =================== */
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setIsSubmitting(false);
      loadPatients();
      loadInstruments();
      loadReagents();

      if (order && isEdit) {
        setFormData({
          patient_id: order.patient_id,
          patient_name: order.patient_name ?? '',
          barcode: order.barcode,
          test_type: order.test_type,
          status: normalizeStatus(order.status),
          created_by: order.created_by ?? user?.name ?? '',
          updated_by: user?.name ?? '',
          due_date: order.due_date?.split('T')[0] || '', // YYYY-MM-DD
          notes: order.notes ?? '',
          is_deleted: order.is_deleted ?? false,
          deleted_at: order.deleted_at ?? '',
          deleted_by: order.deleted_by ?? '',
          processing: order.processing ?? 0,
        });
        // Set reagent_usages if exists
        if (order.reagents && order.reagents.length > 0) {
          setReagentUsages(
            order.reagents.map(r => ({
              reagent_id: r.reagent_id || '',
              quantity_used: r.quantity_used || 1,
            }))
          );
        } else {
          setReagentUsages([]);
        }
      } else {
        // Tạo mới → reset
        setFormData({
          patient_id: '',
          patient_name: '',
          barcode: '',
          test_type: '',
          status: 'Pending',
          created_by: user?.name ?? '',
          updated_by: user?.name ?? '',
          due_date: '',
          notes: '',
          is_deleted: false,
          deleted_at: '',
          deleted_by: '',
          processing: 0,
        });
        setInstrumentId('');
        setReagentUsages([]);
      }
    }
  }, [isOpen, order, isEdit, user]);

  // Set instrument_id after instruments are loaded (for edit mode)
  useEffect(() => {
    if (isOpen && order && isEdit && order.instrument && instruments.length > 0) {
      const matchedInstrument = instruments.find(
        inst => inst.instrument_code === order.instrument?.instrument_code
      );
      if (matchedInstrument) {
        setInstrumentId(matchedInstrument._id);
      }
    }
  }, [isOpen, order, isEdit, instruments]);

  // Load test items when test_type changes
  useEffect(() => {
    if (isOpen && formData.test_type) {
      loadTestItems(formData.test_type);
    } else {
      setTestItems([]);
      if (!formData.test_type) {
        setSelectedTestItemIds([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, formData.test_type]);

  // Load test items for edit mode
  useEffect(() => {
    if (isOpen && order && isEdit && order.test_item_ids && order.test_item_ids.length > 0) {
      setSelectedTestItemIds(order.test_item_ids);
    }
  }, [isOpen, order, isEdit]);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const data = await patientService.getAllPatientsForDropdown();
      setPatients(data);
    } catch {
      toast.error('Không thể tải danh sách bệnh nhân');
    } finally {
      setLoadingPatients(false);
    }
  };

  const loadInstruments = async () => {
    try {
      setLoadingInstruments(true);
      // Use getAllInstrumentsList to fetch all instruments across all pages
      const allInstruments = await instrumentsService.getAllInstrumentsList();
      // Filter only active instruments
      const activeInstruments = allInstruments.filter(inst => inst.is_active && !inst.is_deleted);
      setInstruments(activeInstruments);
    } catch (e) {
      toast.error('Không thể tải danh sách thiết bị');
      console.error('Error loading instruments:', e);
      setInstruments([]); // Set empty array on error
    } finally {
      setLoadingInstruments(false);
    }
  };

  const loadReagents = async () => {
    try {
      setLoadingReagents(true);
      const data = await reagentService.getAllReagents();
      // Filter only available reagents
      const availableReagents = data.filter(r => r.status !== 'Expired');
      setReagents(availableReagents);
    } catch {
      toast.error('Không thể tải danh sách thuốc thử');
    } finally {
      setLoadingReagents(false);
    }
  };

  const loadTestItems = async (testType: string) => {
    try {
      setLoadingTestItems(true);
      const items = await testItemService.getAllTestItems(testType);
      setTestItems(items);
      // Only reset selected items if not in edit mode or if test type changed
      if (!isEdit || !order?.test_item_ids) {
        setSelectedTestItemIds([]);
      }
    } catch {
      toast.error('Không thể tải danh sách test items');
      setTestItems([]);
    } finally {
      setLoadingTestItems(false);
    }
  };

  const handlePatientChange = (patient_id: string) => {
    const patient = patients.find(p => p.id === patient_id);
    setFormData(prev => ({
      ...prev,
      patient_id,
      patient_name: patient?.fullName ?? '',
    }));
  };

  const generateBarcode = (): string => {
    const ts = Date.now().toString(36);
    const rnd = Math.random().toString(36).substr(2, 5);
    return `BC-${ts}-${rnd}`.toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const newErrors: Record<string, string> = {};
    if (!formData.patient_id) newErrors.patient_id = 'Chọn bệnh nhân';
    if (!formData.test_type) newErrors.test_type = 'Chọn loại xét nghiệm';

    const dueDateError = validateDueDate(formData.due_date || '');
    if (dueDateError) {
      newErrors.due_date = dueDateError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const submitData = {
      patient_id: formData.patient_id,
      patient_name: formData.patient_name,
      test_type: formData.test_type,
      due_date: formData.due_date,
      notes: formData.notes,
      created_by: user?.name || 'system',
      updated_by: user?.name ?? 'system',
      ...(isEdit ? {} : { barcode: generateBarcode() }),
      // Instrument và reagents
      ...(instrumentId ? { instrument_id: instrumentId } : {}),
      reagent_usages: reagentUsages.map(ru => ({
        reagent_id: ru.reagent_id,
        quantity_used: ru.quantity_used || 1,
      })),
      // Test items
      test_item_ids: selectedTestItemIds,
    };

    try {
      if (isEdit && order?._id) {
        // Gọi API updateTestOrder khi ở chế độ chỉnh sửa
        await testOrderService.updateTestOrder(order._id, submitData);
        toast.success('Cập nhật thành công!');
      }
      // Gọi callback onSubmit để parent component có thể refresh data
      await onSubmit(submitData);
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };

      const msg =
        error.response?.data?.message ||
        error.message ||
        'Lỗi hệ thống';

      toast.error(msg);
    }finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-gray-50">
        <div className="p-6 bg-white border-b sticky top-0 z-10">
          <DialogHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl text-blue-700">
                {isEdit ? <Edit3 className="w-6 h-6" /> : <ClipboardList className="w-6 h-6" />}
                {isEdit ? 'Chỉnh sửa lệnh xét nghiệm' : 'Tạo lệnh xét nghiệm mới'}
              </DialogTitle>
              {isEdit && order && getStatusBadge(order.status)}
            </div>
            <DialogDescription className="text-base">
              {isEdit ? `Cập nhật thông tin cho mã phiếu: ${order?.barcode}` : 'Điền đầy đủ thông tin để tạo lệnh xét nghiệm mới'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <form id="test-order-form" onSubmit={handleSubmit} className="space-y-6">

            {/* Summary Card - Only in Edit Mode */}
            {isEdit && (
              <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã phiếu (Barcode)</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-2xl font-bold text-gray-900 tracking-tight">{order?.barcode || order?._id}</span>
                  </div>
                </div>
                <div className="flex gap-8">
                  {order?.created_at && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày tạo</span>
                      <p className="font-medium text-gray-900 mt-1">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Card 1: Thông tin chung */}
            <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                <User className="w-4 h-4 text-blue-600" />
                Thông tin chung
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Select */}
                <div className="space-y-2">
                  <Label htmlFor="patient" className="text-sm font-medium text-gray-700">
                    Bệnh nhân <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="patient"
                    value={formData.patient_id}
                    onChange={(e) => handlePatientChange(e.target.value)}
                    disabled={loadingPatients || isSubmitting || isEdit}
                    className={`appearance-none w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.patient_id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                      } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">-- Chọn bệnh nhân --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} {p.patientCode && `(${p.patientCode})`}
                      </option>
                    ))}
                  </select>
                  {errors.patient_id && <p className="text-sm text-red-600 mt-1">{errors.patient_id}</p>}
                </div>

                {/* Test Type Select */}
                <div className="space-y-2">
                  <Label htmlFor="test_type" className="text-sm font-medium text-gray-700">
                    Loại xét nghiệm <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="test_type"
                    value={formData.test_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, test_type: e.target.value }))}
                    disabled={isSubmitting}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.test_type
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                      } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">-- Chọn loại xét nghiệm --</option>
                    {testTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {errors.test_type && <p className="text-sm text-red-600 mt-1">{errors.test_type}</p>}
                </div>
              </div>
            </div>

            {/* Card 2: Chi tiết & Thời gian */}
            <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                <FlaskConical className="w-4 h-4 text-blue-600" />
                Chi tiết chỉ định
              </h4>

              {/* Test Items */}
              {formData.test_type && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Danh sách chỉ số (Test Items)
                  </Label>
                  <TestItemMultiSelect
                    options={testItems}
                    value={selectedTestItemIds}
                    onChange={setSelectedTestItemIds}
                    placeholder={loadingTestItems ? 'Đang tải...' : 'Chọn test items'}
                    searchPlaceholder="Tìm kiếm test items..."
                    disabled={loadingTestItems || isSubmitting}
                  />
                </div>
              )}

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                  Hạn hoàn thành <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  disabled={isSubmitting}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.due_date
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                    } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                />
                {errors.due_date && <p className="text-sm text-red-600 mt-1">{errors.due_date}</p>}
              </div>
            </div>

            {/* Card 3: Tài nguyên & Thiết bị */}
            <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                <Microscope className="w-4 h-4 text-blue-600" />
                Tài nguyên & Thiết bị
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Thiết bị thực hiện</Label>
                  <SearchableDropdown
                    options={instruments.map(inst => ({
                      id: inst._id,
                      label: `${inst.instrument_name} (${inst.instrument_code})`,
                      ...inst,
                    }))}
                    value={instrumentId}
                    onChange={setInstrumentId}
                    placeholder={loadingInstruments ? 'Đang tải...' : 'Chọn thiết bị...'}
                    searchPlaceholder="Tìm thiết bị..."
                    disabled={loadingInstruments || isSubmitting}
                    getOptionLabel={(opt) => opt.label}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Thuốc thử sử dụng</Label>
                  <SearchableMultiSelect
                    options={reagents.map(r => ({
                      id: r.id,
                      name: r.name,
                      lotNumber: r.lotNumber,
                      quantity: r.quantity,
                    }))}
                    value={reagentUsages}
                    onChange={setReagentUsages}
                    placeholder={loadingReagents ? 'Đang tải...' : 'Chọn thuốc thử...'}
                    searchPlaceholder="Tìm thuốc thử..."
                    disabled={loadingReagents || isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Card 4: Ghi chú */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 space-y-4">
              <h4 className="font-semibold text-amber-900 flex items-center gap-2 pb-2 border-b border-amber-200">
                <FileText className="w-4 h-4 text-amber-700" />
                Ghi chú
              </h4>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-y hover:border-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Ghi chú thêm (tùy chọn)"
              />
            </div>

          </form>
        </div>

        <div className="p-6 bg-white border-t sticky bottom-0 z-10">
          <DialogFooter className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              form="test-order-form"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  {isEdit ? 'Lưu thay đổi' : 'Tạo lệnh mới'}
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestOrderFormModal;