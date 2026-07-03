
-- Hourly snapshots of every server's live player count
CREATE TABLE public.server_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  players integer NOT NULL DEFAULT 0,
  max_players integer NOT NULL DEFAULT 0,
  is_online boolean NOT NULL DEFAULT false,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_server_stats_server_time ON public.server_stats(server_id, recorded_at DESC);
CREATE INDEX idx_server_stats_recorded_at ON public.server_stats(recorded_at DESC);

GRANT SELECT ON public.server_stats TO anon;
GRANT SELECT, INSERT ON public.server_stats TO authenticated;
GRANT ALL ON public.server_stats TO service_role;

ALTER TABLE public.server_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stats" ON public.server_stats FOR SELECT USING (true);
CREATE POLICY "Service role manages stats" ON public.server_stats FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Daily all-time-high per server
CREATE TABLE public.server_daily_ath (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  day date NOT NULL,
  peak_players integer NOT NULL DEFAULT 0,
  peak_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (server_id, day)
);

CREATE INDEX idx_server_daily_ath_server_day ON public.server_daily_ath(server_id, day DESC);

GRANT SELECT ON public.server_daily_ath TO anon;
GRANT SELECT ON public.server_daily_ath TO authenticated;
GRANT ALL ON public.server_daily_ath TO service_role;

ALTER TABLE public.server_daily_ath ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ATH" ON public.server_daily_ath FOR SELECT USING (true);
CREATE POLICY "Service role manages ATH" ON public.server_daily_ath FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Global snapshot: total players across all servers per hour
CREATE TABLE public.global_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_players integer NOT NULL DEFAULT 0,
  online_servers integer NOT NULL DEFAULT 0,
  total_servers integer NOT NULL DEFAULT 0,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_global_stats_recorded_at ON public.global_stats(recorded_at DESC);

GRANT SELECT ON public.global_stats TO anon;
GRANT SELECT ON public.global_stats TO authenticated;
GRANT ALL ON public.global_stats TO service_role;

ALTER TABLE public.global_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read global stats" ON public.global_stats FOR SELECT USING (true);
CREATE POLICY "Service role manages global stats" ON public.global_stats FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Enable cron + net for scheduled snapshotting
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
