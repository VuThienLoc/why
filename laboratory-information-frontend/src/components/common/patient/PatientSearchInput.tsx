import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../input';
import { patientService, type PatientOption } from '../../../service/patientService';
import { useTranslation } from 'react-i18next';

interface PatientSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (patient: PatientOption) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  disabled?: boolean;
  selectedPatient?: PatientOption | null;
}

export const PatientSearchInput: React.FC<PatientSearchInputProps> = ({
  value,
  onChange,
  onSelect,
  placeholder,
  className,
  error,
  disabled,
  selectedPatient
}) => {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Handle search debounce
  useEffect(() => {
    if (searchDebounce.current) {
      clearTimeout(searchDebounce.current);
    }

    // Don't search if the value matches the selected patient's name exactly
    // This prevents searching again when a user selects a patient
    if (selectedPatient && value === (selectedPatient.fullName ?? '')) {
      return;
    }

    if (!value.trim()) {
      setSuggestions([]);
      setLoading(false);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      return;
    }

    setShowSuggestions(true);
    setLoading(true);

    let active = true;
    searchDebounce.current = window.setTimeout(async () => {
      try {
        const list = await patientService.getAllPatients({
          search: value.trim(),
          limit: 10,
          page: 1,
          isActive: true,
          populateUser: true,
        });
        if (!active) return;
        setSuggestions(list);
        setHighlightedIndex(list.length ? 0 : -1);
      } catch {
        if (!active) return;
        setSuggestions([]);
        setHighlightedIndex(-1);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      if (searchDebounce.current) {
        clearTimeout(searchDebounce.current);
        searchDebounce.current = null;
      }
    };
  }, [value, selectedPatient]);

  // Handle click outside
  useEffect(() => {
    if (!showSuggestions) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || !suggestions.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === 'Enter') {
      if (highlightedIndex >= 0) {
        event.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (event.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSelect = (patient: PatientOption) => {
    onSelect(patient);
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length) {
            setShowSuggestions(true);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || t('testOrder.searchPatientByName')}
        disabled={disabled}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
          error 
            ? 'border-red-500 bg-red-50' 
            : 'border-gray-300 bg-white hover:border-gray-400'
        } disabled:bg-gray-50 disabled:cursor-not-allowed ${className || ''}`}
      />
      
      {showSuggestions && (
        <div className="absolute z-[70] mt-1 w-full overflow-hidden rounded-md border border-border bg-white shadow-lg">
          {loading ? (
            <div className="px-4 py-2 text-sm text-muted-foreground">Đang tìm...</div>
          ) : suggestions.length ? (
            <ul className="max-h-64 overflow-auto py-1 text-sm">
              {suggestions.map((patient, index) => (
                <li key={patient.id}>
                  <button
                    type="button"
                    className={`flex w-full flex-col items-start gap-0.5 px-4 py-2 text-left transition-colors ${
                      index === highlightedIndex ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100 focus-visible:bg-gray-100'
                    }`}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleSelect(patient);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span className="text-sm font-medium">{patient.fullName}</span>
                    {patient.patientCode && (
                      <span className="text-xs opacity-80">{t('patient.patientCode')}: {patient.patientCode}</span>
                    )}
                    {patient.email && (
                      <span className="text-xs opacity-80">Email: {patient.email}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-2 text-sm text-muted-foreground">{t('patient.noPatientFound')}</div>
          )}
        </div>
      )}
    </div>
  );
};
