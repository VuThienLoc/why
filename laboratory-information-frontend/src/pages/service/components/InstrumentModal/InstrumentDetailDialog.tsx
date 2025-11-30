import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../../../../components/common/dialog";
import Button from "../../../../components/common/button";
import Badge from "../../../../components/common/badge";
import { Label } from "../../../../components/common/label";
import type { Instrument } from "../../types/Instrument";
import { instrumentsService } from "../../../../service/instrumentsService";
import { toast } from "sonner";
import {
    Monitor,
    Calendar,
    AlertCircle,
    Loader2,
    Tag,
    Microscope,
    Factory,
    MapPin,
    Activity,
    Hash,
    User
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface InstrumentDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    instrumentId: string | null;
}

export function InstrumentDetailDialog({
    open,
    onOpenChange,
    instrumentId,
}: InstrumentDetailDialogProps) {
    const { t } = useTranslation();
    const [instrument, setInstrument] = useState<Instrument | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && instrumentId) {
            setIsLoading(true);
            setError(null);
            instrumentsService
                .getInstrumentById(instrumentId)
                .then((data) => {
                    setInstrument(data);
                    setIsLoading(false);
                })
                .catch((err) => {
                    const message = err instanceof Error ? err.message : t('service.instrument.cannotLoadInstrumentInfo');
                    setError(message);
                    setIsLoading(false);
                    toast.error(message);
                });
        } else if (!open) {
            setInstrument(null);
            setError(null);
        }
    }, [open, instrumentId, t]);

    const getStatusBadge = (status: string) => {
        const map: Record<string, { text: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
            Ready: { text: t('service.instrument.statusReady'), variant: "success" },
            Processing: { text: t('service.instrument.statusProcessing'), variant: "warning" },
            Inactive: { text: t('service.instrument.statusInactive') === 'Inactive' ? 'Bảo trì' : t('service.instrument.statusInactive'), variant: "destructive" },
        };
        const data = map[status] || { text: status, variant: "outline" };
        return <Badge variant={data.variant}>{data.text}</Badge>;
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl overflow-hidden border-0 shadow-2xl sm:rounded-2xl p-0 max-h-[90vh] flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
                
                <DialogHeader className="pb-4 sm:pb-6 border-b border-gray-100 px-4 sm:px-6 pt-6 sm:pt-8">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg flex-shrink-0">
                            <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                        <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">
                            {t('service.instrument.detail.title')}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs sm:text-sm text-gray-500 ml-8 sm:ml-11">
                        {t('service.instrument.detail.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 sm:p-6 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="p-4 bg-blue-50 rounded-full">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                            <span className="text-gray-600 font-medium">{t('service.instrument.detail.loading')}</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="p-4 bg-red-50 rounded-full">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <p className="text-red-600 font-medium">{error}</p>
                        </div>
                    ) : !instrument ? (
                        <div className="flex items-center justify-center py-8 sm:py-12">
                            <p className="text-sm sm:text-base text-gray-600">{t('service.instrument.detail.notFound')}</p>
                        </div>
                    ) : (
                        <div className="space-y-6 sm:space-y-8">
                            {/* Basic Information Section */}
                            <div>
                                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                                    {t('service.instrument.detail.basicInfo')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {/* Instrument Code */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t('service.instrument.detail.instrumentCode')}
                                        </Label>
                                        <div className="relative group">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <div className="pl-10 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm font-mono">
                                                {instrument.instrument_code}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Instrument Name */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t('service.instrument.instrumentName')}
                                        </Label>
                                        <div className="relative group">
                                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <div className="pl-10 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm">
                                                {instrument.instrument_name}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Instrument Type */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t('service.instrument.instrumentType')}
                                        </Label>
                                        <div className="relative group">
                                            <Microscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <div className="pl-10 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm">
                                                {instrument.instrument_type}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t('service.instrument.status')}
                                        </Label>
                                        <div className="relative group">
                                            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <div className="pl-10 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2">
                                                {getStatusBadge(instrument.status)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location & Manufacturer Section */}
                            <div>
                                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
                                    <Factory className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                                    {t('service.instrument.detail.locationInfo')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {/* Manufacturer */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t('service.instrument.detail.manufacturer')}
                                        </Label>
                                        <div className="relative group">
                                            <Factory className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <div className="pl-10 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm">
                                                {instrument.manufacturer || t('service.instrument.detail.noInfo')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t('service.instrument.location')}
                                        </Label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <div className="pl-10 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm">
                                                {instrument.location || t('service.instrument.detail.noInfo')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Metadata Section */}
                            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white rounded-md border border-gray-200 shadow-sm">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                {t('service.instrument.detail.createdAt')}
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 mt-0.5">
                                                {instrument.created_at instanceof Date
                                                    ? instrument.created_at.toLocaleDateString("vi-VN")
                                                    : new Date(instrument.created_at).toLocaleDateString("vi-VN")}
                                            </p>
                                            {instrument.created_by && (
                                                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                                    <User className="w-3 h-3" />
                                                    <span>{instrument.created_by}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white rounded-md border border-gray-200 shadow-sm">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                {t('service.instrument.detail.updatedAt')}
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 mt-0.5">
                                                {instrument.updated_at instanceof Date
                                                    ? instrument.updated_at.toLocaleDateString("vi-VN")
                                                    : new Date(instrument.updated_at).toLocaleDateString("vi-VN")}
                                            </p>
                                            {instrument.updated_by && (
                                                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                                    <User className="w-3 h-3" />
                                                    <span>{instrument.updated_by}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100">
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)}
                        className="h-10 px-4 sm:px-6 border-gray-200 hover:bg-white hover:text-gray-900 hover:border-gray-300 w-full sm:w-auto"
                    >
                        {t('service.instrument.cancel')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
