import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReportCard, { Report } from '@/components/dashboard/ReportCard';
import { Plus, Search, Filter } from 'lucide-react';

const allReports: Report[] = [
  { id: '421', title: 'Highway Recovery', type: 'tow', status: 'open', dateCreated: '12/31/2025', vehicle: '2019 Honda Accord' },
  { id: '420', title: 'Downtown Accident', type: 'accident', status: 'open', dateCreated: '12/31/2025', vehicle: '2021 Ford F-150' },
  { id: '419', title: 'Impound Request', type: 'impound', status: 'in-progress', dateCreated: '12/30/2025', vehicle: '2018 Chevrolet Malibu' },
  { id: '418', title: 'Roadside Assist', type: 'roadside', status: 'closed', dateCreated: '12/30/2025', vehicle: '2020 Tesla Model 3' },
  { id: '417', title: 'Vehicle Breakdown', type: 'tow', status: 'pending', dateCreated: '12/29/2025', vehicle: '2017 Toyota Camry' },
  { id: '416', title: 'Parking Violation', type: 'impound', status: 'closed', dateCreated: '12/29/2025', vehicle: '2022 BMW X5' },
  { id: '415', title: 'Accident Scene', type: 'accident', status: 'closed', dateCreated: '12/28/2025', vehicle: '2019 Nissan Altima' },
  { id: '414', title: 'Flat Tire Assist', type: 'roadside', status: 'closed', dateCreated: '12/28/2025', vehicle: '2021 Hyundai Sonata' },
];

const Reports = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredReports = allReports.filter((report) => {
    const matchesSearch = report.id.includes(searchTerm) || report.vehicle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || report.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Manage all towing and service reports</p>
        </div>
        {user?.role === 'admin' && (
          <Button>
            <Plus className="w-4 h-4" />
            Create Report
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by report ID or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-11 px-4 rounded-lg border border-border/50 bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Types</option>
              <option value="tow">Tow</option>
              <option value="roadside">Roadside</option>
              <option value="accident">Accident</option>
              <option value="impound">Impound</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-11 px-4 rounded-lg border border-border/50 bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.map((report) => (
          <ReportCard key={report.id} report={report} compact />
        ))}

        {filteredReports.length === 0 && (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No reports found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
