import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Loader2, Calendar, MapPin, Car, FileText, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { GTA_VEHICLE_MAKES, getModelsForMake, TOW_REASONS, LS_LOCATIONS } from '@/lib/gta-vehicles';

const NewReport = () => {
  const { user, role } = useAuth();
  const { addReport } = useData();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'tow' as 'tow' | 'roadside' | 'impound' | 'pd_tow',
    location: '',
    customerName: '',
    customerPhone: '',
    vehicleMake: '',
    vehicleModel: '',
    vehiclePlate: '',
    vehicleColor: '',
    towReason: '',
    scenarioNotes: '',
    notes: '',
    dueDate: '',
  });

  const reportTypes = [
    { value: 'tow', label: 'Civilian Tow', icon: Car, description: 'Standard civilian tow service' },
    { value: 'roadside', label: 'Roadside Assistance', icon: Car, description: 'On-site vehicle assistance' },
    { value: 'impound', label: 'Impound', icon: Car, description: 'Vehicle impound and storage' },
    { value: 'pd_tow', label: 'PD Tow', icon: Shield, description: 'Police Department request' },
  ];

  const vehicleColors = [
    'Black', 'White', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow', 
    'Orange', 'Purple', 'Pink', 'Brown', 'Gold', 'Chrome', 'Matte Black',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.type !== 'pd_tow' && !formData.customerName) {
      toast.error('Customer name is required for civilian calls');
      return;
    }

    setIsSubmitting(true);
    
    // Build title with vehicle info if provided
    let autoTitle = formData.title;
    if (!autoTitle && formData.vehicleMake && formData.vehicleModel) {
      autoTitle = `${formData.type === 'pd_tow' ? 'PD' : 'Civ'} Tow - ${formData.vehicleMake} ${formData.vehicleModel}`;
    }

    const success = await addReport({
      title: autoTitle || `${formData.type.toUpperCase()} - ${formData.location}`,
      type: formData.type,
      location: formData.location,
      customerName: formData.customerName || undefined,
      customerPhone: formData.customerPhone || undefined,
      notes: [
        formData.vehicleMake && `Vehicle: ${formData.vehicleMake} ${formData.vehicleModel || ''} ${formData.vehicleColor || ''}`.trim(),
        formData.vehiclePlate && `Plate: ${formData.vehiclePlate}`,
        formData.towReason && `Reason: ${formData.towReason}`,
        formData.scenarioNotes && `Notes: ${formData.scenarioNotes}`,
        formData.notes,
      ].filter(Boolean).join('\n'),
      dueDate: formData.dueDate || undefined,
      status: 'open',
    });

    setIsSubmitting(false);

    if (success) {
      toast.success('Dispatch created successfully - standing by for assignment');
      navigate('/dashboard/reports');
    } else {
      toast.error('Failed to create dispatch');
    }
  };

  const currentDate = new Date();
  const formattedDate = format(currentDate, 'EEEE, MMMM do, yyyy');
  const formattedTime = format(currentDate, 'h:mm a');

  const availableModels = formData.vehicleMake ? getModelsForMake(formData.vehicleMake) : [];

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
          <h1 className="text-xl font-semibold text-foreground">New Dispatch</h1>
          <p className="text-sm text-muted-foreground">Create a new tow request or service call</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Call Type Selection */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Call Type
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {reportTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value as any })}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  formData.type === type.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <type.icon className={`w-6 h-6 mb-2 ${
                  formData.type === type.value ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <p className="font-medium text-foreground text-sm">{type.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Report Card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter dispatch title (or leave blank for auto-generate)..."
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

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Location <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full h-11 px-4 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select location...</option>
                {LS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <Input
                placeholder="Or enter custom address..."
                value={!LS_LOCATIONS.includes(formData.location as any) ? formData.location : ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="h-11"
              />
            </div>

            {/* Customer Info (hide for PD Tow) */}
            {formData.type !== 'pd_tow' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Customer Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Full name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Customer Phone</label>
                  <Input
                    placeholder="(555) 123-4567"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="h-11"
                  />
                </div>
              </>
            )}

            {formData.type === 'pd_tow' && (
              <div className="md:col-span-2 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-400">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Police Department Request</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Customer information not required for PD dispatches.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-muted-foreground" />
            Vehicle Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Make</label>
              <select
                value={formData.vehicleMake}
                onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value, vehicleModel: '' })}
                className="w-full h-11 px-4 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select make...</option>
                {GTA_VEHICLE_MAKES.map((make) => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Model</label>
              <select
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                className="w-full h-11 px-4 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={!formData.vehicleMake}
              >
                <option value="">Select model...</option>
                {availableModels.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">License Plate</label>
              <Input
                placeholder="e.g. 12ABC345"
                value={formData.vehiclePlate}
                onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value.toUpperCase() })}
                className="h-11 uppercase"
                maxLength={8}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Color</label>
              <select
                value={formData.vehicleColor}
                onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                className="w-full h-11 px-4 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select color...</option>
                {vehicleColors.map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tow Details */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Tow Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Reason for Tow</label>
              <select
                value={formData.towReason}
                onChange={(e) => setFormData({ ...formData, towReason: e.target.value })}
                className="w-full h-11 px-4 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select reason...</option>
                {TOW_REASONS.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
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
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Scenario Notes</label>
              <textarea
                placeholder="Describe the situation..."
                value={formData.scenarioNotes}
                onChange={(e) => setFormData({ ...formData, scenarioNotes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Additional Notes</label>
              <textarea
                placeholder="Any other details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
          </div>
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
            Create Dispatch
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewReport;
