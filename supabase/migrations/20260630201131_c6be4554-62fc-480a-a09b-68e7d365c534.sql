ALTER TABLE public.auth_failure_logs ADD COLUMN IF NOT EXISTS ip_hash TEXT;
CREATE INDEX IF NOT EXISTS auth_failure_logs_ip_hash_idx ON public.auth_failure_logs (ip_hash);