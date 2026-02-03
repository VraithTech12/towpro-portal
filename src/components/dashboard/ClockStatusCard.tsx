import { Button } from '@/components/ui/button';
import { Clock, PlayCircle, StopCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

const ClockStatusCard = () => {
  const { clockIn, clockOut, isClockedIn, todayHours, weeklyHours, clockRecords } = useAuth();
  
  const today = new Date().toISOString().split('T')[0];
  const currentClockRecord = clockRecords.find(r => r.date === today && !r.clock_out);

  return (
    <div className={`p-5 rounded-xl border transition-all ${
      isClockedIn 
        ? 'bg-success/10 border-success/30 shadow-lg shadow-success/10' 
        : 'bg-card border-border'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isClockedIn ? 'bg-success/20' : 'bg-secondary'
          }`}>
            <Clock className={`w-6 h-6 ${isClockedIn ? 'text-success' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className="font-semibold text-foreground text-lg">
              {isClockedIn ? 'On Duty' : 'Off Duty'}
            </p>
            {isClockedIn && currentClockRecord && (
              <p className="text-sm text-muted-foreground">
                Started {formatDistanceToNow(new Date(currentClockRecord.clock_in), { addSuffix: true })}
              </p>
            )}
            {!isClockedIn && (
              <p className="text-sm text-muted-foreground">
                Clock in to start your shift
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Today</p>
            <p className="text-2xl font-bold text-foreground">{todayHours.toFixed(1)}h</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">This Week</p>
            <p className="text-2xl font-bold text-foreground">{weeklyHours.toFixed(1)}h</p>
          </div>
          <Button 
            variant={isClockedIn ? "destructive" : "default"}
            onClick={isClockedIn ? clockOut : clockIn}
            size="lg"
            className="gap-2 min-w-[140px]"
          >
            {isClockedIn ? (
              <>
                <StopCircle className="w-5 h-5" />
                Clock Out
              </>
            ) : (
              <>
                <PlayCircle className="w-5 h-5" />
                Clock In
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClockStatusCard;
