import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData, Report } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, FileText, Trash2, MapPin, Phone, User, Car, FileType, Calendar, StickyNote } from 'lucide-react';
import { toast } from 'sonner';

const Reports = () => {
  const { user } = useAuth();
  const { reports, updateReport, deleteReport } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter reports based on role
  const userReports = user?.role === 'admin' 
    ? reports 
    : reports.filter(r => r.assignedTo === user?.id);

  const filteredReports = userReports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || report.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleStatusChange = (id: string, status: Report['status']) => {
    updateReport(id, { status });
    toast.success('Status updated');
  };

  const handleDelete = (id: string) => {
    if (user?.role !== 'admin') {
      toast.error('Only admins can delete reports');
      return;
    }
    deleteReport(id);
    toast.success('Report deleted');
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsDetailOpen(true);
  };

  const typeLabels: Record<string, { label: string; className: string }> = {
    tow: { label: 'Tow', className: 'bg-blue-500/20 text-blue-400' },
    roadside: { label: 'Roadside', className: 'bg-green-500/20 text-green-400' },
    accident: { label: 'Accident', className: 'bg-red-500/20 text-red-400' },
    impound: { label: 'Impound', className: 'bg-purple-500/20 text-purple-400' },
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">
            {user?.role === 'admin' ? 'All service reports' : 'Your assigned reports'}
          </p>
        </div>
        <Link to="/dashboard/new-report">
          <Button>
            <Plus className="w-4 h-4" />
            New Report
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-input text-foreground text-sm"
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
            className="h-9 px-3 rounded-lg border border-border bg-input text-foreground text-sm"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">
            {reports.length === 0 ? 'No reports yet' : 'No reports match your filters'}
          </p>
          {reports.length === 0 && (
            <Link to="/dashboard/new-report">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4" />
                Create Report
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">ID</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Title</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Type</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Customer</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                {user?.role === 'admin' && (
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr 
                  key={report.id} 
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => handleViewReport(report)}
                >
                  <td className="p-3 text-sm font-medium text-foreground">#{report.id.slice(-4)}</td>
                  <td className="p-3">
                    <div>
                      <p className="text-sm text-foreground">{report.title}</p>
                      <p className="text-xs text-muted-foreground">{report.vehicle}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeLabels[report.type].className}`}>
                      {typeLabels[report.type].label}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{report.customerName}</td>
                  <td className="p-3 text-sm text-muted-foreground">{report.dateCreated}</td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={report.status}
                      onChange={(e) => handleStatusChange(report.id, e.target.value as Report['status'])}
                      className="h-7 px-2 rounded border border-border bg-input text-foreground text-xs"
                      disabled={user?.role !== 'admin' && report.status === 'closed'}
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="pending">Pending</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  {user?.role === 'admin' && (
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Report Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Report #{selectedReport?.id.slice(-4)}
            </DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4 mt-2">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{selectedReport.title}</h3>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${typeLabels[selectedReport.type].className}`}>
                  {typeLabels[selectedReport.type].label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Car className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vehicle</p>
                    <p className="text-sm text-foreground">{selectedReport.vehicle}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm text-foreground">{selectedReport.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Customer Name</p>
                    <p className="text-sm text-foreground">{selectedReport.customerName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Customer Phone</p>
                    <p className="text-sm text-foreground">{selectedReport.customerPhone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date Created</p>
                    <p className="text-sm text-foreground">{selectedReport.dateCreated}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <FileType className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-sm text-foreground capitalize">{selectedReport.status}</p>
                  </div>
                </div>
              </div>

              {selectedReport.notes && (
                <div className="flex items-start gap-2 pt-2 border-t border-border">
                  <StickyNote className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{selectedReport.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
