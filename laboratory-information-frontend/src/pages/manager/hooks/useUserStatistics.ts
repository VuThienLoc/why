import { useEffect, useMemo, useState } from 'react';
import type { ManagerUser, UserStatistics } from '../types/ManagerTypes';
import { userService } from '../../../service/userService';


export function useUserStatistics(users: ManagerUser[], totalCount?: number): UserStatistics {
  const [allUsers, setAllUsers] = useState<ManagerUser[] | null>(null);

  useEffect(() => {
    let mounted = true;


    const shouldFetchAll = typeof totalCount === 'number' && totalCount > users.length;

    if (!shouldFetchAll) {
      setAllUsers(null);
      return;
    }

    (async () => {
      try {
        const { users: fetched } = await userService.getUsersWithPagination({ limit: totalCount });
        if (mounted) setAllUsers(fetched);
      } catch (e) {

        console.error('Failed to fetch all users for statistics:', e);
        if (mounted) setAllUsers(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [totalCount, users.length]);

  const source = allUsers ?? users;

  return useMemo(() => {
    return {
      total: typeof totalCount === 'number' && allUsers === null ? totalCount : source.length,
      active: source.filter(u => u.active).length,
      inactive: source.filter(u => !u.active).length,
      byRole: source.reduce((acc, user) => {
        const roleKey = Array.isArray(user.role) ? user.role[0] : user.role;
        acc[roleKey] = (acc[roleKey] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }, [source, totalCount, allUsers]);
}

