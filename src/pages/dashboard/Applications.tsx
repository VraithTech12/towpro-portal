import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, X, Trash2, Eye, RefreshCw } from 'lucide-react';

interface Application {
  id: string;
  application_id: string;
  character_name: string;
  discord_name: string;
  experience: string;
  why_join: string;
  hours_per_week: string;
  timezone: string;
  scenario_vehicle_breakdown: string;
  scenario_difficult_customer: string;
  scenario_enhance_roleplay: string;
  rule_break_response: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewer_notes: string | null;
}

const Applications = () => {
  const { role } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'accepted' | 'denied' | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch applications');
      console.error(error);
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (status: 'accepted' | 'denied') => {
    if (!selectedApplication) return;

    const { error } = await supabase
      .from('applications')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', selectedApplication.id);

    if (error) {
      toast.error(`Failed to ${status} application`);
      console.error(error);
    } else {
      toast.success(`Application ${status} successfully`);
      fetchApplications();
    }
    setActionDialogOpen(false);
    setPendingAction(null);
    setSelectedApplication(null);
  };

  const handleDelete = async () => {
    if (!selectedApplication) return;

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', selectedApplication.id);

    if (error) {
      toast.error('Failed to delete application');
      console.error(error);
    } else {
      toast.success('Application deleted successfully');
      fetchApplications();
    }
    setDeleteDialogOpen(false);
    setSelectedApplication(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>;
      case 'accepted':
        return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Accepted</Badge>;
      case 'denied':
        return <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">Denied</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const openActionDialog = (application: Application, action: 'accepted' | 'denied') => {
    setSelectedApplication(application);
    setPendingAction(action);
    setActionDialogOpen(true);
  };

  if (role !== 'owner' && role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground">Manage job applications</p>
        </div>
        <Button variant="outline" onClick={fetchApplications} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Application ID</TableHead>
              <TableHead>Character Name</TableHead>
              <TableHead>Discord</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading applications...
                </TableCell>
              </TableRow>
            ) : applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No applications found
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-mono text-sm">{app.application_id}</TableCell>
                  <TableCell className="font-medium">{app.character_name}</TableCell>
                  <TableCell>{app.discord_name}</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>{format(new Date(app.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedApplication(app);
                          setViewDialogOpen(true);
                        }}
                        className="h-8 w-8"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {app.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openActionDialog(app, 'accepted')}
                            className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openActionDialog(app, 'denied')}
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {role === 'owner' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedApplication(app);
                            setDeleteDialogOpen(true);
                          }}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Application Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              {selectedApplication?.application_id} • {getStatusBadge(selectedApplication?.status || '')}
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Character Name</label>
                  <p className="text-foreground">{selectedApplication.character_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Discord</label>
                  <p className="text-foreground">{selectedApplication.discord_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Timezone</label>
                  <p className="text-foreground">{selectedApplication.timezone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Hours/Week</label>
                  <p className="text-foreground">{selectedApplication.hours_per_week}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Experience</label>
                <p className="text-foreground">{selectedApplication.experience}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Why do you want to join?</label>
                <p className="text-foreground">{selectedApplication.why_join}</p>
              </div>
              
              <div className="border-t border-border pt-4">
                <h4 className="font-medium text-foreground mb-3">Scenario Responses</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Vehicle Breakdown Scenario</label>
                    <p className="text-foreground text-sm">{selectedApplication.scenario_vehicle_breakdown}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Difficult Customer Scenario</label>
                    <p className="text-foreground text-sm">{selectedApplication.scenario_difficult_customer}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Enhance Roleplay Scenario</label>
                    <p className="text-foreground text-sm">{selectedApplication.scenario_enhance_roleplay}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rule Break Response</label>
                    <p className="text-foreground text-sm">{selectedApplication.rule_break_response}</p>
                  </div>
                </div>
              </div>

              {selectedApplication.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    onClick={() => {
                      setViewDialogOpen(false);
                      openActionDialog(selectedApplication, 'accepted');
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    onClick={() => {
                      setViewDialogOpen(false);
                      openActionDialog(selectedApplication, 'denied');
                    }}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Deny
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Accept/Deny Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction === 'accepted' ? 'Accept Application' : 'Deny Application'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {pendingAction === 'accepted' ? 'accept' : 'deny'} this application 
              from {selectedApplication?.character_name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingAction && handleStatusChange(pendingAction)}
              className={pendingAction === 'accepted' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-destructive hover:bg-destructive/90'}
            >
              {pendingAction === 'accepted' ? 'Accept' : 'Deny'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Applications;
