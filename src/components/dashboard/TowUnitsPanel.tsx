import { Truck, User, MapPin } from 'lucide-react';

interface TowUnit {
  id: string;
  name: string;
  operator: string;
  status: 'available' | 'dispatched' | 'offline';
  location?: string;
}

const mockUnits: TowUnit[] = [
  { id: '1', name: 'Unit 101', operator: 'Mike Johnson', status: 'available', location: 'Downtown' },
  { id: '2', name: 'Unit 102', operator: 'Sarah Williams', status: 'dispatched', location: 'Highway 95' },
  { id: '3', name: 'Unit 103', operator: 'Tom Davis', status: 'available', location: 'West Side' },
  { id: '4', name: 'Unit 104', operator: 'Lisa Chen', status: 'offline' },
];

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  available: { label: 'Available', color: 'text-green-400', dot: 'bg-green-400' },
  dispatched: { label: 'Dispatched', color: 'text-primary', dot: 'bg-primary' },
  offline: { label: 'Offline', color: 'text-muted-foreground', dot: 'bg-muted-foreground' },
};

const TowUnitsPanel = () => {
  const availableCount = mockUnits.filter(u => u.status === 'available').length;
  const dispatchedCount = mockUnits.filter(u => u.status === 'dispatched').length;

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Truck className="w-5 h-5 text-primary" />
          Tow Units
        </h3>
        <span className="text-sm text-muted-foreground">{mockUnits.length} total</span>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 p-3 rounded-lg bg-success/10 border border-success/20">
          <p className="text-2xl font-bold text-success">{availableCount}</p>
          <p className="text-xs text-muted-foreground">Available</p>
        </div>
        <div className="flex-1 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-2xl font-bold text-primary">{dispatchedCount}</p>
          <p className="text-xs text-muted-foreground">Dispatched</p>
        </div>
      </div>

      <div className="space-y-3">
        {mockUnits.map((unit) => {
          const config = statusConfig[unit.status];
          return (
            <div
              key={unit.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${config.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{unit.name}</span>
                  <span className={`text-xs ${config.color}`}>({config.label})</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span className="truncate">{unit.operator}</span>
                  {unit.location && (
                    <>
                      <MapPin className="w-3 h-3 ml-2" />
                      <span className="truncate">{unit.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TowUnitsPanel;
