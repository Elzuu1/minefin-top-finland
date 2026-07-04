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

export type ServerMover = {
  id: string;
  slug: string;
  name: string;
  icon_color: string;
  icon_letter: string;
  players: number;
  prev_players: number;
  delta: number;
  delta_pct: number;
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

/** Fetch top movers by 24h player-count delta across all servers. */
export async function fetchTopMovers(limit = 5): Promise<{ up: ServerMover[]; down: ServerMover[] }> {
  const since24 = new Date(Date.now() - 26 * 3600 * 1000).toISOString();
  const [{ data: servers }, { data: stats }] = await Promise.all([
    supabase
      .from("servers")
      .select("id, slug, name, icon_color, icon_letter, players")
      .eq("is_active", true),
    supabase
      .from("server_stats")
      .select("server_id, players, recorded_at")
      .gte("recorded_at", since24)
      .order("recorded_at", { ascending: true }),
  ]);
  if (!servers || !stats) return { up: [], down: [] };

  const firstByServer = new Map<string, number>();
  for (const row of stats as Array<{ server_id: string; players: number }>) {
    if (!firstByServer.has(row.server_id)) firstByServer.set(row.server_id, row.players);
  }

  const movers: ServerMover[] = (servers as Array<{
    id: string; slug: string; name: string; icon_color: string; icon_letter: string; players: number;
  }>).map((s) => {
    const prev = firstByServer.get(s.id) ?? s.players;
    const delta = s.players - prev;
    const delta_pct = prev > 0 ? (delta / prev) * 100 : delta > 0 ? 100 : 0;
    return {
      id: s.id, slug: s.slug, name: s.name, icon_color: s.icon_color, icon_letter: s.icon_letter,
      players: s.players, prev_players: prev, delta, delta_pct,
    };
  });

  const up = [...movers].filter((m) => m.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, limit);
  const down = [...movers].filter((m) => m.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, limit);
  return { up, down };
}

/* ------------------------------ math helpers ------------------------------ */

export function stats(nums: number[]) {
  if (nums.length === 0) return { avg: 0, median: 0, min: 0, max: 0, p95: 0 };
  const sorted = [...nums].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const q = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
  return {
    avg: Math.round(sum / sorted.length),
    median: q(0.5),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p95: q(0.95),
  };
}

export function growthPct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/** Average value bucketed by hour-of-day (0..23). */
export function hourOfDayAvg<T>(rows: T[], value: (r: T) => number, when: (r: T) => string): number[] {
  const sums = new Array(24).fill(0);
  const counts = new Array(24).fill(0);
  for (const r of rows) {
    const h = new Date(when(r)).getHours();
    sums[h] += value(r);
    counts[h] += 1;
  }
  return sums.map((s, i) => (counts[i] ? Math.round(s / counts[i]) : 0));
}
