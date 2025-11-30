export interface Sample {
  id: string;
  type: string;
  receivedDate: string;
  status: string;
}

// Interface matching ServiceTestPage Sample structure
export interface TestOrderSample {
  id: string;
  barcode: string;
  patient_id: string;
  patient_name: string;
  test_type: string;
  status: string;
  progress?: number;
  startTime?: string;
  processing?:number;
}
export interface Instrument {
  instrument_code: string;
  instrument_name: string;
  instrument_type: string;
  manufacturer: string;
  status: string;
}
export interface Reagent {
  reagent_id: string;
  reagent_name: string;
  reagent_type: string;
  status: string;
  quantity_used: number;
}
export interface TestOrder {
  _id: string;
  barcode?: string;
  patient_id: string;
  test_type: string;
  patient_name: string
  status: string;
  created_at?:string;
  created_by?:string;
  due_date?: string; 
  updated_at?:string;
  updated_by?:string;
  is_deleted?:boolean;
  deleted_at?:string;
  deleted_by?:string;
  notes?: string;
  processing?:number;
  instrument?:Instrument;
  reagents?: Reagent[];
  test_item_ids?: string[];
}

export interface TestResult {
  id?: string;
  testOrderId: string;
  resultValue: string;
  unit?: string;
  referenceRange?: string;
  comment?: string;
  attachments?: string[];
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

