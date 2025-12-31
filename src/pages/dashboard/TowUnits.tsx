import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Truck, MapPin, User, Phone } from 'lucide-react';

interface TowUnit {
  id: string;
  name: string;
  operator: string;
  phone: string;
  status: 'available' | 'dispatched' | 'offline' | 'maintenance';
  location: string;
  vehicleType: string;
  licensePlate: string;
}

const mockTowUnits: TowUnit[] = [
  { id: '1', name: 'Unit 101', operator: 'Mike Johnson', phone: '(555) 123-4567', status: 'available', location: 'Downtown Station', vehicleType: 'Flatbed', licensePlate: 'TOW-101' },
  { id: '2', name: 'Unit 102', operator: 'Sarah Williams', phone: '(555) 234-5678', status: 'dispatched', location: 'Highway 95 Mile 42', vehicleType: 'Wheel-Lift', licensePlate: 'TOW-102' },
  { id: '3', name: 'Unit 103', operator: 'Tom Davis', phone: '(555) 345-6789', status: 'available', location: 'West Side Yard', vehicleType: 'Flatbed', licensePlate: 'TOW-103' },
  { id: '4', name: 'Unit 104', operator: 'Lisa Chen', phone: '(555) 456-7890', status: 'offline', location: 'N/A', vehicleType: 'Heavy-Duty', licensePlate: 'TOW-104' },
  { id: '5', name: 'Unit 105', operator: 'James Brown', phone: '(555) 567-8901', status: 'maintenance', location: 'Mechanic Shop', vehicleType: 'Flatbed', licensePlate: 'TOW-105' },
  { id: '6', name: 'Unit 106', operator: 'Maria Garcia', phone: '(555) 678-9012', status: 'dispatched', location: 'Main Street Accident', vehicleType: 'Wheel-Lift', licensePlate: 'TOW-106' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  available: { label: 'Available', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' },
  dispatched: { label: 'Dispatched', color: 'text-primary', bg: 'bg-primary/20 border-primary/30' },
  offline: { label: 'Offline', color: 'text-muted-foreground', bg: 'bg-muted border-border' },
  maintenance: { label: 'Maintenance', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' },
};

const TowUnits = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredUnits = mockTowUnits.filter((unit) => {
    const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.operator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || unit.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tow Units</h1>
          <p className="text-muted-foreground">Manage your fleet and dispatch units</p>
        </div>
        {user?.role === 'admin' && (
          <Button>
            <Plus className="w-4 h-4" />
            Add Unit
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-success">{mockTowUnits.filter(u => u.status === 'available').length}</p>
          <p className="text-sm text-muted-foreground">Available</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{mockTowUnits.filter(u => u.status === 'dispatched').length}</p>
          <p className="text-sm text-muted-foreground">Dispatched</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{mockTowUnits.filter(u => u.status === 'maintenance').length}</p>
          <p className="text-sm text-muted-foreground">Maintenance</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{mockTowUnits.filter(u => u.status === 'offline').length}</p>
          <p className="text-sm text-muted-foreground">Offline</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search units or operators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-11 px-4 rounded-lg border border-border/50 bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="dispatched">Dispatched</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredUnits.map((unit) => {
          const config = statusConfig[unit.status];
          return (
            <div key={unit.id} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{unit.name}</h3>
                    <p className="text-xs text-muted-foreground">{unit.licensePlate} • {unit.vehicleType}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.color}`}>
                  {config.label}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{unit.operator}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{unit.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{unit.location}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                {unit.status === 'available' && (
                  <Button size="sm" className="flex-1">Dispatch</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TowUnits;
