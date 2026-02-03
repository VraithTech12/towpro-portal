import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData, Report } from '@/contexts/DataContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, FileText, Trash2, MapPin, Phone, User, Calendar, StickyNote, Shield, UserPlus, Car, Navigation, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import TowStatusBadge, { TowStatus } from '@/components/dashboard/TowStatusBadge';

const Reports = () => {
  const { user, role } = useAuth();
  const { reports, updateReport, deleteReport, isLoadingReports, fetchReports } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [assignedWorkerName, setAssignedWorkerName] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignedWorkerName = async () => {
      if (selectedReport?.assignedTo) {
        if (selectedReport.assignedTo === user?.id) {
          setAssignedWorkerName('You');
        } else {
          const { data } = await supabase
            .from('profiles')
            .select('name')
            .eq('user_id', selectedReport.assignedTo)
            .maybeSingle();
          setAssignedWorkerName(data?.name || 'Unknown');
        }
      } else {
        setAssignedWorkerName(null);
      }
    };
    fetchAssignedWorkerName();
  }, [selectedReport?.assignedTo, user?.id]);

  const isOwnerOrAdmin = role === 'owner' || role === 'admin';

  const userReports = isOwnerOrAdmin
    ? reports 
    : reports.filter(r => r.assignedTo === user?.id || r.createdBy === user?.id || r.status === 'open');

  const filteredReports = userReports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || report.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleStatusChange = async (id: string, status: Report['status']) => {
    const success = await updateReport(id, { status });
    if (success) {
      const statusMessages: Record<string, string> = {
        open: 'Report reopened',
        assigned: 'Report assigned',
        en_route: 'Unit en route to location',
        in_progress: 'Tow in progress',
        completed: 'Report completed - good work!',
        cancelled: 'Report cancelled',
      };
      toast.success(statusMessages[status] || 'Status updated');
      if (selectedReport?.id === id) {
        setSelectedReport({ ...selectedReport, status });
      }
    } else {
      toast.error('Failed to update status');
    }
  };

  const handleAssignToMe = async () => {
    if (!selectedReport) return;
    const success = await updateReport(selectedReport.id, { 
      assignedTo: user?.id,
      status: 'assigned' as any
    });
    if (success) {
      toast.success('You have been assigned to this report');
      setSelectedReport({ ...selectedReport, assignedTo: user?.id, status: 'assigned' as any });
    } else {
      toast.error('Failed to assign report');
    }
  };

  const handleUnassign = async () => {
    if (!selectedReport) return;
    const success = await updateReport(selectedReport.id, { 
      assignedTo: undefined,
      status: 'open'
    });
    if (success) {
      toast.success('You have been unassigned from this report');
      setSelectedReport({ ...selectedReport, assignedTo: undefined, status: 'open' });
    } else {
      toast.error('Failed to unassign');
    }
  };

  const handleDelete = async (id: string) => {
    if (!isOwnerOrAdmin) {
      toast.error('Only management can delete reports');
      return;
    }
    const success = await deleteReport(id);
    if (success) {
      toast.success('Report deleted');
      setIsDetailOpen(false);
    } else {
      toast.error('Failed to delete report');
    }
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsDetailOpen(true);
  };

  const typeLabels: Record<string, { label: string; className: string }> = {
    tow: { label: 'Civ Tow', className: 'bg-blue-500/20 text-blue-400' },
    roadside: { label: 'Roadside', className: 'bg-green-500/20 text-green-400' },
    impound: { label: 'Impound', className: 'bg-purple-500/20 text-purple-400' },
    pd_tow: { label: 'PD Tow', className: 'bg-amber-500/20 text-amber-400' },
  };

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'en_route', label: 'En Route' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Report Board</h1>
          <p className="text-sm text-muted-foreground">
            {isOwnerOrAdmin ? 'All active reports' : 'Your reports and available jobs'}
          </p>
        </div>
        <Link to="/dashboard/new-report">
          <Button>
            <Plus className="w-4 h-4" />
            New Report
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-3">
        {['open', 'assigned', 'en_route', 'in_progress', 'completed'].map((status) => {
          const count = reports.filter(r => r.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(selectedStatus === status ? 'all' : status)}
              className={`p-3 rounded-xl border transition-all ${
                selectedStatus === status 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <TowStatusBadge status={status as TowStatus} className="mb-2" />
              <p className="text-2xl font-bold text-foreground">{count}</p>
            </button>
          );
        })}
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
            <option value="tow">Civ Tow</option>
            <option value="roadside">Roadside</option>
            <option value="impound">Impound</option>
            <option value="pd_tow">PD Tow</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-input text-foreground text-sm"
          >
            <option value="all">All Status</option>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports List */}
      {isLoadingReports ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
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
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Location</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                {isOwnerOrAdmin && (
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
                    <p className="text-sm text-foreground">{report.title}</p>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeLabels[report.type]?.className || 'bg-muted text-muted-foreground'}`}>
                      {typeLabels[report.type]?.label || report.type}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {report.location}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{report.dateCreated}</td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={report.status}
                      onChange={(e) => handleStatusChange(report.id, e.target.value as Report['status'])}
                      className="h-7 px-2 rounded border border-border bg-input text-foreground text-xs"
                      disabled={!isOwnerOrAdmin && report.assignedTo !== user?.id}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  {isOwnerOrAdmin && (
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
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-foreground">{selectedReport.title}</h3>
                  {selectedReport.type === 'pd_tow' && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      PD
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <TowStatusBadge status={selectedReport.status as TowStatus} />
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeLabels[selectedReport.type]?.className || 'bg-muted text-muted-foreground'}`}>
                    {typeLabels[selectedReport.type]?.label || selectedReport.type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm text-foreground">{selectedReport.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm text-foreground">{selectedReport.dateCreated}</p>
                  </div>
                </div>

                {selectedReport.type !== 'pd_tow' && (
                  <>
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Customer</p>
                        <p className="text-sm text-foreground">{selectedReport.customerName || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm text-foreground">{selectedReport.customerPhone || 'N/A'}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Assignment Section */}
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Assigned Operator</p>
                      <p className="text-sm font-medium text-foreground">
                        {assignedWorkerName || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!selectedReport.assignedTo && selectedReport.status === 'open' && (
                      <Button variant="default" size="sm" onClick={handleAssignToMe}>
                        <UserPlus className="w-4 h-4" />
                        Accept
                      </Button>
                    )}
                    {selectedReport.assignedTo === user?.id && selectedReport.status !== 'completed' && (
                      <>
                        {selectedReport.status === 'assigned' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusChange(selectedReport.id, 'en_route' as any)}
                          >
                            <Navigation className="w-4 h-4" />
                            Go En Route
                          </Button>
                        )}
                        {selectedReport.status === 'en_route' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusChange(selectedReport.id, 'in_progress' as any)}
                          >
                            <Car className="w-4 h-4" />
                            Start Tow
                          </Button>
                        )}
                        {selectedReport.status === 'in_progress' && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleStatusChange(selectedReport.id, 'completed' as any)}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Complete
                          </Button>
                        )}
                      </>
                    )}
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

              <div className="flex justify-between gap-2 pt-2 border-t border-border">
                <div className="flex gap-2">
                  {selectedReport.assignedTo === user?.id && selectedReport.status !== 'completed' && (
                    <Button variant="ghost" size="sm" onClick={handleUnassign}>
                      Unassign
                    </Button>
                  )}
                  {isOwnerOrAdmin && selectedReport.status !== 'cancelled' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange(selectedReport.id, 'cancelled' as any)}
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </Button>
                  )}
                </div>
                {isOwnerOrAdmin && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(selectedReport.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
