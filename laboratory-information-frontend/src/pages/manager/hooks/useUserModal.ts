import { useState, useCallback } from 'react';
import type { ModalState, ManagerUser } from '../types/ManagerTypes';

export function useUserModal() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: 'view',
    user: null,
  });

  const openCreateModal = useCallback(() => {
    setModalState({ isOpen: true, mode: 'create', user: null });
  }, []);

  const openViewModal = useCallback((user: ManagerUser) => {
    setModalState({ isOpen: true, mode: 'view', user });
  }, []);

  const openEditModal = useCallback((user: ManagerUser) => {
    setModalState({ isOpen: true, mode: 'edit', user });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, mode: 'view', user: null });
  }, []);

  return {
    modalState,
    openCreateModal,
    openViewModal,
    openEditModal,
    closeModal,
  };
}

