import React from 'react';
import { Search, PlusCircle, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ReagentToolbarProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onAddClick: () => void;
}

const ReagentToolbar: React.FC<ReagentToolbarProps> = ({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onAddClick,
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('reagent.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-8 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="All">{t('reagent.status.all')}</option>
              <option value="Available">{t('reagent.status.available')}</option>
              <option value="Low Stock">{t('reagent.status.lowStock')}</option>
              <option value="Expired">{t('reagent.status.expired')}</option>
              <option value="Depleted">{t('reagent.status.depleted')}</option>
            </select>
          </div>
        </div>

        <button
          onClick={onAddClick}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="whitespace-nowrap">{t('reagent.addNew')}</span>
        </button>
      </div>
    </div>
  );
};

export default ReagentToolbar;

