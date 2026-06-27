
CREATE TABLE IF NOT EXISTS public.auth_failure_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  reason TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auth_failure_logs_email_idx ON public.auth_failure_logs (email);
CREATE INDEX IF NOT EXISTS auth_failure_logs_created_idx ON public.auth_failure_logs (created_at DESC);
GRANT SELECT ON public.auth_failure_logs TO authenticated;
GRANT ALL ON public.auth_failure_logs TO service_role;
ALTER TABLE public.auth_failure_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view auth failure logs"
  ON public.auth_failure_logs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
