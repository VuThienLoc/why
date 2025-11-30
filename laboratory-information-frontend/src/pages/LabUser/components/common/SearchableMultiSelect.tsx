import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

interface ReagentUsage {
  reagent_id: string;
  quantity_used: number;
}

interface ReagentOption {
  id: string;
  name: string;
  lotNumber?: string;
  quantity?: number;
  [key: string]: unknown;
}

interface SearchableMultiSelectProps {
  options: ReagentOption[];
  value: ReagentUsage[];
  onChange: (value: ReagentUsage[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: string;
}

export const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn thuốc thử...',
  searchPlaceholder = 'Tìm kiếm thuốc thử...',
  disabled = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedIds = value.map(v => v.reagent_id);
  const selectedOptions = options.filter(opt => selectedIds.includes(opt.id));

  const filteredOptions = options.filter(opt =>
    !selectedIds.includes(opt.id) &&
    (opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     opt.lotNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => inputRef.current?.focus(), 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAdd = (reagentId: string) => {
    const newUsage: ReagentUsage = {
      reagent_id: reagentId,
      quantity_used: 1,
    };
    onChange([...value, newUsage]);
    setSearchTerm('');
  };

  const handleRemove = (reagentId: string) => {
    onChange(value.filter(v => v.reagent_id !== reagentId));
  };

  const handleQuantityChange = (reagentId: string, quantity: number) => {
    onChange(
      value.map(v =>
        v.reagent_id === reagentId
          ? { ...v, quantity_used: Math.max(0, quantity) }
          : v
      )
    );
  };

  return (
    <div className="space-y-2">
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full rounded-lg border px-3 py-2.5 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            error
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          } disabled:bg-gray-50 disabled:cursor-not-allowed`}
        >
          <span className="text-gray-500">
            {selectedOptions.length > 0
              ? `Đã chọn ${selectedOptions.length} thuốc thử`
              : placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Options list */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  {searchTerm ? 'Không tìm thấy kết quả' : 'Tất cả đã được chọn'}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleAdd(option.id)}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-blue-50 transition-colors text-gray-900"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{option.name}</div>
                        {option.lotNumber && (
                          <div className="text-xs text-gray-500">Lô: {option.lotNumber}</div>
                        )}
                      </div>
                      {option.quantity !== undefined && (
                        <div className="text-xs text-gray-400">
                          SL: {option.quantity}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected reagents with quantity inputs */}
      {selectedOptions.length > 0 && (
        <div className="space-y-2 mt-2">
          {selectedOptions.map((option) => {
            const usage = value.find(v => v.reagent_id === option.id);
            return (
              <div
                key={option.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {option.name}
                  </div>
                  {option.lotNumber && (
                    <div className="text-xs text-gray-500">Lô: {option.lotNumber}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 whitespace-nowrap">Số lượng:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={usage?.quantity_used ?? 1}
                    onChange={(e) =>
                      handleQuantityChange(option.id, parseFloat(e.target.value) || 0)
                    }
                    disabled={disabled}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(option.id)}
                    disabled={disabled}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

