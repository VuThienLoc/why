import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/card';
import Button from '../../components/common/button';
import { 
  FlaskConical, 
  Users2, 
  Activity, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  TrendingUp,
  TrendingDown,
  Calendar,
  TestTube2
} from 'lucide-react';

// Mock data cho dashboard
const mockDashboardData = {
  totalTestsToday: 42,
  newPatientsThisWeek: 15,
  activeDevices: 5,
  completionRate: 87,
  weeklyStats: [
    { day: "T2", completed: 12, pending: 5, total: 17 },
    { day: "T3", completed: 10, pending: 3, total: 13 },
    { day: "T4", completed: 15, pending: 2, total: 17 },
    { day: "T5", completed: 18, pending: 4, total: 22 },
    { day: "T6", completed: 14, pending: 6, total: 20 },
    { day: "T7", completed: 16, pending: 3, total: 19 },
    { day: "CN", completed: 8, pending: 2, total: 10 }
  ],
  recentActivities: [
    { id: "TO001", patientName: "Nguyễn Văn A", status: "completed", createdAt: "2024-01-15 14:30", testType: "Công thức máu" },
    { id: "TO002", patientName: "Trần Thị B", status: "pending", createdAt: "2024-01-15 13:45", testType: "Sinh hóa máu" },
    { id: "TO003", patientName: "Lê Văn C", status: "reviewed", createdAt: "2024-01-15 12:20", testType: "Chức năng gan" },
    { id: "TO004", patientName: "Phạm Thị D", status: "completed", createdAt: "2024-01-15 11:15", testType: "Đường huyết" },
    { id: "TO005", patientName: "Hoàng Văn E", status: "pending", createdAt: "2024-01-15 10:30", testType: "Cholesterol" }
  ],
  alerts: [
    { id: 1, type: "warning", message: "Máy huyết học #2 đang ngoại tuyến", time: "5 phút trước" },
    { id: 2, type: "info", message: "3 test order đang chờ xác nhận kết quả", time: "10 phút trước" },
    { id: 3, type: "success", message: "Hiệu chuẩn thiết bị sinh hóa hoàn thành", time: "1 giờ trước" }
  ]
};

// Component SummaryCard
const SummaryCard = ({ title, value, icon: Icon, color, trend, trendValue }: {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}) => {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            {trend && (
              <div className="flex items-center mt-2">
                {trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trendValue}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs tuần trước</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${getColorClasses(color)}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Component SimpleChart
const SimpleChart = ({ data }: { data: Array<{ day: string; completed: number; pending: number; total: number }> }) => {
  const maxValue = Math.max(...data.map(d => d.total));
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Hoạt động 7 ngày qua</h3>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>Hoàn thành</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
            <span>Chờ xử lý</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-end justify-between h-48 space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full flex flex-col justify-end h-40 space-y-1">
              <div 
                className="bg-green-500 rounded-t"
                style={{ height: `${(item.completed / maxValue) * 100}%` }}
                title={`Hoàn thành: ${item.completed}`}
              ></div>
              <div 
                className="bg-yellow-500 rounded-t"
                style={{ height: `${(item.pending / maxValue) * 100}%` }}
                title={`Chờ xử lý: ${item.pending}`}
              ></div>
            </div>
            <div className="mt-2 text-xs text-gray-600 font-medium">{item.day}</div>
            <div className="text-xs text-gray-500">{item.total}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Component RecentActivityTable
const RecentActivityTable = ({ activities }: { 
  activities: Array<{ 
    id: string; 
    patientName: string; 
    status: string; 
    createdAt: string; 
    testType: string; 
  }> 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'reviewed':
        return <Eye className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'pending':
        return 'Chờ xử lý';
      case 'reviewed':
        return 'Đã xem xét';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
        <Button variant="outline" size="sm">
          Xem tất cả
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Bệnh nhân</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Loại xét nghiệm</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Trạng thái</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm font-medium text-gray-900">{activity.id}</td>
                <td className="py-3 px-4 text-sm text-gray-900">{activity.patientName}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{activity.testType}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(activity.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {getStatusText(activity.status)}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">{activity.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Component AlertPanel
const AlertPanel = ({ alerts }: { 
  alerts: Array<{ 
    id: number; 
    type: string; 
    message: string; 
    time: string; 
  }> 
}) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Activity className="w-5 h-5 text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Thông báo và cảnh báo</h3>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className={`p-4 rounded-lg border ${getAlertBgColor(alert.type)}`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Component
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<typeof mockDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadDashboardData = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDashboardData(mockDashboardData);
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Thanh tiêu đề */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">
          Bảng điều khiển phòng xét nghiệm
        </h1>
        <p className="text-gray-600">
          Chào mừng trở lại! Đây là tổng quan hoạt động phòng thí nghiệm hôm nay.
        </p>
      </div>

      {/* Khu vực thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Tổng số đơn xét nghiệm hôm nay"
          value={dashboardData!.totalTestsToday}
          icon={FlaskConical}
          color="blue"
          trend="up"
          trendValue="+12%"
        />
        <SummaryCard
          title="Bệnh nhân mới trong tuần"
          value={dashboardData!.newPatientsThisWeek}
          icon={Users2}
          color="green"
          trend="up"
          trendValue="+8%"
        />
        <SummaryCard
          title="Thiết bị đang hoạt động"
          value={`${dashboardData!.activeDevices}/6`}
          icon={Activity}
          color="purple"
          trend="down"
          trendValue="-1"
        />
        <SummaryCard
          title="Tỷ lệ hoàn thành xét nghiệm"
          value={`${dashboardData!.completionRate}%`}
          icon={BarChart3}
          color="orange"
          trend="up"
          trendValue="+3%"
        />
      </div>

      {/* Biểu đồ và hoạt động gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ thống kê */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Thống kê hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleChart data={dashboardData!.weeklyStats} />
          </CardContent>
        </Card>

        {/* Danh sách hoạt động gần đây */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <RecentActivityTable activities={dashboardData!.recentActivities} />
          </CardContent>
        </Card>
      </div>

      {/* Khu vực cảnh báo */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <AlertPanel alerts={dashboardData!.alerts} />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="w-full justify-start" variant="outline">
              <TestTube2 className="w-4 h-4 mr-2" />
              Xem đơn xét nghiệm
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users2 className="w-4 h-4 mr-2" />
              Quản lý bệnh nhân
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Báo cáo thống kê
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
