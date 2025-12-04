import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/common/dialog';
import Button from '../../../../../components/common/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import type { TestOrder } from '../../../types/TestOrderTypes.ts';
import { useTranslation } from 'react-i18next';
import { translateTestType } from '../../../utils/testOrderUtils.tsx';

interface DeleteConfirmModalProps {
  order: TestOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ order, isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation();
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-md mx-auto overflow-hidden border-0 shadow-2xl rounded-lg sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-600 sm:h-1.5" />
        <DialogHeader className="pb-0 border-b-0 px-3 sm:px-4 md:px-6 pt-4 sm:pt-6 md:pt-8">
          <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 text-center mb-1 sm:mb-2">
            <div className="p-2 sm:p-2.5 md:p-3 bg-red-50 rounded-full">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-red-600" />
            </div>
            <DialogTitle className="text-base sm:text-lg md:text-xl font-bold text-gray-900 px-2">
              {t('testOrder.deleteModal.title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-center text-xs sm:text-sm text-gray-500 px-2 sm:px-0">
            {t('testOrder.deleteModal.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
          <div className="bg-red-50 border border-red-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 flex items-start gap-2 sm:gap-3">
            <Trash2 className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-500 mt-0.5 shrink-0 flex-shrink-0" />
            <div className="space-y-1 min-w-0 flex-1">
              <p className="font-semibold text-xs sm:text-sm md:text-base text-gray-900 break-words leading-tight">
                {t('testOrder.deleteModal.testOrder')}: {order.barcode || order._id} - {translateTestType(order.test_type, t)}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 break-words">
                {t('testOrder.deleteModal.patient')}: <span className="font-medium text-gray-800 break-all">{order.patient_name}</span>
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-gray-50 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-gray-100 flex-col sm:flex-row sm:justify-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 sm:h-10 px-4 sm:px-6 border-gray-200 hover:bg-white hover:text-gray-900 hover:border-gray-300 w-full sm:w-auto text-sm sm:text-base order-2 sm:order-1"
          >
            {t('testOrder.deleteModal.cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            className="h-9 sm:h-10 px-4 sm:px-6 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto text-sm sm:text-base order-1 sm:order-2 flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4 mr-1.5 sm:mr-2 shrink-0" />
            {t('testOrder.deleteModal.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal;

