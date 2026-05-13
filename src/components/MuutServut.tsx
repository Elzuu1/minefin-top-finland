import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { fetchServers, type ServerWithStats } from "@/lib/servers";
import { useAuth } from "@/lib/auth";
import { ServerIcon } from "./ServerIcon";
import { HypeButton } from "./HypeButton";

export function MuutServut() {
  const { user } = useAuth();
  const [servers, setServers] = useState<ServerWithStats[] | null>(null);

  useEffect(() => {
    fetchServers(user?.id).then(setServers);
  }, [user?.id]);

  const rest = servers?.slice(10) ?? null;

  if (rest && rest.length === 0) return null;

  return (
    <section id="muut" className="relative mx-auto w-full max-w-5xl scroll-mt-24 px-4 py-12 sm:py-20">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Lisää yhteisön servereitä
        </p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Muut servut</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {rest?.map((s, i) => (
          <Link
            key={s.id}
            to="/server/$slug"
            params={{ slug: s.slug }}
            className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-border animate-rise"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted font-mono text-xs font-bold text-muted-foreground">
              {11 + i}
            </div>
            <ServerIcon color={s.icon_color} letter={s.icon_letter} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{s.name}</p>
              <p className="truncate font-mono text-[11px] text-muted-foreground">{s.ip}</p>
            </div>
            <div className="hidden flex-col items-end text-xs sm:flex">
              <span className="font-mono font-bold tabular-nums">{s.players}</span>
              <span className="text-[10px] text-muted-foreground">pelaajaa</span>
            </div>
            <HypeButton serverId={s.id} hypeCount={s.hype_count} hyped={s.user_hyped} />
          </Link>
        ))}
      </div>
    </section>
  );
}
