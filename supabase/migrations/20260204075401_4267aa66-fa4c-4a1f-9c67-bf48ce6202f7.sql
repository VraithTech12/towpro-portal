-- Fix security: Require authentication for audit_logs SELECT
CREATE POLICY "Require authentication to view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix security: Require authentication for profiles SELECT  
CREATE POLICY "Require authentication to view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);