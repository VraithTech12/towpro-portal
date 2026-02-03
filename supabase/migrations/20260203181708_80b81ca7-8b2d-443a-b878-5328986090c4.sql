-- Add vehicle columns to reports
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS vehicle_make TEXT,
ADD COLUMN IF NOT EXISTS vehicle_model TEXT,
ADD COLUMN IF NOT EXISTS vehicle_plate TEXT,
ADD COLUMN IF NOT EXISTS vehicle_color TEXT,
ADD COLUMN IF NOT EXISTS tow_reason TEXT,
ADD COLUMN IF NOT EXISTS scenario_notes TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_assigned_to ON public.reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_clock_records_user_date ON public.clock_records(user_id, date);