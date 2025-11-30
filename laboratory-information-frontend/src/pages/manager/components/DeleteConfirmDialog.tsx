import { AlertTriangle, X } from 'lucide-react';
import Button from '../../../components/common/button';
import type { ManagerUser } from '../types/ManagerTypes';

interface DeleteConfirmDialogProps {
  user: ManagerUser;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ user, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-md w-full my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 pr-2">
            <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg flex-shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-600" />
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 break-words">
              Xác nhận xóa người dùng
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 flex-shrink-0">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6">
          <p className="text-xs sm:text-sm md:text-base text-gray-700 mb-3 sm:mb-4">
            Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
          </p>
          <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3 md:p-4 border border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm sm:text-base md:text-lg flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-xs sm:text-sm md:text-base text-gray-900 truncate">
                  {user.name}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 truncate">
                  {user.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto text-xs sm:text-sm md:text-base order-2 sm:order-1">
            Hủy
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto text-xs sm:text-sm md:text-base order-1 sm:order-2"
          >
            Xóa người dùng
          </Button>
        </div>
      </div>
    </div>
  );
}

