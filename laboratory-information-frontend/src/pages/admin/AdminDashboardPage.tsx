import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../components/common/card';
import Button from '../../components/common/button';
import { 
  TestTube2, 
  Users, 
  UserPlus,  
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus,
  Search,
  Activity,
  Server
} from 'lucide-react';

export function AdminDashboardPage() {
  // Mock data for KPIs
  const kpiData = [
    {
      title: 'Tổng số xét nghiệm',
      value: '150',
      change: '+12%',
      changeType: 'positive' as const,
      icon: TestTube2,
      color: 'blue'
    },
    {
      title: 'Người dùng hoạt động',
      value: '20',
      change: '+5%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'green'
    },
    {
      title: 'Bệnh nhân mới',
      value: '50',
      change: '+8%',
      changeType: 'positive' as const,
      icon: UserPlus,
      color: 'purple'
    },
    {
      title: 'Kết quả chờ xử lý',
      value: '23',
      change: '-3%',
      changeType: 'negative' as const,
      icon: Clock,
      color: 'orange'
    }
  ];

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-gray-600 mt-1">Chào mừng trở lại! Đây là tình hình hoạt động phòng thí nghiệm hôm nay.</p>
        </div>
        <div className="flex space-x-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Tạo xét nghiệm mới
          </Button>
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Tìm bệnh nhân
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(kpi.color)}`}>
                  <kpi.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Health Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-green-600" />
            <span>System Health</span>
          </CardTitle>
          <CardDescription>Service status and health monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">IAM Service</p>
                  <p className="text-xs text-gray-600">All systems operational</p>
                </div>
              </div>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Online
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Patient Service</p>
                  <p className="text-xs text-gray-600">Running smoothly</p>
                </div>
              </div>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Online
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Test Order Service</p>
                  <p className="text-xs text-gray-600">HL7 sync issues detected</p>
                </div>
              </div>
              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                Error
              </span>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full text-sm">
                <Activity className="h-4 w-4 mr-2" />
                Run Health Check
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
