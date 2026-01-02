import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, ArrowLeft, Loader2, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';


interface ApplicationStatus {
  application_id: string;
  character_name: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewer_notes: string | null;
}

const CheckStatus = () => {
  const [applicationId, setApplicationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [application, setApplication] = useState<ApplicationStatus | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotFound(false);
    setApplication(null);

    try {
      const { data, error } = await supabase
        .from('applications')
        .select('application_id, character_name, status, created_at, reviewed_at, reviewer_notes')
        .eq('application_id', applicationId.toUpperCase().trim())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setNotFound(true);
      } else {
        setApplication(data);
      }
    } catch (error: any) {
      console.error('Error checking status:', error);
      toast.error(error.message || 'Failed to check status');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-8 h-8 text-success" />;
      case 'denied':
        return <XCircle className="w-8 h-8 text-destructive" />;
      default:
        return <Clock className="w-8 h-8 text-amber-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return { label: 'Approved', className: 'bg-success/20 text-success' };
      case 'denied':
        return { label: 'Denied', className: 'bg-destructive/20 text-destructive' };
      default:
        return { label: 'Pending Review', className: 'bg-amber-500/20 text-amber-500' };
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          
          <Search className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Check Application Status</h1>
          <p className="text-muted-foreground">
            Enter your unique Application ID to see the current status.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-foreground">Application Status</h2>
            <p className="text-sm text-muted-foreground">Enter the ID you received upon submission.</p>
          </div>

          <form onSubmit={handleCheck} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="applicationId">Application ID</Label>
              <Input
                id="applicationId"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="TOW12345678"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Check Status
            </Button>
          </form>
        </div>

        {/* Results */}
        {notFound && (
          <div className="bg-card border border-border rounded-xl p-6 text-center space-y-3">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-foreground font-medium">Application Not Found</p>
            <p className="text-sm text-muted-foreground">
              No application found with that ID. Please check the ID and try again.
            </p>
          </div>
        )}

        {application && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Status Header */}
            <div className={`p-6 text-center ${
              application.status === 'approved' 
                ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10' 
                : application.status === 'denied'
                ? 'bg-gradient-to-br from-red-500/20 to-red-600/10'
                : 'bg-gradient-to-br from-amber-500/20 to-amber-600/10'
            }`}>
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                application.status === 'approved'
                  ? 'bg-emerald-500/20 ring-2 ring-emerald-500/30'
                  : application.status === 'denied'
                  ? 'bg-red-500/20 ring-2 ring-red-500/30'
                  : 'bg-amber-500/20 ring-2 ring-amber-500/30'
              }`}>
                {getStatusIcon(application.status)}
              </div>
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusLabel(application.status).className} border ${
                application.status === 'approved'
                  ? 'border-emerald-500/30'
                  : application.status === 'denied'
                  ? 'border-red-500/30'
                  : 'border-amber-500/30'
              }`}>
                {getStatusLabel(application.status).label}
              </span>
            </div>

            {/* Application Details */}
            <div className="p-6 space-y-4">
              <div className="grid gap-3">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Application ID</span>
                  <span className="text-sm font-mono font-semibold text-primary">{application.application_id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Character Name</span>
                  <span className="text-sm font-medium text-foreground">{application.character_name}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Submitted</span>
                  <span className="text-sm font-medium text-foreground">
                    {new Date(application.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                {application.reviewed_at && (
                  <div className="flex justify-between items-center py-2 border-t border-border/50">
                    <span className="text-sm text-muted-foreground">Reviewed</span>
                    <span className="text-sm font-medium text-foreground">
                      {new Date(application.reviewed_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
              </div>

              {application.reviewer_notes && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Reviewer Notes</p>
                  <p className="text-sm text-foreground bg-secondary/50 rounded-lg p-4 border border-border/50">
                    {application.reviewer_notes}
                  </p>
                </div>
              )}

              {application.status === 'approved' && (
                <div className="mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm text-emerald-400 text-center font-medium">
                    🎉 Congratulations! Please check your Discord for next steps.
                  </p>
                </div>
              )}

              {application.status === 'denied' && (
                <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400 text-center">
                    Unfortunately, your application was not approved at this time.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center">
          <Link to="/login" className="text-primary hover:underline inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckStatus;