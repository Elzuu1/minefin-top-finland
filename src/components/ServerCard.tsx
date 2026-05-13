import { ArrowDown, ArrowUp, Copy, Minus } from "lucide-react";
import { useState } from "react";
import type { Server } from "@/lib/servers";
import { ServerIcon } from "./ServerIcon";

const RANK_STYLES: Record<number, { glow: string; ring: string; label: string; color: string }> = {
  1: { glow: "glow-gold", ring: "ring-[color:var(--gold)]/60", label: "1ST", color: "text-[color:var(--gold)] text-glow-gold" },
  2: { glow: "glow-silver", ring: "ring-[color:var(--silver)]/60", label: "2ND", color: "text-[color:var(--silver)]" },
  3: { glow: "glow-bronze", ring: "ring-[color:var(--bronze)]/60", label: "3RD", color: "text-[color:var(--bronze)]" },
};

export function ServerCard({ server, rank }: { server: Server; rank: number }) {
  const [copied, setCopied] = useState(false);
  const isTop3 = rank <= 3;
  const isFeatured = server.name === "FinlandSMP";
  const style = RANK_STYLES[rank];

  const copyIp = async () => {
    await navigator.clipboard.writeText(server.ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const TrendIcon = server.trend === "up" ? ArrowUp : server.trend === "down" ? ArrowDown : Minus;
  const trendColor =
    server.trend === "up"
      ? "text-[color:var(--success)]"
      : server.trend === "down"
        ? "text-[color:var(--danger)]"
        : "text-muted-foreground";

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur transition-all duration-300",
        "hover:-translate-y-1 hover:border-border",
        isTop3 ? "p-6 sm:p-7 ring-1 " + style.ring : "",
        isTop3 ? style.glow : "",
        isFeatured && !isTop3 ? "animate-float-glow ring-1 ring-[color:var(--neon)]/60" : "",
      ].join(" ")}
    >
      {/* rank ribbon */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl" />

      <div className="flex items-center gap-4">
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

        <ServerIcon color={server.iconColor} letter={server.iconLetter} />

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
              <span className="rounded-md border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--neon)]">
                Featured
              </span>
            )}
          </div>
          <button
            onClick={copyIp}
            className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="truncate">{server.ip}</span>
            <Copy className="h-3 w-3" />
            {copied && <span className="text-[color:var(--neon)]">copied</span>}
          </button>
        </div>

        <div className="hidden flex-col items-end gap-1 sm:flex">
          <div className="flex items-baseline gap-1.5">
            <span className={["font-mono text-2xl font-bold tabular-nums", isTop3 ? "text-3xl" : ""].join(" ")}>
              {server.players.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">/ {server.maxPlayers}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className={["inline-flex items-center gap-1.5", trendColor].join(" ")}>
              <TrendIcon className="h-3 w-3" />
              {server.trend}
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

      {/* mobile stats */}
      <div className="mt-4 flex items-center justify-between sm:hidden">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-bold tabular-nums">{server.players.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">/ {server.maxPlayers}</span>
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
            {server.online ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </div>
  );
}
