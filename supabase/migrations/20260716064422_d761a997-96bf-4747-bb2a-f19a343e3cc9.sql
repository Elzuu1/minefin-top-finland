CREATE OR REPLACE FUNCTION public.grant_admin_for_allowlist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF new.email_confirmed_at IS NOT NULL AND lower(new.email) IN (
    'kulmalaelias11@gmail.com','kakakakkaskldkd@gmail.com','kulukasanen@gmail.com',
    'eliaskulmakivi@gmail.com','jokkeluu@gmail.com','eliaskulmala862@gmail.com',
    'eliaskulmala2@gmail.com','pokerlzu126@gmail.com','pokelzu11@gmail.com',
    'elzuu1yt@gmail.com'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_admin_allowlist ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_admin_allowlist
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_admin_for_allowlist();

DROP TRIGGER IF EXISTS on_auth_user_confirmed_grant_admin_allowlist ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_grant_admin_allowlist
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (old.email_confirmed_at IS NULL AND new.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.grant_admin_for_allowlist();