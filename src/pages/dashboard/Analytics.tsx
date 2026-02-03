import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { 
  BarChart3, 
  Clock, 
  Search, 
  Users, 
  FileText, 
  TrendingUp,
  Calendar,
  User,
  Truck,
  CheckCircle,
  Shield
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

const Analytics = () => {
  const { role, staff, clockRecords } = useAuth();
  const { reports } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('week');

  const isOwner = role === 'owner';
  const employees = staff.filter(s => s.role === 'employee' || s.role === 'admin');
  
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEmployeeStats = (userId: string) => {
    const userReports = reports.filter(r => r.assignedTo === userId || r.createdBy === userId);
    const userClockRecords = clockRecords.filter(r => r.user_id === userId);
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = userClockRecords.filter(r => r.date === today);
    const todayHours = todayRecords.reduce((acc, r) => acc + (r.duration || 0), 0) / 60;
    const totalHours = userClockRecords.reduce((acc, r) => acc + (r.duration || 0), 0) / 60;
    const civTows = userReports.filter(r => r.type !== 'pd_tow').length;
    const pdTows = userReports.filter(r => r.type === 'pd_tow').length;
    const completedReports = userReports.filter(r => r.status === 'closed' || r.status === 'completed').length;
    
    return {
      totalReports: userReports.length,
      completedReports,
      civTows,
      pdTows,
      todayHours,
      totalHours,
      clockRecords: userClockRecords,
      isClockedIn: staff.find(s => s.user_id === userId)?.clockedIn || false,
      avgPerHour: totalHours > 0 ? userReports.length / totalHours : 0,
    };
  };

  const selectedEmployee = selectedUser ? staff.find(s => s.user_id === selectedUser) : null;
  const selectedStats = selectedUser ? getEmployeeStats(selectedUser) : null;

  // Overall stats
  const totalReports = reports.length;
  const openReports = reports.filter(r => r.status === 'open').length;
  const completedReports = reports.filter(r => r.status === 'closed' || r.status === 'completed').length;
  const civTows = reports.filter(r => r.type !== 'pd_tow').length;
  const pdTows = reports.filter(r => r.type === 'pd_tow').length;
  const totalHours = clockRecords.reduce((acc, r) => acc + (r.duration || 0), 0) / 60;

  if (!isOwner && role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access restricted to management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Operations Analytics</h1>
          <p className="text-muted-foreground text-sm">
            {isOwner ? 'Executive overview and performance metrics' : 'Team performance metrics'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="h-9 px-3 rounded-lg border border-border bg-input text-foreground text-sm"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-5 h-5 text-primary" />
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <p className="text-3xl font-bold text-foreground">{totalReports}</p>
          <p className="text-sm text-muted-foreground">Total Dispatches</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
          <p className="text-3xl font-bold text-foreground">{completedReports}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0}% rate
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Truck className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-foreground">{civTows}</p>
          <p className="text-sm text-muted-foreground">Civilian Tows</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-foreground">{pdTows}</p>
          <p className="text-sm text-muted-foreground">PD Tows</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-foreground">{totalHours.toFixed(0)}h</p>
          <p className="text-sm text-muted-foreground">Total Hours</p>
        </div>
      </div>

      {/* Tow Type Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-muted-foreground" />
            Tow Type Distribution
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground">Civilian Tows</span>
                <span className="text-muted-foreground">{civTows}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${totalReports > 0 ? (civTows / totalReports) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground">PD Tows</span>
                <span className="text-muted-foreground">{pdTows}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${totalReports > 0 ? (pdTows / totalReports) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
            Status Overview
          </h2>
          <div className="space-y-3">
            {[
              { status: 'Open', count: reports.filter(r => r.status === 'open').length, color: 'bg-primary' },
              { status: 'Assigned', count: reports.filter(r => r.status === 'assigned').length, color: 'bg-blue-500' },
              { status: 'En Route', count: reports.filter(r => r.status === 'en_route').length, color: 'bg-amber-500' },
              { status: 'In Progress', count: reports.filter(r => r.status === 'in_progress').length, color: 'bg-purple-500' },
              { status: 'Completed', count: completedReports, color: 'bg-success' },
            ].map((item) => (
              <div key={item.status} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm text-foreground flex-1">{item.status}</span>
                <span className="text-sm font-medium text-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Employee List */}
        <div className="col-span-1 bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground mb-3">Staff Performance</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {filteredEmployees.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No staff members yet</p>
              </div>
            ) : (
              filteredEmployees.map((employee) => {
                const stats = getEmployeeStats(employee.user_id);
                return (
                  <button
                    key={employee.user_id}
                    onClick={() => setSelectedUser(employee.user_id)}
                    className={`w-full p-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors text-left ${
                      selectedUser === employee.user_id ? 'bg-secondary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {employee.name.charAt(0)}
                          </span>
                        </div>
                        {stats.isClockedIn && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{employee.name}</p>
                        <p className="text-xs text-muted-foreground">{stats.totalReports} dispatches</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{stats.totalHours.toFixed(1)}h</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Employee Details */}
        <div className="col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          {selectedEmployee && selectedStats ? (
            <>
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-2xl">
                        {selectedEmployee.name.charAt(0)}
                      </span>
                    </div>
                    {selectedStats.isClockedIn && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-success rounded-full border-2 border-card" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedEmployee.name}</h2>
                    <p className="text-muted-foreground capitalize">{selectedEmployee.role}</p>
                  </div>
                  <div className="ml-auto">
                    {selectedStats.isClockedIn ? (
                      <span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                        On Duty
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                        Off Duty
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-5 gap-4 p-6 border-b border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedStats.todayHours.toFixed(1)}h</p>
                  <p className="text-sm text-muted-foreground">Today</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedStats.totalHours.toFixed(1)}h</p>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedStats.totalReports}</p>
                  <p className="text-sm text-muted-foreground">Dispatches</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{selectedStats.civTows}</p>
                  <p className="text-sm text-muted-foreground">Civ Tows</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-400">{selectedStats.pdTows}</p>
                  <p className="text-sm text-muted-foreground">PD Tows</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-sm text-muted-foreground">Efficiency</p>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedStats.avgPerHour.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">dispatches/hr</span>
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedStats.totalReports > 0 
                        ? Math.round((selectedStats.completedReports / selectedStats.totalReports) * 100) 
                        : 0}%
                    </p>
                  </div>
                </div>

                <h3 className="font-semibold text-foreground mt-6 mb-4">Recent Shifts</h3>
                {selectedStats.clockRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No time records yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[200px] overflow-y-auto">
                    {selectedStats.clockRecords.slice().reverse().slice(0, 10).map((record) => (
                      <div 
                        key={record.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {format(new Date(record.date), 'MMM d, yyyy')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(record.clock_in), 'h:mm a')}
                              {record.clock_out && ` - ${format(new Date(record.clock_out), 'h:mm a')}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {record.duration ? (
                            <p className="font-medium text-foreground">
                              {(record.duration / 60).toFixed(1)}h
                            </p>
                          ) : (
                            <p className="text-sm text-success">Active</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Select a staff member to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
