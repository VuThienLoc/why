import { useState, useMemo } from 'react';
import type { ManagerUser, UserFilters } from '../types/ManagerTypes';

export function useUserFilters(allUsers: ManagerUser[]) {
  const [filters, setFilters] = useState<UserFilters>({
    searchTerm: '',
    role: 'all',
    status: 'all',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter from ALL users, not just current page
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      // Search filter
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        !filters.searchTerm ||
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone_number?.toLowerCase().includes(searchLower);

      // Role filter - check if user has the role (since role is an array)
      const matchesRole = 
        filters.role === 'all' || 
        (Array.isArray(user.role) && user.role.includes(filters.role));

      // Status filter
      const matchesStatus =
        filters.status === 'all' ||
        (filters.status === 'active' && user.active) ||
        (filters.status === 'inactive' && !user.active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [allUsers, filters]);

  // Paginate the filtered results
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Reset to page 1 when filters change
  const setFiltersAndResetPage = (newFilters: UserFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return {
    filters,
    setFilters: setFiltersAndResetPage,
    filteredUsers: paginatedUsers,
    totalFiltered: filteredUsers.length,
    currentPage,
    totalPages,
    setCurrentPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

