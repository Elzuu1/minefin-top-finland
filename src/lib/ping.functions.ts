import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type McsrvstatResponse = {
  online: boolean;
  players?: { online?: number; max?: number; list?: { name: string }[] };
  version?: string;
  motd?: { clean?: string[] };
  icon?: string;
  debug?: { ping?: boolean };
};

async function pingOne(ip: string, port: number) {
  const host = port && port !== 25565 ? `${ip}:${port}` : ip;
  const start = Date.now();
  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${host}`, {
      headers: { "user-agent": "Minefin/1.0" },
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as McsrvstatResponse;
    const ping = Date.now() - start;
    return {
      online: !!data.online,
      players: data.players?.online ?? 0,
      max_players: data.players?.max ?? 0,
      version: data.version ?? null,
      motd: data.motd?.clean?.join("\n") ?? null,
      favicon: data.icon ?? null,
      ping_ms: ping,
    };
  } catch {
    return {
      online: false,
      players: 0,
      max_players: 0,
      version: null,
      motd: null,
      favicon: null,
      ping_ms: null,
    };
  }
}

/**
 * Ping every active server and update its live stats in DB.
 * Called from the homepage on an interval and from the admin panel.
 */
export const refreshAllServers = createServerFn({ method: "POST" }).handler(async () => {
  const { data: servers, error } = await supabaseAdmin
    .from("servers")
    .select("id, ip, port, players")
    .eq("is_active", true);
  if (error) throw new Error(error.message);

  const results = await Promise.all(
    (servers ?? []).map(async (s) => {
      const stats = await pingOne(s.ip, s.port ?? 25565);
      const trend =
        stats.players > (s.players ?? 0)
          ? "up"
          : stats.players < (s.players ?? 0)
            ? "down"
            : "flat";
      await supabaseAdmin
        .from("servers")
        .update({
          ...stats,
          trend,
          last_checked: new Date().toISOString(),
        })
        .eq("id", s.id);
      return { id: s.id, ...stats };
    }),
  );

  return { ok: true, count: results.length, checked_at: new Date().toISOString() };
});
