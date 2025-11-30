
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../../../../components/common/dialog';
import Button from '../../../../../components/common/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import type { Reagent } from '../../../types/Reagent';
import { useTranslation } from 'react-i18next';

interface ReagentDeleteConfirmModalProps {
  isOpen: boolean;
  reagent: Reagent | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ReagentDeleteConfirmModal({
  isOpen,
  reagent,
  onClose,
  onConfirm,
}: ReagentDeleteConfirmModalProps) {
  const { t } = useTranslation();

  if (!reagent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full overflow-hidden border-0 shadow-2xl sm:rounded-2xl">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-orange-600" />
            <DialogHeader className="pb-0 border-b-0 px-4 sm:px-6 pt-6 sm:pt-8">
                <div className="flex flex-col items-center gap-3 sm:gap-4 text-center mb-2">
                    <div className="p-2.5 sm:p-3 bg-red-50 rounded-full">
                        <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />
                    </div>
                    <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">
                        {t('reagent.deleteModal.title')}
                    </DialogTitle>
                </div>
                <DialogDescription className="text-center text-xs sm:text-sm text-gray-500 px-2">
                    {t('reagent.deleteModal.description')}
                </DialogDescription>
            </DialogHeader>

            <div className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 shrink-0" />
                    <div className="space-y-1 min-w-0 flex-1">
                        <p className="font-semibold text-sm sm:text-base text-gray-900 break-words">{reagent.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600">
                            {t('reagent.deleteModal.lotNumber')}: <span className="font-medium text-gray-800">{reagent.lotNumber}</span>
                        </p>
                    </div>
                </div>
            </div>

            <DialogFooter className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex-col sm:flex-row sm:justify-center gap-2 sm:gap-3">
                <Button 
                    variant="outline" 
                    onClick={onClose} 
                    className="h-10 px-6 border-gray-200 hover:bg-white hover:text-gray-900 hover:border-gray-300 w-full sm:w-auto"
                >
                    {t('reagent.cancel')}
                </Button>
                <Button 
                    onClick={onConfirm} 
                    className="h-10 px-6 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
                >
                    {t('reagent.delete')}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}

