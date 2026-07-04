import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Gauge,
  Percent,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import {
  fetchAllTimePeak,
  fetchServerAth,
  fetchServerStats,
  growthPct,
  hourOfDayAvg,
  stats as statsOf,
  type DailyAth,
  type ServerStat,
} from "@/lib/stats";

const RANGES = [
  { key: "24h", label: "24h", hours: 24 },
  { key: "7d", label: "7 pv", hours: 24 * 7 },
  { key: "30d", label: "30 pv", hours: 24 * 30 },
] as const;

export function ServerStatsChart({ serverId }: { serverId: string }) {
  const [range, setRange] = useState<(typeof RANGES)[number]>(RANGES[0]);
  const [rows, setRows] = useState<ServerStat[]>([]);
  const [prevRows, setPrevRows] = useState<ServerStat[]>([]);
  const [ath, setAth] = useState<DailyAth[]>([]);
  const [peak, setPeak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    async function load() {
      const [s, s2, a, p] = await Promise.all([
        fetchServerStats(serverId, range.hours),
        fetchServerStats(serverId, range.hours * 2),
        fetchServerAth(serverId, 30),
        fetchAllTimePeak(serverId),
      ]);
      if (!alive) return;
      const cutoff = Date.now() - range.hours * 3600 * 1000;
      setRows(s);
      setPrevRows(s2.filter((r) => new Date(r.recorded_at).getTime() < cutoff));
      setAth(a);
      setPeak(Math.max(p, ...a.map((x) => x.peak_players)));
      setLoading(false);
    }
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [serverId, range]);

  const series = useMemo(
    () =>
      rows.map((r) => ({
        t: new Date(r.recorded_at).getTime(),
        label:
          range.hours <= 24
            ? new Date(r.recorded_at).toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" })
            : new Date(r.recorded_at).toLocaleDateString("fi-FI", { day: "2-digit", month: "2-digit" }),
        players: r.players,
        max: r.max_players,
        online: r.is_online ? 1 : 0,
      })),
    [rows, range.hours],
  );

  const nums = rows.map((r) => r.players);
  const s = statsOf(nums);
  const prevAvg = statsOf(prevRows.map((r) => r.players)).avg;
  const growth = growthPct(s.avg, prevAvg);
  const uptime =
    rows.length > 0 ? Math.round((rows.filter((r) => r.is_online).length / rows.length) * 100) : 0;
  const current = rows[rows.length - 1]?.players ?? 0;
  const maxCap = rows[rows.length - 1]?.max_players ?? 0;
  const capacityUse = maxCap > 0 ? Math.round((current / maxCap) * 100) : 0;
  const dayPeak = ath[ath.length - 1]?.peak_players ?? 0;

  const hod = hourOfDayAvg(rows, (r) => r.players, (r) => r.recorded_at);
  const hodMax = Math.max(1, ...hod);
  const hodChart = hod.map((v, h) => ({ h: h.toString().padStart(2, "0"), v }));

  const athChart = ath.map((a) => ({
    label: new Date(a.day).toLocaleDateString("fi-FI", { day: "2-digit", month: "2-digit" }),
    peak: a.peak_players,
  }));
  const athMax = Math.max(1, ...athChart.map((a) => a.peak));

  return (
    <section className="mt-8 space-y-4">
      <div className="premium-card premium-panel p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[color:var(--neon)]">
              <span className="inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-[color:var(--neon)]" />
              Server analytics
            </div>
            <h2 className="mt-1 text-xl font-black sm:text-2xl">
              Suorituskyky &{" "}
              <span className="bg-gradient-to-r from-[color:var(--neon)] to-[color:var(--neon-2)] bg-clip-text text-transparent">
                trendit
              </span>
            </h2>
          </div>
          <div className="flex gap-1 rounded-full border border-border/60 bg-background/60 p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                  r.key === range.key
                    ? "bg-gradient-to-r from-[color:var(--neon)] to-[color:var(--neon-2)] text-black"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI grid */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 sm:gap-3">
          <Kpi icon={<Activity className="h-3 w-3" />} label="Nyt" value={current} color="var(--neon)" trend={growth} />
          <Kpi icon={<TrendingUp className="h-3 w-3" />} label={`${range.label} ka`} value={s.avg} color="var(--neon-2)" />
          <Kpi icon={<Gauge className="h-3 w-3" />} label="Mediaani" value={s.median} sub={`p95 ${s.p95}`} color="#a78bfa" />
          <Kpi icon={<Trophy className="h-3 w-3" />} label="Päivän ATH" value={dayPeak} color="var(--gold)" />
          <Kpi icon={<Zap className="h-3 w-3" />} label="All-time" value={peak} color="#f97316" />
          <Kpi icon={<Percent className="h-3 w-3" />} label="Uptime" value={`${uptime}%`} sub={`kap. ${capacityUse}%`} color="var(--success)" />
        </div>

        {/* Main players area chart */}
        <div className="mt-5 rounded-2xl border border-border/60 bg-background/40 p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="text-sm font-bold">Pelaajat · {range.label}</h3>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Min {s.min} · Max {s.max} · Ka {s.avg}
            </span>
          </div>
          {loading ? (
            <Skeleton h={240} />
          ) : series.length === 0 ? (
            <Empty h={200} text="Ei vielä dataa — palaa hetken päästä." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={series} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="playersFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--neon)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--neon)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                <XAxis dataKey="label" stroke="oklch(1 0 0 / 0.4)" fontSize={10} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis stroke="oklch(1 0 0 / 0.4)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<Tip suffix=" pelaajaa" />} />
                <Area type="monotone" dataKey="players" stroke="var(--neon)" strokeWidth={2.5} fill="url(#playersFill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Secondary charts */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-[color:var(--neon-2)]" />
                Aktiviteetti kellonajan mukaan
              </h3>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Prime {hod.indexOf(Math.max(...hod))}:00
              </span>
            </div>
            {loading ? (
              <Skeleton h={180} />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={hodChart} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.04)" vertical={false} />
                  <XAxis dataKey="h" stroke="oklch(1 0 0 / 0.4)" fontSize={9} tickLine={false} axisLine={false} interval={2} />
                  <YAxis stroke="oklch(1 0 0 / 0.4)" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: "oklch(1 0 0 / 0.04)" }} content={<Tip suffix=" pelaajaa" prefix="klo " prefixKey="h" prefixSuffix=":00" />} />
                  <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                    {hodChart.map((d, i) => (
                      <Cell key={i} fill={`color-mix(in oklab, var(--neon-2) ${25 + (d.v / hodMax) * 65}%, transparent)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5 text-[color:var(--gold)]" />
                Päivittäinen huippu · 30 pv
              </h3>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                All-time {peak}
              </span>
            </div>
            {loading ? (
              <Skeleton h={180} />
            ) : athChart.length === 0 ? (
              <Empty h={160} text="Ei vielä päivittäisiä huippuja." />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={athChart} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.04)" vertical={false} />
                  <XAxis dataKey="label" stroke="oklch(1 0 0 / 0.4)" fontSize={9} tickLine={false} axisLine={false} minTickGap={12} />
                  <YAxis stroke="oklch(1 0 0 / 0.4)" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: "oklch(1 0 0 / 0.04)" }} content={<Tip suffix=" ATH" />} />
                  <Bar dataKey="peak" radius={[4, 4, 0, 0]}>
                    {athChart.map((d, i) => (
                      <Cell key={i} fill={d.peak >= peak ? "var(--gold)" : `color-mix(in oklab, var(--gold) ${30 + (d.peak / athMax) * 55}%, transparent)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Kpi({
  icon,
  label,
  value,
  sub,
  trend,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  trend?: number;
  color: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-background/70 to-background/30 p-3 backdrop-blur"
      style={{ boxShadow: `inset 0 0 30px -16px ${color}` }}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <div className="mt-0.5 font-mono text-xl font-bold tabular-nums sm:text-2xl" style={{ color }}>
        {typeof value === "number" ? value.toLocaleString("fi-FI") : value}
      </div>
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        {sub ? <span>{sub}</span> : <span />}
        {trend !== undefined && Number.isFinite(trend) && (
          <span
            className={[
              "inline-flex items-center gap-0.5 font-bold",
              trend >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--danger)]",
            ].join(" ")}
          >
            {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}

function Skeleton({ h }: { h: number }) {
  return <div style={{ height: h }} className="animate-shimmer rounded-xl bg-card/40" />;
}
function Empty({ text, h }: { text: string; h: number }) {
  return (
    <div style={{ height: h }} className="flex items-center justify-center text-xs text-muted-foreground">
      {text}
    </div>
  );
}

type TipPayload = { value: number; payload: Record<string, string | number> };
function Tip({
  active,
  payload,
  suffix = "",
  prefix = "",
  prefixKey,
  prefixSuffix = "",
}: {
  active?: boolean;
  payload?: TipPayload[];
  suffix?: string;
  prefix?: string;
  prefixKey?: string;
  prefixSuffix?: string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const label = prefixKey
    ? `${prefix}${p.payload[prefixKey]}${prefixSuffix}`
    : (p.payload.label as string);
  return (
    <div className="rounded-lg border border-border/60 bg-background/95 px-3 py-1.5 text-xs shadow-xl backdrop-blur">
      <div className="font-mono text-[10px] text-muted-foreground">{label}</div>
      <div className="font-bold">
        {p.value.toLocaleString("fi-FI")}
        {suffix}
      </div>
    </div>
  );
}
