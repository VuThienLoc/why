import React from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { Card, CardContent } from '../../components/common/card';
import { ClipboardList, Clock, CheckCircle } from 'lucide-react';
import { mockTestResults } from '@/pages/normaluser/type/TestResult';
const Dashboard: React.FC = () => {
  const { user } = useAuthContext();

  const total = mockTestResults.length;
  const completed = mockTestResults.filter(t => t.status === 'hoàn thành').length;
  const pending = mockTestResults.filter(t => t.status === 'đang xử lý').length;
  const getGreeting = (name: string | undefined): string => {
    if (!name) return 'Chào mừng trở lại';
    return `Chào mừng trở lại, ${name}`;
  };


  return (
    <div className="space-y-6">

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          {getGreeting(user?.name)}
        </h1>
        <p className="text-sm text-gray-500">Đây là tổng quan về hoạt động gần đây của bạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng số xét nghiệm</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{total}</h3>
                <p className="text-sm text-gray-500 mt-1">Tất cả</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Xét nghiệm đang chờ</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{pending}</h3>
                <p className="text-sm text-gray-500 mt-1">Đang xử lý</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Xét nghiệm hoàn thành</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{completed}</h3>
                <p className="text-sm text-gray-500 mt-1">Hoàn thành thành công</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Kết quả xét nghiệm gần đây
              <p className="text-sm text-gray-600 font-normal mt-1">
                Kết quả xét nghiệm mới nhất của bạn
              </p>
            </h2>

            <div className="space-y-4">
              {mockTestResults.map((test) => (
                <div key={test.id} className="flex items-start space-x-4">
                  <div className="mt-1">
                    {test.status === 'hoàn thành' ? (
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                      >
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        <path d="M9 12l2 2 4-4" strokeWidth="2" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5 text-yellow-500"
                        fill="none"
                        stroke="currentColor"
                      >
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        <path
                          d="M12 8v4M12 16h.01"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{test.name}</h3>
                        <div className="mt-1 text-sm text-gray-600">
                          <p>
                            Ngày đặt: {test.orderDate}
                            {test.completionDate && ` • Hoàn thành: ${test.completionDate}`}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 text-sm font-medium rounded-full ${test.status === 'hoàn thành'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {test.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
