import { Clock, FileText } from 'lucide-react';

interface LatestReport {
  id: string;
  title: string;
  timestamp: string;
  status: string;
}

const mockLatestReports: LatestReport[] = [
  { id: '421', title: 'Highway 95 - Vehicle Breakdown', timestamp: '12/31/2025 2:45 PM', status: 'Pending' },
  { id: '420', title: 'Downtown - Accident Recovery', timestamp: '12/31/2025 1:30 PM', status: 'Completed' },
  { id: '419', title: 'West Side - Impound Request', timestamp: '12/31/2025 11:15 AM', status: 'In Progress' },
  { id: '418', title: 'Main Street - Jump Start', timestamp: '12/30/2025 5:22 PM', status: 'Completed' },
];

const LatestReports = () => {
  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        Latest Reports
      </h3>

      <div className="space-y-3">
        {mockLatestReports.map((report) => (
          <div
            key={report.id}
            className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <a href="#" className="font-medium text-foreground hover:text-primary transition-colors">
                #{report.id} - {report.title}
              </a>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{report.timestamp}</span>
              <span className="ml-auto px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs">
                {report.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestReports;
