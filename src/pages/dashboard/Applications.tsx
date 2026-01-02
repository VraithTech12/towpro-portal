import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Search, CheckCircle, XCircle, Clock, Eye, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Application {
  id: string;
  application_id: string;
  character_name: string;
  discord_name: string;
  timezone: string;
  hours_per_week: string;
  experience: string;
  why_join: string;
  scenario_vehicle_breakdown: string;
  scenario_difficult_customer: string;
  scenario_enhance_roleplay: string;
  rule_break_response: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  reviewer_notes: string | null;
}

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (status: 'approved' | 'denied') => {
    if (!selectedApp || !user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          reviewer_notes: reviewNotes || null,
        })
        .eq('id', selectedApp.id);

      if (error) throw error;

      toast.success(`Application ${status}`);
      setSelectedApp(null);
      setReviewNotes('');
      fetchApplications();
    } catch (error: any) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case 'denied':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive">
            <XCircle className="w-3 h-3" /> Denied
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-500">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.character_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.discord_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.application_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Applications</h1>
        <p className="text-muted-foreground">Review and manage job applications</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, discord, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'denied'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No applications found
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="p-4 hover:bg-secondary/30 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-foreground truncate">
                      {app.character_name}
                    </span>
                    {getStatusBadge(app.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{app.discord_name}</span>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                      {app.application_id}
                    </span>
                    <span>{new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedApp(app);
                    setReviewNotes(app.reviewer_notes || '');
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" /> View
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Application: {selectedApp?.application_id}</span>
              {selectedApp && getStatusBadge(selectedApp.status)}
            </DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Character Name</label>
                  <p className="font-medium text-foreground">{selectedApp.character_name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Discord</label>
                  <p className="font-medium text-foreground">{selectedApp.discord_name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Timezone</label>
                  <p className="font-medium text-foreground">{selectedApp.timezone}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Hours/Week</label>
                  <p className="font-medium text-foreground">{selectedApp.hours_per_week}</p>
                </div>
              </div>

              {/* Responses */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Experience</label>
                  <p className="text-foreground bg-secondary/50 rounded p-3 mt-1">{selectedApp.experience}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Why do you want to join?</label>
                  <p className="text-foreground bg-secondary/50 rounded p-3 mt-1">{selectedApp.why_join}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Scenario: Vehicle Breakdown</label>
                  <p className="text-foreground bg-secondary/50 rounded p-3 mt-1">{selectedApp.scenario_vehicle_breakdown}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Scenario: Difficult Customer</label>
                  <p className="text-foreground bg-secondary/50 rounded p-3 mt-1">{selectedApp.scenario_difficult_customer}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Scenario: Enhance Roleplay</label>
                  <p className="text-foreground bg-secondary/50 rounded p-3 mt-1">{selectedApp.scenario_enhance_roleplay}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Rule Break Response</label>
                  <p className="text-foreground bg-secondary/50 rounded p-3 mt-1">{selectedApp.rule_break_response}</p>
                </div>
              </div>

              {/* Review Section */}
              {selectedApp.status === 'pending' && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div>
                    <label className="text-sm font-medium text-foreground">Reviewer Notes (Optional)</label>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add notes about this application..."
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-success hover:bg-success/90"
                      onClick={() => updateApplicationStatus('approved')}
                      disabled={isUpdating}
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => updateApplicationStatus('denied')}
                      disabled={isUpdating}
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
                      Deny
                    </Button>
                  </div>
                </div>
              )}

              {/* Already Reviewed */}
              {selectedApp.status !== 'pending' && selectedApp.reviewer_notes && (
                <div className="pt-4 border-t border-border">
                  <label className="text-sm text-muted-foreground">Reviewer Notes</label>
                  <p className="text-foreground bg-secondary/50 rounded p-3 mt-1">{selectedApp.reviewer_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applications;
