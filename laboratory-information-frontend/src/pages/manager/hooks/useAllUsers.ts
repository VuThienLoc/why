import { useState, useEffect, useCallback } from 'react';
import { userService } from '../../../service/userService';
import type { ManagerUser } from '../types/ManagerTypes';

/**
 * Hook to fetch all users from the API for filtering purposes
 * This ensures filters work across all users, not just current page
 */
export function useAllUsers() {
  const [allUsers, setAllUsers] = useState<ManagerUser[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  const fetchAllUsers = useCallback(async () => {
    setIsLoadingAll(true);
    try {
      // Fetch all users by requesting a large limit
      // If API doesn't support fetching all at once, we'll need to paginate through all pages
      const result = await fetchAllUsersRecursively();
      setAllUsers(result);
    } catch (error) {
      console.error('Error fetching all users:', error);
      setAllUsers([]);
    } finally {
      setIsLoadingAll(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  return { allUsers, isLoadingAll, refreshAllUsers: fetchAllUsers };
}

/**
 * Recursively fetch all users by following pagination cursors
 */
async function fetchAllUsersRecursively(): Promise<ManagerUser[]> {
  const allUsers: ManagerUser[] = [];
  let cursor: string | undefined = undefined;
  let hasNext = true;

  while (hasNext) {
    const { users, pagination } = await userService.getUsersWithPagination({
      cursor,
      limit: 100, // Fetch in batches of 100
      sortBy: '_id',
      sortOrder: 'desc',
    });

    allUsers.push(...users);
    hasNext = pagination.hasNext;
    cursor = pagination.cursor;
  }

  return allUsers;
}
