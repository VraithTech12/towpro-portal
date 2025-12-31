import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, FileText, Truck, Wrench, ArrowRight, Clock, PlayCircle, StopCircle, Users, BarChart3, Wifi } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const DashboardHome = () => {
  const { profile, role, staff, clockIn, clockOut, isClockedIn, todayHours, clockRecords, user } = useAuth();
  const { reports, towUnits } = useData();
  const { onlineCount } = useOnlinePresence();

  const userReports = role === 'employee' 
    ? reports.filter(r => r.assignedTo === user?.id)
    : reports;

  const openReports = userReports.filter(r => r.status === 'open' || r.status === 'in-progress').length;
  const clockedInCount = staff.filter(s => s.clockedIn).length;

  const isOwnerOrAdmin = role === 'owner' || role === 'admin';

  // Find current clock in time from clock records
  const today = new Date().toISOString().split('T')[0];
  const currentClockRecord = clockRecords.find(r => r.date === today && !r.clock_out);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {profile?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {role === 'owner' ? 'Full owner access' : 
             role === 'admin' ? 'Administrator access' : 
             'Employee dashboard'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Clock In/Out Button for all staff */}
          <Button 
            variant={isClockedIn ? "destructive" : "default"}
            onClick={isClockedIn ? clockOut : clockIn}
            className="gap-2"
          >
            {isClockedIn ? (
              <>
                <StopCircle className="w-4 h-4" />
                Clock Out
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                Clock In
              </>
            )}
          </Button>
          <Link to="/dashboard/new-report">
            <Button variant="outline">
              <Plus className="w-4 h-4" />
              New Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Clock Status */}
      <div className={`p-4 rounded-xl border ${isClockedIn ? 'bg-success/10 border-success/30' : 'bg-card border-border'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className={`w-5 h-5 ${isClockedIn ? 'text-success' : 'text-muted-foreground'}`} />
            <div>
              <p className="font-medium text-foreground">
                {isClockedIn ? 'Currently Clocked In' : 'Not Clocked In'}
              </p>
              {isClockedIn && currentClockRecord && (
                <p className="text-sm text-muted-foreground">
                  Started {formatDistanceToNow(new Date(currentClockRecord.clock_in), { addSuffix: true })}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Today's Hours</p>
            <p className="text-xl font-bold text-foreground">{todayHours.toFixed(1)}h</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid gap-4 ${isOwnerOrAdmin ? 'grid-cols-4' : 'grid-cols-2'}`}>
        <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">Active</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{openReports}</p>
          <p className="text-sm text-muted-foreground mt-1">Open Reports</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 hover:border-success/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <Truck className="w-5 h-5 text-success" />
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">On Duty</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{clockedInCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Clocked In</p>
        </div>

        {isOwnerOrAdmin && (
          <>
            <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <Wifi className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">Live</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{onlineCount}</p>
              <p className="text-sm text-muted-foreground mt-1">Online Now</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-muted-foreground">Team</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{staff.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Staff</p>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className={`grid gap-4 ${isOwnerOrAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <Link 
          to="/dashboard/reports"
          className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all hover:shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground mb-1">View Reports</h3>
              <p className="text-sm text-muted-foreground">
                {userReports.length === 0 ? 'No reports yet' : `${userReports.length} total reports`}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link 
          to="/dashboard/tow-units"
          className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all hover:shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Manage Fleet</h3>
              <p className="text-sm text-muted-foreground">
                {towUnits.length === 0 ? 'No units added' : `${towUnits.length} tow units`}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        {isOwnerOrAdmin && (
          <Link 
            to="/dashboard/analytics"
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all hover:shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Analytics</h3>
                <p className="text-sm text-muted-foreground">View employee stats</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        )}
      </div>

      {/* Recent Reports */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent Reports</h2>
          <Link to="/dashboard/reports" className="text-sm text-primary hover:underline font-medium">
            View All
          </Link>
        </div>
        <div className="p-5">
          {userReports.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">No reports yet</p>
              <Link to="/dashboard/new-report">
                <Button variant="outline">
                  <Plus className="w-4 h-4" />
                  Create First Report
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {userReports.slice(0, 5).map((report) => (
                <div 
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{report.title}</p>
                      <p className="text-sm text-muted-foreground">#{report.id.slice(-6)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    report.status === 'open' ? 'bg-primary/20 text-primary' :
                    report.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                    report.status === 'closed' ? 'bg-muted text-muted-foreground' :
                    'bg-warning/20 text-warning'
                  }`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
