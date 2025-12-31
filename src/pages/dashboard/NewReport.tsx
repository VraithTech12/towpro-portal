import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const NewReport = () => {
  const { user } = useAuth();
  const { addReport } = useData();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    type: 'tow' as 'tow' | 'roadside' | 'accident' | 'impound',
    location: '',
    vehicle: '',
    customerName: '',
    customerPhone: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.location || !formData.vehicle || !formData.customerName) {
      toast.error('Please fill in all required fields');
      return;
    }

    addReport({
      ...formData,
      status: 'open',
      assignedTo: user?.role === 'employee' ? user.id : undefined,
    });

    toast.success('Report created successfully');
    navigate('/dashboard/reports');
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">New Report</h1>
          <p className="text-sm text-muted-foreground">Create a new service call or report</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g., Vehicle breakdown on Highway 95"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Type <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full h-11 px-4 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="tow">Tow</option>
              <option value="roadside">Roadside Assistance</option>
              <option value="accident">Accident Recovery</option>
              <option value="impound">Impound</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Location <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Enter address or location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Vehicle <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g., 2019 Honda Accord (Silver)"
              value={formData.vehicle}
              onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Customer Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Full name"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Customer Phone
            </label>
            <Input
              placeholder="(555) 123-4567"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Notes
            </label>
            <textarea
              placeholder="Additional details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="w-4 h-4" />
            Create Report
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewReport;
