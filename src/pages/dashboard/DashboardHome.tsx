import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, FileText, Truck, ArrowRight, Users, Wifi, AlertCircle, Navigation, CheckCircle, Clock } from 'lucide-react';
import ClockStatusCard from '@/components/dashboard/ClockStatusCard';
import TowStatusBadge from '@/components/dashboard/TowStatusBadge';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardHome = () => {
  const { profile, role, staff, user } = useAuth();
  const { reports, towUnits, updateReport } = useData();
  const { onlineCount } = useOnlinePresence();
  const isMobile = useIsMobile();

  const openReports = reports.filter(r => r.status === 'open').length;
  const assignedReports = reports.filter(r => r.status === 'assigned').length;
  const enRouteReports = reports.filter(r => r.status === 'en_route').length;
  const inProgressReports = reports.filter(r => r.status === 'in_progress').length;
  const completedToday = reports.filter(r => r.status === 'completed' || r.status === 'closed').length;
  const clockedInCount = staff.filter(s => s.clockedIn).length;

  const isOwnerOrAdmin = role === 'owner' || role === 'admin';

  // Get user's active report
  const myActiveReport = reports.find(r => 
    r.assignedTo === user?.id && 
    ['assigned', 'en_route', 'in_progress'].includes(r.status)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {profile?.name?.split(' ')[0] || 'Operator'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {role === 'owner' ? 'Owner Access' : 
             role === 'admin' ? 'Administrator' : 
             'Tow Operator'} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/dashboard/new-report">
          <Button size="lg" className="shadow-lg">
            <Plus className="w-4 h-4" />
            New Report
          </Button>
        </Link>
      </div>

      {/* Clock Status */}
      <ClockStatusCard />

      {/* Active Report Banner (for employees) */}
      {myActiveReport && (
        <div className="p-5 rounded-2xl border-2 border-primary bg-gradient-to-r from-primary/10 to-primary/5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Truck className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-xs text-primary font-semibold uppercase tracking-wider">Active Report</p>
                <p className="font-bold text-lg text-foreground">{myActiveReport.title}</p>
                <p className="text-sm text-muted-foreground">{myActiveReport.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TowStatusBadge status={myActiveReport.status as any} />
              {myActiveReport.status === 'assigned' && (
                <Button 
                  onClick={() => updateReport(myActiveReport.id, { status: 'en_route' })}
                >
                  <Navigation className="w-4 h-4" />
                  Go En Route
                </Button>
              )}
              {myActiveReport.status === 'en_route' && (
                <Button 
                  onClick={() => updateReport(myActiveReport.id, { status: 'in_progress' })}
                >
                  <Truck className="w-4 h-4" />
                  Start Tow
                </Button>
              )}
              {myActiveReport.status === 'in_progress' && (
                <Button 
                  onClick={() => updateReport(myActiveReport.id, { status: 'completed' })}
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-5'}`}>
        <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">Open</span>
          </div>
          <p className="text-4xl font-bold text-foreground">{openReports}</p>
          <p className="text-sm text-muted-foreground mt-1">Awaiting Assignment</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 hover:border-blue-500/50 hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400">Active</span>
          </div>
          <p className="text-4xl font-bold text-foreground">{assignedReports + enRouteReports + inProgressReports}</p>
          <p className="text-sm text-muted-foreground mt-1">In Progress</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 hover:border-success/50 hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-success" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-success/10 text-success">On Duty</span>
          </div>
          <p className="text-4xl font-bold text-foreground">{clockedInCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Operators Clocked In</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 hover:border-amber-500/50 hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-4xl font-bold text-foreground">{completedToday}</p>
          <p className="text-sm text-muted-foreground mt-1">Completed</p>
        </div>

        {isOwnerOrAdmin && (
          <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wifi className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400">Live</span>
            </div>
            <p className="text-4xl font-bold text-foreground">{onlineCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Online Now</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
        <Link 
          to="/dashboard/reports"
          className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all hover:shadow-xl group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">Report Board</h3>
                <p className="text-sm text-muted-foreground">
                  {openReports} open reports
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link 
          to="/dashboard/tow-units"
          className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all hover:shadow-xl group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">Fleet Status</h3>
                <p className="text-sm text-muted-foreground">
                  {towUnits.length} tow units
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        {isOwnerOrAdmin ? (
          <Link 
            to="/dashboard/analytics"
            className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all hover:shadow-xl group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">Analytics</h3>
                  <p className="text-sm text-muted-foreground">View performance</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ) : (
          <Link 
            to="/dashboard/new-report"
            className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl p-6 hover:border-primary/50 transition-all hover:shadow-xl group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">New Report</h3>
                  <p className="text-sm text-muted-foreground">Create a tow report</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        )}
      </div>

      {/* Open Reports */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-lg text-foreground">Open Reports</h2>
          <Link to="/dashboard/reports" className="text-sm text-primary hover:underline font-medium">
            View All
          </Link>
        </div>
        <div className="p-5">
          {reports.filter(r => r.status === 'open').length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">No open reports</p>
              <Link to="/dashboard/new-report">
                <Button variant="outline" size="lg">
                  <Plus className="w-4 h-4" />
                  Create Report
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.filter(r => r.status === 'open').slice(0, 5).map((report) => (
                <div 
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors border border-transparent hover:border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{report.title}</p>
                      <p className="text-sm text-muted-foreground">{report.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      report.type === 'pd_tow' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {report.type === 'pd_tow' ? 'PD Tow' : 'Civ Tow'}
                    </span>
                    <Button 
                      onClick={async () => {
                        await updateReport(report.id, { assignedTo: user?.id, status: 'assigned' });
                      }}
                    >
                      Accept
                    </Button>
                  </div>
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
