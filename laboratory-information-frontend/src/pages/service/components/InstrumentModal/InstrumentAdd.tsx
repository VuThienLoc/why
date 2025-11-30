import { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../../../components/common/dialog';
import Button from '../../../../components/common/button';
import { Label } from '../../../../components/common/label';
import { Input } from '../../../../components/common/input';
import { toast } from 'sonner';
import { Microscope, Tag, Factory, MapPin } from 'lucide-react';
import { type Instrument, validateInstrumentField } from '../../types/Instrument';
import { instrumentsService } from '../../../../service/instrumentsService';
import { useTranslation } from 'react-i18next';

interface AddInstrumentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddInstrument: (instrument: Instrument) => void;
}

interface InstrumentFormData {
    instrument_name: string;
    instrument_type: string;
    manufacturer: string;
    location: string;
}

interface ValidationErrors {
    instrument_name?: string;
    instrument_type?: string;
    manufacturer?: string;
    location?: string;
}

export function AddInstrumentDialog({
    open,
    onOpenChange,
    onAddInstrument,
}: AddInstrumentDialogProps) {
    const { t } = useTranslation();
    const [newInstrument, setNewInstrument] = useState<InstrumentFormData>({
        instrument_name: '',
        instrument_type: '',
        manufacturer: '',
        location: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    const resetForm = useCallback(() => {
        setNewInstrument({
            instrument_name: '',
            instrument_type: '',
            manufacturer: '',
            location: '',
        });
        setErrors({});
    }, []);

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            resetForm();
            setIsSubmitting(false);
        }
    }, [open, resetForm]);

    const validateField = (field: keyof InstrumentFormData, value: string): string | undefined => {
        return validateInstrumentField(field, value, t);
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        
        const instrumentNameError = validateField('instrument_name', newInstrument.instrument_name);
        if (instrumentNameError) newErrors.instrument_name = instrumentNameError;

        const instrumentTypeError = validateField('instrument_type', newInstrument.instrument_type);
        if (instrumentTypeError) newErrors.instrument_type = instrumentTypeError;

        const manufacturerError = validateField('manufacturer', newInstrument.manufacturer);
        if (manufacturerError) newErrors.manufacturer = manufacturerError;

        const locationError = validateField('location', newInstrument.location);
        if (locationError) newErrors.location = locationError;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFieldChange = (field: keyof InstrumentFormData, value: string) => {
        setNewInstrument((prev) => ({ ...prev, [field]: value }));
        
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error(t('service.instrument.validation.checkFields'));
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: Partial<Instrument> = {
                instrument_name: newInstrument.instrument_name.trim(),
                instrument_type: newInstrument.instrument_type.trim(),
                manufacturer: newInstrument.manufacturer.trim(),
                location: newInstrument.location.trim(),
            };

            const createdInstrument = await instrumentsService.createInstrument(payload);
            onAddInstrument(createdInstrument);
            onOpenChange(false);
            resetForm();
            toast.success(t('service.instrument.addSuccess'));
        } catch (error) {
            const message = error instanceof Error ? error.message : t('service.instrument.cannotAddInstrument');
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl overflow-hidden border-0 shadow-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
                <DialogHeader className="pb-4 sm:pb-6 border-b border-gray-100 px-4 sm:px-6 pt-6 sm:pt-8">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg flex-shrink-0">
                            <Microscope className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                        <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">
                            {t('service.instrument.addDialog.title')}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs sm:text-sm text-gray-500 ml-8 sm:ml-11">
                        {t('service.instrument.addDialog.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Instrument Name */}
                        <div className="space-y-2">
                            <Label htmlFor="instrument_name" className="text-sm font-medium text-gray-700">
                                {t('service.instrument.addDialog.instrumentName')} <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative group">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    id="instrument_name"
                                    type="text"
                                    value={newInstrument.instrument_name}
                                    onChange={(e) => handleFieldChange('instrument_name', e.target.value)}
                                    placeholder={t('service.instrument.addDialog.instrumentNamePlaceholder')}
                                    className={`pl-10 h-11 transition-all ${errors.instrument_name ? 'border-red-300 focus-visible:ring-red-200' : 'border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200'}`}
                                    aria-invalid={!!errors.instrument_name}
                                />
                            </div>
                            {errors.instrument_name && (
                                <p className="text-xs text-red-500 mt-1 font-medium animate-in slide-in-from-top-1">{errors.instrument_name}</p>
                            )}
                        </div>

                        {/* Instrument Type */}
                        <div className="space-y-2">
                            <Label htmlFor="instrument_type" className="text-sm font-medium text-gray-700">
                                {t('service.instrument.addDialog.instrumentType')} <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative group">
                                <Microscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    id="instrument_type"
                                    type="text"
                                    value={newInstrument.instrument_type}
                                    onChange={(e) => handleFieldChange('instrument_type', e.target.value)}
                                    placeholder={t('service.instrument.addDialog.instrumentTypePlaceholder')}
                                    className={`pl-10 h-11 transition-all ${errors.instrument_type ? 'border-red-300 focus-visible:ring-red-200' : 'border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200'}`}
                                    aria-invalid={!!errors.instrument_type}
                                />
                            </div>
                            {errors.instrument_type && (
                                <p className="text-xs text-red-500 mt-1 font-medium animate-in slide-in-from-top-1">{errors.instrument_type}</p>
                            )}
                        </div>

                        {/* Manufacturer */}
                        <div className="space-y-2">
                            <Label htmlFor="manufacturer" className="text-sm font-medium text-gray-700">
                                {t('service.instrument.addDialog.manufacturer')} <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative group">
                                <Factory className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    id="manufacturer"
                                    type="text"
                                    value={newInstrument.manufacturer}
                                    onChange={(e) => handleFieldChange('manufacturer', e.target.value)}
                                    placeholder={t('service.instrument.addDialog.manufacturerPlaceholder')}
                                    className={`pl-10 h-11 transition-all ${errors.manufacturer ? 'border-red-300 focus-visible:ring-red-200' : 'border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200'}`}
                                    aria-invalid={!!errors.manufacturer}
                                />
                            </div>
                            {errors.manufacturer && (
                                <p className="text-xs text-red-500 mt-1 font-medium animate-in slide-in-from-top-1">{errors.manufacturer}</p>
                            )}
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                                {t('service.instrument.addDialog.location')} <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    id="location"
                                    type="text"
                                    value={newInstrument.location}
                                    onChange={(e) => handleFieldChange('location', e.target.value)}
                                    placeholder={t('service.instrument.addDialog.locationPlaceholder')}
                                    className={`pl-10 h-11 transition-all ${errors.location ? 'border-red-300 focus-visible:ring-red-200' : 'border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200'}`}
                                    aria-invalid={!!errors.location}
                                />
                            </div>
                            {errors.location && (
                                <p className="text-xs text-red-500 mt-1 font-medium animate-in slide-in-from-top-1">{errors.location}</p>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex-col sm:flex-row gap-2 sm:gap-0">
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)} 
                        disabled={isSubmitting}
                        className="h-10 px-4 sm:px-6 border-gray-200 hover:bg-white hover:text-gray-900 hover:border-gray-300 w-full sm:w-auto order-2 sm:order-1"
                    >
                        {t('service.instrument.cancel')}
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className="h-10 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto order-1 sm:order-2"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>{t('service.instrument.addDialog.adding')}</span>
                            </div>
                        ) : (
                            t('service.instrument.addDialog.addButton')
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
