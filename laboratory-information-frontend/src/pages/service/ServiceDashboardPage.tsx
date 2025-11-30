import {
  Beaker,
  Monitor,
  Activity,
  Settings,
  CheckCircle,
  BarChart3,
  Wrench,
  Bell,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  Clock
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle }  from '../../components/common/card';
import Badge from '../../components/common/badge';

// Interfaces
interface Stats {
  totalReagents: number;
  lowStockReagents: number;
  expiredReagents: number;
  totalInstruments: number;
  activeInstruments: number;
  readyInstruments: number;
  maintenanceInstruments: number;
  totalEventLogs: number;
  recentErrors: number;
}

interface Reagent {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minimumStock: number;
  expiryDate: string;
  status: 'normal' | 'low_stock' | 'expired';
}

interface Instrument {
  id: string;
  name: string;
  location: string;
  status: 'normal' | 'maintenance';
}

interface EventLog {
  id: string;
  message: string;
  timestamp: string;
  severityLevel: 'Info' | 'Warning' | 'Error';
}

// Fake data
const stats: Stats = {
  totalReagents: 120,
  lowStockReagents: 8,
  expiredReagents: 5,
  totalInstruments: 35,
  activeInstruments: 28,
  readyInstruments: 25,
  maintenanceInstruments: 7,
  totalEventLogs: 54,
  recentErrors: 3,
};

const reagents: Reagent[] = [
  { id: 'r1', name: 'Hóa chất A', quantity: 3, unit: 'kg', minimumStock: 5, expiryDate: '2025-10-30', status: 'low_stock' },
  { id: 'r2', name: 'Hóa chất B', quantity: 0, unit: 'kg', minimumStock: 5, expiryDate: '2025-09-15', status: 'expired' },
  { id: 'r3', name: 'Hóa chất C', quantity: 10, unit: 'kg', minimumStock: 5, expiryDate: '2026-01-01', status: 'normal' },
];

const instruments: Instrument[] = [
  { id: 'i1', name: 'Máy X', location: 'Phòng 1', status: 'maintenance' },
  { id: 'i2', name: 'Máy Y', location: 'Phòng 2', status: 'normal' },
];

const eventLogs: EventLog[] = [
  { id: 'e1', message: 'Thiết bị Máy X bảo trì', timestamp: '10:30 22/10/2025', severityLevel: 'Warning' },
  { id: 'e2', message: 'Hóa chất B hết hạn', timestamp: '09:15 22/10/2025', severityLevel: 'Error' },
  { id: 'e3', message: 'Người dùng đăng nhập', timestamp: '08:50 22/10/2025', severityLevel: 'Info' },
];

export function ServiceDashboardPage() {


  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Hóa chất */}
        <Card className="glass-strong hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hóa chất</p>
                <p className="text-2xl text-blue-600">{stats.totalReagents}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-orange-600">{stats.lowStockReagents} sắp hết</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Beaker className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thiết bị */}
        <Card className="glass-strong hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Thiết bị</p>
                <p className="text-2xl text-green-600">{stats.activeInstruments}/{stats.totalInstruments}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 pulse-dot"></div>
                  <span className="text-xs text-green-600">Hoạt động</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Monitor className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nhật ký */}
        <Card className="glass-strong hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nhật ký</p>
                <p className="text-2xl text-purple-600">{stats.totalEventLogs}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-red-600">{stats.recentErrors} lỗi</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cấu hình */}
        <Card className="glass-strong hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cấu hình</p>
                <p className="text-2xl text-gray-900">8</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">Hoạt động</span>
                </div>
              </div>
              <div className="p-3 bg-gray-100 rounded-xl">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Overview / System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-strong hover-lift lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Trạng thái Hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-lg">
                <span className="flex items-center gap-2">
                  <Beaker className="w-4 h-4 text-blue-500" />
                  Hóa chất khả dụng
                </span>
                <Badge variant="default">{stats.totalReagents - stats.expiredReagents}</Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-lg">
                <span className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-green-500" />
                  Thiết bị sẵn sàng
                </span>
                <Badge variant="default">{stats.readyInstruments}</Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-lg">
                <span className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-orange-500" />
                  Thiết bị bảo trì
                </span>
                <Badge variant="secondary">{stats.maintenanceInstruments}</Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-lg">
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-500" />
                  Sự kiện hôm nay
                </span>
                <Badge variant="outline">{stats.totalEventLogs}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alerts */}
        <Card className="glass-strong hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              Cảnh báo & Thông báo
            </CardTitle>
            <CardContent className="text-sm text-gray-500">Các vấn đề cần chú ý ngay lập tức</CardContent>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reagents.filter(r => r.status === 'low_stock').map(r => (
                <div key={r.id} className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-orange-900">
                      Hóa chất <span className="font-medium">{r.name}</span> sắp hết
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Còn lại: {r.quantity} {r.unit} / Tối thiểu: {r.minimumStock} {r.unit}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-orange-600" />
                </div>
              ))}

              {reagents.filter(r => r.status === 'expired').map(r => (
                <div key={r.id} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-900">
                      Hóa chất <span className="font-medium">{r.name}</span> đã hết hạn
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Hết hạn: {r.expiryDate}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-600" />
                </div>
              ))}

              {instruments.filter(i => i.status === 'maintenance').map(i => (
                <div key={i.id} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer">
                  <Wrench className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-900">
                      Thiết bị <span className="font-medium">{i.name}</span> đang bảo trì
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Vị trí: {i.location}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-yellow-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="glass-strong hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {log.severityLevel === 'Error' ? (
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      </div>
                    ) : log.severityLevel === 'Warning' ? (
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{log.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <Badge variant={log.severityLevel === 'Error' ? 'destructive' : log.severityLevel === 'Warning' ? 'outline' : 'secondary'} className="text-xs">
                        {log.severityLevel}
                      </Badge>
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
}

export default ServiceDashboardPage;
