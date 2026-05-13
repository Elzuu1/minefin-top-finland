import { useEffect, useState } from "react";
import { fetchServers, type Server } from "@/lib/servers";
import { ServerCard } from "./ServerCard";

function Skeleton() {
  return (
    <div className="relative h-[92px] overflow-hidden rounded-2xl border border-border/60 bg-card/50">
      <div className="absolute inset-0 animate-shimmer" />
    </div>
  );
}

export function Leaderboard() {
  const [servers, setServers] = useState<Server[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    const data = await fetchServers();
    setServers(data);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="leaderboard" className="relative mx-auto w-full max-w-5xl scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[color:var(--neon)]">
            Live Top 10
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Leaderboardit</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Suomen kymmenen suosituinta Minecraft-serveriä reaaliaikaisen pelaajamäärän mukaan.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
          <span
            className={[
              "h-2 w-2 rounded-full",
              refreshing ? "bg-[color:var(--neon)] animate-pulse-dot" : "bg-[color:var(--success)]",
            ].join(" ")}
          />
          {refreshing ? "Päivitetään…" : "Live · päivittyy 30s välein"}
        </div>
      </div>

      <div className="space-y-3">
        {!servers &&
          Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} />)}

        {servers?.map((s, i) => (
          <div key={s.id} className="animate-rise" style={{ animationDelay: `${i * 40}ms` }}>
            <ServerCard server={s} rank={i + 1} />
          </div>
        ))}
      </div>
    </section>
  );
}
