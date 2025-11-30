import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { ManagerUser, UserFormData } from '../types/ManagerTypes';
import { userService } from '../../../service/userService';
import { apiUtils } from '../../../service/apiClient';

export function useUserManagement() {
  const [users, setUsers] = useState<ManagerUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasLoadedRef = useRef(false);
  
  const [pagination, setPagination] = useState({
    cursor: undefined as string | undefined,
    hasNext: false,
    hasPrev: false,
    limit: 10,
    total: 0,
  });

  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);

  const fetchPage = useCallback(async (cursor?: string) => {
    setIsLoading(true);
    try {
      const { users: usersData, pagination: paginationData } = await userService.getUsersWithPagination({
        sortBy: '_id',
        sortOrder: 'desc',
        cursor,
        limit: pagination.limit,
      });
      
      setUsers(usersData);
      setCurrentCursor(cursor);
      
      setPagination({
        cursor: paginationData.cursor,
        hasNext: paginationData.hasNext,
        hasPrev: Boolean(cursor) || cursorHistory.length > 0,
        limit: paginationData.limit,
        total: paginationData.total || 0,
      });
      
      hasLoadedRef.current = true;
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit, cursorHistory.length]);

  const loadNextPage = useCallback(() => {
    if (pagination.hasNext && pagination.cursor) {
      setCursorHistory((prev) => [...prev, currentCursor]);
      fetchPage(pagination.cursor);
    }
  }, [fetchPage, pagination.hasNext, pagination.cursor, currentCursor]);

  const loadPrevPage = useCallback(() => {
    setCursorHistory((prev) => {
      if (prev.length === 0) return prev;
      const newHistory = prev.slice(0, -1);
      const previousCursor = newHistory[newHistory.length - 1];
      fetchPage(previousCursor);
      return newHistory;
    });
  }, [fetchPage]);

  const loadLastPage = useCallback(async () => {
    if (!pagination.hasNext) return;
    setIsLoading(true);
    try {
      let nextCursor = pagination.cursor;
      let lastCursor: string | undefined = nextCursor;
      const newHistory = [...cursorHistory, currentCursor];
      while (nextCursor) {
        const { pagination: p } = await userService.getUsersWithPagination({
          sortBy: '_id',
          sortOrder: 'desc',
          cursor: nextCursor,
          limit: pagination.limit,
        });
        newHistory.push(nextCursor);
        lastCursor = nextCursor;
        nextCursor = p.hasNext ? p.cursor : undefined;
      }
      setCursorHistory(newHistory.filter((c) => c !== undefined));
      await fetchPage(lastCursor);
    } catch (e) {
      console.error('Error jumping to last page:', e);
      toast.error('Không thể tới trang cuối');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.hasNext, pagination.cursor, pagination.limit, cursorHistory, currentCursor, fetchPage]);

  const loadFirstPage = useCallback(() => {
    setCursorHistory([]);
    fetchPage(undefined);
  }, [fetchPage]);

  const refreshUsers = useCallback(() => {
    setCursorHistory([]);
    fetchPage(undefined);
  }, [fetchPage]);

  const createUser = useCallback(async (data: UserFormData): Promise<boolean> => {
    try {
      await userService.createUser(data);
      toast.success('Tạo người dùng thành công');
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = apiUtils.getErrorMessage(error);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const updateUser = useCallback(async (userId: string, data: UserFormData): Promise<boolean> => {
    try {
      await userService.updateUser(userId, data);
      toast.success('Cập nhật người dùng thành công');
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = apiUtils.getErrorMessage(error);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      await userService.deleteUser(userId);
      toast.success('Xóa người dùng thành công');
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = apiUtils.getErrorMessage(error);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const toggleUserLock = useCallback(async (userId: string, currentStatus: boolean): Promise<boolean> => {
    try {
      await userService.toggleUserStatus(userId, !currentStatus);
      toast.success(currentStatus ? 'Khóa tài khoản thành công' : 'Mở khóa tài khoản thành công');
      return true;
    } catch (error) {
      console.error('Error toggling lock:', error);
      const errorMessage = apiUtils.getErrorMessage(error);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  useEffect(() => {
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    users,
    isLoading,
    pagination,
    loadUsers: refreshUsers,
    loadNextPage,
    loadPrevPage,
    loadFirstPage,
    loadLastPage,
    createUser,
    updateUser,
    deleteUser,
    toggleUserLock,
  };
}

