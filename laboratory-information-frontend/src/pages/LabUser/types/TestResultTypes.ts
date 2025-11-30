// API Response Types
export interface TestResultItem {
  _id: string;
  test_order_id: string;
  test_item_id: string;
  test_type: string;
  name: string;
  code: string;
  unit: string;
  result_value: number;
  result_status: 'normal' | 'high' | 'low' | 'abnormal' | 'critical';
  reviewed: boolean;
  reviewer_comment: string;
  patient_name: string;
  createdAt: string;
}

export interface TestResultGroup {
  patient_name: string;
  test_type: string;
  totalResults: number;
  resultsSample: TestResultItem[];
}

export interface TestResultApiResponse {
  data: TestResultGroup[];
}

// UI Types for display
export interface TestResult {
  testOrderId: string;
  patientName: string;
  test_type: string;
  totalTests: number;
  results: TestResultDetail[];
  reviewedCount: number;
  pendingCount: number;
  createdAt: string;
}

export interface TestResultDetail {
  id: string;
  testItemId: string;
  test_type: string;
  name: string;
  code: string;
  unit: string;
  resultValue: number;
  resultStatus: 'normal' | 'high' | 'low' | 'abnormal' | 'critical';
  reviewed: boolean;
  reviewerComment: string;
  createdAt: string;
}

