CREATE TABLE IF NOT EXISTS public.external_websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  url text NOT NULL,
  image_url text,
  accent text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.external_websites TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.external_websites TO authenticated;
GRANT ALL ON public.external_websites TO service_role;

ALTER TABLE public.external_websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active websites" ON public.external_websites
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert websites" ON public.external_websites
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update websites" ON public.external_websites
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete websites" ON public.external_websites
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER set_external_websites_updated_at
  BEFORE UPDATE ON public.external_websites
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.external_websites (title, description, url, image_url, accent, sort_order) VALUES
  (
    'FinlandSMP Kotisivut',
    'Ei perus kotisivut vaan paljon kaikkea liikkuvaa. Top 10 Listoja 📊 · Awards 🏆 · Chatti ✉️',
    'https://finlandsmp.lovable.app/',
    '/__l5e/assets-v1/d3cd4ed4-becb-43fb-9912-2503e2cd0a8e/finland-flag-v2.jpg',
    '#1e64c8',
    10
  ),
  (
    'FinlandSMP API',
    'Toiminnallinen versio FinlandSMP:stä mobiiliin. Kasino 🎰 · Chatti ✉️ · Pelejä 🎮 — Tienaa FinlandSMP:lle rahaa mobiilissa 💸',
    'https://finlandsmp-api.base44.app/',
    '/__l5e/assets-v1/beda10be-199d-43f8-83c2-f6df9b6c3607/casino-roulette.jpg',
    '#d62828',
    20
  ),
  (
    'Elzuu1 Kotisivut',
    'Kaikki tiedot minusta sekä kaikkea muuta mielenkiintoista 👌',
    'https://elzuu1.lovable.app',
    '/__l5e/assets-v1/546fb5bd-5d52-4d1b-9e25-25b179a14e6e/minecraft.jpg',
    '#3aa856',
    30
  ),
  (
    'FinlandSMP VIP',
    'FinlandSMP:n VIP-peli — Flappy Bird, jossa välillä jaossa ilmaiseksi VIPPEJÄ 💸💸',
    'https://finlandsmp.lovable.app/',
    '/__l5e/assets-v1/8faeaba4-6934-4b24-ab8e-8660c24ca20b/flappy.jpg',
    '#f4c542',
    40
  );