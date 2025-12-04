import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Reagent } from '@/pages/labuser/types/Reagent';
import { useAuthContext } from '../../../../hooks/useAuthContext';
import { reagentService } from '../../../../service/reagentService';
import { toast } from 'sonner';
import ReagentToolbar from '@/pages/labuser/components/ReagentComp/ReagentToolbar';
import ReagentTable from '@/pages/labuser/components/ReagentComp/ReagentTable';
import ReagentAddModal from '../modals/ReagentModal/ReagentAddModal';
import ReagentEditModal from '../modals/ReagentModal/ReagentEditModal';
import ReagentDetailModal from '../modals/ReagentModal/ReagentDetailModal';
import ReagentDeleteConfirmModal from '../modals/ReagentModal/ReagentDeleteModal';
import { filterReagents } from '../../utils/reagentUtils';
import { useTranslation } from 'react-i18next';

const ReagentManagementPage: React.FC = () => {
  const { user } = useAuthContext();
  const [reagents, setReagents] = useState<Reagent[]>([]);
  const [filteredReagents, setFilteredReagents] = useState<Reagent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReagent, setSelectedReagent] = useState<Reagent | null>(null);
  const [editingReagent, setEditingReagent] = useState<Partial<Reagent>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch reagents from API
  useEffect(() => {
    const fetchReagents = async () => {
      setIsLoading(true);
      try {
        const allReagents = await reagentService.getAllReagents();
        setReagents(allReagents);
      } catch (error: unknown) {
        console.error('Lỗi khi tải danh sách thuốc thử:', error);

        let errorMessage = 'Không thể tải danh sách thuốc thử';
        let isNetworkError = false;

        if (error instanceof Error) {
          errorMessage = error.message;
          isNetworkError = error.message.includes('Network Error');
        } else if (typeof error === 'object' && error !== null) {
          const anyError = error as { message?: string; code?: string };
          errorMessage = anyError.message || errorMessage;
          isNetworkError = anyError.code === 'ERR_NETWORK' || anyError.code === 'ERR_CONNECTION_REFUSED';
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        if (isNetworkError) {
          toast.error(
            'Không thể kết nối đến server. Vui lòng kiểm tra backend service đã chạy chưa (port 5003)'
          );
        } else {
          toast.error(errorMessage);
        }

        setReagents([]);
      } finally {
        setIsLoading(false);
      }


    };

    fetchReagents();
  }, []);

  useEffect(() => {
    const filtered = filterReagents(reagents, searchTerm, statusFilter);
    setFilteredReagents(filtered);
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [reagents, searchTerm, statusFilter]);

  // Calculate pagination
  const totalPages = useMemo(() => {
    return Math.ceil(filteredReagents.length / itemsPerPage);
  }, [filteredReagents.length, itemsPerPage]);

  const paginatedReagents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredReagents.slice(startIndex, endIndex);
  }, [filteredReagents, currentPage, itemsPerPage]);

  const handleAddReagent = () => {
    setEditingReagent({});
    setIsAddModalOpen(true);
  };

  const handleEditReagent = (reagent: Reagent) => {
    setEditingReagent(reagent);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = async (reagent: Reagent) => {
    try {
      // Lấy chi tiết thuốc thử từ API
      const fullReagent = await reagentService.getReagentById(reagent.id);
      if (fullReagent) {
        setSelectedReagent(fullReagent);
        setIsDetailModalOpen(true);
      } else {
        toast.error('Không tìm thấy thông tin thuốc thử');
      }
    } catch (error: unknown) {
      // Ghi log lỗi an toàn
      if (error instanceof Error) {
        console.error('Lỗi khi lấy chi tiết thuốc thử:', error.message);
        toast.error(error.message || 'Không thể tải thông tin thuốc thử');
      } else {
        console.error('Lỗi không xác định khi lấy chi tiết thuốc thử:', error);
        toast.error('Không thể tải thông tin thuốc thử');
      }

      // Dùng fallback: hiển thị thuốc thử từ danh sách
      setSelectedReagent(reagent);
      setIsDetailModalOpen(true);
    }
  };


  const handleDeleteReagent = (reagent: Reagent) => {
    setSelectedReagent(reagent);
    setIsDeleteModalOpen(true);
  };

  const handleSaveReagent = async (reagentData?: Partial<Reagent>): Promise<boolean> => {
    const dataToSave = reagentData || editingReagent;

    // Validate required fields
    if (!dataToSave.name || !dataToSave.quantity || !dataToSave.expiryDate) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Số lượng, Ngày hết hạn)');
      return false;
    }

    // Validate lot number uniqueness (only for new reagents)
    // Note: lotNumber might be generated by backend or entered. If entered, check it.
    if (dataToSave.lotNumber && !dataToSave.id) {
      const existingReagent = reagents.find(reagent =>
        reagent.lotNumber === dataToSave.lotNumber
      );
      if (existingReagent) {
        toast.error('Số lô đã tồn tại');
        return false;
      }
    }

    // Validate expiry date
    if (dataToSave.expiryDate) {
      const expiryDate = new Date(dataToSave.expiryDate);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Reset time to compare dates only
      if (expiryDate <= currentDate) {
        toast.error('Ngày hết hạn phải sau ngày hiện tại');
        return false;
      }
    }

    // Validate quantity
    if (dataToSave.quantity !== undefined && dataToSave.quantity < 0) {
      toast.error('Số lượng phải lớn hơn hoặc bằng 0');
      return false;
    }

    try {
      if (dataToSave.id) {
        // Update existing reagent
        const updatedReagent = await reagentService.updateReagent(
          dataToSave.id,
          dataToSave,
          user?.id
        );
        setReagents(prev => prev.map(reagent => reagent.id === dataToSave.id ? updatedReagent : reagent));
        toast.success('Cập nhật thuốc thử thành công');
        console.log(`[AUDIT] E_00027 | Reagent modified by ${user?.name}`);

        setIsEditModalOpen(false);
        setEditingReagent({});
        return true;
      } else {
        // Create new reagent
        const newReagent = await reagentService.createReagent(
          {
            ...dataToSave,
            receivedDate: dataToSave.receivedDate || new Date().toISOString().split('T')[0],
            status: dataToSave.status || 'Available',
          },
          user?.id
        );
        setReagents(prev => [...prev, newReagent]);
        toast.success('Tạo thuốc thử thành công');
        console.log(`[AUDIT] E_00026 | Reagent created by ${user?.name}`);

        setIsAddModalOpen(false);
        setEditingReagent({});
        return true;
      }
    } catch (error: unknown) {
      console.error('Lỗi khi lưu thuốc thử:', error);

      // Lấy thông báo lỗi an toàn
      let errorMessage = 'Có lỗi xảy ra khi lưu thuốc thử';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Kiểm tra các lỗi cụ thể từ backend
      if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
        toast.error('Số lô thuốc thử đã tồn tại trong hệ thống');
      } else if (errorMessage.includes('quantity_current') && errorMessage.includes('lớn hơn')) {
        toast.error('Số lượng hiện tại không được lớn hơn số lượng đã nhận');
      } else if (errorMessage.includes('validation') || errorMessage.includes('required')) {
        toast.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập vào.');
      } else if (errorMessage.includes('not found') || errorMessage.includes('không tìm thấy')) {
        toast.error('Không tìm thấy thuốc thử để cập nhật');
      } else {
        toast.error(errorMessage);
      }

      return false;
    }

  };

  const handleDeleteConfirm = async () => {
    if (!selectedReagent) return;

    try {
      await reagentService.deleteReagent(selectedReagent.id, user?.id);
      setReagents(prev => prev.filter(reagent => reagent.id !== selectedReagent.id));
      toast.success('Xóa thuốc thử thành công');
      console.log(`[AUDIT] E_00028 | Reagent deleted by ${user?.name}`);
      setIsDeleteModalOpen(false);
      setSelectedReagent(null);
    } catch (error: unknown) {
      console.error('Lỗi khi xóa thuốc thử:', error);

      let errorMessage = 'Có lỗi xảy ra khi xóa thuốc thử';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast.error(errorMessage);
    }

  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {useTranslation().t('reagent.title')}
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          {useTranslation().t('reagent.subtitle')}
        </p>
      </div>

      <ReagentToolbar
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onAddClick={handleAddReagent}
      />

      <ReagentTable
        reagents={paginatedReagents}
        isLoading={isLoading}
        onView={handleViewDetails}
        onEdit={handleEditReagent}
        onDelete={handleDeleteReagent}
      />

      {/* Pagination */}
      {filteredReagents.length > 0 && (
        <div className="flex justify-center items-center gap-1 sm:gap-2 mt-4 overflow-x-auto pb-2">
          <button
            className="px-2 sm:px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex-shrink-0"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => {
            const pageNum = i + 1;
            // Show first page, last page, current page, and pages around current
            // If totalPages <= 7, show all pages
            // On mobile, show fewer pages
            const showAllPages = totalPages <= 5;
            const showPage =
              showAllPages ||
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

            if (!showPage) {
              // Show ellipsis
              if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return (
                  <span key={pageNum} className="px-1 sm:px-2 text-gray-500 flex-shrink-0">
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={pageNum}
                className={`px-3 sm:px-4 py-2 rounded-lg border transition flex-shrink-0 text-sm sm:text-base ${currentPage === pageNum
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            className="px-2 sm:px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex-shrink-0"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Trang sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <ReagentAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveReagent}
      />

      <ReagentEditModal
        isOpen={isEditModalOpen}
        reagent={editingReagent}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingReagent({});
        }}
        onSave={handleSaveReagent}
      />

      <ReagentDetailModal
        isOpen={isDetailModalOpen}
        reagent={selectedReagent}
        onClose={() => setIsDetailModalOpen(false)}
      />

      <ReagentDeleteConfirmModal
        isOpen={isDeleteModalOpen}
        reagent={selectedReagent}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedReagent(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ReagentManagementPage;
