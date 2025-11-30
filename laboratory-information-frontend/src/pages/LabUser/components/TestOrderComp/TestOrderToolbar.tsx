import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '../../../../components/common/input';
import Button from '../../../../components/common/button';
import {useTranslation} from 'react-i18next'
interface TestOrderToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateTestOrder?: () => void;
}

const TestOrderToolbar: React.FC<TestOrderToolbarProps> = ({
  searchTerm,
  onSearchChange,
  onCreateTestOrder,
}) => {
  const {t} = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold">{t('testOrder.testOrderList')}</h2>
        <p className="text-sm sm:text-base text-gray-600">{t('testOrder.subTestOrderList')}</p>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-4 sm:gap-0">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t('testOrder.searchPlaceholder')}
            className="pl-10 w-full sm:w-64 md:w-80"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {onCreateTestOrder && (
          <Button
            onClick={onCreateTestOrder}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">{t('testOrder.createTestOrder')}</span>
            <span className="sm:hidden">Create</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default TestOrderToolbar;

