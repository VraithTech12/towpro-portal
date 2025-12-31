import { CheckCircle, DollarSign, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompletedJob {
  id: string;
  customer: string;
  vehicle: string;
  operator: string;
  amount: string;
  completedAt: string;
}

const mockJobs: CompletedJob[] = [
  { id: 'J-1001', customer: 'John Smith', vehicle: '2019 Honda Accord', operator: 'Mike Johnson', amount: '$125.00', completedAt: '12/31/2025 at 2:30 PM' },
  { id: 'J-1002', customer: 'Emily Davis', vehicle: '2021 Toyota Camry', operator: 'Sarah Williams', amount: '$95.00', completedAt: '12/31/2025 at 1:15 PM' },
];

const CompletedJobs = () => {
  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-success" />
        Completed Jobs
      </h3>

      <div className="space-y-4">
        {mockJobs.map((job) => (
          <div
            key={job.id}
            className="p-4 rounded-lg bg-secondary/50 border border-border/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <span className="text-success font-bold text-sm">{job.customer.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{job.customer}</p>
                  <p className="text-xs text-muted-foreground">{job.id}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">View Report</Button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Truck className="w-3 h-3" />
                <span className="truncate">{job.vehicle}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="w-3 h-3" />
                <span className="text-success font-medium">{job.amount}</span>
              </div>
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              Completed: {job.completedAt}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedJobs;
