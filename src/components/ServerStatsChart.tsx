import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, TrendingUp, Trophy } from "lucide-react";
import { fetchAllTimePeak, fetchServerAth, fetchServerStats, type DailyAth, type ServerStat } from "@/lib/stats";

export function ServerStatsChart({ serverId }: { serverId: string }) {
  const [stats, setStats] = useState<ServerStat[]>([]);
  const [ath, setAth] = useState<DailyAth[]>([]);
  const [peak, setPeak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      const [s, a, p] = await Promise.all([
        fetchServerStats(serverId, 24),
        fetchServerAth(serverId, 30),
        fetchAllTimePeak(serverId),
      ]);
      if (!alive) return;
      setStats(s);
      setAth(a);
      setPeak(p);
      setLoading(false);
    }
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [serverId]);

  const last24 = stats.map((s) => ({
    t: new Date(s.recorded_at).getTime(),
    label: new Date(s.recorded_at).toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" }),
    players: s.players,
  }));

  const athData = ath.map((a) => ({
    label: new Date(a.day).toLocaleDateString("fi-FI", { day: "2-digit", month: "2-digit" }),
    peak: a.peak_players,
  }));

  const current = last24[last24.length - 1]?.players ?? 0;
  const dayPeak = ath[ath.length - 1]?.peak_players ?? 0;
  const avg =
    last24.length > 0 ? Math.round(last24.reduce((sum, x) => sum + x.players, 0) / last24.length) : 0;

  return (
    <section className="mt-8 space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatChip icon={<Activity className="h-3.5 w-3.5" />} label="Nyt" value={current} color="var(--neon)" />
        <StatChip icon={<TrendingUp className="h-3.5 w-3.5" />} label="24h ka" value={avg} color="var(--neon-2)" />
        <StatChip icon={<Trophy className="h-3.5 w-3.5" />} label="Päivän ATH" value={dayPeak} color="#facc15" />
        <StatChip icon={<Trophy className="h-3.5 w-3.5" />} label="All-time" value={peak} color="#f97316" />
      </div>

      <ChartCard title="Pelaajat viimeisen 24h aikana" subtitle="Snapshot joka tunti">
        {loading ? (
          <Skeleton />
        ) : last24.length === 0 ? (
          <Empty text="Ei vielä dataa — palaa hetken päästä." />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={last24} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="playersFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--neon)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--neon)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="oklch(1 0 0 / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(1 0 0 / 0.4)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<Tip suffix=" pelaajaa" />} />
              <Area
                type="monotone"
                dataKey="players"
                stroke="var(--neon)"
                strokeWidth={2}
                fill="url(#playersFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Päivittäinen ATH" subtitle="Korkein pelaajamäärä per päivä (30 pv)">
        {loading ? (
          <Skeleton />
        ) : athData.length === 0 ? (
          <Empty text="Ei vielä päivittäisiä huippuja." />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={athData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="athFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#facc15" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#facc15" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="oklch(1 0 0 / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(1 0 0 / 0.4)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<Tip suffix=" ATH" />} />
              <Area
                type="monotone"
                dataKey="peak"
                stroke="#facc15"
                strokeWidth={2}
                fill="url(#athFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </section>
  );
}

function StatChip({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-3 backdrop-blur"
      style={{ boxShadow: `inset 0 0 24px -12px ${color}` }}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl font-bold tabular-nums" style={{ color }}>
        {value.toLocaleString("fi-FI")}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-bold">{title}</h3>
        {subtitle && <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function Skeleton() {
  return <div className="h-[220px] animate-shimmer rounded-xl bg-card/50" />;
}

function Empty({ text }: { text: string }) {
  return <div className="flex h-[180px] items-center justify-center text-xs text-muted-foreground">{text}</div>;
}

type TipPayload = { value: number; payload: { label: string } };
function Tip({ active, payload, suffix }: { active?: boolean; payload?: TipPayload[]; suffix?: string }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-border/60 bg-background/95 px-3 py-1.5 text-xs shadow-lg backdrop-blur">
      <div className="font-mono text-[10px] text-muted-foreground">{p.payload.label}</div>
      <div className="font-bold">
        {p.value.toLocaleString("fi-FI")}
        {suffix ?? ""}
      </div>
    </div>
  );
}
