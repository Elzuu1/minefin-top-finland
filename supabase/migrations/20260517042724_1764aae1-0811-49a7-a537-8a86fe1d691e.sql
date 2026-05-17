
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TYPE public.submission_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.server_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  ip TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 25565,
  description TEXT,
  version TEXT,
  category TEXT,
  banner_url TEXT,
  logo_url TEXT,
  status public.submission_status NOT NULL DEFAULT 'pending',
  review_note TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_server_submissions_status ON public.server_submissions(status);
CREATE INDEX idx_server_submissions_user ON public.server_submissions(user_id);

ALTER TABLE public.server_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Submissions are viewable by everyone"
  ON public.server_submissions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can create own submission"
  ON public.server_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can update submissions"
  ON public.server_submissions FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete submissions"
  ON public.server_submissions FOR DELETE
  USING (true);

CREATE TRIGGER update_server_submissions_updated_at
  BEFORE UPDATE ON public.server_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
