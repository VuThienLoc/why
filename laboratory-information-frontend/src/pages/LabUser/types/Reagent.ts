export interface Reagent {
  id: string;
  name: string;
  lotNumber: string;
  manufacturer?: string;
  reagentType?: string;
  receivedDate: string;
  expiryDate: string;
  quantity: number;
  unitOfMeasure?: string;
  lowStockThreshold?: number;
  status: "Available" | "Low Stock" | "Expired" | "Depleted";
  storageLocation: string;
  usedInTests: string[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReagentFormData {
    reagent_name: string;
    reagent_type: string;
    quantity_current: number;
    unit_of_measure: string;
    expiration_date: string;
    received_date: string;
    low_stock_threshold: number;
    storage_location: string;
}

export const validateReagentForm = (data: ReagentFormData, t: (key: string) => string) => {
    const errors: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!data.reagent_name.trim()) errors.reagent_name = t('reagent.validation.nameRequired') || 'Tên thuốc thử là bắt buộc';
    if (!data.reagent_type.trim()) errors.reagent_type = t('reagent.validation.typeRequired') || 'Loại thuốc thử là bắt buộc';
    
    if (data.quantity_current <= 0) {
        errors.quantity_current = t('reagent.validation.quantityInvalid') || 'Số lượng phải lớn hơn 0';
    }

    if (!data.unit_of_measure.trim()) errors.unit_of_measure = t('reagent.validation.unitRequired') || 'Đơn vị tính là bắt buộc';

    // Validate Received Date
    let receivedDateObj: Date | null = null;
    if (!data.received_date) {
         errors.received_date = t('reagent.validation.receivedDateRequired') || 'Ngày nhập là bắt buộc';
    } else {
        receivedDateObj = new Date(data.received_date);
        // Reset time to midnight for accurate date comparison
        receivedDateObj.setHours(0, 0, 0, 0);
        
        if (receivedDateObj > today) {
            errors.received_date = t('reagent.validation.receivedDatePast') || 'Ngày nhập không được lớn hơn ngày hiện tại';
        }
    }

    // Validate Expiry Date
    if (!data.expiration_date) {
        errors.expiration_date = t('reagent.validation.expiryDateRequired') || 'Ngày hết hạn là bắt buộc';
    } else {
        const expiry = new Date(data.expiration_date);
        expiry.setHours(0, 0, 0, 0);

        // Check 1: Expiry must be in the future
        if (expiry <= today) {
             errors.expiration_date = t('reagent.validation.expiryDateFuture') || 'Ngày hết hạn phải là ngày trong tương lai';
        }
        
        // Check 2: Expiry must be after Received Date
        if (receivedDateObj && expiry <= receivedDateObj) {
             errors.expiration_date = t('reagent.validation.expiryDateAfterReceived') || 'Ngày hết hạn phải sau ngày nhập';
        }
    }

    // Low Stock Threshold - Must be positive (> 0)
    // Check for NaN or <= 0
    if (data.low_stock_threshold === undefined || isNaN(data.low_stock_threshold) || data.low_stock_threshold <= 0) {
        errors.low_stock_threshold = t('reagent.validation.thresholdInvalid') || 'Ngưỡng cảnh báo phải là số dương (lớn hơn 0)';
    }

    if (!data.storage_location.trim()) errors.storage_location = t('reagent.validation.locationRequired') || 'Vị trí lưu trữ là bắt buộc';

    return errors;
};
