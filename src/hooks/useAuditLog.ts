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
    if (!user || !profile) {
      console.warn('[AUDIT] Cannot log - no user/profile');
      return;
    }

    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          user_name: profile.name,
          action: params.action,
          entity_type: params.entityType,
          entity_id: params.entityId || null,
          details: params.details || null,
          old_value: params.oldValue as Record<string, unknown> | null,
          new_value: params.newValue as Record<string, unknown> | null,
        } as never);

      if (error) {
        console.error('[AUDIT] Failed to log:', error);
      }
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }, [user, profile]);

  return { logAudit };
}
