import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Loader2, MapPin, Car, FileText, Clock, Shield, User, Phone } from 'lucide-react';
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
    { value: 'pd_tow', label: 'PD Tow', icon: Shield, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    { value: 'tow', label: 'Civilian', icon: Car, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    { value: 'impound', label: 'Impound', icon: Car, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
    { value: 'roadside', label: 'Roadside Assist', icon: Car, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
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
      status: role === 'employee' ? 'assigned' : 'open',
    });

    setIsSubmitting(false);

    if (success) {
      toast.success(role === 'employee' ? 'Report created and assigned to you' : 'Report created successfully');
      navigate('/dashboard/reports');
    } else {
      toast.error('Failed to create report');
    }
  };

  const currentDate = new Date();
  const formattedDate = format(currentDate, 'EEEE, MMMM do, yyyy');
  const formattedTime = format(currentDate, 'h:mm a');

  const availableModels = formData.vehicleMake ? getModelsForMake(formData.vehicleMake) : [];

  const selectedTypeInfo = reportTypes.find(t => t.value === formData.type);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">New Report</h1>
            <p className="text-sm text-muted-foreground">{formattedDate} • {formattedTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border px-4 py-2 rounded-xl">
          <Clock className="w-4 h-4" />
          <span>Auto-saves as draft</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Report Title - Prominent */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <FileText className="w-4 h-4 text-primary" />
            Report Title <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="Enter a clear, descriptive title for this report..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="text-xl font-semibold h-14 bg-secondary/50 border-border"
          />
          <p className="text-xs text-muted-foreground mt-2">Leave blank to auto-generate from vehicle info</p>
        </div>

        {/* Call Type Selection */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Call Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {reportTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value as any })}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  formData.type === type.value
                    ? `border-primary bg-primary/10`
                    : `border-border hover:border-primary/50 ${type.bg}`
                }`}
              >
                <type.icon className={`w-7 h-7 mb-3 ${
                  formData.type === type.value ? 'text-primary' : type.color
                }`} />
                <p className="font-semibold text-foreground">{type.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Location & Customer */}
          <div className="space-y-6">
            {/* Location */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Location <span className="text-destructive">*</span>
              </h2>
              <div className="space-y-3">
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-secondary/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select a location...</option>
                  {LS_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <Input
                  placeholder="Or enter custom address..."
                  value={!LS_LOCATIONS.includes(formData.location as any) ? formData.location : ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-12"
                />
              </div>
            </div>

            {/* Customer Info */}
            {formData.type !== 'pd_tow' ? (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  Customer Information
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Customer full name"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      Phone
                    </label>
                    <Input
                      placeholder="(555) 123-4567"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="h-12"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 text-amber-400 mb-2">
                  <Shield className="w-6 h-6" />
                  <span className="font-semibold">Police Department Request</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Customer information is not required for PD tow reports.
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Vehicle */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-muted-foreground" />
              Vehicle Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Make</label>
                <select
                  value={formData.vehicleMake}
                  onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value, vehicleModel: '' })}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-secondary/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                  className="w-full h-12 px-4 rounded-xl border border-border bg-secondary/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                  className="h-12 uppercase font-mono"
                  maxLength={8}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Color</label>
                <select
                  value={formData.vehicleColor}
                  onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-secondary/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select color...</option>
                  {vehicleColors.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium text-foreground">Reason for Tow</label>
                <select
                  value={formData.towReason}
                  onChange={(e) => setFormData({ ...formData, towReason: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-secondary/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select reason...</option>
                  {TOW_REASONS.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Additional Notes</h2>
          <textarea
            placeholder="Describe the situation, any special instructions, or relevant details..."
            value={formData.scenarioNotes}
            onChange={(e) => setFormData({ ...formData, scenarioNotes: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/50 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-[160px]">
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Report
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewReport;
