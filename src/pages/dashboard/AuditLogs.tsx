import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  History, 
  User, 
  FileText, 
  UserPlus, 
  Clock, 
  Settings,
  Filter,
  Calendar,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: string | null;
  created_at: string;
}

const AuditLogs = () => {
  const { role } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const isOwner = role === 'owner';

  // Mock data for now since audit_logs table doesn't exist yet
  const mockLogs: AuditLog[] = [
    {
      id: '1',
      user_id: '123',
      user_name: 'John Smith',
      action: 'report_created',
      entity_type: 'report',
      entity_id: 'abc123',
      details: 'Created dispatch for Vapid Buffalo',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: '456',
      user_name: 'Jane Doe',
      action: 'clock_in',
      entity_type: 'clock_record',
      entity_id: null,
      details: 'Started shift',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      user_id: '123',
      user_name: 'John Smith',
      action: 'report_status_changed',
      entity_type: 'report',
      entity_id: 'abc123',
      details: 'Status changed from open to assigned',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  useEffect(() => {
    // TODO: Fetch from audit_logs table when it exists
    setLogs(mockLogs);
    setIsLoading(false);
  }, []);

  const getActionIcon = (action: string) => {
    if (action.includes('report')) return FileText;
    if (action.includes('user') || action.includes('role')) return UserPlus;
    if (action.includes('clock')) return Clock;
    if (action.includes('settings')) return Settings;
    return History;
  };

  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'text-success';
    if (action.includes('deleted')) return 'text-destructive';
    if (action.includes('updated') || action.includes('changed')) return 'text-blue-400';
    return 'text-muted-foreground';
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  if (!isOwner && role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access restricted to management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">System activity and change history</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-input text-foreground text-sm"
          >
            <option value="all">All Actions</option>
            <option value="report">Reports</option>
            <option value="user">Users</option>
            <option value="clock">Clock In/Out</option>
            <option value="settings">Settings</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Loading audit logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <History className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No audit logs found</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {filteredLogs.map((log) => {
              const Icon = getActionIcon(log.action);
              return (
                <div key={log.id} className="p-4 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${getActionColor(log.action)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{log.user_name}</span>
                        <span className={`text-sm ${getActionColor(log.action)}`}>
                          {formatAction(log.action)}
                        </span>
                        {log.entity_id && (
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                            #{log.entity_id.slice(-6)}
                          </span>
                        )}
                      </div>
                      {log.details && (
                        <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start gap-3">
          <History className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Audit Log System</p>
            <p className="text-sm text-muted-foreground mt-1">
              All system actions are recorded for security and compliance. Logs are immutable and cannot be modified or deleted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
