export interface TestResult {
    id: string;
    name: string;
    orderDate: string;
    completionDate?: string;
    dueDate?: string;
    status: 'hoàn thành' | 'đang xử lý';
    cost: string;
    testResult?: string;
  }
  export const mockTestResults: TestResult[] = [
    {
      id: 'XN-001',
      name: 'Xét nghiệm máu tổng quát',
      orderDate: '15/01/2024',
      completionDate: '16/01/2024',
      status: 'hoàn thành',
      cost: '500,000 VNĐ',
      testResult: 'Kết quả bình thường. Tất cả các chỉ số đều trong phạm vi cho phép.',
    },
    {
      id: 'XN-002',
      name: 'Xét nghiệm nước tiểu',
      orderDate: '20/01/2024',
      dueDate: '22/01/2024',
      status: 'đang xử lý',
      cost: '300,000 VNĐ',
    },
    {
      id: 'XN-003',
      name: 'Xét nghiệm đường huyết',
      orderDate: '10/01/2024',
      completionDate: '11/01/2024',
      status: 'hoàn thành',
      cost: '200,000 VNĐ',
      testResult: 'Chỉ số đường huyết: 95 mg/dL (Bình thường)',
    },
  ];