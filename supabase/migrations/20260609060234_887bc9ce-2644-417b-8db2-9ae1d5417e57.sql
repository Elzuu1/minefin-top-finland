
DROP POLICY IF EXISTS "Anyone can insert banners" ON public.banners;
DROP POLICY IF EXISTS "Anyone can update banners" ON public.banners;
DROP POLICY IF EXISTS "Anyone can delete banners" ON public.banners;

CREATE POLICY "Admins can insert banners" ON public.banners
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update banners" ON public.banners
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete banners" ON public.banners
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Anyone can insert servers" ON public.servers;
DROP POLICY IF EXISTS "Anyone can update servers" ON public.servers;
DROP POLICY IF EXISTS "Anyone can delete servers" ON public.servers;

CREATE POLICY "Admins can insert servers" ON public.servers
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update servers" ON public.servers
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete servers" ON public.servers
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Submissions are viewable by everyone" ON public.server_submissions;
DROP POLICY IF EXISTS "Anyone can update submissions" ON public.server_submissions;
DROP POLICY IF EXISTS "Anyone can delete submissions" ON public.server_submissions;

CREATE POLICY "Owners and admins can view submissions" ON public.server_submissions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update submissions" ON public.server_submissions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete submissions" ON public.server_submissions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
