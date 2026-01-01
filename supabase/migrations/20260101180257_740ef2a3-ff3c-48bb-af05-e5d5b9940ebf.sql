-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL,
  assigned_to UUID NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  pd_tow BOOLEAN NOT NULL DEFAULT false,
  customer_name TEXT NULL,
  customer_phone TEXT NULL,
  notes TEXT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_reports_created_by ON public.reports (created_by);
CREATE INDEX IF NOT EXISTS idx_reports_assigned_to ON public.reports (assigned_to);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports (created_at DESC);

-- Timestamp trigger
DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
DROP POLICY IF EXISTS "Owners/admins can view all reports" ON public.reports;
CREATE POLICY "Owners/admins can view all reports"
ON public.reports
FOR SELECT
USING (is_owner_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Employees can view their assigned or created reports" ON public.reports;
CREATE POLICY "Employees can view their assigned or created reports"
ON public.reports
FOR SELECT
USING (
  auth.uid() = created_by
  OR auth.uid() = assigned_to
);

DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
CREATE POLICY "Users can create reports"
ON public.reports
FOR INSERT
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Owners/admins can update any report" ON public.reports;
CREATE POLICY "Owners/admins can update any report"
ON public.reports
FOR UPDATE
USING (is_owner_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own reports" ON public.reports;
CREATE POLICY "Users can update their own reports"
ON public.reports
FOR UPDATE
USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Owners/admins can delete reports" ON public.reports;
CREATE POLICY "Owners/admins can delete reports"
ON public.reports
FOR DELETE
USING (is_owner_or_admin(auth.uid()));
