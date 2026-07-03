import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Users, Server, Activity } from "lucide-react";
import { fetchGlobalStats, type GlobalStat } from "@/lib/stats";

const RANGES = [
  { key: "24h", label: "24h", hours: 24 },
  { key: "7d", label: "7 pv", hours: 24 * 7 },
  { key: "30d", label: "30 pv", hours: 24 * 30 },
] as const;

export function GlobalPlayersChart() {
  const [range, setRange] = useState<(typeof RANGES)[number]>(RANGES[0]);
  const [data, setData] = useState<GlobalStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    async function load() {
      const rows = await fetchGlobalStats(range.hours);
      if (!alive) return;
      setData(rows);
      setLoading(false);
    }
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [range]);

  const chart = data.map((d) => {
    const dt = new Date(d.recorded_at);
    return {
      label:
        range.hours <= 24
          ? dt.toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" })
          : dt.toLocaleDateString("fi-FI", { day: "2-digit", month: "2-digit" }),
      total: d.total_players,
      online: d.online_servers,
    };
  });

  const latest = data[data.length - 1];
  const peak = data.reduce((m, d) => Math.max(m, d.total_players), 0);

  return (
    <section className="mx-auto mt-6 max-w-6xl px-4">
      <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card/40 to-background/60 p-4 backdrop-blur sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black sm:text-2xl">
              <span className="bg-gradient-to-r from-[color:var(--neon)] to-[color:var(--neon-2)] bg-clip-text text-transparent">
                Suomen pelaajat
              </span>{" "}
              live
            </h2>
            <p className="text-xs text-muted-foreground">
              Päivittyy joka tunti · Snapshot kaikilta seuratuilta servereiltä
            </p>
          </div>
          <div className="flex gap-1 rounded-full border border-border/60 bg-background/60 p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  r.key === range.key
                    ? "bg-[color:var(--neon)] text-black"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <MiniStat
            icon={<Users className="h-3.5 w-3.5" />}
            label="Nyt online"
            value={latest?.total_players ?? 0}
            color="var(--neon)"
          />
          <MiniStat
            icon={<Activity className="h-3.5 w-3.5" />}
            label={`${range.label} huippu`}
            value={peak}
            color="var(--neon-2)"
          />
          <MiniStat
            icon={<Server className="h-3.5 w-3.5" />}
            label="Serverit online"
            value={latest ? `${latest.online_servers}/${latest.total_servers}` : "0/0"}
            color="#facc15"
          />
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="h-[260px] animate-shimmer rounded-xl bg-card/50" />
          ) : chart.length === 0 ? (
            <div className="flex h-[220px] items-center justify-center text-xs text-muted-foreground">
              Ei vielä dataa — kaavio täyttyy tunneittain.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chart} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--neon)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="var(--neon)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="oklch(1 0 0 / 0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(1 0 0 / 0.4)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload as { label: string; total: number; online: number };
                    return (
                      <div className="rounded-lg border border-border/60 bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
                        <div className="font-mono text-[10px] text-muted-foreground">{p.label}</div>
                        <div className="font-bold text-[color:var(--neon)]">
                          {p.total.toLocaleString("fi-FI")} pelaajaa
                        </div>
                        <div className="text-[10px] text-muted-foreground">{p.online} serveriä online</div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="var(--neon)"
                  strokeWidth={2.5}
                  fill="url(#totalFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}

function MiniStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl border border-border/60 bg-background/40 p-3 backdrop-blur"
      style={{ boxShadow: `inset 0 0 30px -18px ${color}` }}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <div className="mt-1 font-mono text-xl font-bold tabular-nums sm:text-2xl" style={{ color }}>
        {typeof value === "number" ? value.toLocaleString("fi-FI") : value}
      </div>
    </div>
  );
}
