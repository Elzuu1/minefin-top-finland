import { createServerFn } from "@tanstack/react-start";
import { status } from "minecraft-server-util";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type McStatusIoResponse = {
  online: boolean;
  players?: { online?: number; max?: number };
  version?: { name_clean?: string; name_raw?: string };
  motd?: { clean?: string; raw?: string };
  icon?: string;
};

async function pingViaHttpFallback(ip: string, port: number) {
  const host = port && port !== 25565 ? `${ip}:${port}` : ip;
  const start = Date.now();
  const res = await fetch(`https://api.mcstatus.io/v2/status/java/${host}`, {
    headers: { "user-agent": "Minefin/1.0" },
  });
  if (!res.ok) throw new Error(`fallback status ${res.status}`);
  const data = (await res.json()) as McStatusIoResponse;
  if (!data.online) throw new Error("offline");
  return {
    online: true,
    players: data.players?.online ?? 0,
    max_players: data.players?.max ?? 0,
    version: data.version?.name_clean ?? data.version?.name_raw ?? null,
    motd: data.motd?.clean ?? data.motd?.raw ?? null,
    favicon: data.icon ?? null,
    ping_ms: Date.now() - start,
  };
}

async function pingOne(ip: string, port: number) {
  try {
    const data = await status(ip, port ?? 25565, { timeout: 8_000, enableSRV: true });
    return {
      online: true,
      players: data.players.online,
      max_players: data.players.max,
      version: data.version.name,
      motd: data.motd.clean,
      favicon: data.favicon ?? null,
      ping_ms: data.roundTripLatency,
    };
  } catch {
    try {
      return await pingViaHttpFallback(ip, port ?? 25565);
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
