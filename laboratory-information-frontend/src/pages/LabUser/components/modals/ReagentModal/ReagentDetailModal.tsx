import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../../../../components/common/dialog';
import Button from '../../../../../components/common/button';
import { Label } from '../../../../../components/common/label';
import { Input } from '../../../../../components/common/input';
import { FlaskConical, Tag, Factory, MapPin, Calendar, Scale, FileText, Link as LinkIcon } from 'lucide-react';
import type { Reagent } from '@/pages/labuser/types/Reagent';
import { getStatusBadge, formatDate } from '../../../utils/reagentUtils';
import { useTranslation } from 'react-i18next';

interface ReagentDetailModalProps {
  isOpen: boolean;
  reagent: Reagent | null;
  onClose: () => void;
}

export default function ReagentDetailModal({
    isOpen,
    reagent,
    onClose,
}: ReagentDetailModalProps) {
    const { t } = useTranslation();

    if (!reagent) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl w-[95vw] sm:w-full overflow-hidden border-0 shadow-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
                <DialogHeader className="pb-4 sm:pb-6 border-b border-gray-100 px-4 sm:px-6 pt-6 sm:pt-8">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg flex-shrink-0">
                            <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                        <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 break-words">
                            {t('reagent.detailModal.title')}: {reagent.name}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs sm:text-sm text-gray-500 ml-8 sm:ml-11">
                        {t('reagent.detailModal.viewDescription') || 'Chi tiết thông tin thuốc thử'}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                    {/* Basic Info Section */}
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                            {t('reagent.detailModal.basicInfo')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">{t('reagent.detailModal.name')}</Label>
                                <div className="relative group">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input readOnly value={reagent.name} className="pl-10 bg-gray-50 border-gray-200" />
                                </div>
                            </div>

                            {/* Lot Number */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">{t('reagent.detailModal.lotNumber')}</Label>
                                <div className="relative group">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input readOnly value={reagent.lotNumber} className="pl-10 bg-gray-50 border-gray-200" />
                                </div>
                            </div>

                            {/* Manufacturer */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">{t('reagent.detailModal.manufacturer')}</Label>
                                <div className="relative group">
                                    <Factory className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input readOnly value={reagent.manufacturer || t('reagent.detailModal.noInfo')} className="pl-10 bg-gray-50 border-gray-200" />
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">{t('reagent.detailModal.quantity')}</Label>
                                <div className="relative group">
                                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input readOnly value={`${reagent.quantity} ${reagent.unitOfMeasure || ''}`} className="pl-10 bg-gray-50 border-gray-200" />
                                </div>
                            </div>

                            {/* Expiry Date */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">{t('reagent.detailModal.expiryDate')}</Label>
                                <div className="relative group">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input readOnly value={formatDate(reagent.expiryDate)} className="pl-10 bg-gray-50 border-gray-200" />
                                </div>
                            </div>

                            {/* Received Date */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">{t('reagent.detailModal.receivedDate')}</Label>
                                <div className="relative group">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input readOnly value={formatDate(reagent.receivedDate)} className="pl-10 bg-gray-50 border-gray-200" />
                                </div>
                            </div>

                            {/* Storage Location */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">{t('reagent.detailModal.storageLocation')}</Label>
                                <div className="relative group">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input readOnly value={reagent.storageLocation || ''} className="pl-10 bg-gray-50 border-gray-200" />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">{t('reagent.detailModal.status')}</Label>
                                <div className="h-10 flex items-center">
                                    {getStatusBadge(reagent.status)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Usage Info Section */}
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                            {t('reagent.detailModal.usageInfo')}
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-100">
                            <div>
                                <span className="font-medium text-gray-700 block mb-2 text-sm sm:text-base">{t('reagent.detailModal.notes')}:</span>
                                <p className="text-sm sm:text-base text-gray-600 bg-white p-3 rounded border border-gray-200 min-h-[60px]">
                                    {reagent.notes || t('reagent.detailModal.noNotes')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100">
                    <Button 
                        onClick={onClose} 
                        className="h-10 w-full sm:w-auto px-6 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 shadow-sm"
                    >
                        {t('reagent.close')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}



