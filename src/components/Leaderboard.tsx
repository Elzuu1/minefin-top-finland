import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { fetchServers, type ServerWithStats } from "@/lib/servers";
import { refreshAllServers } from "@/lib/ping.functions";
import { useAuth } from "@/lib/auth";
import { useHypeRealtime } from "@/lib/use-hype-realtime";
import { ServerCard } from "./ServerCard";

type MinecraftStatusResponse = {
  online: boolean;
  players: number;
  maxPlayers: number;
  motd: string;
  version: string;
  favicon: string;
  pingMs?: number;
  error?: string;
};

function Skeleton() {
  return (
    <div className="relative h-[360px] overflow-hidden rounded-[2rem] border border-white/[0.06] bg-card/40">
      <div className="absolute inset-0 animate-shimmer" />
    </div>
  );
}

export function Leaderboard() {
  const { user } = useAuth();
  const refresh = useServerFn(refreshAllServers);
  const [servers, setServers] = useState<ServerWithStats[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const reload = async () => {
    const data = await fetchServers(user?.id);
    setServers(data);
    return data;
  };

  const applyLiveStatus = async (currentServers: ServerWithStats[]) => {
    const topServers = currentServers.slice(0, 10);
    setServers((prev) =>
      prev?.map((server) =>
        topServers.some((topServer) => topServer.id === server.id)
          ? { ...server, live_loading: true, live_error: null }
          : server,
      ) ?? prev,
    );

    const updates = await Promise.all(
      topServers.map(async (server) => {
        try {
          const res = await fetch(
            `/api/minecraft-status?ip=${encodeURIComponent(server.ip)}&port=${server.port ?? 25565}`,
            { cache: "no-store" },
          );
          if (!res.ok) throw new Error(`API ${res.status}`);
          const data = (await res.json()) as MinecraftStatusResponse;
          console.log("Minecraft status API response", server.name, data);
          return {
            id: server.id,
            data: {
              online: !!data.online,
              players: data.online ? data.players ?? 0 : 0,
              max_players: data.online ? data.maxPlayers ?? 0 : 0,
              motd: data.motd || null,
              version: data.version || null,
              favicon: data.favicon || null,
              ping_ms: data.pingMs ?? null,
              live_loading: false,
              live_error: data.error ?? null,
            },
          };
        } catch (err) {
          console.error("Minecraft status API error", server.name, err);
          return {
            id: server.id,
            data: {
              online: false,
              players: 0,
              max_players: 0,
              live_loading: false,
              live_error: "Live dataa ei saatu haettua",
            },
          };
        }
      }),
    );

    setServers((prev) =>
      prev
        ?.map((server) => {
          const update = updates.find((item) => item.id === server.id);
          return update ? { ...server, ...update.data } : server;
        })
        .sort((a, b) => Number(b.online) - Number(a.online) || b.players - a.players || a.sort_order - b.sort_order) ?? prev,
    );
  };

  const tick = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await refresh().catch(() => null); // best-effort live ping
      const data = await reload();
      await applyLiveStatus(data);
      setLastChecked(new Date());
    } catch (err) {
      console.error("Leaderboard live refresh failed", err);
      setError("Live trackerin päivitys epäonnistui");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // First paint: show cached data fast, then ping in background.
    reload();
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Debounced reload triggered by realtime hype changes.
  const hypeReloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onHypeChange = useCallback(() => {
    if (hypeReloadTimer.current) clearTimeout(hypeReloadTimer.current);
    hypeReloadTimer.current = setTimeout(() => {
      reload().catch(() => {});
    }, 250);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
  useHypeRealtime(onHypeChange);

  const top10 = servers?.slice(0, 10) ?? null;

  return (
    <section id="leaderboard" className="relative mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-16 sm:py-32">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:mb-16 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--neon)] sm:text-xs">
            Live Top 10
          </p>
          <h2 className="mt-3 font-display text-4xl font-black tracking-tighter sm:text-6xl">
            Leaderboard
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            Suomen kymmenen suosituinta Minecraft-serveriä reaaliaikaisen pelaajamäärän mukaan.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur sm:text-xs">
          <span
            className={[
              "h-2 w-2 rounded-full",
              refreshing ? "bg-[color:var(--neon)] animate-pulse-dot" : "bg-[color:var(--success)] animate-pulse-dot",
            ].join(" ")}
          />
          {refreshing
            ? "Pingataan…"
            : lastChecked
              ? `Live · ${lastChecked.toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" })}`
              : "Live · 30s"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
        {!top10 && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}

        {error && (
          <div className="col-span-full rounded-2xl border border-[color:var(--danger)]/40 bg-[color:var(--danger)]/10 px-4 py-3 text-sm text-[color:var(--danger)]">
            {error}
          </div>
        )}

        {top10?.map((s, i) => (
          <div key={s.id} className="animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
            <ServerCard server={s} rank={i + 1} />
          </div>
        ))}
      </div>
    </section>
  );
}
