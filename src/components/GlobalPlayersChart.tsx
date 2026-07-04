import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
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
  Server,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import {
  fetchGlobalStats,
  fetchTopMovers,
  growthPct,
  hourOfDayAvg,
  stats as statsOf,
  type GlobalStat,
  type ServerMover,
} from "@/lib/stats";

const RANGES = [
  { key: "24h", label: "24h", hours: 24 },
  { key: "7d", label: "7 pv", hours: 24 * 7 },
  { key: "30d", label: "30 pv", hours: 24 * 30 },
] as const;

export function GlobalPlayersChart() {
  const [range, setRange] = useState<(typeof RANGES)[number]>(RANGES[0]);
  const [data, setData] = useState<GlobalStat[]>([]);
  const [prevData, setPrevData] = useState<GlobalStat[]>([]);
  const [movers, setMovers] = useState<{ up: ServerMover[]; down: ServerMover[] }>({ up: [], down: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    async function load() {
      const [rows, prevRows, m] = await Promise.all([
        fetchGlobalStats(range.hours),
        fetchGlobalStats(range.hours * 2),
        fetchTopMovers(5),
      ]);
      if (!alive) return;
      const cutoff = Date.now() - range.hours * 3600 * 1000;
      setData(rows);
      setPrevData(prevRows.filter((r) => new Date(r.recorded_at).getTime() < cutoff));
      setMovers(m);
      setLoading(false);
    }
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [range]);

  const chart = useMemo(
    () =>
      data.map((d) => {
        const dt = new Date(d.recorded_at);
        return {
          label:
            range.hours <= 24
              ? dt.toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" })
              : dt.toLocaleDateString("fi-FI", { day: "2-digit", month: "2-digit" }),
          total: d.total_players,
          online: d.online_servers,
          servers: d.total_servers,
        };
      }),
    [data, range.hours],
  );

  const playersSeries = data.map((d) => d.total_players);
  const s = statsOf(playersSeries);
  const prevAvg = statsOf(prevData.map((d) => d.total_players)).avg;
  const growth = growthPct(s.avg, prevAvg);
  const latest = data[data.length - 1];

  const hodAvg = hourOfDayAvg(data, (d) => d.total_players, (d) => d.recorded_at);
  const hodMax = Math.max(1, ...hodAvg);
  const hodChart = hodAvg.map((v, h) => ({ h: `${h.toString().padStart(2, "0")}`, v }));

  const serverUptimeAvg =
    data.length > 0
      ? Math.round(
          (data.reduce((sum, d) => sum + d.online_servers / Math.max(1, d.total_servers), 0) /
            data.length) *
            100,
        )
      : 0;

  return (
    <section className="mx-auto mt-8 max-w-6xl px-4">
      <div className="premium-card premium-panel p-5 sm:p-7">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[color:var(--neon)]">
              <span className="inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-[color:var(--neon)]" />
              Suomen Minecraft · Live Analytics
            </div>
            <h2 className="mt-1 text-2xl font-black leading-tight sm:text-3xl">
              Verkoston{" "}
              <span className="bg-gradient-to-r from-[color:var(--neon)] via-[color:var(--neon-2)] to-[color:var(--gold)] bg-clip-text text-transparent">
                pulssi
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Snapshot joka tunti · Aggregoituna kaikilta seuratuilta servereiltä
            </p>
          </div>
          <RangePicker range={range} onChange={setRange} />
        </div>

        {/* Headline KPIs */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <Kpi
            icon={<Users className="h-3.5 w-3.5" />}
            label="Nyt online"
            value={latest?.total_players ?? 0}
            trend={growth}
            color="var(--neon)"
          />
          <Kpi
            icon={<Trophy className="h-3.5 w-3.5" />}
            label={`${range.label} huippu`}
            value={s.max}
            sub={`ka ${s.avg.toLocaleString("fi-FI")}`}
            color="var(--gold)"
          />
          <Kpi
            icon={<Activity className="h-3.5 w-3.5" />}
            label="Mediaani"
            value={s.median}
            sub={`p95 ${s.p95.toLocaleString("fi-FI")}`}
            color="var(--neon-2)"
          />
          <Kpi
            icon={<Server className="h-3.5 w-3.5" />}
            label="Serverit online"
            value={latest ? `${latest.online_servers}/${latest.total_servers}` : "0/0"}
            sub={`uptime ${serverUptimeAvg}%`}
            color="#a78bfa"
          />
        </div>

        {/* Main chart */}
        <div className="mt-6 rounded-2xl border border-border/60 bg-background/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">Pelaajamäärä & aktiiviset serverit</h3>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {range.label} · verrattuna edelliseen jaksoon
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <LegendDot color="var(--neon)" label="Pelaajat" />
              <LegendDot color="var(--neon-2)" label="Serverit" dashed />
            </div>
          </div>
          {loading ? (
            <Skeleton h={280} />
          ) : chart.length === 0 ? (
            <Empty h={220} text="Ei vielä dataa — kaavio täyttyy tunneittain." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={chart} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--neon)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--neon)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                <XAxis dataKey="label" stroke="oklch(1 0 0 / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="left"
                  stroke="oklch(1 0 0 / 0.4)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="oklch(1 0 0 / 0.4)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<GlobalTip />} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="total"
                  stroke="var(--neon)"
                  strokeWidth={2.5}
                  fill="url(#totalFill)"
                  name="Pelaajat"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="online"
                  stroke="var(--neon-2)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Serverit online"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Secondary panels */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {/* Hour of day */}
          <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[color:var(--neon-2)]" />
                  Aktiviteetti kellonajan mukaan
                </h3>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Keskim. pelaajat / tunti · {range.label}
                </p>
              </div>
            </div>
            {loading ? (
              <Skeleton h={180} />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={hodChart} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="oklch(1 0 0 / 0.04)" vertical={false} />
                    <XAxis dataKey="h" stroke="oklch(1 0 0 / 0.4)" fontSize={9} tickLine={false} axisLine={false} interval={2} />
                    <YAxis stroke="oklch(1 0 0 / 0.4)" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: "oklch(1 0 0 / 0.04)" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const p = payload[0] as { value: number; payload: { h: string } };
                        return (
                          <div className="rounded-lg border border-border/60 bg-background/95 px-3 py-1.5 text-xs backdrop-blur">
                            <div className="font-mono text-[10px] text-muted-foreground">klo {p.payload.h}:00</div>
                            <div className="font-bold text-[color:var(--neon-2)]">
                              {p.value.toLocaleString("fi-FI")} pelaajaa
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                      {hodChart.map((d, i) => (
                        <rect
                          key={i}
                          fill={`color-mix(in oklab, var(--neon) ${20 + (d.v / hodMax) * 70}%, transparent)`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-2 flex justify-between text-[10px] font-mono text-muted-foreground">
                  <span>Hiljaisin: klo {hodAvg.indexOf(Math.min(...hodAvg))}:00</span>
                  <span>Prime time: klo {hodAvg.indexOf(Math.max(...hodAvg))}:00</span>
                </div>
              </>
            )}
          </div>

          {/* Top movers */}
          <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
            <div className="mb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-[color:var(--gold)]" />
                Suurimmat liikkujat · 24h
              </h3>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Pelaajamäärän muutos
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <MoverList title="Nousussa" movers={movers.up} direction="up" />
              <MoverList title="Laskussa" movers={movers.down} direction="down" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ subcomponents ----------------------------- */

function RangePicker({
  range,
  onChange,
}: {
  range: (typeof RANGES)[number];
  onChange: (r: (typeof RANGES)[number]) => void;
}) {
  return (
    <div className="flex gap-1 rounded-full border border-border/60 bg-background/60 p-1 backdrop-blur">
      {RANGES.map((r) => (
        <button
          key={r.key}
          onClick={() => onChange(r)}
          className={[
            "rounded-full px-3 py-1 text-xs font-semibold transition-all",
            r.key === range.key
              ? "bg-gradient-to-r from-[color:var(--neon)] to-[color:var(--neon-2)] text-black shadow-[0_0_20px_-4px_oklch(0.78_0.18_165/0.6)]"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          {r.label}
        </button>
      ))}
    </div>
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
      style={{ boxShadow: `inset 0 0 40px -20px ${color}` }}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl font-bold tabular-nums sm:text-3xl" style={{ color }}>
        {typeof value === "number" ? value.toLocaleString("fi-FI") : value}
      </div>
      <div className="mt-0.5 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        {sub ? <span>{sub}</span> : <span />}
        {trend !== undefined && Number.isFinite(trend) && (
          <span
            className={[
              "inline-flex items-center gap-0.5 font-bold",
              trend >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--danger)]",
            ].join(" ")}
          >
            {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

function LegendDot({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-block h-0.5 w-4"
        style={{
          background: color,
          borderTop: dashed ? `2px dashed ${color}` : undefined,
          height: dashed ? 0 : 2,
        }}
      />
      {label}
    </span>
  );
}

function MoverList({
  title,
  movers,
  direction,
}: {
  title: string;
  movers: ServerMover[];
  direction: "up" | "down";
}) {
  const color = direction === "up" ? "var(--success)" : "var(--danger)";
  const Icon = direction === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-mono uppercase tracking-widest" style={{ color }}>
        {title}
      </div>
      <ul className="space-y-1">
        {movers.length === 0 && (
          <li className="rounded-lg border border-border/40 bg-background/30 px-2 py-1.5 text-[11px] text-muted-foreground">
            Ei muutoksia
          </li>
        )}
        {movers.map((m) => (
          <li key={m.id}>
            <Link
              to="/server/$slug"
              params={{ slug: m.slug }}
              className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/30 px-2 py-1.5 transition-colors hover:border-border hover:bg-background/60"
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-black text-[10px] text-black"
                style={{ background: m.icon_color }}
              >
                {m.icon_letter}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs font-semibold">{m.name}</span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {m.players}
              </span>
              <span
                className="inline-flex items-center gap-0.5 font-mono text-[10px] font-bold tabular-nums"
                style={{ color }}
              >
                <Icon className="h-3 w-3" />
                {m.delta > 0 ? "+" : ""}
                {m.delta}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

type TipPayload = { value: number; name: string; color?: string; payload: { label: string } };
function GlobalTip({ active, payload }: { active?: boolean; payload?: TipPayload[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-background/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <div className="mb-1 font-mono text-[10px] text-muted-foreground">{payload[0].payload.label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 font-bold" style={{ color: p.color }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
          {p.value.toLocaleString("fi-FI")} <span className="text-[10px] text-muted-foreground">{p.name}</span>
        </div>
      ))}
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
