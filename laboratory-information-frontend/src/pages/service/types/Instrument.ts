export interface Instrument {
  _id: string;
  instrument_code: string;
  instrument_name: string;
  instrument_type: string;
  manufacturer?: string;
  status: "Ready" | "Processing" | "Inactive";
  is_active: boolean;
  location?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
  is_deleted: boolean;
  deleted_at?: Date;
  deleted_by?: string;
}

export const validateInstrumentField = (field: string, value: string, t: (key: string) => string): string | undefined => {
  switch (field) {
      case 'instrument_name':
          if (!value.trim()) {
              return t('service.instrument.validation.instrumentNameRequired');
          }
          if (value.trim().length < 3) {
              return t('service.instrument.validation.instrumentNameMinLength');
          }
          if (value.trim().length > 200) {
              return t('service.instrument.validation.instrumentNameMaxLength');
          }
          break;
      case 'instrument_type':
          if (!value.trim()) {
              return t('service.instrument.validation.instrumentTypeRequired');
          }
          if (value.trim().length < 3) {
              return t('service.instrument.validation.instrumentTypeMinLength');
          }
          if (value.trim().length > 100) {
              return t('service.instrument.validation.instrumentTypeMaxLength');
          }
          break;
      case 'manufacturer':
          if (!value.trim()) {
              return t('service.instrument.validation.manufacturerRequired');
          }
          if (value.trim().length < 2) {
              return t('service.instrument.validation.manufacturerMinLength');
          }
          if (value.trim().length > 100) {
              return t('service.instrument.validation.manufacturerMaxLength');
          }
          break;
      case 'location':
          if (!value.trim()) {
              return t('service.instrument.validation.locationRequired');
          }
          if (value.trim().length < 2) {
              return t('service.instrument.validation.locationMinLength');
          }
          if (value.trim().length > 100) {
              return t('service.instrument.validation.locationMaxLength');
          }
          break;
  }
  return undefined;
};