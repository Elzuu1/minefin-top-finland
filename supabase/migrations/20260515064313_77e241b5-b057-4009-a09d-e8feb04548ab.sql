DROP POLICY IF EXISTS "Admins can insert servers" ON public.servers;
DROP POLICY IF EXISTS "Admins can update servers" ON public.servers;
DROP POLICY IF EXISTS "Admins can delete servers" ON public.servers;

CREATE POLICY "Anyone can insert servers" ON public.servers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update servers" ON public.servers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete servers" ON public.servers FOR DELETE USING (true);