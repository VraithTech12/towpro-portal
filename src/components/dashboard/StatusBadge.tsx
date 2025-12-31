import { cn } from '@/lib/utils';

type StatusType = 'open' | 'closed' | 'in-progress' | 'pending';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  open: {
    label: 'Open',
    className: 'status-open',
  },
  closed: {
    label: 'Closed',
    className: 'status-closed',
  },
  'in-progress': {
    label: 'In Progress',
    className: 'status-progress',
  },
  pending: {
    label: 'Pending',
    className: 'bg-warning/20 text-warning border border-warning/30',
  },
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  
  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
