import React from 'react';
import { Eye, Edit2, Trash2, Package, AlertTriangle } from 'lucide-react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../../../components/common/table';
import type { Reagent } from '@/pages/labuser/types/Reagent';
import { getStatusBadge, formatDate, isExpired, isExpiringSoon, getRowClassName } from '../../utils/reagentUtils';
import { useTranslation } from 'react-i18next';

interface ReagentTableProps {
  reagents: Reagent[];
  isLoading?: boolean;
  onView: (reagent: Reagent) => void;
  onEdit: (reagent: Reagent) => void;
  onDelete: (reagent: Reagent) => void;
}

const ReagentTable: React.FC<ReagentTableProps> = ({ reagents, isLoading = false, onView, onEdit, onDelete }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {t('reagent.table.name')}
              </TableHead>
              <TableHead className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {t('reagent.table.expiryDate')}
              </TableHead>
              <TableHead className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {t('reagent.table.quantity')}
              </TableHead>
              <TableHead className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {t('reagent.table.status')}
              </TableHead>
              <TableHead className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                {t('reagent.table.storageLocation')}
              </TableHead>
              <TableHead className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {t('reagent.table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-500">{t('reagent.table.loading')}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : reagents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                {t('reagent.table.noReagents')}
              </TableCell>
            </TableRow>
          ) : (
            reagents.map((reagent) => (
            <TableRow key={reagent.id} className={getRowClassName(reagent)}>
              <TableCell className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                <div className="max-w-[150px] sm:max-w-none truncate" title={reagent.name}>
                  {reagent.name}
                </div>
              </TableCell>
              <TableCell className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                <div className="flex items-center gap-1">
                  {isExpired(reagent.expiryDate) && (
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                  )}
                  {isExpiringSoon(reagent.expiryDate) && !isExpired(reagent.expiryDate) && (
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
                  )}
                  <span className="text-xs sm:text-sm">{formatDate(reagent.expiryDate)}</span>
                </div>
              </TableCell>
              <TableCell className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                <div className="flex items-center gap-1">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  <span>{reagent.quantity}</span>
                </div>
              </TableCell>
              <TableCell className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                {getStatusBadge(reagent.status)}
              </TableCell>
              <TableCell className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                <div className="max-w-[120px] truncate" title={reagent.storageLocation}>
                  {reagent.storageLocation}
                </div>
              </TableCell>
              <TableCell className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => onView(reagent)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                    title={t('reagent.table.viewDetails')}
                  >
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(reagent)}
                    className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                    title={t('reagent.table.edit')}
                  >
                    <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(reagent)}
                    className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                    title={t('reagent.table.delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
};

export default ReagentTable;

