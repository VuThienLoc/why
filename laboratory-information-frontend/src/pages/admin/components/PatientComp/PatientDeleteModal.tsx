import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../../components/common/dialog';
import Button from '../../../../components/common/button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface Props {
  open: boolean;
  itemName?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const Patient_DeleteModal: React.FC<Props> = ({ open, itemName, description, onConfirm, onCancel }) => {
  const { t } = useTranslation();
  const defaultItemName = t('patient.deleteConfirm.defaultItemName');
  const displayItemName = itemName || defaultItemName;

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md overflow-hidden border-0 shadow-2xl sm:rounded-2xl">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-orange-600" />
        <DialogHeader className="pb-0 border-b-0 px-6 pt-8">
          <div className="flex flex-col items-center gap-4 text-center mb-2">
            <div className="p-3 bg-red-50 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {t('patient.deleteConfirm.title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-center text-gray-500">
            {description ?? t('patient.deleteConfirm.description', { itemName: displayItemName })}
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-4">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
            <Trash2 className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">{displayItemName}</p>
              <p className="text-sm text-gray-600">
                {t('patient.deleteConfirm.delete')}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-gray-50 px-6 py-4 border-t border-gray-100 sm:justify-center gap-3">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="h-10 px-6 border-gray-200 hover:bg-white hover:text-gray-900 hover:border-gray-300 w-full sm:w-auto"
          >
            {t('patient.deleteConfirm.cancel')}
          </Button>
          <Button 
            onClick={onConfirm} 
            className="h-10 px-6 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
          >
            {t('patient.deleteConfirm.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
