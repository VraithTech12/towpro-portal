import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navigate } from 'react-router-dom';
import { Building, Bell, Shield, Save, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { z } from 'zod';

interface CompanySettings {
  id: string;
  company_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notify_new_jobs: boolean;
  notify_job_status: boolean;
  notify_unit_availability: boolean;
  notify_daily_reports: boolean;
}

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Settings = () => {
  const { role } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  
  // Password change dialog state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Owner or admin only page
  if (role !== 'owner' && role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('company_settings')
        .update({
          company_name: settings.company_name,
          phone: settings.phone,
          email: settings.email,
          address: settings.address,
          notify_new_jobs: settings.notify_new_jobs,
          notify_job_status: settings.notify_job_status,
          notify_unit_availability: settings.notify_unit_availability,
          notify_daily_reports: settings.notify_daily_reports,
        })
        .eq('id', settings.id);

      if (error) throw error;
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const validation = passwordSchema.safeParse({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      setIsChangingPassword(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Password changed successfully');
      setPasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const updateSetting = <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your company settings and preferences</p>
      </div>

      {/* Company Settings */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Building className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Company Information</h2>
            <p className="text-sm text-muted-foreground">Update your company details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Company Name</label>
            <Input 
              value={settings?.company_name || ''} 
              onChange={(e) => updateSetting('company_name', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
            <Input 
              value={settings?.phone || ''} 
              onChange={(e) => updateSetting('phone', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <Input 
              value={settings?.email || ''} 
              onChange={(e) => updateSetting('email', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Address</label>
            <Input 
              value={settings?.address || ''} 
              onChange={(e) => updateSetting('address', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
            <p className="text-sm text-muted-foreground">Configure notification preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
              <p className="font-medium text-foreground">New job assignments</p>
              <p className="text-sm text-muted-foreground">Get notified when new jobs are assigned</p>
            </div>
            <Switch 
              checked={settings?.notify_new_jobs ?? false}
              onCheckedChange={(checked) => updateSetting('notify_new_jobs', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
              <p className="font-medium text-foreground">Job status updates</p>
              <p className="text-sm text-muted-foreground">Updates when job status changes</p>
            </div>
            <Switch 
              checked={settings?.notify_job_status ?? false}
              onCheckedChange={(checked) => updateSetting('notify_job_status', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
              <p className="font-medium text-foreground">Unit availability</p>
              <p className="text-sm text-muted-foreground">Alerts when units become available</p>
            </div>
            <Switch 
              checked={settings?.notify_unit_availability ?? false}
              onCheckedChange={(checked) => updateSetting('notify_unit_availability', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
              <p className="font-medium text-foreground">Daily reports</p>
              <p className="text-sm text-muted-foreground">Receive daily summary reports</p>
            </div>
            <Switch 
              checked={settings?.notify_daily_reports ?? false}
              onCheckedChange={(checked) => updateSetting('notify_daily_reports', checked)}
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Security</h2>
            <p className="text-sm text-muted-foreground">Manage security settings</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Change Password</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your new password below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                  {isChangingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Change Password
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={() => toast.info('Two-factor authentication coming soon')}>
            Enable Two-Factor Authentication
          </Button>
          <Button variant="outline" onClick={() => toast.info('Login history coming soon')}>
            View Login History
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Settings;
