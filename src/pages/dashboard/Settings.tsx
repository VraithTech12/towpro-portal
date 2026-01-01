import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navigate } from 'react-router-dom';
import { Settings as SettingsIcon, Building, Bell, Shield, Palette, Save } from 'lucide-react';

const Settings = () => {
  const { role } = useAuth();

  // Owner or admin only page
  if (role !== 'owner' && role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Company Name</label>
            <Input defaultValue="TowPro Services" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
            <Input defaultValue="(555) 999-8888" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <Input defaultValue="dispatch@towpro.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Address</label>
            <Input defaultValue="123 Tow Lane, City, ST 12345" />
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
          {[
            { label: 'New job assignments', description: 'Get notified when new jobs are assigned', enabled: true },
            { label: 'Job status updates', description: 'Updates when job status changes', enabled: true },
            { label: 'Unit availability', description: 'Alerts when units become available', enabled: false },
            { label: 'Daily reports', description: 'Receive daily summary reports', enabled: true },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <button
                className={`w-12 h-6 rounded-full transition-colors ${
                  item.enabled ? 'bg-primary' : 'bg-muted'
                } relative`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-foreground transition-transform ${
                    item.enabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          ))}
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

        <div className="space-y-4">
          <Button variant="outline">Change Password</Button>
          <Button variant="outline">Enable Two-Factor Authentication</Button>
          <Button variant="outline">View Login History</Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="lg">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Settings;
