-- Create applications table for job applicants
CREATE TABLE public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id text NOT NULL UNIQUE DEFAULT ('TOW' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8))),
  character_name text NOT NULL,
  discord_name text NOT NULL,
  timezone text NOT NULL,
  hours_per_week text NOT NULL,
  why_join text NOT NULL,
  experience text NOT NULL,
  scenario_vehicle_breakdown text NOT NULL,
  scenario_difficult_customer text NOT NULL,
  scenario_enhance_roleplay text NOT NULL,
  rule_break_response text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reviewer_notes text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application (no auth required)
CREATE POLICY "Anyone can submit applications"
ON public.applications
FOR INSERT
WITH CHECK (true);

-- Anyone can check their application status by application_id
CREATE POLICY "Anyone can view applications by application_id"
ON public.applications
FOR SELECT
USING (true);

-- Only owners and admins can update applications (for reviewing)
CREATE POLICY "Owners and admins can update applications"
ON public.applications
FOR UPDATE
USING (is_owner_or_admin(auth.uid()));

-- Only owners can delete applications
CREATE POLICY "Owners can delete applications"
ON public.applications
FOR DELETE
USING (has_role(auth.uid(), 'owner'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();