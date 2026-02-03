-- Allow owners to delete audit logs
CREATE POLICY "Owners can delete audit logs" 
ON public.audit_logs 
FOR DELETE 
USING (has_role(auth.uid(), 'owner'::app_role));