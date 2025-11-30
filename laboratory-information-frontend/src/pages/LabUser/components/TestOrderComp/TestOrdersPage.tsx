import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthContext } from '../../../../hooks/useAuthContext';
import type { TestOrder } from '../../types/TestOrderTypes';
import { testOrderService } from '../../../../service/testOrderService';
import TestOrderToolbar from './TestOrderToolbar';
import TestOrderStatsCards from './TestOrderStatsCards';
import TestOrderList from './TestOrderList';
import TestOrderFormModal from '../modals/TestOrderModal/TestOrderUpdateModal';
import DeleteConfirmModal from '../modals/TestOrderModal/TestOrderDeleteModal';
import TestOrderDetailModal from '../modals/TestOrderModal/TestOrderDetailModal';
import { calculateStats } from '../../utils/testOrderUtils';
import { Card, CardContent, CardHeader } from '@/components/common/card';
import { Skeleton } from '@/components/common/skeleton';
import { useTranslation } from 'react-i18next';
const TestOrdersPage: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<TestOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<TestOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<TestOrder | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Debounce search input - update searchTerm after 500ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      // Reset to page 1 when search term changes
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load data when page or searchTerm changes
  useEffect(() => {
    if (searchTerm.trim()) {
      loadSearchResults(searchTerm, currentPage);
    } else {
      loadTestOrders(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);


  // Tự động tăng % khi đang Processing
  useEffect(() => {
    const interval = setInterval(() => {
      const updateProcessing = (order: TestOrder) => {
        if (order.status === 'Processing' && (order.processing ?? 0) < 95) {
          return { ...order, processing: (order.processing ?? 0) + 5 };
        }
        return order;
      };
      setOrders(prev => prev.map(updateProcessing));
      setFilteredOrders(prev => prev.map(updateProcessing));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadTestOrders = async (page: number = 1) => {
    try {
      setLoading(true);
      const { orders: data, pagination: paginationInfo } = await testOrderService.getAllTestOrders(page, 10);
      setOrders(data);
      setFilteredOrders(data); // Set filtered orders to all orders when not searching
      setPagination(paginationInfo);
      setCurrentPage(paginationInfo.page); // Sync currentPage with API response
    } catch (error) {
      toast.error(t('testOrder.notLoading'));
      console.error('Error loading test orders:', error);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const loadSearchResults = async (keyword: string, page: number = 1) => {
    try {
      setLoading(true);
      const { orders: data, pagination: paginationInfo } = await testOrderService.searchTestOrders(keyword, page, 10);
      setOrders(data);
      setFilteredOrders(data); // Set filtered orders to search results
      setPagination(paginationInfo);
      setCurrentPage(paginationInfo.page); // Sync currentPage with API response
    } catch (error) {
      toast.error(t('testOrder.notSearching'));
      console.error('Error searching test orders:', error);
      // On error, clear results
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  // Detect current route base path (admin, service, or labuser)
  const getBasePath = React.useCallback(() => {
    if (location.pathname.startsWith('/admin')) return '/admin';
    if (location.pathname.startsWith('/service')) return '/service';
    return '/labuser';
  }, [location.pathname]);

  const handleCreate = React.useCallback(() => {
    const basePath = getBasePath();
    navigate(`${basePath}/create-test-order`);
  }, [navigate, getBasePath]);



  const handleFormSubmit = async () => {
    try {
      // TestOrderFormModal đã gọi API trực tiếp, chỉ cần refresh data
      setFormModalOpen(false);
      setIsEdit(false);
      setSelectedOrder(null);
      await loadTestOrders(currentPage);
    } catch (error) {
      console.error('Error refreshing test orders:', error);
    }
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: 'Pending' | 'Processing' | 'Completed'
  ) => {
    try {
      await testOrderService.changeStatus(orderId, newStatus, user?.name ?? 'system');
      toast.success(`Đã chuyển sang ${newStatus}`);

      // Optimistic UI – cập nhật ngay, không cần reload
      const updateOrder = (o: TestOrder) =>
        o._id === orderId
          ? {
            ...o,
            status: newStatus,
            processing: newStatus === 'Processing' ? 10 : newStatus === 'Completed' ? 100 : 0
          }
          : o;

      setOrders(prev => prev.map(updateOrder));
      setFilteredOrders(prev => prev.map(updateOrder));
    } catch (error: unknown) {
      console.error('Lỗi khi thay đổi trạng thái:', error);

      let msg = 'Cập nhật thất bại';

      if (error instanceof Error) {
        msg = error.message;
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const errObj = error as { response?: { data?: { message?: string } } };
        msg = errObj.response?.data?.message || msg;
        console.error('Status change error data:', errObj.response?.data);
      }

      toast.error(msg);
    }

  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrder) return;
    try {
      await testOrderService.deleteTestOrder(selectedOrder._id, user?.name ?? 'system');
      toast.success(`Đã xóa lệnh xét nghiệm "${selectedOrder.patient_name}" thành công`);
      setDeleteModalOpen(false);
      await loadTestOrders(currentPage);
    } catch (error) {
      toast.error('Không thể xóa lệnh xét nghiệm');
      console.error('Error deleting test order:', error);
    }
  };


  const handleOrderClick = async (order: TestOrder) => {
    try {
      // Fetch full order details including instrument and reagents
      const fullOrderDetails = await testOrderService.getTestOrderById(order._id);
      if (fullOrderDetails) {
        setSelectedOrder(fullOrderDetails);
        setShowDetailDialog(true);
      } else {
        toast.error('Không thể tải chi tiết lệnh xét nghiệm');
      }
    } catch (error) {
      toast.error('Không thể tải chi tiết lệnh xét nghiệm');
      console.error('Error loading order details:', error);
      // Fallback to basic order info if fetch fails
      setSelectedOrder(order);
      setShowDetailDialog(true);
    }
  };


  // Only show full skeleton on initial load, not during search
  if (loading && isInitialLoad) {
    return (
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
        {/* Toolbar skeleton */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
            <Skeleton className="h-3 sm:h-4 w-48 sm:w-64" />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-4">
            <Skeleton className="h-10 w-full sm:w-64 md:w-80 rounded-md" />
            <Skeleton className="h-10 w-full sm:w-48 md:w-60 rounded-md" />
          </div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 sm:p-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 sm:h-8 w-12" />
              </div>
            </Card>
          ))}
        </div>

        {/* TestOrderList skeleton */}
        <Card className="glass-strong hover-lift">
          <CardHeader className="p-4 sm:p-6">
            <Skeleton className="h-4 sm:h-5 w-28 sm:w-32 mb-2" />
            <Skeleton className="h-3 sm:h-4 w-1/2" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 sm:p-4 border rounded-lg bg-white/50 mb-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }


  const stats = calculateStats(orders);

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      <TestOrderToolbar
        searchTerm={searchInput}
        onSearchChange={setSearchInput}
        onCreateTestOrder={handleCreate}
      />

      <TestOrderStatsCards stats={stats} loading={loading} />

      <TestOrderList
        orders={filteredOrders}
        onOrderClick={handleOrderClick}
        onStatusChange={handleStatusChange}
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        isLoading={loading && !isInitialLoad}
      />

      <TestOrderDetailModal
        order={selectedOrder}
        isOpen={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        onDelete={(order) => {
          setSelectedOrder(order);
          setDeleteModalOpen(true);
        }}
        onEdit={(order) => {
          setSelectedOrder(order);
          setIsEdit(true);
          setFormModalOpen(true);
        }}
      />

      <TestOrderFormModal
        order={selectedOrder}
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        isEdit={isEdit}
      />

      <DeleteConfirmModal
        order={selectedOrder}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default TestOrdersPage;
