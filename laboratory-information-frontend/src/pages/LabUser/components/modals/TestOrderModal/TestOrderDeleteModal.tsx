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
      <DialogContent className="max-w-md overflow-hidden border-0 shadow-2xl sm:rounded-2xl">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-orange-600" />
        <DialogHeader className="pb-0 border-b-0 px-6 pt-8">
          <div className="flex flex-col items-center gap-4 text-center mb-2">
            <div className="p-3 bg-red-50 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {t('testOrder.deleteModal.title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-center text-gray-500">
            {t('testOrder.deleteModal.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
            <Trash2 className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">
                {t('testOrder.deleteModal.testOrder')}: {order.barcode || order._id} - {translateTestType(order.test_type, t)}
              </p>
              <p className="text-sm text-gray-600">
                {t('testOrder.deleteModal.patient')}: <span className="font-medium text-gray-800">{order.patient_name}</span>
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-gray-50 px-6 py-4 border-t border-gray-100 sm:justify-center gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 px-6 border-gray-200 hover:bg-white hover:text-gray-900 hover:border-gray-300 w-full sm:w-auto"
          >
            {t('testOrder.deleteModal.cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            className="h-10 px-6 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('testOrder.deleteModal.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal;

