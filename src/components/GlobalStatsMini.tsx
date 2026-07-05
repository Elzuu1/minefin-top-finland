import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Activity, ArrowUpRight, BarChart3, Trophy, Users } from "lucide-react";
import { fetchGlobalStats, growthPct, stats as statsOf, type GlobalStat } from "@/lib/stats";

export function GlobalStatsMini() {
  const [data, setData] = useState<GlobalStat[]>([]);
  const [prev, setPrev] = useState<GlobalStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      const [rows, prevRows] = await Promise.all([fetchGlobalStats(24), fetchGlobalStats(48)]);
      if (!alive) return;
      const cutoff = Date.now() - 24 * 3600 * 1000;
      setData(rows);
      setPrev(prevRows.filter((r) => new Date(r.recorded_at).getTime() < cutoff));
      setLoading(false);
    }
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const nums = data.map((d) => d.total_players);
  const s = statsOf(nums);
  const prevAvg = statsOf(prev.map((d) => d.total_players)).avg;
  const growth = growthPct(s.avg, prevAvg);
  const latest = data[data.length - 1];
  const chart = data.map((d) => ({ v: d.total_players }));

  return (
    <section className="mx-auto mt-6 max-w-5xl px-4">
      <div className="premium-card premium-panel overflow-hidden p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[color:var(--neon)]">
              <span className="inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-[color:var(--neon)]" />
              Live · 24h
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-4">
              <Mini
                icon={<Users className="h-3 w-3" />}
                label="Nyt online"
                value={latest?.total_players ?? 0}
                color="var(--neon)"
                trend={growth}
              />
              <Mini
                icon={<Trophy className="h-3 w-3" />}
                label="24h huippu"
                value={s.max}
                color="var(--gold)"
              />
              <Mini
                icon={<Activity className="h-3 w-3" />}
                label="Serverit"
                value={
                  latest ? `${latest.online_servers}/${latest.total_servers}` : "—"
                }
                color="var(--neon-2)"
              />
            </div>
          </div>

          {/* Sparkline */}
          <div className="h-16 w-full sm:h-20 sm:w-40">
            {loading || chart.length === 0 ? (
              <div className="h-full w-full animate-shimmer rounded-lg bg-card/40" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="miniFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--neon)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="var(--neon)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="var(--neon)"
                    strokeWidth={2}
                    fill="url(#miniFill)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <Link
          to="/tilastot"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--neon)]/40 bg-gradient-to-r from-[color:var(--neon)]/10 to-[color:var(--neon-2)]/10 px-4 py-2.5 text-sm font-bold text-[color:var(--neon)] transition-all hover:border-[color:var(--neon)] hover:from-[color:var(--neon)]/20 hover:to-[color:var(--neon-2)]/20 sm:w-auto"
        >
          <BarChart3 className="h-4 w-4" />
          Ammattitilastot
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Mini({
  icon,
  label,
  value,
  color,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  trend?: number;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-muted-foreground sm:text-[10px]">
        <span style={{ color }}>{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <div
        className="mt-0.5 font-mono text-lg font-bold tabular-nums sm:text-2xl"
        style={{ color }}
      >
        {typeof value === "number" ? value.toLocaleString("fi-FI") : value}
      </div>
      {trend !== undefined && Number.isFinite(trend) && (
        <div
          className={[
            "text-[9px] font-mono font-bold sm:text-[10px]",
            trend >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--danger)]",
          ].join(" ")}
        >
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}
