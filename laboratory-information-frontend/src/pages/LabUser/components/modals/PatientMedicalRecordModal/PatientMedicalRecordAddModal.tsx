import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '../../../../../components/common/dialog';
import { Label } from '../../../../../components/common/label';
import { Input } from '../../../../../components/common/input';
import { Textarea } from '../../../../../components/common/textarea';
import Button from '../../../../../components/common/button';
import { patientService, type PatientOption } from '../../../../../service/patientService';
import { patientMedicalRecordService, type PatientMedicalRecord } from '../../../../../service/patientMedicalRecordService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { User, Droplet, AlertCircle, Activity, Pill, FileText, Clipboard, FileBarChart } from 'lucide-react';

interface AddPatientMedicalRecordProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated?: (record?: PatientMedicalRecord | null) => void;
    patientId?: string;
}

export default function AddPatientMedicalRecord({ open, onOpenChange, onCreated, patientId }: AddPatientMedicalRecordProps) {
    const { t } = useTranslation();
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        patient_id: '',
        blood_type: '',
        allergies: '',
        chronic_conditions: '',
        current_medications: '',
        medical_history: '',
        clinical_notes: '',
        recent_test_summary: '',
    });
    const [patientQuery, setPatientQuery] = useState('');
    const [patientSuggestions, setPatientSuggestions] = useState<PatientOption[]>([]);
    const [patientSearchLoading, setPatientSearchLoading] = useState(false);
    const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
    const [highlightedPatientIndex, setHighlightedPatientIndex] = useState(-1);
    const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
    const patientSearchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
    const patientSearchContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open || !patientId) return;
        let active = true;
        setPatientSearchLoading(true);
        patientService.getPatientById(patientId)
            .then((patient) => {
                if (!active) return;
                if (patient) {
                    setSelectedPatient(patient);
                    setPatientQuery(patient.fullName ?? '');
                    setForm((prev) => ({ ...prev, patient_id: patient.id }));
                } else {
                    setSelectedPatient(null);
                    setPatientQuery('');
                    setForm((prev) => ({ ...prev, patient_id: patientId }));
                }
            })
            .catch(() => {
                if (!active) return;
                setSelectedPatient(null);
                setPatientQuery('');
            })
            .finally(() => {
                if (active) {
                    setPatientSearchLoading(false);
                }
            });
        return () => { active = false; };
    }, [open, patientId]);

    useEffect(() => {
        if (!open || patientId) return;

        if (patientSearchDebounce.current) {
            clearTimeout(patientSearchDebounce.current);
        }

        if (!patientQuery.trim()) {
            setPatientSuggestions([]);
            setPatientSearchLoading(false);
            setShowPatientSuggestions(false);
            setHighlightedPatientIndex(-1);
            return;
        }

        setShowPatientSuggestions(true);
        setPatientSearchLoading(true);

        let active = true;
        patientSearchDebounce.current = window.setTimeout(async () => {
            try {
                const list = await patientService.getAllPatients({
                    search: patientQuery.trim(),
                    limit: 10,
                    page: 1,
                    isActive: true,
                    populateUser: true,
                });
                if (!active) return;
                setPatientSuggestions(list);
                setHighlightedPatientIndex(list.length ? 0 : -1);
            } catch {
                if (!active) return;
                setPatientSuggestions([]);
                setHighlightedPatientIndex(-1);
            } finally {
                if (active) {
                    setPatientSearchLoading(false);
                }
            }
        }, 300);

        return () => {
            active = false;
            if (patientSearchDebounce.current) {
                clearTimeout(patientSearchDebounce.current);
                patientSearchDebounce.current = null;
            }
        };
    }, [open, patientId, patientQuery]);

    useEffect(() => {
        if (!showPatientSuggestions) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (!patientSearchContainerRef.current?.contains(event.target as Node)) {
                setShowPatientSuggestions(false);
                setHighlightedPatientIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPatientSuggestions]);

    const handleSelectPatient = (patient: PatientOption) => {
        setSelectedPatient(patient);
        setPatientQuery(patient.fullName ?? '');
        setForm((prev) => ({ ...prev, patient_id: patient.id }));
        setPatientSuggestions([]);
        setShowPatientSuggestions(false);
        setHighlightedPatientIndex(-1);
    };

    const handlePatientKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (!showPatientSuggestions || !patientSuggestions.length) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setHighlightedPatientIndex((prev) => (prev + 1) % patientSuggestions.length);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setHighlightedPatientIndex((prev) => (prev - 1 + patientSuggestions.length) % patientSuggestions.length);
        } else if (event.key === 'Enter') {
            if (highlightedPatientIndex >= 0) {
                event.preventDefault();
                handleSelectPatient(patientSuggestions[highlightedPatientIndex]);
            }
        } else if (event.key === 'Escape') {
            setShowPatientSuggestions(false);
            setHighlightedPatientIndex(-1);
        }
    };

    const handleSubmit = async () => {
        if (!form.patient_id) {
            toast.error(t('patient.pleaseSelectPatient'));
            return;
        }
        setCreating(true);
        try {
            const created = await patientMedicalRecordService.create(form);
            if (created) {
                toast.success(t('patient.createMedicalRecordSuccess'));
                onOpenChange(false);
                onCreated?.(created);
                setForm({
                    patient_id: '', blood_type: '', allergies: '', chronic_conditions: '', current_medications: '',
                    medical_history: '', clinical_notes: '', recent_test_summary: ''
                });
                setSelectedPatient(null);
                setPatientQuery('');
                setPatientSuggestions([]);
                setHighlightedPatientIndex(-1);
                setShowPatientSuggestions(false);
            } else {
                toast.error(t('patient.createMedicalRecordFailed'));
            }
        } catch (error) {
            const rawMessage = error instanceof Error ? error.message : '';
            const duplicateMessage = t('patient.patientAlreadyHasMedicalRecord');
            if (rawMessage && /already exists/i.test(rawMessage)) {
                toast.error(duplicateMessage);
            } else if (rawMessage) {
                toast.error(rawMessage);
            } else {
                toast.error(t('patient.createMedicalRecordFailed'));
            }
        } finally {
            setCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden border-0 shadow-2xl sm:rounded-2xl">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 z-10" />
                <DialogHeader className="pb-4 border-b border-gray-100 px-6 pt-8 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-gray-900">
                            {t('patient.createMedicalRecord')}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-gray-500 ml-11">
                        {t('patient.patientDetailDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Patient Name */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                                {t('patient.patientName')} <span className="text-red-500">*</span>
                            </Label>
                            <div ref={patientSearchContainerRef} className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    value={patientQuery}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setPatientQuery(value);
                                        if (selectedPatient && value !== (selectedPatient.fullName ?? '')) {
                                            setSelectedPatient(null);
                                            setForm((prev) => ({ ...prev, patient_id: '' }));
                                        }
                                    }}
                                    onFocus={() => {
                                        if (patientSuggestions.length) {
                                            setShowPatientSuggestions(true);
                                        }
                                    }}
                                    onKeyDown={handlePatientKeyDown}
                                    placeholder={t('patient.enterPatientName')}
                                    disabled={Boolean(patientId)}
                                    className="pl-10 h-11 transition-all border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200"
                                />
                                {showPatientSuggestions && (
                                    <div className="absolute z-[70] mt-1 w-full overflow-hidden rounded-md border border-border bg-white shadow-lg">
                                        {patientSearchLoading ? (
                                            <div className="px-4 py-2 text-sm text-muted-foreground">Đang tìm...</div>
                                        ) : patientSuggestions.length ? (
                                            <ul className="max-h-64 overflow-auto py-1 text-sm">
                                                {patientSuggestions.map((patient, index) => (
                                                    <li key={patient.id}>
                                                        <button
                                                            type="button"
                                                            className={`flex w-full flex-col items-start gap-0.5 px-4 py-2 text-left transition-colors ${index === highlightedPatientIndex ? 'bg-primary text-primary-foreground' : 'hover:bg-muted focus-visible:bg-muted'}`}
                                                            onMouseDown={(event) => {
                                                                event.preventDefault();
                                                                handleSelectPatient(patient);
                                                            }}
                                                            onMouseEnter={() => setHighlightedPatientIndex(index)}
                                                        >
                                                            <span className="text-sm font-medium">{patient.fullName}</span>
                                                            {patient.patientCode && (
                                                                <span className="text-xs opacity-80">{t('patient.patientCode')}: {patient.patientCode}</span>
                                                            )}
                                                            {patient.email && (
                                                                <span className="text-xs opacity-80">Email: {patient.email}</span>
                                                            )}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="px-4 py-2 text-sm text-muted-foreground">{t('patient.noPatientFound')}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {selectedPatient?.patientCode && (
                                <p className="text-xs text-muted-foreground ml-1">{t('patient.patientCode')}: {selectedPatient.patientCode}</p>
                            )}
                        </div>

                        {/* Blood Type */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">{t('patient.bloodType')}</Label>
                            <div className="relative group">
                                <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    value={form.blood_type}
                                    placeholder={t('patient.enterBloodType')}
                                    onChange={(e) => setForm(prev => ({ ...prev, blood_type: e.target.value }))}
                                    className="pl-10 h-11 transition-all border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200"
                                />
                            </div>
                        </div>

                        {/* Allergies */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">{t('patient.allergies')}</Label>
                            <div className="relative group">
                                <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input 
                                    value={form.allergies} 
                                    onChange={(e) => setForm(prev => ({ ...prev, allergies: e.target.value }))} 
                                    className="pl-10 h-11 transition-all border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200"
                                />
                            </div>
                        </div>

                        {/* Chronic Conditions */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">{t('patient.chronicConditions')}</Label>
                            <div className="relative group">
                                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input 
                                    value={form.chronic_conditions} 
                                    onChange={(e) => setForm(prev => ({ ...prev, chronic_conditions: e.target.value }))} 
                                    className="pl-10 h-11 transition-all border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200"
                                />
                            </div>
                        </div>

                        {/* Current Medications */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">{t('patient.currentMedications')}</Label>
                            <div className="relative group">
                                <Pill className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input 
                                    value={form.current_medications} 
                                    onChange={(e) => setForm(prev => ({ ...prev, current_medications: e.target.value }))} 
                                    className="pl-10 h-11 transition-all border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200"
                                />
                            </div>
                        </div>

                        {/* Medical History */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">{t('patient.medicalHistory')}</Label>
                            <div className="relative group">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    value={form.medical_history}
                                    onChange={(e) => setForm(prev => ({ ...prev, medical_history: e.target.value }))}
                                    className="pl-10 h-11 transition-all border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200"
                                />
                            </div>
                        </div>

                        {/* Clinical Notes */}
                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-sm font-medium text-gray-700">{t('patient.clinicalNotes')}</Label>
                            <div className="relative group">
                                <Clipboard className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Textarea 
                                    value={form.clinical_notes} 
                                    onChange={(e) => setForm(prev => ({ ...prev, clinical_notes: e.target.value }))} 
                                    className="pl-10 min-h-[100px] transition-all border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200"
                                />
                            </div>
                        </div>

                        {/* Recent Test Summary */}
                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-sm font-medium text-gray-700">{t('patient.recentTestSummary')}</Label>
                            <div className="relative group">
                                <FileBarChart className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Textarea 
                                    value={form.recent_test_summary} 
                                    onChange={(e) => setForm(prev => ({ ...prev, recent_test_summary: e.target.value }))} 
                                    className="pl-10 min-h-[100px] transition-all border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex-shrink-0">
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)}
                        disabled={creating}
                        className="h-10 px-6 border-gray-200 hover:bg-white hover:text-gray-900 hover:border-gray-300"
                    >
                        {t('patient.cancel')}
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={creating}
                        className="h-10 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                    >
                        {creating ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>{t('patient.saving')}</span>
                            </div>
                        ) : (
                            t('patient.save')
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


