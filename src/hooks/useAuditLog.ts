import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AuditAction =
  | 'report_created'
  | 'report_updated'
  | 'report_deleted'
  | 'report_assigned'
  | 'report_status_changed'
  | 'evidence_uploaded'
  | 'evidence_deleted'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'role_changed'
  | 'clock_in'
  | 'clock_out'
  | 'tow_log_created'
  | 'settings_updated';

interface LogAuditParams {
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  details?: string;
}

export function useAuditLog() {
  const { user, profile } = useAuth();

  const logAudit = useCallback(async (params: LogAuditParams) => {
    if (!user || !profile) return;

    try {
      // Note: audit_logs table will be created via migration
      // This is a placeholder that logs to console until the table exists
      console.log('[AUDIT]', {
        user_id: user.id,
        user_name: profile.name,
        ...params,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }, [user, profile]);

  return { logAudit };
}
