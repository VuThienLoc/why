import { useState, useCallback } from 'react';
import { viewPatientDetail } from '../../../service/patientService';

export interface PatientDetail {
  id?: string;
  _id?: string;
  patient_code?: string;
  user?: {
    id?: string;
    fullName?: string;
    email?: string;
    identityNumber?: string;
    phoneNumber?: string;
    gender?: string;
    age?: number;
    dateOfBirth?: string;
    address?: string;
  };
  emergency_contact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  is_active?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export type PatientModalMode = 'create' | 'edit' | 'view';

export function usePatientModal() {
  const [modalState, setModalState] = useState<{ isOpen: boolean; mode: PatientModalMode; patient: PatientDetail | null }>({
    isOpen: false,
    mode: 'view',
    patient: null,
  });

  const openCreateModal = useCallback(() => {
    setModalState({ isOpen: true, mode: 'create', patient: null });
  }, []);

  const openViewModal = useCallback(async (patientIdOrObj: string | PatientDetail) => {
    if (typeof patientIdOrObj !== 'string') {
      setModalState({ isOpen: true, mode: 'view', patient: patientIdOrObj });
      return;
    }
    try {
      const detail = await viewPatientDetail(patientIdOrObj);
      if (detail) setModalState({ isOpen: true, mode: 'view', patient: detail });
      else setModalState((s) => ({ ...s, isOpen: false }));
    } catch (err) {
      console.error('openViewModal error', err);
      setModalState((s) => ({ ...s, isOpen: false }));
    }
  }, []);

  const openEditModal = useCallback(async (patientIdOrObj: string | PatientDetail) => {
    if (typeof patientIdOrObj !== 'string') {
      setModalState({ isOpen: true, mode: 'edit', patient: patientIdOrObj });
      return;
    }
    try {
      const detail = await viewPatientDetail(patientIdOrObj);
      if (detail) setModalState({ isOpen: true, mode: 'edit', patient: detail });
      else setModalState((s) => ({ ...s, isOpen: false }));
    } catch (err) {
      console.error('openEditModal error', err);
      setModalState((s) => ({ ...s, isOpen: false }));
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, mode: 'view', patient: null });
  }, []);

  return {
    modalState,
    openCreateModal,
    openViewModal,
    openEditModal,
    closeModal,
  };
}
