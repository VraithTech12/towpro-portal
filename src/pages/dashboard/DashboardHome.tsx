import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import ReportCard, { Report } from '@/components/dashboard/ReportCard';
import TowUnitsPanel from '@/components/dashboard/TowUnitsPanel';
import LatestReports from '@/components/dashboard/LatestReports';
import CompletedJobs from '@/components/dashboard/CompletedJobs';
import { Plus, FileText, Truck } from 'lucide-react';

const mockAssignedReports: Report[] = [
  { id: '421', title: 'Highway Recovery', type: 'tow', status: 'open', dateCreated: '12/31/2025', vehicle: '2019 Honda Accord' },
  { id: '420', title: 'Downtown Accident', type: 'accident', status: 'open', dateCreated: '12/31/2025', vehicle: '2021 Ford F-150' },
  { id: '419', title: 'Impound Request', type: 'impound', status: 'in-progress', dateCreated: '12/30/2025', vehicle: '2018 Chevrolet Malibu' },
  { id: '418', title: 'Roadside Assist', type: 'roadside', status: 'open', dateCreated: '12/30/2025', vehicle: '2020 Tesla Model 3' },
  { id: '417', title: 'Vehicle Breakdown', type: 'tow', status: 'pending', dateCreated: '12/29/2025', vehicle: '2017 Toyota Camry' },
  { id: '416', title: 'Parking Violation', type: 'impound', status: 'open', dateCreated: '12/29/2025', vehicle: '2022 BMW X5' },
];

const DashboardHome = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground">Here's your operations overview for today</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileText className="w-4 h-4" />
            View All Reports
          </Button>
          <Button>
            <Plus className="w-4 h-4" />
            New Report
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Assigned to You</span>
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">{mockAssignedReports.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Active reports</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Open Jobs</span>
            <Truck className="w-5 h-5 text-warning" />
          </div>
          <p className="text-3xl font-bold text-foreground">4</p>
          <p className="text-xs text-muted-foreground mt-1">Awaiting dispatch</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Completed Today</span>
            <Truck className="w-5 h-5 text-success" />
          </div>
          <p className="text-3xl font-bold text-success">8</p>
          <p className="text-xs text-muted-foreground mt-1">+2 from yesterday</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Revenue Today</span>
            <span className="text-xl">$</span>
          </div>
          <p className="text-3xl font-bold text-foreground">$1,245</p>
          <p className="text-xs text-success mt-1">↑ 12% from average</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Assigned Reports - Takes 2 columns */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground uppercase tracking-wide">Assigned to You</h2>
            <Button variant="ghost" size="sm" className="text-primary">View All</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {mockAssignedReports.slice(0, 6).map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>

        {/* Right Panel - Tow Units */}
        <div className="space-y-6">
          <TowUnitsPanel />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-2 gap-6">
        <LatestReports />
        <CompletedJobs />
      </div>
    </div>
  );
};

export default DashboardHome;
