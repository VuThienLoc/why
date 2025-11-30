import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '../../../../components/common/input';
import { Label } from '../../../../components/common/label';
import Button from '../../../../components/common/button';
import { Edit3, ArrowLeft, ArrowRight } from 'lucide-react';
import type { TestOrder } from '../../types/TestOrderTypes';
import { useAuthContext } from '../../../../hooks/useAuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '../../../../components/common/card';
import { testItemService, type TestItem } from '../../../../service/testItemService';
import { TestItemMultiSelect } from '../common/TestItemMultiSelect';
import { useTranslation } from 'react-i18next';
import { type PatientOption } from '../../../../service/patientService';
import { PatientSearchInput } from '../../../../components/common/patient/PatientSearchInput';
import { validateDueDate } from '../../utils/testOrderUtils';

// Test type keys - these are used as values and for translation keys
const testTypeKeys = [
  "biochemistry",
  "generalHematology",
  "microbiology",
  "immunology",
  "endocrinology",
  "oncology"
];

// Mapping from translation keys to backend expected values (Vietnamese)
// Backend expects Vietnamese test type names
const testTypeKeyToBackendValue: Record<string, string> = {
  "biochemistry": "Sinh hóa máu",
  "generalHematology": "Huyết học tổng quát",
  "microbiology": "Vi sinh",
  "immunology": "Miễn dịch",
  "endocrinology": "Nội tiết",
  "oncology": "Ung thư học"
};
const CreateTestOrderPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();

  const [patientQuery, setPatientQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);

  const handleSelectPatient = (patient: PatientOption) => {
      setSelectedPatient(patient);
      setPatientQuery(patient.fullName ?? '');
      setFormData(prev => ({
          ...prev,
          patient_name: patient.fullName ?? '',
          patient_id: patient.id
      }));
  };

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
  const [testItems, setTestItems] = useState<TestItem[]>([]);
  const [loadingTestItems, setLoadingTestItems] = useState(false);
  const [selectedTestItemIds, setSelectedTestItemIds] = useState<string[]>([]);

  // Load test items when test_type changes
  useEffect(() => {
    if (formData.test_type) {
      loadTestItems(formData.test_type);
    } else {
      setTestItems([]);
      setSelectedTestItemIds([]);
    }
  }, [formData.test_type]);

const loadTestItems = async (testTypeKey: string) => {
  try {
    setLoadingTestItems(true);
    // Convert translation key to backend expected value
    const backendTestType = testTypeKeyToBackendValue[testTypeKey] || testTypeKey;
    const items = await testItemService.getAllTestItems(backendTestType);
    setTestItems(items);
    // Reset selected items when test type changes
    setSelectedTestItemIds([]);
  } catch (error: unknown) {
    toast.error(t('testOrder.cannotLoadTestItems'));
    setTestItems([]);

    // Optional: log error safely
    if (error instanceof Error) {
      console.error('Error loading test items:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  } finally {
    setLoadingTestItems(false);
  }
};


  const generateBarcode = (): string => {
    const ts = Date.now().toString(36);
    const rnd = Math.random().toString(36).substr(2, 5);
    return `BC-${ts}-${rnd}`.toUpperCase();
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.patient_name?.trim()) newErrors.patient_name = t('testOrder.enterPatientName');
    if (!formData.test_type) newErrors.test_type = t('testOrder.selectTestType');
    
    const dueDateError = validateDueDate(formData.due_date || '', t);
    if (dueDateError) {
      newErrors.due_date = dueDateError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t('testOrder.pleaseFillRequiredFields'));
      return;
    }

    // Convert test_type key to backend expected value before navigation
    const backendTestType = testTypeKeyToBackendValue[formData.test_type] || formData.test_type;
    
    // Navigate to select instruments page with form data
    const basePath = getBasePath();
    navigate(`${basePath}/select-instruments`, {
      state: {
        formData: {
          ...formData,
          test_type: backendTestType, // Use backend expected value
          barcode: generateBarcode(),
          test_item_ids: selectedTestItemIds,
        }
      }
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Step Indicator */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
        <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-8 flex-wrap">
          {/* Step 1 - Active */}
          <div className="flex flex-col items-center gap-2 sm:gap-4 min-w-[100px] sm:min-w-[140px]">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-lg sm:text-xl md:text-2xl shadow-lg ring-2 sm:ring-4 ring-blue-100 animate-pulse">
                1
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-blue-700">{t('testOrder.createTestOrder')}</p>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 hidden sm:block mt-1">{t('testOrder.newTestOrder')}</p>
            </div>
          </div>

          {/* Connector 1 */}
          <div className="hidden sm:block flex-1 min-w-[30px] sm:min-w-[50px] max-w-[60px] sm:max-w-[100px] h-1 sm:h-1.5 bg-gray-300 rounded-full mt-[-24px] sm:mt-[-32px]"></div>

          {/* Step 2 - Inactive */}
          <div className="flex flex-col items-center gap-2 sm:gap-4 min-w-[100px] sm:min-w-[140px]">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-lg sm:text-xl md:text-2xl border-2 border-gray-300">
              2
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-500">{t('testOrder.selectInstrument')}</p>
            </div>
          </div>

          {/* Connector 2 */}
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
              navigate(`${basePath}/test-orders`);
            }}
            className="flex items-center gap-2 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('testOrder.back')}
          </Button>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 sm:p-2.5 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                {t('testOrder.createTestOrder')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {t('testOrder.enterTestOrderInfo')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold">{t('testOrder.testOrderInfo')}</h3>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleNext} className="space-y-4 sm:space-y-6">
            {/* Bệnh nhân và Loại xét nghiệm - cùng hàng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Bệnh nhân */}
              <div className="space-y-2">
                <Label htmlFor="patient" className="text-sm font-medium">
                  {t('testOrder.patient')} <span className="text-red-500">*</span>
                </Label>
                <PatientSearchInput
                  value={patientQuery}
                  onChange={(value) => {
                    setPatientQuery(value);
                    if (selectedPatient && value !== (selectedPatient.fullName ?? '')) {
                      setSelectedPatient(null);
                      setFormData((prev) => ({ ...prev, patient_id: '', patient_name: value }));
                    } else {
                      setFormData((prev) => ({ ...prev, patient_name: value }));
                    }
                  }}
                  onSelect={handleSelectPatient}
                  selectedPatient={selectedPatient}
                  error={errors.patient_name}
                />
                {selectedPatient?.patientCode && (
                    <p className="text-xs text-muted-foreground">{t('patient.patientCode')}: {selectedPatient.patientCode}</p>
                )}
                {errors.patient_name && (
                  <p className="text-sm text-red-600">{errors.patient_name}</p>
                )}
              </div>

              {/* Loại xét nghiệm */}
              <div className="space-y-2">
                <Label htmlFor="testType" className="text-sm font-medium">
                  {t('testOrder.testType')} <span className="text-red-500">*</span>
                </Label>
                <select
                  id="testType"
                  value={formData.test_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, test_type: e.target.value }))}
                  disabled={false}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.test_type 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                >
                  <option value="">{t('testOrder.selectTestType')}</option>
                  {testTypeKeys.map(testTypeKey => (
                    <option key={testTypeKey} value={testTypeKey}>
                      {t(`testOrder.${testTypeKey}`)}
                    </option>
                  ))}
                </select>
                {errors.test_type && (
                  <p className="text-sm text-red-600">{errors.test_type}</p>
                )}
              </div>
            </div>

            {/* Test Items - hiển thị khi đã chọn loại xét nghiệm */}
            {formData.test_type && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('testOrder.testItems')}
                </Label>
                <TestItemMultiSelect
                  options={testItems}
                  value={selectedTestItemIds}
                  onChange={setSelectedTestItemIds}
                  placeholder={loadingTestItems ? t('testOrder.loading') : t('testOrder.selectTestItems')}
                  searchPlaceholder={t('testOrder.searchTestItems')}
                  disabled={loadingTestItems}
                />
              </div>
            )}

            {/* Hạn hoàn thành - full width */}
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-medium">
                {t('testOrder.dueDate')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  disabled={false}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.due_date 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                  placeholder="dd/mm/yyyy"
                />
              </div>
              {errors.due_date && (
                <p className="text-sm text-red-600">{errors.due_date}</p>
              )}
            </div>

            {/* Ghi chú */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                {t('testOrder.notes')}
              </Label>
              <textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                disabled={false}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-y hover:border-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder={t('testOrder.notesPlaceholder')}
              />
            </div>

            {/* Nút hành động */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 mt-4 sm:mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const basePath = getBasePath();
                  navigate(`${basePath}/test-orders`);
                }}
                disabled={false}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {t('testOrder.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={false}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('testOrder.next')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTestOrderPage;

