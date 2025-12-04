import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../../components/common/dialog';
import { Label } from '../../../../../components/common/label';
import { Input } from '../../../../../components/common/input';
import { Textarea } from '../../../../../components/common/textarea';
import Button from '../../../../../components/common/button';
import { patientMedicalRecordService } from '../../../../../service/patientMedicalRecordService';
import { patientService } from '../../../../../service/patientService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { FileText, User, Droplet, AlertTriangle, Activity, Pill, History, ClipboardList } from 'lucide-react';

interface EditPatientMedicalRecordProps {
  id: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

export default function EditPatientMedicalRecord({ id, open, onOpenChange, onUpdated }: EditPatientMedicalRecordProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const [patientName, setPatientName] = useState<string>('');
  const [form, setForm] = useState({
    blood_type: '',
    allergies: '',
    chronic_conditions: '',
    current_medications: '',
    medical_history: '',
    clinical_notes: '',
    recent_test_summary: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!open || !id) return;
      setLoading(true);
      try {
        const detail = await patientMedicalRecordService.getDetail(id);
        if (!mounted) return;

        // Resolve patient name from embedded data or fetch by patient_id
        const embeddedName = detail?.patient?.user?.fullName;
        if (embeddedName) {
          setPatientName(embeddedName);
        } else if (detail?.patient_id) {
          try {
            const p = await patientService.getPatientById(detail.patient_id);
            if (mounted) setPatientName(p?.fullName || '');
          } catch {
            if (mounted) setPatientName('');
          }
        } else {
          setPatientName('');
        }
        setForm({
          blood_type: String(detail?.blood_type ?? ''),
          allergies: String(detail?.allergies ?? ''),
          chronic_conditions: String(detail?.chronic_conditions ?? ''),
          current_medications: String(detail?.current_medications ?? ''),
          medical_history: String(detail?.medical_history ?? ''),
          clinical_notes: String(detail?.clinical_notes ?? ''),
          recent_test_summary: String(detail?.recent_test_summary ?? ''),
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [open, id]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.blood_type) newErrors.blood_type = `${t('patient.bloodType')} là bắt buộc`;
    if (!form.allergies) newErrors.allergies = `${t('patient.allergies')} là bắt buộc`;
    if (!form.chronic_conditions) newErrors.chronic_conditions = `${t('patient.chronicConditions')} là bắt buộc`;
    if (!form.current_medications) newErrors.current_medications = `${t('patient.currentMedications')} là bắt buộc`;
    if (!form.medical_history) newErrors.medical_history = `${t('patient.medicalHistory')} là bắt buộc`;
    if (!form.clinical_notes) newErrors.clinical_notes = `${t('patient.clinicalNotes')} là bắt buộc`;
    if (!form.recent_test_summary) newErrors.recent_test_summary = `${t('patient.recentTestSummary')} là bắt buộc`;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!id) return;
    if (!validate()) return;
    setLoading(true);
    try {
      const updated = await patientMedicalRecordService.update(id, form);
      if (updated) {
        toast.success(t('patient.medicalRecordEdit.success'));
        onOpenChange(false);
        onUpdated?.();
      } else {
        toast.error(t('patient.medicalRecordEdit.error'));
      }
    } catch {
      toast.error(t('patient.medicalRecordEdit.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden border-0 shadow-2xl sm:rounded-2xl">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <DialogHeader className="pb-4 border-b border-gray-100 px-6 pt-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {t('patient.medicalRecordEdit.title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-500 ml-11">
            {t('patient.medicalRecordEdit.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Patient Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">{t('patient.medicalRecordEdit.patient')}</Label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input value={patientName} disabled className="pl-10 h-11 bg-gray-50 text-gray-500 border-gray-200" />
              </div>
            </div>

            {/* Blood Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                {t('patient.medicalRecordEdit.bloodType')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  value={form.blood_type}
                  placeholder={t('patient.medicalRecordEdit.bloodTypePlaceholder')}
                  onChange={(e) => setForm(prev => ({ ...prev, blood_type: e.target.value }))}
                  className="pl-10 h-11 border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200 transition-all"
                />
              </div>
              {errors.blood_type && <p className="text-red-500 text-sm mt-1">{errors.blood_type}</p>}
            </div>

            {/* Allergies */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                {t('patient.medicalRecordEdit.allergies')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  value={form.allergies} 
                  onChange={(e) => setForm(prev => ({ ...prev, allergies: e.target.value }))}
                  className="pl-10 h-11 border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200 transition-all"
                />
              </div>
              {errors.allergies && <p className="text-red-500 text-sm mt-1">{errors.allergies}</p>}
            </div>

            {/* Chronic Conditions */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                {t('patient.medicalRecordEdit.chronicConditions')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  value={form.chronic_conditions} 
                  onChange={(e) => setForm(prev => ({ ...prev, chronic_conditions: e.target.value }))}
                  className="pl-10 h-11 border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200 transition-all"
                />
              </div>
              {errors.chronic_conditions && <p className="text-red-500 text-sm mt-1">{errors.chronic_conditions}</p>}
            </div>

            {/* Current Medications */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                {t('patient.medicalRecordEdit.currentMedications')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <Pill className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  value={form.current_medications} 
                  onChange={(e) => setForm(prev => ({ ...prev, current_medications: e.target.value }))}
                  className="pl-10 h-11 border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200 transition-all"
                />
              </div>
              {errors.current_medications && <p className="text-red-500 text-sm mt-1">{errors.current_medications}</p>}
            </div>

            {/* Medical History */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                {t('patient.medicalRecordEdit.medicalHistory')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <History className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  value={form.medical_history}
                  onChange={(e) => setForm(prev => ({ ...prev, medical_history: e.target.value }))}
                  className="pl-10 h-11 border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200 transition-all"
                />
              </div>
              {errors.medical_history && <p className="text-red-500 text-sm mt-1">{errors.medical_history}</p>}
            </div>

            {/* Clinical Notes */}
            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                {t('patient.medicalRecordEdit.clinicalNotes')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <ClipboardList className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Textarea 
                  value={form.clinical_notes} 
                  onChange={(e) => setForm(prev => ({ ...prev, clinical_notes: e.target.value }))}
                  className="pl-10 min-h-[100px] border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200 transition-all"
                />
              </div>
              {errors.clinical_notes && <p className="text-red-500 text-sm mt-1">{errors.clinical_notes}</p>}
            </div>

            {/* Recent Test Summary */}
            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                {t('patient.medicalRecordEdit.recentTestSummary')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Textarea 
                  value={form.recent_test_summary} 
                  onChange={(e) => setForm(prev => ({ ...prev, recent_test_summary: e.target.value }))}
                  className="pl-10 min-h-[100px] border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200 transition-all"
                />
              </div>
              {errors.recent_test_summary && <p className="text-red-500 text-sm mt-1">{errors.recent_test_summary}</p>}
            </div>
          </div>
        </div>

        <DialogFooter className="bg-gray-50 px-6 py-3 border-t border-gray-100">

          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="h-10 px-6 border-gray-200 hover:bg-white hover:text-gray-900 hover:border-gray-300"
          >
            {t('patient.medicalRecordEdit.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="h-10 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t('patient.medicalRecordEdit.saving')}</span>
              </div>
            ) : (
              t('patient.medicalRecordEdit.save')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



