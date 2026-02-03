import { cn } from '@/lib/utils';

export type TowStatus = 'open' | 'assigned' | 'en_route' | 'in_progress' | 'completed' | 'cancelled' | 'closed';

interface TowStatusBadgeProps {
  status: TowStatus;
  className?: string;
  showDot?: boolean;
}

const statusConfig: Record<TowStatus, { label: string; className: string; dotColor: string }> = {
  open: {
    label: 'Open',
    className: 'bg-primary/20 text-primary border-primary/30',
    dotColor: 'bg-primary',
  },
  assigned: {
    label: 'Assigned',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    dotColor: 'bg-blue-400',
  },
  en_route: {
    label: 'En Route',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    dotColor: 'bg-amber-400 animate-pulse',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    dotColor: 'bg-blue-400',
  },
  completed: {
    label: 'Completed',
    className: 'bg-success/20 text-success border-success/30',
    dotColor: 'bg-success',
  },
  closed: {
    label: 'Closed',
    className: 'bg-muted text-muted-foreground border-border',
    dotColor: 'bg-muted-foreground',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-destructive/20 text-destructive border-destructive/30',
    dotColor: 'bg-destructive',
  },
};

const TowStatusBadge = ({ status, className, showDot = true }: TowStatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.open;
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
      config.className,
      className
    )}>
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
      )}
      {config.label}
    </span>
  );
};

export default TowStatusBadge;
