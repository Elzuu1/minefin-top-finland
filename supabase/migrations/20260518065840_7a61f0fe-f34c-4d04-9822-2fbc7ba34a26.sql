
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  link_url TEXT,
  speed_seconds INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Banners are viewable by everyone"
  ON public.banners FOR SELECT USING (true);
CREATE POLICY "Anyone can insert banners"
  ON public.banners FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update banners"
  ON public.banners FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete banners"
  ON public.banners FOR DELETE USING (true);

CREATE TRIGGER set_banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.banners (text, speed_seconds, sort_order, is_active)
VALUES ('FinlandSMP — Suomen Suurin SMP', 30, 0, true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.banners;
ALTER TABLE public.server_hypes REPLICA IDENTITY FULL;
