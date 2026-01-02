import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Loader2, Calendar, MapPin, Users, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const NewReport = () => {
  const { user } = useAuth();
  const { addReport } = useData();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'tow' as 'tow' | 'roadside' | 'impound' | 'pd_tow',
    location: '',
    customerName: '',
    customerPhone: '',
    notes: '',
    dueDate: '',
  });

  const reportTypes = [
    { value: 'tow', label: 'Tow' },
    { value: 'roadside', label: 'Road Assistance' },
    { value: 'impound', label: 'Impound' },
    { value: 'pd_tow', label: 'PD Tow' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Customer name is required only if NOT a PD tow
    if (formData.type !== 'pd_tow' && !formData.customerName) {
      toast.error('Customer name is required for non-PD tows');
      return;
    }

    setIsSubmitting(true);
    
    const success = await addReport({
      title: formData.title,
      type: formData.type,
      location: formData.location,
      customerName: formData.customerName || undefined,
      customerPhone: formData.customerPhone || undefined,
      notes: formData.notes || undefined,
      dueDate: formData.dueDate || undefined,
      status: 'open',
    });

    setIsSubmitting(false);

    if (success) {
      toast.success('Report created successfully');
      navigate('/dashboard/reports');
    } else {
      toast.error('Failed to create report');
    }
  };

  const currentDate = new Date();
  const formattedDate = format(currentDate, 'EEEE, MMMM do, yyyy');
  const formattedTime = format(currentDate, 'h:mm a');

  return (
    <div className="max-w-4xl animate-fade-in">
      {/* Header */}
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Report Card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Report Header with Title Input */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter report title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-lg font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                <span>{formattedTime}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
          </div>

          {/* Report Details Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Report Type */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Report Type <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full h-11 px-4 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Due Date
              </label>
              <Input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="h-11"
              />
            </div>

            {/* Location */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Location <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Enter address or location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="h-11"
              />
            </div>

            {/* Customer Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                Customer Name {formData.type !== 'pd_tow' && <span className="text-destructive">*</span>}
              </label>
              <Input
                placeholder="Full name"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="h-11"
              />
            </div>

            {/* Customer Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Customer Phone
              </label>
              <Input
                placeholder="(555) 123-4567"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="h-11"
              />
            </div>
          </div>
        </div>

        {/* Workers Assigned Section */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Workers Assigned</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            No workers assigned yet. Workers can be assigned after creating the report.
          </p>
        </div>

        {/* Notes Section */}
        <div className="bg-card border border-border rounded-xl p-6">
          <label className="block text-sm font-medium text-foreground mb-3">
            Notes
          </label>
          <textarea
            placeholder="Additional details..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Create Report
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewReport;
