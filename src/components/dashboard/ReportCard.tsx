import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';

export interface Report {
  id: string;
  title: string;
  type: 'tow' | 'roadside' | 'accident' | 'impound';
  status: 'open' | 'closed' | 'in-progress' | 'pending';
  dateCreated: string;
  location?: string;
  vehicle?: string;
}

interface ReportCardProps {
  report: Report;
  compact?: boolean;
}

const typeLabels: Record<string, { label: string; className: string }> = {
  tow: { label: 'Tow', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  roadside: { label: 'Roadside', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  accident: { label: 'Accident', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  impound: { label: 'Impound', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
};

const ReportCard = ({ report, compact = false }: ReportCardProps) => {
  const typeConfig = typeLabels[report.type];

  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
        <div className="flex items-center gap-4">
          <a href="#" className="font-semibold text-foreground hover:text-primary transition-colors underline">
            Report #{report.id}
          </a>
          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${typeConfig.className}`}>
            {typeConfig.label}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{report.dateCreated}</span>
          <StatusBadge status={report.status} />
          <Button variant="outline" size="sm">Open</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <a href="#" className="text-lg font-semibold text-foreground hover:text-primary transition-colors underline">
          Report #{report.id}
        </a>
        <StatusBadge status={report.status} />
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Type</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${typeConfig.className}`}>
            {typeConfig.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Date Created</span>
          <span className="text-sm text-foreground">{report.dateCreated}</span>
        </div>
        {report.vehicle && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Vehicle</span>
            <span className="text-sm text-foreground">{report.vehicle}</span>
          </div>
        )}
      </div>

      <Button variant="outline" size="sm" className="w-full">
        View Details
      </Button>
    </div>
  );
};

export default ReportCard;
