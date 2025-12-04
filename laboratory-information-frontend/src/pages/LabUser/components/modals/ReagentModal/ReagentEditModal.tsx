import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { FlaskConical, Tag, Factory, MapPin, Calendar, Scale, AlertTriangle } from 'lucide-react';
import { validateReagentForm } from '@/pages/labuser/types/Reagent';
import type { Reagent, ReagentFormData } from '@/pages/labuser/types/Reagent';
import { useTranslation } from 'react-i18next';

interface ReagentEditModalProps {
    isOpen: boolean;
    reagent: Partial<Reagent>;
    onClose: () => void;
    onSave: (data: Partial<Reagent>) => Promise<boolean> | void;
}

export default function ReagentEditModal({
    isOpen,
    reagent,
    onClose,
    onSave,
}: ReagentEditModalProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<ReagentFormData>({
        reagent_name: '',
        reagent_type: '',
        quantity_current: 0,
        unit_of_measure: 'ml',
        expiration_date: '',
        received_date: '',
        low_stock_threshold: 0,
        storage_location: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen && reagent) {
            setFormData({
                reagent_name: reagent.name || '',
                reagent_type: reagent.reagentType || reagent.manufacturer || '',
                quantity_current: reagent.quantity || 0,
                unit_of_measure: reagent.unitOfMeasure || 'ml',
                expiration_date: reagent.expiryDate || '',
                received_date: reagent.receivedDate || '',
                low_stock_threshold: reagent.lowStockThreshold || 0,
                storage_location: reagent.storageLocation || '',
            });
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen, reagent]);

    const handleFieldChange = (field: keyof ReagentFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = async () => {
        const validationErrors = validateReagentForm(formData, t);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error(t('reagent.validation.checkFields') || 'Vui lòng kiểm tra lại thông tin');
            return;
        }

        setIsSubmitting(true);
        
        // Map back to Reagent type for parent
        const submitData: Partial<Reagent> = {
            ...reagent, // Keep existing ID etc
            name: formData.reagent_name,
            reagentType: formData.reagent_type,
            manufacturer: formData.reagent_type, // Fallback/Sync
            quantity: formData.quantity_current,
            unitOfMeasure: formData.unit_of_measure,
            expiryDate: formData.expiration_date,
            receivedDate: formData.received_date,
            lowStockThreshold: formData.low_stock_threshold,
            storageLocation: formData.storage_location,
        };

        const result = await onSave(submitData);
        if (result === false) {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl w-[95vw] sm:w-full overflow-hidden border-0 shadow-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
                <DialogHeader className="pb-4 sm:pb-6 border-b border-gray-100 px-4 sm:px-6 pt-6 sm:pt-8">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg flex-shrink-0">
                            <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                        <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">
                            {t('reagent.formModal.editTitle')}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs sm:text-sm text-gray-500 ml-8 sm:ml-11">
                        {t('reagent.formModal.editDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Reagent Name */}
                        <div className="space-y-2">
                            <Label htmlFor="reagent_name" className="text-sm font-medium text-gray-700">
                                {t('reagent.formModal.name')} <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative group">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    id="reagent_name"
                                    value={formData.reagent_name}
                                    onChange={(e) => handleFieldChange('reagent_name', e.target.value)}
                                    placeholder="Nhập tên thuốc thử"
                                    className={`pl-10 h-11 transition-all ${errors.reagent_name ? 'border-red-300 focus-visible:ring-red-200' : 'border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200'}`}
                                />
                            </div>
                            {errors.reagent_name && <p className="text-xs text-red-500 mt-1">{errors.reagent_name}</p>}
                        </div>

                        {/* Reagent Type */}
                        <div className="space-y-2">
                            <Label htmlFor="reagent_type" className="text-sm font-medium text-gray-700">
                                {t('reagent.formModal.type') || 'Loại thuốc thử'} <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative group">
                                <Factory className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    id="reagent_type"
                                    value={formData.reagent_type}
                                    onChange={(e) => handleFieldChange('reagent_type', e.target.value)}
                                    placeholder="Nhập loại thuốc thử"
                                    className={`pl-10 h-11 transition-all ${errors.reagent_type ? 'border-red-300 focus-visible:ring-red-200' : 'border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200'}`}
                                />
                            </div>
                            {errors.reagent_type && <p className="text-xs text-red-500 mt-1">{errors.reagent_type}</p>}
                        </div>

                        {/* Quantity Current */}
                        <div className="space-y-2">
                            <Label htmlFor="quantity_current" className="text-sm font-medium text-gray-700">
                                {t('reagent.formModal.quantity')} <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative group">
                                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    id="quantity_current"
                                    type="number"
                                    value={formData.quantity_current}
                                    onChange={(e) => handleFieldChange('quantity_current', Number(e.target.value))}
                                    className={`pl-10 h-11 transition-all ${errors.quantity_current ? 'border-red-300 focus-visible:ring-red-200' : 'border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200'}`}
                                />
                            </div>
                            {errors.quantity_current && <p className="text-xs text-red-500 mt-1">{errors.quantity_current}</p>}
                        </div>

                        {/* Unit of Measure */}
                        <div className="space-y-2">
                            <Label htmlFor="unit_of_measure" className="text-sm font-medium text-gray-700">
                                {t('reagent.formModal.unit') || 'Đơn vị tính'}
                            </Label>
                            <div className="relative group">
                                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    id="unit_of_measure"
                                    value={formData.unit_of_measure}
                                    onChange={(e) => handleFieldChange('unit_of_measure', e.target.value)}
                                    placeholder="ml, mg, kit..."
                                    className={`pl-10 h-11 transition-all ${errors.unit_of_measure ? 'border-red-300 focus-visible:ring-red-200' : 'border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200'}`}
                                />
                            </div>
                            {errors.unit_of_measure && <p className="text-xs text-red-500 mt-1">{errors.unit_of_measure}</p>}
                        </div>

                        {/* Expiration Date */}
                        <div className="space-y-2">
                            <Label htmlFor="expiration_date" className="text-sm font-medium text-gray-700">
                                {t('reagent.formModal.expiryDate')} <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    id="expiration_date"
                                    type="date"
                                    value={formData.expiration_date}
                                    onChange={(e) => handleFieldChange('expiration_date', e.target.value)}
                                    className={`pl-10 h-11 transition-all ${errors.expiration_date ? 'border-red-300 focus-visible:ring-red-200' : 'border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200'}`}
                                />
                            </div>
                            {errors.expiration_date && <p className="text-xs text-red-500 mt-1">{errors.expiration_date}</p>}
                        </div>

                        {/* Received Date */}
                        <div className="space-y-2">
                            <Label htmlFor="received_date" className="text-sm font-medium text-gray-700">
                                {t('reagent.formModal.receivedDate')}
                            </Label>
                            <div className="relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    id="received_date"
                                    type="date"
                                    value={formData.received_date}
                                    onChange={(e) => handleFieldChange('received_date', e.target.value)}
                                    className={`pl-10 h-11 transition-all ${errors.received_date ? 'border-red-300 focus-visible:ring-red-200' : 'border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200'}`}
                                />
                            </div>
                            {errors.received_date && <p className="text-xs text-red-500 mt-1">{errors.received_date}</p>}
                        </div>

                        {/* Low Stock Threshold */}
                        <div className="space-y-2">
                            <Label htmlFor="low_stock_threshold" className="text-sm font-medium text-gray-700">
                                {t('reagent.formModal.lowStockThreshold') || 'Ngưỡng cảnh báo thấp'}
                            </Label>
                            <div className="relative group">
                                <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    id="low_stock_threshold"
                                    type="number"
                                    value={formData.low_stock_threshold}
                                    onChange={(e) => handleFieldChange('low_stock_threshold', Number(e.target.value))}
                                    className={`pl-10 h-11 transition-all ${errors.low_stock_threshold ? 'border-red-300 focus-visible:ring-red-200' : 'border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200'}`}
                                />
                            </div>
                            {errors.low_stock_threshold && <p className="text-xs text-red-500 mt-1">{errors.low_stock_threshold}</p>}
                        </div>

                        {/* Storage Location */}
                        <div className="space-y-2">
                            <Label htmlFor="storage_location" className="text-sm font-medium text-gray-700">
                                {t('reagent.formModal.storageLocation')}
                            </Label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    id="storage_location"
                                    value={formData.storage_location}
                                    onChange={(e) => handleFieldChange('storage_location', e.target.value)}
                                    placeholder="Vị trí lưu trữ"
                                    className={`pl-10 h-11 transition-all ${errors.storage_location ? 'border-red-300 focus-visible:ring-red-200' : 'border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200'}`}
                                />
                            </div>
                            {errors.storage_location && <p className="text-xs text-red-500 mt-1">{errors.storage_location}</p>}
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex-col sm:flex-row gap-2 sm:gap-2">
                    <Button 
                        variant="outline" 
                        onClick={onClose} 
                        disabled={isSubmitting}
                        className="h-10 w-full sm:w-auto px-6 border-gray-200 hover:bg-white hover:text-gray-900 hover:border-gray-300"
                    >
                        {t('reagent.cancel')}
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className="h-10 w-full sm:w-auto px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>{t('reagent.formModal.updating')}</span>
                            </div>
                        ) : (
                            t('reagent.save')
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
