
ALTER TABLE public.servers
  ADD COLUMN IF NOT EXISTS port integer NOT NULL DEFAULT 25565,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS motd text,
  ADD COLUMN IF NOT EXISTS favicon text,
  ADD COLUMN IF NOT EXISTS ping_ms integer,
  ADD COLUMN IF NOT EXISTS last_checked timestamp with time zone;
