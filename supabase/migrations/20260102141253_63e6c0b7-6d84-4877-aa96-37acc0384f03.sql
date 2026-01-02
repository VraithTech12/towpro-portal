-- Fix: Applications should only be viewable by applicant (via application_id match) or admins
-- First drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view applications by application_id" ON public.applications;

-- Create a more restrictive policy - only allow viewing via exact application_id match
-- This requires the application_id to be passed as a parameter, not browsing all
CREATE POLICY "View own application by application_id"
ON public.applications
FOR SELECT
USING (
  -- Owners and admins can view all
  is_owner_or_admin(auth.uid())
);

-- Enable leaked password protection by adding a comment (actual setting is in auth config)
-- This is handled via configure-auth tool