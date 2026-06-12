import { useEffect, useRef, useState } from "react";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Sums live players across all active servers.
 * Polls every 30s in sync with leaderboard pings.
 * IMPORTANT: keeps the previous value visible during refresh —
 * never falls back to 0 / skeleton once the first value loaded.
 */
export function TotalPlayers() {
  const [total, setTotal] = useState<number | null>(null);
  const [maxTotal, setMaxTotal] = useState<number | null>(null);
  const [serverCount, setServerCount] = useState<number | null>(null);
  const [pulse, setPulse] = useState(false);
  const lastTotal = useRef<number | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("servers")
      .select("players, max_players, online")
      .eq("is_active", true);
    if (error || !data) return;
    const players = data.reduce((sum, s) => sum + (s.online ? s.players ?? 0 : 0), 0);
    const max = data.reduce((sum, s) => sum + (s.max_players ?? 0), 0);
    setTotal((prev) => {
      if (prev !== null && prev !== players) {
        setPulse(true);
        setTimeout(() => setPulse(false), 600);
      }
      lastTotal.current = players;
      return players;
    });
    setMaxTotal(max);
    setServerCount(data.length);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  const display = total ?? lastTotal.current;

  return (
    <section className="relative mx-auto w-full max-w-4xl overflow-hidden px-4 py-4 sm:overflow-visible sm:py-10">
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--neon)]/30 bg-gradient-to-br from-black/70 via-card/60 to-[color:var(--neon)]/10 px-4 py-4 backdrop-blur-xl sm:rounded-3xl sm:px-10 sm:py-8">
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[color:var(--neon)]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[color:var(--neon-2)]/25 blur-3xl" />

        <div className="relative flex flex-row items-center justify-between gap-3 text-left">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--neon)]/15 text-[color:var(--neon)] shadow-[0_0_30px_-5px_oklch(0.82_0.2_165_/_0.6)] sm:h-14 sm:w-14 sm:rounded-2xl">
              <Users className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[color:var(--neon)] sm:text-xs sm:tracking-[0.3em]">
                Pelaajia nyt
              </p>
              <p className="truncate text-[10px] text-muted-foreground sm:text-sm">
                {serverCount !== null ? `${serverCount} serveriltä` : "Lasketaan…"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-baseline gap-1.5">
            {display !== null ? (
              <span
                className={[
                  "font-display text-3xl font-black tabular-nums leading-none transition-all duration-500 sm:text-7xl",
                  "bg-gradient-to-br from-white via-white to-[color:var(--neon)] bg-clip-text text-transparent text-glow-neon",
                  pulse ? "scale-110" : "scale-100",
                ].join(" ")}
              >
                {display.toLocaleString("fi-FI")}
              </span>
            ) : (
              <span className="relative block h-8 w-20 overflow-hidden rounded-lg border border-border/60 bg-card/50 sm:h-16 sm:w-44">
                <span className="absolute inset-0 animate-shimmer" />
              </span>
            )}
            {maxTotal !== null ? (
              <span className="font-mono text-xs text-muted-foreground sm:text-base">
                / {maxTotal.toLocaleString("fi-FI")}
              </span>
            ) : (
              <span className="relative block h-3 w-10 overflow-hidden rounded bg-card/50">
                <span className="absolute inset-0 animate-shimmer" />
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
