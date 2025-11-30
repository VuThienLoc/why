import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/common/dialog';
import Button from '../../../components/common/button';

interface Props {
  open: boolean;
  itemName?: string;
  description?: string;
  title?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmDialog: React.FC<Props> = ({ open, itemName, description, title, onConfirm, onCancel }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title || t('common.confirmDelete')}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {description ?? t('common.deleteConfirmDefault', { itemName: itemName || '' })}
        </DialogDescription>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>{t('common.cancel')}</Button>
          <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white">{t('common.delete')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
