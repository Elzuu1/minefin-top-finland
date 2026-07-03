import { createFileRoute } from "@tanstack/react-router";

type McStatusIoResponse = {
  online: boolean;
  players?: { online?: number; max?: number };
};

async function pingServer(ip: string, port: number) {
  const host = port && port !== 25565 ? `${ip}:${port}` : ip;
  try {
    const res = await fetch(`https://api.mcstatus.io/v2/status/java/${host}`, {
      headers: { "user-agent": "Minefin/1.0" },
    });
    if (!res.ok) return { online: false, players: 0, max_players: 0 };
    const data = (await res.json()) as McStatusIoResponse;
    return {
      online: !!data.online,
      players: data.players?.online ?? 0,
      max_players: data.players?.max ?? 0,
    };
  } catch {
    return { online: false, players: 0, max_players: 0 };
  }
}

export const Route = createFileRoute("/api/public/hooks/snapshot-servers")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: servers, error } = await supabaseAdmin
          .from("servers")
          .select("id, ip, port");

        if (error || !servers) {
          return Response.json({ ok: false, error: error?.message ?? "no servers" }, { status: 500 });
        }

        const now = new Date();
        const day = now.toISOString().slice(0, 10);

        let totalPlayers = 0;
        let onlineCount = 0;
        const snapshots: Array<{
          server_id: string;
          players: number;
          max_players: number;
          is_online: boolean;
          recorded_at: string;
        }> = [];

        const results = await Promise.all(
          servers.map(async (s) => {
            const ping = await pingServer(s.ip, s.port ?? 25565);
            return { id: s.id, ...ping };
          }),
        );

        for (const r of results) {
          totalPlayers += r.players;
          if (r.online) onlineCount++;
          snapshots.push({
            server_id: r.id,
            players: r.players,
            max_players: r.max_players,
            is_online: r.online,
            recorded_at: now.toISOString(),
          });

          // Update live server row
          await supabaseAdmin
            .from("servers")
            .update({
              players: r.players,
              max_players: r.max_players,
              online: r.online,
              last_checked: now.toISOString(),
            })
            .eq("id", r.id);

          // Update daily ATH
          const { data: existing } = await supabaseAdmin
            .from("server_daily_ath")
            .select("id, peak_players")
            .eq("server_id", r.id)
            .eq("day", day)
            .maybeSingle();

          if (!existing) {
            await supabaseAdmin.from("server_daily_ath").insert({
              server_id: r.id,
              day,
              peak_players: r.players,
              peak_at: now.toISOString(),
            });
          } else if (r.players > (existing.peak_players ?? 0)) {
            await supabaseAdmin
              .from("server_daily_ath")
              .update({ peak_players: r.players, peak_at: now.toISOString() })
              .eq("id", existing.id);
          }
        }

        // Insert snapshot rows in one batch
        if (snapshots.length > 0) {
          await supabaseAdmin.from("server_stats").insert(snapshots);
        }

        // Global snapshot
        await supabaseAdmin.from("global_stats").insert({
          total_players: totalPlayers,
          online_servers: onlineCount,
          total_servers: servers.length,
          recorded_at: now.toISOString(),
        });

        return Response.json({
          ok: true,
          total_players: totalPlayers,
          online_servers: onlineCount,
          total_servers: servers.length,
        });
      },
    },
  },
});
