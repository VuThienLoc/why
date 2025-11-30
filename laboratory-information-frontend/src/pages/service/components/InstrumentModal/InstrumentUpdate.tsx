import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../../components/common/dialog";
import { Label } from "../../../../components/common/label";
import { Input } from "../../../../components/common/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../../components/common/select";
import Button from "../../../../components/common/button";
import { type Instrument, validateInstrumentField } from "../../types/Instrument";
import { toast } from "sonner";
import { instrumentsService } from "../../../../service/instrumentsService";
import { useTranslation } from "react-i18next";
import { Microscope, Tag, Factory, MapPin, Activity, Settings } from 'lucide-react';

interface ChangeInstrumentStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instrument: Instrument | null;
  onStatusChange: (updatedInstrument: Instrument) => void;
}

export function ChangeInstrumentStatusDialog({
  open,
  onOpenChange,
  instrument,
  onStatusChange,
}: ChangeInstrumentStatusDialogProps) {
  const { t } = useTranslation();
  const [instrumentName, setInstrumentName] = useState("");
  const [instrumentType, setInstrumentType] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<Instrument['status'] | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset fields when dialog opens or instrument changes to avoid stale input
  useEffect(() => {
    if (open && instrument) {
      setInstrumentName(instrument.instrument_name || "");
      setInstrumentType(instrument.instrument_type || "");
      setManufacturer(instrument.manufacturer || "");
      setLocation(instrument.location || "");
      setStatus(instrument.status); // Set default to current status
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open, instrument]);

  if (!instrument) return null;

  const handleFieldChange = (field: string, value: string, setter: (val: string) => void) => {
    setter(value);
    if (errors[field]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }
  };

  const handleConfirm = async () => {
    // Validate
    const newErrors: Record<string, string> = {};
    
    const nameError = validateInstrumentField('instrument_name', instrumentName, t);
    if (nameError) newErrors.instrument_name = nameError;

    const typeError = validateInstrumentField('instrument_type', instrumentType, t);
    if (typeError) newErrors.instrument_type = typeError;

    const manufacturerError = validateInstrumentField('manufacturer', manufacturer, t);
    if (manufacturerError) newErrors.manufacturer = manufacturerError;

    const locationError = validateInstrumentField('location', location, t);
    if (locationError) newErrors.location = locationError;

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    setIsSubmitting(true);
    try {
      const updatePayload: Partial<Instrument> = {
        instrument_name: instrumentName.trim(),
        instrument_type: instrumentType.trim(),
        manufacturer: manufacturer.trim(),
        location: location.trim(),
        status: (status || instrument.status) as Instrument['status'],
        is_active: true,
      };

      const updatedInstrument = await instrumentsService.updateInstrument(instrument._id, updatePayload);

      onStatusChange(updatedInstrument);
      toast.success(t('service.instrument.updateSuccess'));
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('service.instrument.cannotUpdateInstrument');
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
                    <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">
                    {t('service.instrument.updateDialog.title')}
                </DialogTitle>
            </div>
            <DialogDescription className="text-xs sm:text-sm text-gray-500 ml-8 sm:ml-11">
                {t('service.instrument.updateDialog.description')}
            </DialogDescription>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Tên thiết bị */}
            <div className="space-y-2">
              <Label htmlFor="instrument_name" className="text-sm font-medium text-gray-700">
                {t('service.instrument.instrumentName')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="instrument_name"
                    value={instrumentName}
                    onChange={(e) => handleFieldChange('instrument_name', e.target.value, setInstrumentName)}
                    placeholder={t('service.instrument.updateDialog.instrumentNamePlaceholder')}
                    className={`pl-10 h-11 transition-all ${errors.instrument_name ? 'border-red-300 focus-visible:ring-red-200' : 'border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200'}`}
                  />
              </div>
              {errors.instrument_name && (
                  <p className="text-xs text-red-500 mt-1 font-medium animate-in slide-in-from-top-1">{errors.instrument_name}</p>
              )}
            </div>

            {/* Loại thiết bị */}
            <div className="space-y-2">
              <Label htmlFor="instrument_type" className="text-sm font-medium text-gray-700">
                {t('service.instrument.instrumentType')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                  <Microscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="instrument_type"
                    value={instrumentType}
                    onChange={(e) => handleFieldChange('instrument_type', e.target.value, setInstrumentType)}
                    placeholder={t('service.instrument.updateDialog.instrumentTypePlaceholder')}
                    className={`pl-10 h-11 transition-all ${errors.instrument_type ? 'border-red-300 focus-visible:ring-red-200' : 'border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200'}`}
                  />
              </div>
              {errors.instrument_type && (
                  <p className="text-xs text-red-500 mt-1 font-medium animate-in slide-in-from-top-1">{errors.instrument_type}</p>
              )}
            </div>

            {/* Nhà sản xuất */}
            <div className="space-y-2">
              <Label htmlFor="manufacturer" className="text-sm font-medium text-gray-700">
                {t('service.instrument.updateDialog.manufacturer')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                  <Factory className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="manufacturer"
                    value={manufacturer}
                    onChange={(e) => handleFieldChange('manufacturer', e.target.value, setManufacturer)}
                    placeholder={t('service.instrument.updateDialog.manufacturerPlaceholder')}
                    className={`pl-10 h-11 transition-all ${errors.manufacturer ? 'border-red-300 focus-visible:ring-red-200' : 'border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200'}`}
                  />
              </div>
              {errors.manufacturer && (
                  <p className="text-xs text-red-500 mt-1 font-medium animate-in slide-in-from-top-1">{errors.manufacturer}</p>
              )}
            </div>

            {/* Vị trí */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                {t('service.instrument.location')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => handleFieldChange('location', e.target.value, setLocation)}
                    placeholder={t('service.instrument.updateDialog.locationPlaceholder')}
                    className={`pl-10 h-11 transition-all ${errors.location ? 'border-red-300 focus-visible:ring-red-200' : 'border-gray-200 focus-visible:border-blue-500 focus-visible:ring-blue-200'}`}
                  />
              </div>
              {errors.location && (
                  <p className="text-xs text-red-500 mt-1 font-medium animate-in slide-in-from-top-1">{errors.location}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 pt-2 border-t border-gray-100">
            {/* Status Section */}
            <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-700">{t('service.instrument.status')}</Label>
                <div className="relative group">
                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 group-focus-within:text-blue-500 transition-colors" />
                    <Select value={status} onValueChange={(v) => setStatus(v as Instrument['status'])}>
                    <SelectTrigger className="pl-10 h-10 sm:h-11 bg-white border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all text-sm sm:text-base">
                        <SelectValue placeholder={t('service.instrument.updateDialog.statusPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-md">
                        <SelectItem value="Ready">{t('service.instrument.statusReady')}</SelectItem>
                        <SelectItem value="Processing">{t('service.instrument.statusProcessing')}</SelectItem>
                        <SelectItem value="Inactive">{t('service.instrument.statusInactive') === 'Inactive' ? 'Bảo trì' : t('service.instrument.statusInactive')}</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
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
            onClick={handleConfirm} 
            disabled={isSubmitting}
            className="h-10 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto order-1 sm:order-2"
          >
            {isSubmitting ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('service.instrument.updateDialog.updating')}</span>
                </div>
            ) : (
                t('service.instrument.updateDialog.confirmButton')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
