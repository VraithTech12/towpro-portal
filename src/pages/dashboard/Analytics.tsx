import { useState } from 'react';
import { useAuth, ClockRecord } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  Clock, 
  Search, 
  Users, 
  FileText, 
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  User
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const Analytics = () => {
  const { users, clockRecords, getUserClockRecords, getTodayHours } = useAuth();
  const { reports } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const employees = users.filter(u => u.role === 'employee' || u.role === 'admin');
  
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEmployeeStats = (userId: string) => {
    const userReports = reports.filter(r => r.assignedTo === userId);
    const userClockRecords = getUserClockRecords(userId);
    const todayHours = getTodayHours(userId);
    const totalHours = userClockRecords.reduce((acc, r) => acc + (r.duration || 0), 0) / 60;
    
    return {
      totalReports: userReports.length,
      completedReports: userReports.filter(r => r.status === 'closed').length,
      todayHours,
      totalHours,
      clockRecords: userClockRecords,
      isClockedIn: users.find(u => u.id === userId)?.clockedIn || false,
    };
  };

  const selectedEmployee = selectedUser ? users.find(u => u.id === selectedUser) : null;
  const selectedStats = selectedUser ? getEmployeeStats(selectedUser) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track employee performance and time</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{employees.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Staff</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-success" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {employees.filter(e => e.clockedIn).length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Currently Clocked In</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{reports.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Reports</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {reports.filter(r => r.status === 'closed').length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Completed Reports</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Employee List */}
        <div className="col-span-1 bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground mb-3">Staff Members</h2>
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
          <div className="max-h-[500px] overflow-y-auto">
            {filteredEmployees.map((employee) => {
              const stats = getEmployeeStats(employee.id);
              return (
                <button
                  key={employee.id}
                  onClick={() => setSelectedUser(employee.id)}
                  className={`w-full p-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors text-left ${
                    selectedUser === employee.id ? 'bg-secondary' : ''
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
                      <p className="text-xs text-muted-foreground capitalize">{employee.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{stats.todayHours.toFixed(1)}h</p>
                      <p className="text-xs text-muted-foreground">Today</p>
                    </div>
                  </div>
                </button>
              );
            })}
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
                    {selectedEmployee.phone && (
                      <p className="text-sm text-muted-foreground">{selectedEmployee.phone}</p>
                    )}
                  </div>
                  <div className="ml-auto">
                    {selectedStats.isClockedIn ? (
                      <span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                        Clocked In
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                        Clocked Out
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 p-6 border-b border-border">
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
                  <p className="text-sm text-muted-foreground">Reports</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedStats.completedReports}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>

              {/* Time Records */}
              <div className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Recent Time Records</h3>
                {selectedStats.clockRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No time records yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[250px] overflow-y-auto">
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
                              {format(new Date(record.clockIn), 'h:mm a')}
                              {record.clockOut && ` - ${format(new Date(record.clockOut), 'h:mm a')}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {record.duration ? (
                            <p className="font-medium text-foreground">
                              {(record.duration / 60).toFixed(1)}h
                            </p>
                          ) : (
                            <p className="text-sm text-success">In progress</p>
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
