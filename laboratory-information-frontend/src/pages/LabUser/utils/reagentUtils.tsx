import React from 'react';
import type { Reagent } from '../types/Reagent';

export const getStatusBadge = (status: string): React.JSX.Element => {
  const statusClasses = {
    Available: 'bg-green-100 text-green-800',
    'Low Stock': 'bg-yellow-100 text-yellow-800',
    Expired: 'bg-red-100 text-red-800',
    Depleted: 'bg-gray-100 text-gray-700'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses]}`}>
      {status}
    </span>
  );
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export const isExpiringSoon = (expiryDate: string): boolean => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30 && diffDays > 0;
};

export const isExpired = (expiryDate: string): boolean => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  return expiry < today;
};

export const getRowClassName = (reagent: Reagent): string => {
  if (isExpired(reagent.expiryDate)) {
    return 'bg-red-50';
  } else if (isExpiringSoon(reagent.expiryDate)) {
    return 'bg-yellow-50';
  }
  return 'hover:bg-gray-50';
};

export const filterReagents = (
  reagents: Reagent[],
  searchTerm: string,
  statusFilter: string
): Reagent[] => {
  let filtered = reagents;

  if (searchTerm) {
    filtered = filtered.filter(reagent =>
      reagent.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reagent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reagent.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reagent.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (statusFilter !== 'All') {
    filtered = filtered.filter(reagent => reagent.status === statusFilter);
  }

  return filtered;
};

