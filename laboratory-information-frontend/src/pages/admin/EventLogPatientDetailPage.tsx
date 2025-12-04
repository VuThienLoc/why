import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/card';
import { Label } from '@/components/common/label';
import { Clock } from 'lucide-react';
import type { EventLog } from '@/service/eventLogService';
import { OperatorInfoCard } from './components/EventLog/OperatorInfoCard';
import { EventInfoCard } from './components/EventLog/EventInfoCard';
import { useTranslation } from 'react-i18next';

interface UserSnapshot {
  id?: string;
  email?: string;
  fullName?: string;
  identityNumber?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  age?: number;
}

interface PatientSnapshot {
  id?: string;
  userId?: string;
  code?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  lastVisitDate?: string | null;
  lastTestType?: string | null;
  emergencyContact?: {
    name?: string;
    phone?: string;
  };
}

interface MedicalRecordSnapshot {
  _id?: string;
  patient_id?: string;
  record_code?: string;
  blood_type?: string;
  allergies?: string;
  chronic_conditions?: string;
  current_medications?: string;
  medical_history?: string;
  clinical_notes?: string;
  recent_test_summary?: string;
  created_by?: string;
  updated_by?: string;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  deleted_by?: string;
}

interface SnapshotData {
  patient?: PatientSnapshot;
  user?: UserSnapshot;
  medical_record?: MedicalRecordSnapshot;
}

interface EventLogPatientDetailPageProps {
  log: EventLog;
}

const EventLogPatientDetailPage: React.FC<EventLogPatientDetailPageProps> = ({ log }) => {
  const { t } = useTranslation();
  const formatDateOnly = (iso?: string) => {
    if (!iso) return '-';
    try {
      const date = new Date(iso);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const getSnapshot = (values: unknown): SnapshotData | null => {
    if (!values || typeof values !== 'object') return null;
    const obj = values as Record<string, unknown>;
    
    // Handle nested snapshot structure for DELETE_MEDICAL
    if (obj.snapshot && typeof obj.snapshot === 'object') {
      const snap = obj.snapshot as Record<string, unknown>;
      if (snap.medical_record && typeof snap.medical_record === 'object') {
        const nestedMedical = snap.medical_record as Record<string, unknown>;
        if (nestedMedical.snapshot) {
           return nestedMedical.snapshot as SnapshotData;
        }
      }
    }

    const snapshot = obj.snapshot as SnapshotData | undefined;
    return snapshot || null;
  };

  const eventType = useMemo(() => {
    if (!log) return null;
    const action = String(log.action ?? '').toUpperCase();
    const message = String(log.event_message ?? '').toLowerCase();

    if (action === 'CREATE') {
      if (message.includes('patient record created')) return 'CREATE_PATIENT';
      if (message.includes('medical record created')) return 'CREATE_MEDICAL';
    } else if (action === 'DELETE') {
      if (message.includes('patient record soft deleted')) return 'DELETE_PATIENT';
      if (message.includes('medical record soft deleted')) return 'DELETE_MEDICAL';
    } else if (action === 'UPDATE') {
      if (message.includes('patient record updated') && message.includes('emergency_contact')) return 'UPDATE_PATIENT_EMERGENCY';
      if (message.includes('medical record updated')) return 'UPDATE_MEDICAL';
    }
    return null;
  }, [log]);

  const renderPatientInfo = (snapshot: SnapshotData | null, title = t('eventLog.patient.createdPatient')) => {
    if (!snapshot) return null;
    const user = snapshot.user;
    const patient = snapshot.patient;
    if (!user && !patient) return null;

    return (
      <div className="space-y-4">
        {title && <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">{title}</h3>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {patient?.code && (
            <div>
              <p className="text-gray-500">{t('eventLog.patient.patientCode')}</p>
              <p className="font-medium">{patient.code}</p>
            </div>
          )}
          {user?.fullName && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.fullName')}</p>
              <p className="font-medium">{user.fullName}</p>
            </div>
          )}
          {user?.email && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.email')}</p>
              <p className="font-medium">{user.email}</p>
            </div>
          )}
          {user?.identityNumber && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.identityNumber')}</p>
              <p className="font-medium">{user.identityNumber}</p>
            </div>
          )}
          {user?.phoneNumber && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.phone')}</p>
              <p className="font-medium">{user.phoneNumber}</p>
            </div>
          )}
          {user?.gender && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.gender')}</p>
              <p className="font-medium">{user.gender === 'male' ? t('eventLog.iam.male') : user.gender === 'female' ? t('eventLog.iam.female') : user.gender}</p>
            </div>
          )}
          {user?.dateOfBirth && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.dob')}</p>
              <p className="font-medium">{formatDateOnly(user.dateOfBirth)}</p>
            </div>
          )}
          {user?.age !== undefined && (
            <div>
              <p className="text-gray-500">{t('eventLog.patient.age')}</p>
              <p className="font-medium">{user.age}</p>
            </div>
          )}
          {user?.address && (
            <div className="md:col-span-2">
              <p className="text-gray-500">{t('eventLog.iam.address')}</p>
              <p className="font-medium">{user.address}</p>
            </div>
          )}
          {patient?.emergencyContact && (patient.emergencyContact.name || patient.emergencyContact.phone) && (
            <>
              <div>
                <p className="text-gray-500">{t('eventLog.patient.emergencyContactName')}</p>
                <p className="font-medium">{patient.emergencyContact.name || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('eventLog.patient.emergencyContactPhone')}</p>
                <p className="font-medium">{patient.emergencyContact.phone || '-'}</p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderMedicalRecordInfo = (snapshot: SnapshotData | null, title = t('eventLog.patient.createdMedical')) => {
    if (!snapshot) return null;
    const medicalRecord = snapshot.medical_record;
    const user = snapshot.user;
    if (!medicalRecord) return null;
    if (!user) return null;

    return (
      <div className="space-y-4">
        {title && <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">{title}</h3>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {user.fullName && (
            <div>
              <p className="text-gray-500">{t('eventLog.patient.patientName')}</p>
              <p className="font-medium">{user.fullName}</p>
            </div>  
          )}
          {user.email && (
             <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          )}
          {medicalRecord.record_code && (
            <div>
              <p className="text-gray-500">{t('eventLog.patient.recordCode')}</p>
              <p className="font-medium">{medicalRecord.record_code}</p>
            </div>
          )}
          {medicalRecord.blood_type && (
            <div>
              <p className="text-gray-500">{t('eventLog.patient.bloodType')}</p>
              <p className="font-medium">{medicalRecord.blood_type}</p>
            </div>
          )}
          {medicalRecord.allergies !== undefined && (
            <div>
              <p className="text-gray-500">{t('eventLog.patient.allergies')}</p>
              <p className="font-medium">{medicalRecord.allergies || '-'}</p>
            </div>
          )}
          {medicalRecord.chronic_conditions !== undefined && (
            <div>
              <p className="text-gray-500">{t('eventLog.patient.chronicConditions')}</p>
              <p className="font-medium">{medicalRecord.chronic_conditions || '-'}</p>
            </div>
          )}
          {medicalRecord.current_medications !== undefined && (
            <div>
              <p className="text-gray-500">{t('eventLog.patient.currentMedications')}</p>
              <p className="font-medium">{medicalRecord.current_medications || '-'}</p>
            </div>
          )}
          {medicalRecord.medical_history !== undefined && (
            <div>
              <p className="text-gray-500">{t('eventLog.patient.medicalHistory')}</p>
              <p className="font-medium">{medicalRecord.medical_history || '-'}</p>
            </div>
          )}
          {medicalRecord.clinical_notes !== undefined && (
            <div>
              <p className="text-gray-500">{t('eventLog.patient.clinicalNotes')}</p>
              <p className="font-medium">{medicalRecord.clinical_notes || '-'}</p>
            </div>
          )}
          {medicalRecord.recent_test_summary !== undefined && (
            <div>
              <p className="text-gray-500">{t('eventLog.patient.recentTestSummary')}</p>
              <p className="font-medium">{medicalRecord.recent_test_summary || '-'}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEmergencyContactInfo = (values: unknown) => {
    if (!values || typeof values !== 'object') return <p className="text-gray-500 italic">{t('eventLog.empty')}</p>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = values as Record<string, any>;
    const contact = obj.emergency_contact;
    
    if (!contact) return <p className="text-gray-500 italic">{t('eventLog.empty')}</p>;

    return (
      <div className="space-y-4 text-sm">
        <div>
          <p className="text-gray-500">{t('eventLog.patient.emergencyContactName')}</p>
          <p className="font-medium">{contact.name || '-'}</p>
        </div>
        <div>
          <p className="text-gray-500">{t('eventLog.patient.emergencyContactPhone')}</p>
          <p className="font-medium">{contact.phone || '-'}</p>
        </div>
      </div>
    );
  };

  const renderMedicalRecordUpdate = (values: unknown) => {
    if (!values || typeof values !== 'object') return <p className="text-gray-500 italic">{t('eventLog.empty')}</p>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = values as Record<string, any>;

    const fields = [
      { key: 'record_code', label: t('eventLog.patient.recordCode') },
      { key: 'blood_type', label: t('eventLog.patient.bloodType') },
      { key: 'allergies', label: t('eventLog.patient.allergies') },
      { key: 'chronic_conditions', label: t('eventLog.patient.chronicConditions') },
      { key: 'current_medications', label: t('eventLog.patient.currentMedications') },
      { key: 'medical_history', label: t('eventLog.patient.medicalHistory') },
      { key: 'clinical_notes', label: t('eventLog.patient.clinicalNotes') },
      { key: 'recent_test_summary', label: t('eventLog.patient.recentTestSummary') },
    ];

    const hasData = fields.some(f => data[f.key] !== undefined);
    if (!hasData) return <p className="text-gray-500 italic">{t('eventLog.empty')}</p>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {fields.map(({ key, label }) => {
          if (data[key] !== undefined) {
            return (
              <div key={key}>
                <p className="text-gray-500">{label}</p>
                <p className="font-medium">{data[key] || '-'}</p>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  const renderPatientSummary = (snapshot: SnapshotData | null) => {
    if (!snapshot) return null;
    const { user, patient } = snapshot;
    if (!user && !patient) return null;

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">
          {t('eventLog.patient.patientInfo')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {patient?.code && (
            <div>
              <p className="text-gray-500">{t('eventLog.patient.patientCode')}</p>
              <p className="font-medium">{patient.code}</p>
            </div>
          )}
          {user?.fullName && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.fullName')}</p>
              <p className="font-medium">{user.fullName}</p>
            </div>
          )}
          {user?.email && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.email')}</p>
              <p className="font-medium">{user.email}</p>
            </div>
          )}
          {user?.identityNumber && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.identityNumber')}</p>
              <p className="font-medium">{user.identityNumber}</p>
            </div>
          )}
          {user?.phoneNumber && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.phone')}</p>
              <p className="font-medium">{user.phoneNumber}</p>
            </div>
          )}
          {user?.gender && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.gender')}</p>
              <p className="font-medium">{user.gender === 'male' ? t('eventLog.iam.male') : user.gender === 'female' ? t('eventLog.iam.female') : user.gender}</p>
            </div>
          )}
          {user?.dateOfBirth && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.dob')}</p>
              <p className="font-medium">{formatDateOnly(user.dateOfBirth)}</p>
            </div>
          )}
          {user?.address && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.address')}</p>
              <p className="font-medium">{user.address}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMedicalRecordSummary = (snapshot: SnapshotData | null) => {
    if (!snapshot) return null;
    const { user, medical_record } = snapshot;
    if (!user && !medical_record) return null;

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">
          {t('eventLog.patient.recordInfo')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {medical_record?.record_code && (
            <div>
              <p className="text-gray-500">{t('eventLog.patient.recordCode')}</p>
              <p className="font-medium">{medical_record.record_code}</p>
            </div>
          )}
          {user?.fullName && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.fullName')}</p>
              <p className="font-medium">{user.fullName}</p>
            </div>
          )}
          {user?.identityNumber && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.identityNumber')}</p>
              <p className="font-medium">{user.identityNumber}</p>
            </div>
          )}
          {user?.email && (
            <div>
              <p className="text-gray-500">{t('eventLog.iam.email')}</p>
              <p className="font-medium">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEventContent = () => {
    if (!log || !eventType) return null;
    switch (eventType) {
      case 'CREATE_PATIENT': {
        const snapshot = getSnapshot(log.new_values);
        return renderPatientInfo(snapshot, t('eventLog.patient.createdPatient'));
      }
      case 'CREATE_MEDICAL': {
        const snapshot = getSnapshot(log.new_values);
        return renderMedicalRecordInfo(snapshot, t('eventLog.patient.createdMedical'));
      }
      case 'DELETE_PATIENT': {
        const snapshot = getSnapshot(log.old_values) || getSnapshot(log.new_values);
        return renderPatientInfo(snapshot, t('eventLog.patient.deletedPatient'));
      }
      case 'DELETE_MEDICAL': {
        const snapshot = getSnapshot(log.old_values) || getSnapshot(log.new_values);
        return renderMedicalRecordInfo(snapshot, t('eventLog.patient.deletedMedical'));
      }
      case 'UPDATE_PATIENT_EMERGENCY': {
        const snapshot = getSnapshot(log.new_values);
        return (
          <div className="space-y-6">
            {renderPatientSummary(snapshot)}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-r pr-4">
                  <h3 className="font-semibold text-lg text-gray-900 border-b pb-2 mb-4">{t('eventLog.iam.oldData')}</h3>
                  {renderEmergencyContactInfo(log.old_values)}
                </div>
                <div className="pl-4">
                  <h3 className="font-semibold text-lg text-gray-900 border-b pb-2 mb-4">{t('eventLog.iam.newData')}</h3>
                  {renderEmergencyContactInfo(log.new_values)}
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'UPDATE_MEDICAL': {
        const snapshot = getSnapshot(log.new_values);
        return (
          <div className="space-y-6">
            {renderMedicalRecordSummary(snapshot)}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-r pr-4">
                  <h3 className="font-semibold text-lg text-gray-900 border-b pb-2 mb-4">{t('eventLog.iam.oldData')}</h3>
                  {renderMedicalRecordUpdate(log.old_values)}
                </div>
                <div className="pl-4">
                  <h3 className="font-semibold text-lg text-gray-900 border-b pb-2 mb-4">{t('eventLog.iam.newData')}</h3>
                  {renderMedicalRecordUpdate(log.new_values)}
                </div>
              </div>
            </div>
          </div>
        );
      }
      default:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 mb-1">{t('eventLog.oldValue')}</p>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-64">
                  {log.old_values ? JSON.stringify(log.old_values, null, 2) : t('eventLog.empty')}
                </pre>
              </div>
              <div>
                <p className="text-gray-500 mb-1">{t('eventLog.newValue')}</p>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-64">
                  {log.new_values ? JSON.stringify(log.new_values, null, 2) : t('eventLog.empty')}
                </pre>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <OperatorInfoCard log={log} />
      <EventInfoCard log={log} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            {t('eventLog.changedData')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderEventContent() || (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">{t('eventLog.oldValue')}</Label>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-64 mt-1">
                  {log.old_values ? JSON.stringify(log.old_values, null, 2) : t('eventLog.empty')}
                </pre>
              </div>
              <div>
                <Label className="text-sm text-gray-600">{t('eventLog.newValue')}</Label>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-64 mt-1">
                  {log.new_values ? JSON.stringify(log.new_values, null, 2) : t('eventLog.empty')}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventLogPatientDetailPage;
