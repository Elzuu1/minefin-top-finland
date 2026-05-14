import { supabase } from "@/integrations/supabase/client";

export type DBServer = {
  id: string;
  slug: string;
  name: string;
  ip: string;
  port: number;
  description: string | null;
  version: string | null;
  discord_url: string | null;
  banner_url: string | null;
  icon_color: string;
  icon_letter: string;
  is_featured: boolean;
  is_active: boolean;
  category: string | null;
  players: number;
  max_players: number;
  online: boolean;
  trend: string;
  sort_order: number;
  motd: string | null;
  favicon: string | null;
  ping_ms: number | null;
  last_checked: string | null;
};

export type ServerWithStats = DBServer & {
  hype_count: number;
  user_hyped: boolean;
};

export async function fetchServers(userId?: string | null): Promise<ServerWithStats[]> {
  const { data: servers, error } = await supabase
    .from("servers")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const { data: hypes } = await supabase.from("server_hypes").select("server_id, user_id");
  const hypeCounts = new Map<string, number>();
  const userHypes = new Set<string>();
  for (const h of hypes ?? []) {
    hypeCounts.set(h.server_id, (hypeCounts.get(h.server_id) ?? 0) + 1);
    if (userId && h.user_id === userId) userHypes.add(h.server_id);
  }

  return (servers as DBServer[]).map((s) => ({
    ...s,
    hype_count: hypeCounts.get(s.id) ?? 0,
    user_hyped: userHypes.has(s.id),
  }));
}

export async function fetchServerBySlug(slug: string, userId?: string | null) {
  const { data: server, error } = await supabase
    .from("servers")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!server) return null;

  const [{ count: hypeCount }, userHypeRes] = await Promise.all([
    supabase
      .from("server_hypes")
      .select("*", { count: "exact", head: true })
      .eq("server_id", server.id),
    userId
      ? supabase
          .from("server_hypes")
          .select("id")
          .eq("server_id", server.id)
          .eq("user_id", userId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    ...(server as DBServer),
    hype_count: hypeCount ?? 0,
    user_hyped: !!userHypeRes.data,
  } satisfies ServerWithStats;
}

export async function toggleHype(serverId: string, userId: string, currentlyHyped: boolean) {
  if (currentlyHyped) {
    const { error } = await supabase
      .from("server_hypes")
      .delete()
      .eq("server_id", serverId)
      .eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("server_hypes")
      .insert({ server_id: serverId, user_id: userId });
    if (error) throw error;
  }
}
