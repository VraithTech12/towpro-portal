import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Wrench, User, Phone, Calendar } from 'lucide-react';

interface Mechanic {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  status: 'available' | 'busy' | 'off-duty';
  currentJob?: string;
  completedToday: number;
}

const mockMechanics: Mechanic[] = [
  { id: '1', name: 'Robert Martinez', specialization: 'Engine & Transmission', phone: '(555) 111-2222', status: 'available', completedToday: 3 },
  { id: '2', name: 'Kevin Thompson', specialization: 'Electrical Systems', phone: '(555) 222-3333', status: 'busy', currentJob: 'Unit 105 - Brake Repair', completedToday: 2 },
  { id: '3', name: 'David Wilson', specialization: 'Hydraulics', phone: '(555) 333-4444', status: 'available', completedToday: 4 },
  { id: '4', name: 'Anthony Lee', specialization: 'General Maintenance', phone: '(555) 444-5555', status: 'off-duty', completedToday: 0 },
  { id: '5', name: 'Chris Anderson', specialization: 'Heavy Equipment', phone: '(555) 555-6666', status: 'busy', currentJob: 'Unit 102 - Winch Service', completedToday: 1 },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  available: { label: 'Available', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' },
  busy: { label: 'Busy', color: 'text-primary', bg: 'bg-primary/20 border-primary/30' },
  'off-duty': { label: 'Off Duty', color: 'text-muted-foreground', bg: 'bg-muted border-border' },
};

const Mechanics = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMechanics = mockMechanics.filter((mechanic) =>
    mechanic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mechanic.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mechanics</h1>
          <p className="text-muted-foreground">Manage your maintenance team</p>
        </div>
        {user?.role === 'admin' && (
          <Button>
            <Plus className="w-4 h-4" />
            Add Mechanic
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-success">{mockMechanics.filter(m => m.status === 'available').length}</p>
          <p className="text-sm text-muted-foreground">Available</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{mockMechanics.filter(m => m.status === 'busy').length}</p>
          <p className="text-sm text-muted-foreground">Working</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{mockMechanics.reduce((acc, m) => acc + m.completedToday, 0)}</p>
          <p className="text-sm text-muted-foreground">Jobs Today</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card rounded-xl p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search mechanics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Mechanics List */}
      <div className="grid grid-cols-2 gap-4">
        {filteredMechanics.map((mechanic) => {
          const config = statusConfig[mechanic.status];
          return (
            <div key={mechanic.id} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-lg font-semibold text-foreground">{mechanic.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{mechanic.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      {mechanic.specialization}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.color}`}>
                  {config.label}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{mechanic.phone}</span>
                </div>
                {mechanic.currentJob && (
                  <div className="flex items-center gap-2 text-primary">
                    <Calendar className="w-4 h-4" />
                    <span>{mechanic.currentJob}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-xs">Completed today: <span className="text-foreground font-medium">{mechanic.completedToday}</span></span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">View Profile</Button>
                {mechanic.status === 'available' && (
                  <Button size="sm" className="flex-1">Assign Job</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Mechanics;
