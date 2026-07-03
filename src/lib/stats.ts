import { supabase } from "@/integrations/supabase/client";

export type ServerStat = {
  players: number;
  max_players: number;
  is_online: boolean;
  recorded_at: string;
};

export type DailyAth = {
  day: string;
  peak_players: number;
};

export type GlobalStat = {
  total_players: number;
  online_servers: number;
  total_servers: number;
  recorded_at: string;
};

export async function fetchServerStats(serverId: string, hours = 24): Promise<ServerStat[]> {
  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  const { data } = await supabase
    .from("server_stats")
    .select("players, max_players, is_online, recorded_at")
    .eq("server_id", serverId)
    .gte("recorded_at", since)
    .order("recorded_at", { ascending: true });
  return (data as ServerStat[]) ?? [];
}

export async function fetchServerAth(serverId: string, days = 30): Promise<DailyAth[]> {
  const since = new Date(Date.now() - days * 86400 * 1000).toISOString().slice(0, 10);
  const { data } = await supabase
    .from("server_daily_ath")
    .select("day, peak_players")
    .eq("server_id", serverId)
    .gte("day", since)
    .order("day", { ascending: true });
  return (data as DailyAth[]) ?? [];
}

export async function fetchGlobalStats(hours = 24): Promise<GlobalStat[]> {
  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  const { data } = await supabase
    .from("global_stats")
    .select("total_players, online_servers, total_servers, recorded_at")
    .gte("recorded_at", since)
    .order("recorded_at", { ascending: true });
  return (data as GlobalStat[]) ?? [];
}

export async function fetchAllTimePeak(serverId: string): Promise<number> {
  const { data } = await supabase
    .from("server_daily_ath")
    .select("peak_players")
    .eq("server_id", serverId)
    .order("peak_players", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as { peak_players?: number } | null)?.peak_players ?? 0;
}
