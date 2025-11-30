import { useState, useEffect } from "react";
import type { Instrument } from "./types/Instrument";
import {
    Monitor,
    Plus,
    CheckCircle,
    Wrench,
    PlayCircle,
    Trash2,
    Eye,
    Search,
} from "lucide-react";
import Button from "../../components/common/button";
import { Input } from "../../components/common/input";
import Badge from "../../components/common/badge";
import Pagination from "../../components/common/pagination";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "../../components/common/card";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "../../components/common/table";
import { toast } from "sonner";
import { InstrumentDetailDialog } from "./components/InstrumentModal/InstrumentDetailDialog";
import { AddInstrumentDialog } from "./components/InstrumentModal/InstrumentAdd";
import { ChangeInstrumentStatusDialog } from "./components/InstrumentModal/InstrumentUpdate";
import { DeleteInstrumentConfirmDialog } from "./components/InstrumentModal/InstrumentDeleteModal";
import { instrumentsService } from "../../service/instrumentsService";
import { useTranslation } from "react-i18next";

export default function ServiceInstrumentPage() {
    const { t } = useTranslation();
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const [totalInstruments, setTotalInstruments] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [instrumentSearchTerm, setInstrumentSearchTerm] = useState("");
    const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | null>(null);
    const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [showChangeModeDialog, setShowChangeModeDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [instrumentToDelete, setInstrumentToDelete] = useState<Instrument | null>(null);
    const [stats, setStats] = useState({ total: 0, active: 0, ready: 0 });
    const itemsPerPage = 10;

    // Load stats on mount
    useEffect(() => {
        (async () => {
            try {
                const statsData = await instrumentsService.getInstrumentStats();
                setStats(statsData);
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        })();
    }, []);

    // Load instruments with search or pagination
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            try {
                if (instrumentSearchTerm.trim()) {
                    // Use search API when there's a search term
                    const response = await instrumentsService.searchInstruments(
                        instrumentSearchTerm.trim(),
                        currentPage,
                        itemsPerPage
                    );
                    setInstruments(response.data);
                    setTotalInstruments(response.total);
                } else {
                    // Use regular getAllInstruments when no search term
                    const response = await instrumentsService.getAllInstruments(currentPage, itemsPerPage);
                    setInstruments(response.data);
                    setTotalInstruments(response.total);
                }
                } catch (error) {
                const message = error instanceof Error ? error.message : t('service.instrument.cannotLoadInstruments');
                toast.error(message);
            }
        }, 500); // Debounce 500ms

        return () => clearTimeout(timeoutId);
    }, [currentPage, instrumentSearchTerm]);


    const handleChangeInstrumentStatus = async () => {
        // Refresh the current page to get updated data
        try {
            if (instrumentSearchTerm.trim()) {
                const response = await instrumentsService.searchInstruments(
                    instrumentSearchTerm.trim(),
                    currentPage,
                    itemsPerPage
                );
                setInstruments(response.data);
                setTotalInstruments(response.total);
            } else {
                const response = await instrumentsService.getAllInstruments(currentPage, itemsPerPage);
                setInstruments(response.data);
                setTotalInstruments(response.total);
            }
            // Reload stats
            const statsData = await instrumentsService.getInstrumentStats();
            setStats(statsData);
                } catch (error) {
                const message = error instanceof Error ? error.message : t('service.instrument.cannotLoadInstruments');
                toast.error(message);
            }
    };

    const handleAddInstrument = async () => {
            toast.success(t('service.instrument.addSuccess'));
        // Refresh the current page to get updated data
        try {
            if (instrumentSearchTerm.trim()) {
                const response = await instrumentsService.searchInstruments(
                    instrumentSearchTerm.trim(),
                    currentPage,
                    itemsPerPage
                );
                setInstruments(response.data);
                setTotalInstruments(response.total);
            } else {
                const response = await instrumentsService.getAllInstruments(currentPage, itemsPerPage);
                setInstruments(response.data);
                setTotalInstruments(response.total);
            }
            // Reload stats
            const statsData = await instrumentsService.getInstrumentStats();
            setStats(statsData);
                } catch (error) {
                const message = error instanceof Error ? error.message : t('service.instrument.cannotLoadInstruments');
                toast.error(message);
            }
    };
    const handleOpenDetail = (instrument: Instrument) => {
        setSelectedInstrumentId(instrument._id);
        setOpenDialog(true);
    };

    const handleDeleteClick = (instrument: Instrument) => {
        setInstrumentToDelete(instrument);
        setShowDeleteDialog(true);
    };

    const handleDeleteInstrument = async () => {
        if (!instrumentToDelete) return;
        
        try {
            await instrumentsService.deleteInstrument(instrumentToDelete._id);
            // If the deleted instrument was opened in detail, close it
            if (selectedInstrumentId === instrumentToDelete._id) {
                setSelectedInstrumentId(null);
                setOpenDialog(false);
            }
            toast.success(t('service.instrument.deleteSuccess'));
            setShowDeleteDialog(false);
            setInstrumentToDelete(null);
            
            // Refresh the current page to get updated data
            if (instrumentSearchTerm.trim()) {
                const response = await instrumentsService.searchInstruments(
                    instrumentSearchTerm.trim(),
                    currentPage,
                    itemsPerPage
                );
                setInstruments(response.data);
                setTotalInstruments(response.total);
            } else {
                const response = await instrumentsService.getAllInstruments(currentPage, itemsPerPage);
                setInstruments(response.data);
                setTotalInstruments(response.total);
            }
            // Reload stats
            const statsData = await instrumentsService.getInstrumentStats();
            setStats(statsData);
        } catch (error) {
            const message = error instanceof Error ? error.message : t('service.instrument.cannotDeleteInstrument');
            toast.error(message);
        }
    };

    // Reset to page 1 when search term changes
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [instrumentSearchTerm]);

    return (
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                <div>
                    <h2 className="text-lg sm:text-xl font-semibold">{t('service.instrument.title')}</h2>
                    <p className="text-sm sm:text-base text-gray-600">
                        {t('service.instrument.subtitle')}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-4">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder={t('service.instrument.searchPlaceholder')}
                            className="pl-10 w-full sm:w-64 md:w-80"
                            value={instrumentSearchTerm}
                            onChange={(e) => setInstrumentSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                         className="
    flex items-center justify-center
    bg-gradient-to-r from-blue-500 to-indigo-600
    text-white font-medium shadow-md
    px-4 py-2 rounded-lg
    hover:from-blue-600 hover:to-indigo-700
    hover:shadow-lg
    focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1
    transition-all duration-200 ease-in-out
    w-full sm:w-auto
  "
                        onClick={() => setOpenAddDialog(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('service.instrument.addInstrument')}
                    </Button>
                </div>
            </div>

            {/* Thống kê */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card className="glass-strong hover-lift">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('service.instrument.totalInstruments')}</p>
                                <p className="text-xl sm:text-2xl text-blue-600">{stats.total}</p>
                            </div>
                            <Monitor className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0 ml-2" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-strong hover-lift">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('service.instrument.activeInstruments')}</p>
                                <p className="text-xl sm:text-2xl text-green-600">{stats.active}</p>
                            </div>
                            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0 ml-2" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-strong hover-lift">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('service.instrument.readyInstruments')}</p>
                                <p className="text-xl sm:text-2xl text-blue-600">{stats.ready}</p>
                            </div>
                            <PlayCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0 ml-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Danh sách thiết bị */}
            <Card className="glass-strong hover-lift">
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-base sm:text-lg">{t('service.instrument.instrumentList')}</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                {t('service.instrument.displayInstruments', { current: instruments.length, total: totalInstruments })}{instrumentSearchTerm ? ` ${t('service.instrument.searching', { term: instrumentSearchTerm })}` : ''}
                            </CardDescription>
                        </div>
                        {instrumentSearchTerm && (
                            <Button variant="outline" size="sm" onClick={() => setInstrumentSearchTerm("")} className="w-full sm:w-auto">
                                {t('service.instrument.clearFilter')}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    {instruments.length > 0 ? (
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs sm:text-sm">{t('service.instrument.instrumentName')}</TableHead>
                                            <TableHead className="text-xs sm:text-sm hidden sm:table-cell">{t('service.instrument.instrumentType')}</TableHead>
                                            <TableHead className="text-xs sm:text-sm hidden md:table-cell">{t('service.instrument.location')}</TableHead>
                                            <TableHead className="text-xs sm:text-sm">{t('service.instrument.status')}</TableHead>   
                                            <TableHead className="text-xs sm:text-sm">{t('service.instrument.actions')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {instruments.map((instrument) => (
                                            <TableRow key={instrument._id}>
                                                <TableCell className="text-xs sm:text-sm">
                                                    <div className="font-medium">{instrument.instrument_name}</div>
                                                    <div className="sm:hidden text-xs text-gray-500 mt-1">{instrument.instrument_type}</div>
                                                    <div className="md:hidden text-xs text-gray-500 mt-1">{instrument.location}</div>
                                                </TableCell>
                                                <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{instrument.instrument_type}</TableCell>
                                                <TableCell className="text-xs sm:text-sm hidden md:table-cell">{instrument.location}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            instrument.status === "Ready"
                                                                ? "success"
                                                                : instrument.status === "Processing"
                                                                    ? "warning"
                                                                    : "destructive"
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {instrument.status === "Ready"
                                                            ? t('service.instrument.statusReady')
                                                            : instrument.status === "Processing"
                                                                ? t('service.instrument.statusProcessing')
                                                                : t('service.instrument.statusInactive')}
                                                    </Badge>
                                                </TableCell>
                                                
                                                <TableCell>
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleOpenDetail(instrument)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedInstrument(instrument);
                                                                setShowChangeModeDialog(true);
                                                            }}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(instrument)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 sm:py-12">
                            <Monitor className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                            <h3 className="text-base sm:text-lg text-gray-900 mb-2">{t('service.instrument.noInstrumentsFound')}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-4">
                                {t('service.instrument.noInstrumentsFoundDescription')}
                            </p>
                            <Button variant="outline" onClick={() => setInstrumentSearchTerm("")} className="text-xs sm:text-sm">
                                {t('service.instrument.clearFilter')}
                            </Button>
                        </div>
                    )}
                    {instruments.length > 0 && Math.ceil(totalInstruments / itemsPerPage) > 1 && (
                        <div className="mt-4 flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(totalInstruments / itemsPerPage)}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
            <ChangeInstrumentStatusDialog
                open={showChangeModeDialog}
                onOpenChange={setShowChangeModeDialog}
                instrument={selectedInstrument}
                onStatusChange={handleChangeInstrumentStatus}
            />

            <AddInstrumentDialog
                open={openAddDialog}
                onOpenChange={setOpenAddDialog}
                onAddInstrument={handleAddInstrument}
            />
            <InstrumentDetailDialog
                open={openDialog}
                onOpenChange={setOpenDialog}
                instrumentId={selectedInstrumentId} 
            />
            <DeleteInstrumentConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                instrument={instrumentToDelete}
                onConfirm={handleDeleteInstrument}
            />
        </div>
    );
}
