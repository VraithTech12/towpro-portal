import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Wrench, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface Mechanic {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  status: 'available' | 'busy' | 'off-duty';
}

const Mechanics = () => {
  const { user } = useAuth();
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMechanic, setNewMechanic] = useState({
    name: '',
    specialization: '',
    phone: '',
  });

  const filteredMechanics = mechanics.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMechanic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMechanic.name || !newMechanic.specialization) {
      toast.error('Please fill in required fields');
      return;
    }

    setMechanics([
      {
        ...newMechanic,
        id: Date.now().toString(),
        status: 'available',
      },
      ...mechanics,
    ]);

    setNewMechanic({ name: '', specialization: '', phone: '' });
    setShowAddForm(false);
    toast.success('Mechanic added');
  };

  const handleStatusChange = (id: string, status: Mechanic['status']) => {
    setMechanics((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
    toast.success('Status updated');
  };

  const handleDelete = (id: string) => {
    if (user?.role !== 'admin') {
      toast.error('Only admins can delete');
      return;
    }
    setMechanics((prev) => prev.filter((m) => m.id !== id));
    toast.success('Mechanic removed');
  };

  const statusConfig: Record<string, { label: string; className: string }> = {
    available: { label: 'Available', className: 'bg-success/20 text-success' },
    busy: { label: 'Busy', className: 'bg-primary/20 text-primary' },
    'off-duty': { label: 'Off Duty', className: 'bg-muted text-muted-foreground' },
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Mechanics</h1>
          <p className="text-sm text-muted-foreground">Manage your maintenance team</p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4" />
            Add Mechanic
          </Button>
        )}
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Add Mechanic</h2>
              <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMechanic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Name *</label>
                <Input
                  placeholder="Full name"
                  value={newMechanic.name}
                  onChange={(e) => setNewMechanic({ ...newMechanic, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Specialization *</label>
                <Input
                  placeholder="e.g., Engine & Transmission"
                  value={newMechanic.specialization}
                  onChange={(e) => setNewMechanic({ ...newMechanic, specialization: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                <Input
                  placeholder="(555) 123-4567"
                  value={newMechanic.phone}
                  onChange={(e) => setNewMechanic({ ...newMechanic, phone: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">Add</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search mechanics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* List */}
      {filteredMechanics.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">
            {mechanics.length === 0 ? 'No mechanics added yet' : 'No mechanics match your search'}
          </p>
          {mechanics.length === 0 && user?.role === 'admin' && (
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4" />
              Add Mechanic
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredMechanics.map((mechanic) => (
            <div key={mechanic.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <span className="font-medium text-foreground">{mechanic.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{mechanic.name}</h3>
                    <p className="text-xs text-muted-foreground">{mechanic.specialization}</p>
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(mechanic.id)}
                    className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {mechanic.phone && (
                <p className="text-sm text-muted-foreground mb-3">Phone: {mechanic.phone}</p>
              )}

              <select
                value={mechanic.status}
                onChange={(e) => handleStatusChange(mechanic.id, e.target.value as Mechanic['status'])}
                className={`w-full h-8 px-3 rounded border border-border text-xs font-medium ${statusConfig[mechanic.status].className}`}
                disabled={user?.role !== 'admin'}
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="off-duty">Off Duty</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Mechanics;
