-- Create company_settings table to store company configuration
CREATE TABLE public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'TowPro Services',
  phone TEXT DEFAULT '(555) 999-8888',
  email TEXT DEFAULT 'dispatch@towpro.com',
  address TEXT DEFAULT '123 Tow Lane, City, ST 12345',
  notify_new_jobs BOOLEAN NOT NULL DEFAULT true,
  notify_job_status BOOLEAN NOT NULL DEFAULT true,
  notify_unit_availability BOOLEAN NOT NULL DEFAULT false,
  notify_daily_reports BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Only owners and admins can view settings
CREATE POLICY "Owners and admins can view settings"
ON public.company_settings
FOR SELECT
USING (is_owner_or_admin(auth.uid()));

-- Only owners and admins can update settings
CREATE POLICY "Owners and admins can update settings"
ON public.company_settings
FOR UPDATE
USING (is_owner_or_admin(auth.uid()));

-- Only owners can insert settings (initial setup)
CREATE POLICY "Owners can insert settings"
ON public.company_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'owner'::app_role));

-- Insert default settings row
INSERT INTO public.company_settings (id) VALUES (gen_random_uuid());

-- Add trigger for updated_at
CREATE TRIGGER update_company_settings_updated_at
BEFORE UPDATE ON public.company_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();