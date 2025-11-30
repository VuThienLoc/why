import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '../../../../../components/common/dialog';
import Button from '../../../../../components/common/button';
import { Label } from '../../../../../components/common/label';
import { Input } from '../../../../../components/common/input';
import { 
  FileText, 
  User, 
  Calendar, 
  Phone, 
  Activity, 
  AlertCircle, 
  HeartPulse, 
  Pill, 
  History, 
  ClipboardList, 
  FileBarChart, 
  Clock 
} from 'lucide-react';
import { patientMedicalRecordService, type PatientMedicalRecord } from '../../../../../service/patientMedicalRecordService';
import { patientService, type PatientOption } from '../../../../../service/patientService';

interface MedicalRecordViewModalProps {
  recordId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const MedicalRecordViewModal: React.FC<MedicalRecordViewModalProps> = ({ recordId, isOpen, onClose }) => {
  const { t } = useTranslation();
  const [record, setRecord] = useState<PatientMedicalRecord | null>(null);
  const [patient, setPatient] = useState<PatientOption | null>(null);
  const [loading, setLoading] = useState(false);

  const loadRecord = useCallback(async () => {
    if (!recordId) return;
    setLoading(true);
    try {
      const data = await patientMedicalRecordService.getDetail(recordId);
      setRecord(data);
      if (data?.patient_id) {
        try {
          const p = await patientService.getPatientById(data.patient_id);
          setPatient(p);
        } catch {
          // ignore
        }
      }
    } catch (e) {
      console.error('Error loading MR:', e);
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    if (isOpen && recordId) loadRecord();
  }, [isOpen, recordId, loadRecord]);

  const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleString('vi-VN') : '-';

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl overflow-hidden border-0 shadow-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <DialogHeader className="pb-6 border-b border-gray-100 px-6 pt-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {t('patient.medicalRecordDetail.title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-500 ml-11">
            {record?.record_code || ''}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : record ? (
            <>
              {/* Patient Info Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  {t('patient.medicalRecordDetail.patientInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">{t('patient.medicalRecordDetail.recordCode')}</Label>
                    <div className="relative group">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input readOnly value={record.record_code} className="pl-10 bg-gray-50 border-gray-200" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">{t('patient.medicalRecordDetail.fullName')}</Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input readOnly value={patient?.fullName || '-'} className="pl-10 bg-gray-50 border-gray-200" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">{t('patient.medicalRecordDetail.dateOfBirth')}</Label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input readOnly value={patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('vi-VN') : '-'} className="pl-10 bg-gray-50 border-gray-200" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">{t('patient.medicalRecordDetail.phoneNumber')}</Label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input readOnly value={patient?.phoneNumber || '-'} className="pl-10 bg-gray-50 border-gray-200" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Info Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  {t('patient.medicalRecordDetail.medicalInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">{t('patient.medicalRecordDetail.bloodType')}</Label>
                    <div className="relative group">
                      <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input readOnly value={record.blood_type || '-'} className="pl-10 bg-gray-50 border-gray-200" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">{t('patient.medicalRecordDetail.allergies')}</Label>
                    <div className="relative group">
                      <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input readOnly value={record.allergies || '-'} className="pl-10 bg-gray-50 border-gray-200" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">{t('patient.medicalRecordDetail.chronicConditions')}</Label>
                    <div className="relative group">
                      <HeartPulse className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input readOnly value={record.chronic_conditions || '-'} className="pl-10 bg-gray-50 border-gray-200" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">{t('patient.medicalRecordDetail.currentMedications')}</Label>
                    <div className="relative group">
                      <Pill className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input readOnly value={record.current_medications || '-'} className="pl-10 bg-gray-50 border-gray-200" />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-medium text-gray-700">{t('patient.medicalRecordDetail.medicalHistory')}</Label>
                    <div className="relative group">
                      <History className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea readOnly value={record.medical_history || '-'} className="w-full pl-10 p-2 bg-gray-50 border border-gray-200 rounded-md min-h-[80px]" />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-medium text-gray-700">{t('patient.medicalRecordDetail.clinicalNotes')}</Label>
                    <div className="relative group">
                      <ClipboardList className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea readOnly value={record.clinical_notes || '-'} className="w-full pl-10 p-2 bg-gray-50 border border-gray-200 rounded-md min-h-[80px]" />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-medium text-gray-700">{t('patient.medicalRecordDetail.recentTestSummary')}</Label>
                    <div className="relative group">
                      <FileBarChart className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea readOnly value={record.recent_test_summary || '-'} className="w-full pl-10 p-2 bg-gray-50 border border-gray-200 rounded-md min-h-[80px]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* System Info Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  {t('patient.medicalRecordDetail.systemInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">{t('patient.medicalRecordDetail.createdAt')}</Label>
                    <div className="relative group">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input readOnly value={formatDate(record.created_at)} className="pl-10 bg-gray-50 border-gray-200" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">{t('patient.medicalRecordDetail.updatedAt')}</Label>
                    <div className="relative group">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input readOnly value={formatDate(record.updated_at)} className="pl-10 bg-gray-50 border-gray-200" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">{t('patient.medicalRecordDetail.notFound')}</div>
          )}
        </div>

        <DialogFooter className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <Button 
            onClick={onClose} 
            className="h-10 px-6 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 shadow-sm"
          >
            {t('patient.medicalRecordDetail.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MedicalRecordViewModal;
