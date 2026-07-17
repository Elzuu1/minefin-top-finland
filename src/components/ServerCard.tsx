import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ServerWithStats } from "@/lib/servers";
import { HypeButton } from "./HypeButton";

export function ServerCard({ server, rank }: { server: ServerWithStats; rank: number }) {
  const isFeatured = server.is_featured;
  const isTop = rank <= 3;

  const statusLabel = server.live_loading
    ? "Ladataan"
    : server.online
      ? "Online"
      : "Offline";
  const statusOnline = !server.live_loading && server.online;

  const accent = server.icon_color || "oklch(0.82 0.2 165)";

  return (
    <Link
      to="/server/$slug"
      params={{ slug: server.slug }}
      className={[
        "group relative block overflow-hidden rounded-[2rem] border border-white/[0.06] bg-[oklch(0.14_0.02_260)]/70 backdrop-blur-sm transition-all duration-500",
        "hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]",
        !server.online && !server.live_loading ? "opacity-70" : "",
      ].join(" ")}
    >
      {/* Rank badge — overlapping top-left */}
      <div
        className={[
          "absolute -left-2 -top-2 z-20 flex h-14 w-14 items-center justify-center rounded-2xl border-2 font-display text-2xl font-black shadow-2xl sm:h-16 sm:w-16 sm:text-3xl",
          isTop
            ? "bg-background border-[color:var(--neon)] text-[color:var(--neon)]"
            : "bg-background border-white/15 text-muted-foreground",
        ].join(" ")}
        style={
          isTop
            ? { boxShadow: `0 0 24px -4px ${accent}, 0 8px 24px rgba(0,0,0,0.6)` }
            : undefined
        }
      >
        {rank}
      </div>

      {/* Banner */}
      <div className="relative h-44 overflow-hidden sm:h-56">
        <div
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.05]"
          style={{
            background: `radial-gradient(120% 100% at 20% 0%, ${accent} 0%, transparent 60%), linear-gradient(135deg, ${accent} 0%, oklch(0.12 0.03 260) 70%)`,
          }}
        />
        {server.favicon ? (
          <img
            src={server.favicon}
            alt=""
            aria-hidden
            className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 opacity-40 blur-sm [image-rendering:pixelated] sm:h-56 sm:w-56"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.02_260)] via-[oklch(0.14_0.02_260)]/40 to-transparent" />

        {/* Server icon chip */}
        <div className="absolute bottom-4 left-6 flex items-center gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-2xl sm:h-16 sm:w-16">
            {server.favicon ? (
              <img
                src={server.favicon}
                alt=""
                className="h-full w-full object-cover [image-rendering:pixelated]"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center font-display text-2xl font-black text-background sm:text-3xl"
                style={{ background: accent }}
              >
                {server.icon_letter}
              </div>
            )}
          </div>
        </div>

        {/* Status pill */}
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md">
          <span
            className={[
              "h-2 w-2 rounded-full",
              statusOnline
                ? "bg-[color:var(--success)] animate-pulse-dot shadow-[0_0_8px_var(--success)]"
                : server.live_loading
                  ? "bg-[color:var(--neon)] animate-pulse-dot"
                  : "bg-[color:var(--danger)]",
            ].join(" ")}
          />
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
            {statusLabel}
          </span>
        </div>

        {isFeatured && (
          <div className="absolute right-4 top-14 rounded-full border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[color:var(--neon)] backdrop-blur">
            ★ Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 pt-4 sm:p-8 sm:pt-5">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-2xl font-black tracking-tight sm:text-3xl">
              {server.name}
            </h3>
            <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground sm:text-xs">
              {server.ip}
              {server.port && server.port !== 25565 ? `:${server.port}` : ""}
            </p>
            {server.category && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {server.category}
                </span>
                {server.version && (
                  <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {server.version}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="shrink-0 text-right">
            {server.live_loading ? (
              <span className="relative block h-9 w-16 overflow-hidden rounded-md bg-white/5">
                <span className="absolute inset-0 animate-shimmer" />
              </span>
            ) : (
              <div
                className="font-display text-4xl font-black tabular-nums sm:text-5xl"
                style={{ color: accent }}
              >
                {server.players.toLocaleString()}
              </div>
            )}
            <div className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Pelaajaa
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex-1 rounded-2xl px-5 py-3.5 text-center text-xs font-extrabold uppercase tracking-wider text-background shadow-lg transition-all group-hover:brightness-110 sm:text-sm"
            style={{
              background: accent,
              boxShadow: `0 0 24px -6px ${accent}`,
            }}
          >
            <span className="inline-flex items-center gap-2">
              Katso servu <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
          <div onClick={(e) => e.preventDefault()} className="shrink-0">
            <HypeButton
              serverId={server.id}
              hypeCount={server.hype_count}
              hyped={server.user_hyped}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
