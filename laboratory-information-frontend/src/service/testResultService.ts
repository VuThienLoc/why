import axios from 'axios';
import type { TestResultApiResponse, TestResultGroup, TestResult, TestResultDetail, TestResultItem } from '../pages/labuser/types/TestResultTypes';

const TEST_RESULT_API_BASE = import.meta.env.VITE_API_TEST_ORDER_SERVICE_URL || 'http://localhost:5002';

// Interface for the flat response item from getResultsByUserId/PatientId
export interface TestResultFlatItem {
  _id: string;
  test_order_id: string;
  test_item_id: string;
  user_id: string;
  patient_id: string;
  test_type: string;
  name: string;
  instrument_name: string;
  patient_name: string;
  reagent_names: string[];
  code: string;
  unit: string;
  result_value: number;
  result_status: 'normal' | 'high' | 'low' | 'abnormal' | 'critical';
  reviewed: boolean;
  reviewer_comment: string;
  is_deleted: boolean;
  deleted_at: string | null;
  createdAt: string;
  updatedAt: string;
}

// Create axios instance for test result service
const testResultClient = axios.create({
  baseURL: TEST_RESULT_API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Transform API response to UI format
const transformTestResultGroup = (group: TestResultGroup): TestResult => {
  const results: TestResultDetail[] = group.resultsSample.map((item: TestResultItem) => {
    return {
      id: item._id,
      testItemId: item.test_item_id,
      test_type: item.test_type,
      name: item.name,
      code: item.code,
      unit: item.unit,
      resultValue: item.result_value,
      resultStatus: item.result_status,
      reviewed: item.reviewed,
      reviewerComment: item.reviewer_comment,
      createdAt: item.createdAt,
    };
  });

  const reviewedCount = results.filter(r => r.reviewed).length;
  const pendingCount = results.filter(r => !r.reviewed).length;

  return {
    testOrderId: group.resultsSample[0]?.test_order_id || '',
    patientName: group.patient_name,
    test_type: group.test_type,
    totalTests: group.totalResults,
    results,
    reviewedCount,
    pendingCount,
    createdAt: group.resultsSample[0]?.createdAt || new Date().toISOString(),
  };
};

// Helper to group flat items by test_order_id
const groupTestResults = (flatItems: TestResultFlatItem[]): TestResult[] => {
  const groups: { [key: string]: TestResultFlatItem[] } = {};

  flatItems.forEach(item => {
    if (!groups[item.test_order_id]) {
      groups[item.test_order_id] = [];
    }
    groups[item.test_order_id].push(item);
  });

  return Object.values(groups).map(items => {
    const firstItem = items[0];
    const results: TestResultDetail[] = items.map(item => ({
      id: item._id,
      testItemId: item.test_item_id,
      test_type: item.test_type,
      name: item.name,
      code: item.code,
      unit: item.unit,
      resultValue: item.result_value,
      resultStatus: item.result_status,
      reviewed: item.reviewed,
      reviewerComment: item.reviewer_comment,
      createdAt: item.createdAt,
    }));

    const reviewedCount = results.filter(r => r.reviewed).length;
    const pendingCount = results.filter(r => !r.reviewed).length;

    return {
      testOrderId: firstItem.test_order_id,
      patientName: firstItem.patient_name,
      test_type: firstItem.test_type, // Assuming all items in order have same test_type or taking first
      totalTests: results.length,
      results,
      reviewedCount,
      pendingCount,
      createdAt: firstItem.createdAt,
    };
  });
};

export class TestResultService {
  async getAllTestResults(): Promise<TestResult[]> {
    try {
      // Tải tất cả dữ liệu và phân trang ở frontend
      const response = await testResultClient.get<TestResultApiResponse>(`${TEST_RESULT_API_BASE}/api/testResult/all`, {
        params: { page: 1, limit: 1000 }
      });

      const results = response.data.data.map(transformTestResultGroup);
      
      // Sắp xếp theo createdAt từ mới nhất đến cũ nhất
      return results.sort((a: TestResult, b: TestResult) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Mới nhất trước
      });
    } catch (error) {
      console.error('Error fetching test results:', error);
      throw new Error('Không thể tải danh sách kết quả xét nghiệm');
    }
  }

  async updateTestResult(
    id: string,
    updateData: { result_value?: number; reviewer_comment?: string; reviewed?: boolean }
  ): Promise<void> {
    try {
      await testResultClient.put(`${TEST_RESULT_API_BASE}/api/testResult/update/${id}`, updateData);
    } catch (error) {
      console.error('Error updating test result:', error);
      throw new Error('Không thể cập nhật kết quả xét nghiệm');
    }
  }

  async reviewTestResult(id: string, comment: string): Promise<void> {
    try {
      await testResultClient.put(`${TEST_RESULT_API_BASE}/api/testResult/update/${id}`, {
        reviewed: true,
        reviewer_comment: comment,
      });
    } catch (error) {
      console.error('Error reviewing test result:', error);
      throw new Error('Không thể duyệt kết quả xét nghiệm');
    }
  }

  async deleteTestResult(test_order_id: string): Promise<void> {
    try {
      await testResultClient.delete(`${TEST_RESULT_API_BASE}/api/testResult/delete/${test_order_id}`);
    } catch (error) {
      console.error('Error deleting test result:', error);
      throw new Error('Không thể xóa kết quả xét nghiệm');
    }
  }

  async getResultsByUserId(userId: string, page: number = 1, limit: number = 5): Promise<{
    data: TestResult[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      // Fetch all results to handle grouping and pagination on client side
      // This is a workaround because backend paginates by items, not by orders
      const response = await testResultClient.get<{
        data: TestResultFlatItem[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(`${TEST_RESULT_API_BASE}/api/testResult/getResultsByUserId/${userId}`, {
        params: { page: 1, limit: 1000 }
      });

      const allGroupedResults = groupTestResults(response.data.data);
      
      // Sort by createdAt descending
      allGroupedResults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const totalGroups = allGroupedResults.length;
      const totalPages = Math.ceil(totalGroups / limit);
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = allGroupedResults.slice(startIndex, endIndex);

      return {
        data: paginatedResults,
        pagination: {
          page,
          limit,
          total: totalGroups,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching test results by user ID:', error);
      throw new Error('Không thể tải kết quả xét nghiệm của người dùng');
    }
  }

  async getResultsByPatientId(patientId: string): Promise<{
    success: boolean;
    data: Array<Record<string, unknown>>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const response = await testResultClient.get(`${TEST_RESULT_API_BASE}/api/testResult/getResultsByPatientId/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching test results by patient ID:', error);
      throw new Error('Không thể tải kết quả xét nghiệm của bệnh nhân');
    }
  }
}

export const testResultService = new TestResultService();