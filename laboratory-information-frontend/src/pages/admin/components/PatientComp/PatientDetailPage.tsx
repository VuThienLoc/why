import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/common/card';
import Button from '../../../../components/common/button';
import { Label } from '../../../../components/common/label';
import { ArrowLeft, User, FileText, Eye, Pencil, Trash2, FlaskConical } from 'lucide-react';
import { patientService, type PatientOption, type PatientDetailResponse, viewPatientDetail } from '../../../../service/patientService';
import { patientMedicalRecordService, type PatientMedicalRecord } from '../../../../service/patientMedicalRecordService';
// import { testOrderService } from '../../../../service/testOrderService';
import { testResultService } from '../../../../service/testResultService';
import type { TestResult } from '@/pages/NormalUser/type/TestResult';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import EditPatientMedicalRecord from '@/pages/LabUser/components/modals/PatientMedicalRecordModal/PatientMedicalRecordEditModal';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';
import MedicalRecordViewModal from '@/pages/LabUser/components/modals/PatientMedicalRecordModal/PatientMedicalRecordViewModal';
import TestResultModal from '@/pages/LabUser/components/modals/TestResultModal/TestResultModal';

// Type for test result items from API
interface TestResultItem {
  _id: string;
  test_order_id: string;
  test_item_id: string;
  patient_id: string;
  test_type: string;
  name: string;
  instrument_name: string;
  patient_name: string;
  reagent_names: string[];
  code: string;
  unit: string;
  result_value: number;
  result_status: 'normal' | 'high' | 'low';
  reviewed: boolean;
  reviewer_comment: string;
  is_deleted: boolean;
  deleted_at: string | null;
  createdAt: string;
  updatedAt: string;
}

const PatientDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientOption | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<PatientMedicalRecord[]>([]);
  const [testResultItems, setTestResultItems] = useState<TestResultItem[]>([]);
  const [selectedTestResult, setSelectedTestResult] = useState<TestResult | null>(null);
  const [testResultModalOpen, setTestResultModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [patientDetail, setPatientDetail] = useState<PatientDetailResponse | null>(null);
  // Create button moved to patient list page
  const [editId, setEditId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name?: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadPatient = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const foundPatient = await patientService.getPatientById(id);
      setPatient(foundPatient);
      // Fetch detailed info (emergency_contact, patient_code, etc.)
      const detail = await viewPatientDetail(id);
      setPatientDetail(detail);
    } catch (error) {
      toast.error(t('patient.cannotLoadPatientInfo'));
      console.error('Error loading patient:', error);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  const loadMedicalRecords = useCallback(async () => {
    if (!patient) return;
    try {
      const res = await patientMedicalRecordService.getAll({ page: 1, limit: 50, patientId: patient.id });
      setMedicalRecords(res.records || []);
    } catch (error) {
      toast.error(t('patient.cannotLoadMedicalRecords'));
      console.error('Error loading medical records:', error);
    }
  }, [patient, t]);

  const loadTestResults = useCallback(async () => {
    if (!patient) return;
    try {
      const response = await testResultService.getResultsByPatientId(patient.id);
      
      if (response && response.success && response.data) {
        setTestResultItems(response.data);
      } else {
        setTestResultItems([]);
      }
    } catch (error) {
      console.error('Error loading test results:', error);
      setTestResultItems([]);
    }
  }, [patient]);

  useEffect(() => { loadPatient(); }, [loadPatient]);
  useEffect(() => { 
    if (patient) {
      loadMedicalRecords();
      loadTestResults();
    }
  }, [patient, refreshKey, loadMedicalRecords, loadTestResults]);

  const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleString('vi-VN') : '-';

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const ok = await patientMedicalRecordService.remove(deleteTarget.id);
      if (ok) {
        toast.success(t('patient.deleteMedicalRecordSuccess'));
        setRefreshKey(k => k + 1);
      } else {
        toast.error(t('patient.deleteMedicalRecordFailed'));
      }
    } catch {
      toast.error(t('patient.deleteMedicalRecordFailed'));
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleViewTestResult = async (testOrderId: string) => {
    try {
      const allResults = await testResultService.getAllTestResults();
      // Find the result matching the test order ID
      const result = allResults.find(r => r.testOrderId === testOrderId);
      if (result) {
        setSelectedTestResult(result);
        setTestResultModalOpen(true);
      } else {
        toast.info(t('patient.noTestResult'));
      }
    } catch (error) {
      toast.error(t('patient.cannotLoadTestResult'));
      console.error('Error loading test result:', error);
    }
  };

  // Group test results by test_order_id for display
  const groupedTestResults = testResultItems.reduce((acc, item) => {
    if (!acc[item.test_order_id]) {
      acc[item.test_order_id] = [];
    }
    acc[item.test_order_id].push(item);
    return acc;
  }, {} as Record<string, TestResultItem[]>);

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return t('patient.notUpdated');
    try {
      const date = new Date(isoString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return t('patient.notUpdated');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('patient.patientNotFound')}</h3>
          <Button onClick={() => navigate(-1)}>{t('patient.backToHome')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
             <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{t('patient.patientDetail')}</h1>
            <p className="text-sm sm:text-base text-gray-600">{t('patient.patientDetailDescription')}</p>
          </div>
        </div>
        <div />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            {t('patient.patientInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

            <div>
              <Label className="text-xs sm:text-sm text-gray-600">{t('patient.patientCode')}</Label>
              <p className="text-base sm:text-lg font-semibold mt-1 break-words">{patient.patientCode || patient.id}</p>
            </div>
            <div>
               <Label className="text-xs sm:text-sm text-gray-600">{t('patient.patientName')}</Label>
              <p className="text-base sm:text-lg mt-1 break-words">{patient.fullName}</p>
            </div>
            <div>
               <Label className="text-xs sm:text-sm text-gray-600">{t('patient.dateOfBirth')}</Label>
              <p className="text-base sm:text-lg mt-1">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
            </div>
            <div>
              <Label className="text-xs sm:text-sm text-gray-600">{t('patient.gender')}</Label>
              <p className="text-base sm:text-lg mt-1">{patient.gender?.toLowerCase() === 'male' ? 'Nam' : patient.gender?.toLowerCase() === 'female' ? 'Nữ' : 'Khác'}</p>
            </div>
            <div>
              <Label className="text-xs sm:text-sm text-gray-600">{t('patient.phoneNumber')}</Label>
              <p className="text-base sm:text-lg mt-1 break-words">{patient.phoneNumber || t('patient.notUpdated')}</p>
            </div>
            <div>
                <Label className="text-xs sm:text-sm text-gray-600">Email</Label>
              <p className="text-base sm:text-lg mt-1 break-words">{patient.email || t('patient.notUpdated')}</p>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs sm:text-sm text-gray-600">{t('patient.address')}</Label>
              <p className="text-base sm:text-lg mt-1 break-words">{patient.address || t('patient.notUpdated')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thông tin người thân bệnh nhân */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            {t('patient.emergencyContactInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <Label className="text-xs sm:text-sm text-gray-600">{t('patient.emergencyContactName')}</Label>
              <p className="text-base sm:text-lg mt-1 break-words">{patientDetail?.emergency_contact?.name || t('patient.notUpdated')}</p>
            </div>
            <div>
              <Label className="text-xs sm:text-sm text-gray-600">{t('patient.emergencyContactPhone')}</Label>
              <p className="text-base sm:text-lg mt-1 break-words">{patientDetail?.emergency_contact?.phone || t('patient.notUpdated')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hồ sơ y tế */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-base sm:text-lg">{t('patient.medicalRecord')}</span>
            </div>
            {medicalRecords.length > 0 && (
               <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Button variant="ghost" size="sm" onClick={() => setViewId(medicalRecords[0]._id)} title="Xem chi tiết" className="text-xs sm:text-sm">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /><span className="hidden sm:inline">{t('patient.viewDetails')}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditId(medicalRecords[0]._id)} title="Chỉnh sửa" className="text-xs sm:text-sm">
                  <Pencil className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /><span className="hidden sm:inline">{t('patient.edit')}</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 text-xs sm:text-sm" onClick={() => setDeleteTarget({ id: medicalRecords[0]._id, name: medicalRecords[0].record_code })} title="Xóa">
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /><span className="hidden sm:inline">{t('patient.delete')}</span>
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medicalRecords.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('patient.noMedicalRecord')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Label className="text-xs sm:text-sm text-gray-600">{t('patient.bloodType')}</Label>
                <p className="text-base sm:text-lg mt-1">{medicalRecords[0].blood_type || 'Chưa cập nhật'}</p>
              </div>
              <div>
                 <Label className="text-xs sm:text-sm text-gray-600">{t('patient.allergies')}</Label>
                <p className="text-base sm:text-lg mt-1 break-words">
                  {medicalRecords[0].allergies 
                    ? (Array.isArray(medicalRecords[0].allergies) 
                        ? medicalRecords[0].allergies.join(', ') 
                        : medicalRecords[0].allergies)
                    : 'Không có'}
                </p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm text-gray-600">{t('patient.chronicConditions')}</Label>
                <p className="text-base sm:text-lg mt-1 break-words">
                  {medicalRecords[0].chronic_conditions 
                    ? (Array.isArray(medicalRecords[0].chronic_conditions) 
                        ? medicalRecords[0].chronic_conditions.join(', ') 
                        : medicalRecords[0].chronic_conditions)
                    : 'Không có'}
                </p>
              </div>
              <div>
               <Label className="text-xs sm:text-sm text-gray-600">{t('patient.createdAt')}</Label>
                <p className="text-base sm:text-lg mt-1">{formatDate(medicalRecords[0].created_at)}</p>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs sm:text-sm text-gray-600">{t('patient.medicalHistory')}</Label>
                <p className="text-base sm:text-lg mt-1 break-words">{medicalRecords[0].medical_history || 'Chưa cập nhật'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kết quả xét nghiệm */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FlaskConical className="w-5 h-5 mr-2" />
            {t('patient.testResult')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testResultItems.length === 0 ? (
            <div className="text-center py-8">
              <FlaskConical className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('patient.noTestResult')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('patient.testTypeName')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('patient.instrumentName')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('patient.reagentName')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('patient.createdAt')}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedTestResults).map(([testOrderId, items]) => {
                    const firstItem = items[0];
                    return (
                      <tr 
                        key={testOrderId} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleViewTestResult(testOrderId)}
                        title={t('patient.clickToViewTestResult')}
                      >
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {firstItem.test_type}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {firstItem.instrument_name || t('patient.notUpdated')}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {firstItem.reagent_names && firstItem.reagent_names.length > 0
                            ? firstItem.reagent_names.join(', ')
                            : t('patient.notUpdated')}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDateTime(firstItem.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

  {/* Create MR moved to list page */}
      <EditPatientMedicalRecord id={editId} open={Boolean(editId)} onOpenChange={(o) => { if (!o) setEditId(null); }} onUpdated={() => setRefreshKey(k => k + 1)} />
      <MedicalRecordViewModal recordId={viewId} isOpen={Boolean(viewId)} onClose={() => setViewId(null)} />
      <TestResultModal 
        isOpen={testResultModalOpen} 
        onClose={() => {
          setTestResultModalOpen(false);
          setSelectedTestResult(null);
        }} 
        testResult={selectedTestResult} 
      />
      <DeleteConfirmDialog open={Boolean(deleteTarget)} itemName={deleteTarget?.name} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
};

export default PatientDetail;
