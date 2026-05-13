
-- ROLES
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  uname text;
begin
  uname := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1),
    'player'
  );
  -- ensure uniqueness with suffix
  while exists (select 1 from public.profiles where username = uname) loop
    uname := uname || floor(random()*1000)::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    uname,
    coalesce(new.raw_user_meta_data->>'display_name', uname),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- SERVERS
create table public.servers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  ip text not null,
  description text,
  version text,
  discord_url text,
  banner_url text,
  icon_color text not null default 'oklch(0.78 0.18 165)',
  icon_letter text not null default 'M',
  is_featured boolean not null default false,
  players integer not null default 0,
  max_players integer not null default 100,
  online boolean not null default true,
  trend text not null default 'flat',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.servers enable row level security;

create table public.server_hypes (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.servers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (server_id, user_id)
);
alter table public.server_hypes enable row level security;
create index server_hypes_server_idx on public.server_hypes(server_id);

create table public.server_comments (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.servers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.server_comments(id) on delete cascade,
  body text not null check (length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
alter table public.server_comments enable row level security;
create index server_comments_server_idx on public.server_comments(server_id);

create table public.comment_likes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.server_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (comment_id, user_id)
);
alter table public.comment_likes enable row level security;
create index comment_likes_comment_idx on public.comment_likes(comment_id);

-- POLICIES
-- profiles
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users insert their own profile" on public.profiles for insert with check (auth.uid() = id);

-- user_roles (read own, admins read all; only admins write)
create policy "Users can view own roles" on public.user_roles for select using (auth.uid() = user_id);
create policy "Admins can view all roles" on public.user_roles for select using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles" on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- servers (public read; admin write)
create policy "Servers are viewable by everyone" on public.servers for select using (true);
create policy "Admins can insert servers" on public.servers for insert with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update servers" on public.servers for update using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete servers" on public.servers for delete using (public.has_role(auth.uid(), 'admin'));

-- hypes (public read; auth insert/delete own)
create policy "Hypes are viewable by everyone" on public.server_hypes for select using (true);
create policy "Authenticated can hype" on public.server_hypes for insert
  with check (auth.uid() = user_id);
create policy "Users can remove own hype" on public.server_hypes for delete using (auth.uid() = user_id);

-- comments (public read; auth write own; admins moderate)
create policy "Comments are viewable by everyone" on public.server_comments for select using (true);
create policy "Authenticated can post comments" on public.server_comments for insert
  with check (auth.uid() = user_id);
create policy "Users can update own comments" on public.server_comments for update using (auth.uid() = user_id);
create policy "Users or admins can delete comments" on public.server_comments for delete
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

-- comment likes
create policy "Comment likes are viewable by everyone" on public.comment_likes for select using (true);
create policy "Authenticated can like comments" on public.comment_likes for insert
  with check (auth.uid() = user_id);
create policy "Users can unlike own" on public.comment_likes for delete using (auth.uid() = user_id);

-- realtime
alter publication supabase_realtime add table public.server_hypes;
alter publication supabase_realtime add table public.server_comments;
alter publication supabase_realtime add table public.comment_likes;
alter publication supabase_realtime add table public.servers;

-- SEED servers (Top 10 + Muut servut)
insert into public.servers (slug, name, ip, description, version, discord_url, icon_color, icon_letter, is_featured, players, max_players, online, trend, sort_order) values
('vanillafinland','VanillaFinland','play.vanillafinland.fi','Klassinen vanilla-kokemus suomeksi. Pitkän tähtäimen survival ja ystävällinen yhteisö.','1.21.4','https://discord.gg/vanillafinland','oklch(0.7 0.18 145)','V',false,842,1000,true,'up',1),
('nordiccraft','NordicCraft','mc.nordiccraft.fi','Pohjoismainen verkosto, johon kuuluu survival, skyblock ja minipelejä.','1.21.4','https://discord.gg/nordiccraft','oklch(0.7 0.18 220)','N',false,671,800,true,'up',2),
('suomismp','SuomiSMP','play.suomismp.net','Aktiivinen SMP suomalaisille pelaajille. Maailmoja, yhteisöprojekteja ja eventtejä.','1.21.4','https://discord.gg/suomismp','oklch(0.75 0.17 60)','S',false,528,600,true,'down',3),
('finlandsmp','FinlandSMP','play.finlandsmp.fi','Featured server. Suomen parhaiten ylläpidetty SMP, jossa on rankisysteemi ja viikoittaiset eventit.','1.21.4','https://discord.gg/finlandsmp','oklch(0.78 0.18 165)','F',true,412,500,true,'up',4),
('helsinkicraft','HelsinkiCraft','mc.helsinkicraft.fi','Kaupunkielämää Minecraftissa. RP-mausteinen survival.','1.21.4','https://discord.gg/helsinkicraft','oklch(0.7 0.18 280)','H',false,387,500,true,'flat',5),
('tamperemc','TampereMC','play.tamperemc.fi','Tamperelaisten oma serveri. Survival + pikkutyökaluja.','1.21.4','https://discord.gg/tamperemc','oklch(0.7 0.18 30)','T',false,264,400,true,'up',6),
('arcticrealms','ArcticRealms','mc.arcticrealms.fi','Lumiset maisemat ja arctic-teemainen RPG-survival.','1.21.4','https://discord.gg/arcticrealms','oklch(0.78 0.12 200)','A',false,198,300,true,'down',7),
('oulunetwork','OuluNetwork','play.oulunetwork.fi','Oulun seudun pelaajien verkosto. SMP, Skyblock ja minigames.','1.21.4','https://discord.gg/oulunetwork','oklch(0.7 0.18 320)','O',false,142,250,true,'up',8),
('mokkicraft','MökkiCraft','mc.mokkicraft.fi','Rento mökkitunnelma, ei kiirettä, paljon rakenteluprojekteja.','1.21.4','https://discord.gg/mokkicraft','oklch(0.75 0.15 90)','M',false,87,150,true,'flat',9),
('saunasmp','SaunaSMP','play.saunasmp.fi','Aloitteleva SMP. Tällä hetkellä päivityksessä.','1.21.4','https://discord.gg/saunasmp','oklch(0.6 0.1 30)','S',false,0,100,false,'down',10),
('lapinmc','LapinMC','play.lapinmc.fi','Pohjoisen pelaajien koti. Survival ja eventit.','1.21.4','https://discord.gg/lapinmc','oklch(0.72 0.16 250)','L',false,64,150,true,'up',11),
('kakkossuomi','KakkosSuomi','mc.kakkossuomi.fi','Toinen koti suomalaiselle Minecraft-yhteisölle.','1.21.4','https://discord.gg/kakkossuomi','oklch(0.74 0.16 35)','K',false,53,100,true,'flat',12),
('saaristomc','SaaristoMC','play.saaristomc.fi','Saaristomeren teemainen survival-serveri.','1.21.4','https://discord.gg/saaristomc','oklch(0.72 0.16 200)','S',false,41,80,true,'up',13),
('peruna','Peruna','mc.peruna.fi','Hauskan nimen takana yllättävän aktiivinen yhteisö.','1.21.4','https://discord.gg/peruna','oklch(0.78 0.15 90)','P',false,29,60,true,'down',14);
