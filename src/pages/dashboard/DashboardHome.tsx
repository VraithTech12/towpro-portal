import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, FileText, Truck, Wrench, ArrowRight } from 'lucide-react';

const DashboardHome = () => {
  const { user } = useAuth();
  const { reports, towUnits } = useData();

  const userReports = user?.role === 'admin' 
    ? reports 
    : reports.filter(r => r.assignedTo === user?.id);

  const openReports = userReports.filter(r => r.status === 'open' || r.status === 'in-progress').length;
  const availableUnits = towUnits.filter(u => u.status === 'available').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Welcome, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user?.role === 'admin' ? 'Full system access' : 'View your assigned reports'}
          </p>
        </div>
        <Link to="/dashboard/new-report">
          <Button>
            <Plus className="w-4 h-4" />
            New Report
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{openReports}</p>
          <p className="text-sm text-muted-foreground">Open Reports</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Truck className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Fleet</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{towUnits.length}</p>
          <p className="text-sm text-muted-foreground">Total Units</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Wrench className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-success">Ready</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{availableUnits}</p>
          <p className="text-sm text-muted-foreground">Available Units</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link 
          to="/dashboard/reports"
          className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground mb-1">View Reports</h3>
              <p className="text-sm text-muted-foreground">
                {userReports.length === 0 ? 'No reports yet' : `${userReports.length} total reports`}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>

        <Link 
          to="/dashboard/tow-units"
          className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground mb-1">Manage Fleet</h3>
              <p className="text-sm text-muted-foreground">
                {towUnits.length === 0 ? 'No units added' : `${towUnits.length} tow units`}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent Reports */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-medium text-foreground">Recent Reports</h2>
          <Link to="/dashboard/reports" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>
        <div className="p-4">
          {userReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">No reports yet</p>
              <Link to="/dashboard/new-report">
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4" />
                  Create First Report
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {userReports.slice(0, 5).map((report) => (
                <div 
                  key={report.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">#{report.id.slice(-4)}</span>
                    <span className="text-sm text-muted-foreground">{report.title}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    report.status === 'open' ? 'bg-primary/20 text-primary' :
                    report.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                    report.status === 'closed' ? 'bg-muted text-muted-foreground' :
                    'bg-warning/20 text-warning'
                  }`}>
                    {report.status}
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
