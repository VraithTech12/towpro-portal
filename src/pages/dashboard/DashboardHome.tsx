import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, FileText, Truck, ArrowRight, Users, BarChart3, Wifi, AlertCircle, Navigation, CheckCircle } from 'lucide-react';
import ClockStatusCard from '@/components/dashboard/ClockStatusCard';
import TowStatusBadge from '@/components/dashboard/TowStatusBadge';

const DashboardHome = () => {
  const { profile, role, staff, user } = useAuth();
  const { reports, towUnits, updateReport } = useData();
  const { onlineCount } = useOnlinePresence();

  const userReports = role === 'employee' 
    ? reports.filter(r => r.assignedTo === user?.id || r.status === 'open')
    : reports;

  const openReports = reports.filter(r => r.status === 'open').length;
  const assignedReports = reports.filter(r => r.status === 'assigned').length;
  const enRouteReports = reports.filter(r => r.status === 'en_route').length;
  const inProgressReports = reports.filter(r => r.status === 'in_progress').length;
  const clockedInCount = staff.filter(s => s.clockedIn).length;

  const isOwnerOrAdmin = role === 'owner' || role === 'admin';

  // Get user's active dispatch
  const myActiveDispatch = reports.find(r => 
    r.assignedTo === user?.id && 
    ['assigned', 'en_route', 'in_progress'].includes(r.status)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {profile?.name?.split(' ')[0] || 'Operator'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {role === 'owner' ? 'Owner Access' : 
             role === 'admin' ? 'Administrator' : 
             'Tow Operator'}
          </p>
        </div>
        <Link to="/dashboard/new-report">
          <Button>
            <Plus className="w-4 h-4" />
            New Dispatch
          </Button>
        </Link>
      </div>

      {/* Clock Status */}
      <ClockStatusCard />

      {/* Active Dispatch Banner (for employees) */}
      {myActiveDispatch && (
        <div className="p-5 rounded-xl border-2 border-primary bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Dispatch</p>
                <p className="font-semibold text-foreground">{myActiveDispatch.title}</p>
                <p className="text-sm text-muted-foreground">{myActiveDispatch.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TowStatusBadge status={myActiveDispatch.status as any} />
              {myActiveDispatch.status === 'assigned' && (
                <Button 
                  size="sm"
                  onClick={() => updateReport(myActiveDispatch.id, { status: 'en_route' })}
                >
                  <Navigation className="w-4 h-4" />
                  Go En Route
                </Button>
              )}
              {myActiveDispatch.status === 'en_route' && (
                <Button 
                  size="sm"
                  onClick={() => updateReport(myActiveDispatch.id, { status: 'in_progress' })}
                >
                  <Truck className="w-4 h-4" />
                  Start Tow
                </Button>
              )}
              {myActiveDispatch.status === 'in_progress' && (
                <Button 
                  size="sm"
                  onClick={() => updateReport(myActiveDispatch.id, { status: 'completed' })}
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
      <div className={`grid gap-4 ${isOwnerOrAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
        <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">Open</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{openReports}</p>
          <p className="text-sm text-muted-foreground mt-1">Awaiting Assignment</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 hover:border-blue-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">Active</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{assignedReports + enRouteReports + inProgressReports}</p>
          <p className="text-sm text-muted-foreground mt-1">In Progress</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 hover:border-success/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <Truck className="w-5 h-5 text-success" />
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">On Duty</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{clockedInCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Operators Clocked In</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 hover:border-amber-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-foreground">{reports.filter(r => r.status === 'completed' || r.status === 'closed').length}</p>
          <p className="text-sm text-muted-foreground mt-1">Completed Today</p>
        </div>

        {isOwnerOrAdmin && (
          <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <Wifi className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">Live</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{onlineCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Online Now</p>
          </div>
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
              <h3 className="font-semibold text-foreground mb-1">Dispatch Board</h3>
              <p className="text-sm text-muted-foreground">
                {openReports} open dispatches
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
              <h3 className="font-semibold text-foreground mb-1">Fleet Status</h3>
              <p className="text-sm text-muted-foreground">
                {towUnits.length} tow units
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
                <p className="text-sm text-muted-foreground">View performance stats</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        )}
      </div>

      {/* Open Dispatches */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Open Dispatches</h2>
          <Link to="/dashboard/reports" className="text-sm text-primary hover:underline font-medium">
            View All
          </Link>
        </div>
        <div className="p-5">
          {reports.filter(r => r.status === 'open').length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">No open dispatches</p>
              <Link to="/dashboard/new-report">
                <Button variant="outline">
                  <Plus className="w-4 h-4" />
                  Create Dispatch
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.filter(r => r.status === 'open').slice(0, 5).map((report) => (
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
                      <p className="text-sm text-muted-foreground">{report.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      report.type === 'pd_tow' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {report.type === 'pd_tow' ? 'PD' : 'Civ'}
                    </span>
                    <Button 
                      size="sm"
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
