import { ArrowDown, ArrowUp, ChevronRight, Minus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ServerWithStats } from "@/lib/servers";
import { ServerIcon } from "./ServerIcon";
import { HypeButton } from "./HypeButton";

const RANK_STYLES: Record<number, { glow: string; ring: string; border: string; color: string; hoverGlow: string }> = {
  1: { glow: "glow-gold", ring: "ring-[color:var(--gold)]/60", border: "hover:border-[color:var(--gold)]", color: "text-[color:var(--gold)] text-glow-gold", hoverGlow: "hover:shadow-[0_0_60px_-8px_oklch(0.84_0.17_88_/_0.7),0_0_20px_-4px_oklch(0.84_0.17_88_/_0.5)]" },
  2: { glow: "glow-silver", ring: "ring-[color:var(--silver)]/60", border: "hover:border-[color:var(--silver)]", color: "text-[color:var(--silver)]", hoverGlow: "hover:shadow-[0_0_60px_-8px_oklch(0.86_0.02_250_/_0.7),0_0_20px_-4px_oklch(0.86_0.02_250_/_0.5)]" },
  3: { glow: "glow-bronze", ring: "ring-[color:var(--bronze)]/60", border: "hover:border-[color:var(--bronze)]", color: "text-[color:var(--bronze)]", hoverGlow: "hover:shadow-[0_0_60px_-8px_oklch(0.7_0.13_55_/_0.7),0_0_20px_-4px_oklch(0.7_0.13_55_/_0.5)]" },
};

export function ServerCard({ server, rank }: { server: ServerWithStats; rank: number }) {
  const isTop3 = rank <= 3;
  const isFeatured = server.is_featured;
  const style = RANK_STYLES[rank];
  const statusLabel = server.live_loading
    ? "Loading"
    : server.live_error
      ? "Error"
      : server.online
        ? "Online"
        : "OFFLINE";
  const statusColor = server.live_loading
    ? "text-[color:var(--neon)]"
    : server.live_error || !server.online
      ? "text-[color:var(--danger)]"
      : "text-[color:var(--success)]";
  const statusDot = server.live_loading
    ? "bg-[color:var(--neon)] animate-pulse-dot"
    : server.live_error || !server.online
      ? "bg-[color:var(--danger)]"
      : "bg-[color:var(--success)] animate-pulse-dot";

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
        "group relative block overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur transition-all",
        "hover:-translate-y-1 hover:border-border",
        isTop3 ? "p-6 sm:p-7 ring-1 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:scale-[1.015]" : "duration-300",
        isTop3 ? (style?.ring ?? "") : "",
        isTop3 ? (style?.glow ?? "") : "",
        isTop3 ? (style?.border ?? "") : "",
        isTop3 ? (style?.hoverGlow ?? "") : "",
        isFeatured && !isTop3 ? "animate-float-glow ring-1 ring-[color:var(--neon)]/60" : "",
        !server.online && !server.live_loading ? "grayscale opacity-60" : "",
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
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
            {server.ip}
            {server.port && server.port !== 25565 ? `:${server.port}` : ""}
            {server.version ? <span className="ml-2 opacity-70">· {server.version}</span> : null}
            {server.ping_ms != null ? <span className="ml-2 opacity-70">· {server.ping_ms}ms</span> : null}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {server.live_loading
              ? "Haetaan live dataa…"
              : server.live_error
                ? server.live_error
                : server.online
                  ? server.motd || "Live data aktiivinen"
                  : "Serveri ei vastaa juuri nyt"}
          </p>
        </div>

        <div className="hidden flex-col items-end gap-1.5 sm:flex">
          <div className="flex items-baseline gap-1.5">
            {server.live_loading ? (
              <span className="relative block h-7 w-16 overflow-hidden rounded-md border border-border/60 bg-card/50">
                <span className="absolute inset-0 animate-shimmer" />
              </span>
            ) : (
              <span className={["font-mono text-2xl font-bold tabular-nums", isTop3 ? "text-3xl" : ""].join(" ")}>
                {server.players.toLocaleString()}
              </span>
            )}
            <span className="text-xs text-muted-foreground">/ {server.max_players}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className={["inline-flex items-center gap-1", trendColor].join(" ")}>
              <TrendIcon className="h-3 w-3" /> {server.trend}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className={["h-2 w-2 rounded-full", statusDot].join(" ")}
              />
              <span className={statusColor}>{statusLabel}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 sm:mt-4">
        <div className="flex items-center gap-2 sm:hidden">
          {server.live_loading ? (
            <span className="relative block h-5 w-12 overflow-hidden rounded-md border border-border/60 bg-card/50">
              <span className="absolute inset-0 animate-shimmer" />
            </span>
          ) : (
            <span className="font-mono text-xl font-bold tabular-nums">
              {server.players.toLocaleString()}
            </span>
          )}
          <span className="text-xs text-muted-foreground">/ {server.max_players}</span>
          <span
            className={["ml-1 h-2 w-2 rounded-full", statusDot].join(" ")}
          />
          <span className={["text-[10px] font-semibold uppercase", statusColor].join(" ")}>{statusLabel}</span>
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
