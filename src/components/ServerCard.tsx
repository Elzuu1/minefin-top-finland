import { ArrowDown, ArrowUp, ChevronRight, Minus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ServerWithStats } from "@/lib/servers";
import { ServerIcon } from "./ServerIcon";
import { HypeButton } from "./HypeButton";

const RANK_STYLES: Record<number, { glow: string; ring: string; color: string }> = {
  1: { glow: "glow-gold", ring: "ring-[color:var(--gold)]/60", color: "text-[color:var(--gold)] text-glow-gold" },
  2: { glow: "glow-silver", ring: "ring-[color:var(--silver)]/60", color: "text-[color:var(--silver)]" },
  3: { glow: "glow-bronze", ring: "ring-[color:var(--bronze)]/60", color: "text-[color:var(--bronze)]" },
};

export function ServerCard({ server, rank }: { server: ServerWithStats; rank: number }) {
  const isTop3 = rank <= 3;
  const isFeatured = server.is_featured;
  const style = RANK_STYLES[rank];

  const TrendIcon =
    server.trend === "up" ? ArrowUp : server.trend === "down" ? ArrowDown : Minus;
  const trendColor =
    server.trend === "up"
      ? "text-[color:var(--success)]"
      : server.trend === "down"
        ? "text-[color:var(--danger)]"
        : "text-muted-foreground";

  return (
    <Link
      to="/server/$slug"
      params={{ slug: server.slug }}
      className={[
        "group relative block overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur transition-all duration-300",
        "hover:-translate-y-1 hover:border-border",
        isTop3 ? "p-6 sm:p-7 ring-1 " + (style?.ring ?? "") : "",
        isTop3 ? (style?.glow ?? "") : "",
        isFeatured && !isTop3 ? "animate-float-glow ring-1 ring-[color:var(--neon)]/60" : "",
      ].join(" ")}
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl" />

      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-mono text-xl font-bold",
            isTop3 ? "text-2xl" : "",
            rank === 1 ? "bg-[color:var(--gold)]/15 text-[color:var(--gold)] text-glow-gold" : "",
            rank === 2 ? "bg-[color:var(--silver)]/15 text-[color:var(--silver)]" : "",
            rank === 3 ? "bg-[color:var(--bronze)]/15 text-[color:var(--bronze)]" : "",
            !isTop3 ? "bg-muted text-muted-foreground" : "",
          ].join(" ")}
        >
          #{rank}
        </div>

        {server.favicon ? (
          <img
            src={server.favicon}
            alt=""
            className="h-12 w-12 shrink-0 rounded-xl border border-border/60 bg-black/40 object-cover [image-rendering:pixelated]"
          />
        ) : (
          <ServerIcon color={server.icon_color} letter={server.icon_letter} />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className={[
                "truncate text-lg font-bold sm:text-xl",
                isFeatured ? "text-[color:var(--neon)] text-glow-neon" : "",
              ].join(" ")}
            >
              {server.name}
            </h3>
            {isFeatured && (
              <span className="hidden rounded-md border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--neon)] sm:inline-block">
                Featured
              </span>
            )}
          </div>
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{server.ip}</p>
        </div>

        <div className="hidden flex-col items-end gap-1.5 sm:flex">
          <div className="flex items-baseline gap-1.5">
            <span className={["font-mono text-2xl font-bold tabular-nums", isTop3 ? "text-3xl" : ""].join(" ")}>
              {server.players.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">/ {server.max_players}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className={["inline-flex items-center gap-1", trendColor].join(" ")}>
              <TrendIcon className="h-3 w-3" /> {server.trend}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  server.online ? "bg-[color:var(--success)] animate-pulse-dot" : "bg-[color:var(--danger)]",
                ].join(" ")}
              />
              <span className={server.online ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}>
                {server.online ? "Online" : "Offline"}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 sm:mt-4">
        <div className="flex items-center gap-2 sm:hidden">
          <span className="font-mono text-xl font-bold tabular-nums">{server.players.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">/ {server.max_players}</span>
          <span
            className={[
              "ml-1 h-2 w-2 rounded-full",
              server.online ? "bg-[color:var(--success)] animate-pulse-dot" : "bg-[color:var(--danger)]",
            ].join(" ")}
          />
        </div>

        <HypeButton
          serverId={server.id}
          hypeCount={server.hype_count}
          hyped={server.user_hyped}
        />

        <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
          Avaa <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
