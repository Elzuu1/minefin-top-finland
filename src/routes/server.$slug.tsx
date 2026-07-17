import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUp, ArrowDown, Copy, ExternalLink, Minus, Users, Wifi, Gauge } from "lucide-react";
import { toast } from "sonner";
import { fetchServerBySlug, type ServerWithStats } from "@/lib/servers";
import { useAuth } from "@/lib/auth";
import { useHypeRealtime } from "@/lib/use-hype-realtime";
import { HypeButton } from "@/components/HypeButton";
import { CommentsSection } from "@/components/CommentsSection";
import { SiteHeader } from "@/components/SiteHeader";
import { ServerStatsChart } from "@/components/ServerStatsChart";

export const Route = createFileRoute("/server/$slug")({
  component: ServerProfile,
});

function ServerProfile() {
  const { slug } = useParams({ from: "/server/$slug" });
  const { user } = useAuth();
  const [server, setServer] = useState<ServerWithStats | null | "missing">(null);

  const reload = useCallback(() => {
    fetchServerBySlug(slug, user?.id).then((s) => setServer(s ?? "missing"));
  }, [slug, user?.id]);

  useEffect(() => {
    let cancelled = false;
    fetchServerBySlug(slug, user?.id).then((s) => {
      if (cancelled) return;
      setServer(s ?? "missing");
    });
    return () => {
      cancelled = true;
    };
  }, [slug, user?.id]);

  const hypeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentServerId = typeof server === "object" && server ? server.id : null;
  useHypeRealtime(
    useCallback(
      (changedId) => {
        if (changedId !== currentServerId) return;
        if (hypeTimer.current) clearTimeout(hypeTimer.current);
        hypeTimer.current = setTimeout(reload, 250);
      },
      [currentServerId, reload],
    ),
  );

  if (server === null) {
    return (
      <main className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="h-80 animate-shimmer rounded-[2rem] bg-card/50" />
        </div>
      </main>
    );
  }

  if (server === "missing") {
    return (
      <main className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-md px-4 py-32 text-center">
          <h1 className="font-display text-4xl font-black">Serveriä ei löytynyt</h1>
          <Link to="/" className="mt-6 inline-block text-sm text-[color:var(--neon)] hover:underline">
            ← Takaisin etusivulle
          </Link>
        </div>
      </main>
    );
  }

  const accent = server.icon_color || "oklch(0.82 0.2 165)";
  const TrendIcon = server.trend === "up" ? ArrowUp : server.trend === "down" ? ArrowDown : Minus;
  const trendColor =
    server.trend === "up"
      ? "text-[color:var(--success)]"
      : server.trend === "down"
        ? "text-[color:var(--danger)]"
        : "text-muted-foreground";

  const copyIp = async () => {
    const full = server.port && server.port !== 25565 ? `${server.ip}:${server.port}` : server.ip;
    await navigator.clipboard.writeText(full);
    toast.success("Osoite kopioitu");
  };

  const fillPct = server.max_players > 0 ? Math.min(100, (server.players / server.max_players) * 100) : 0;

  return (
    <main
      className="min-h-screen"
      style={{ ["--srv" as any]: accent }}
    >
      <SiteHeader />

      {/* Themed hero */}
      <section className="relative overflow-hidden pb-12 pt-8 sm:pb-20 sm:pt-14">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-90"
          style={{
            background: `radial-gradient(60% 60% at 50% 0%, ${accent}22 0%, transparent 60%)`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-20" />

        <div className="mx-auto max-w-5xl px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Takaisin
          </Link>

          <div className="mt-8 flex flex-col items-center gap-8 text-center sm:mt-12">
            {/* Big themed favicon */}
            <div className="relative">
              <div
                className="absolute -inset-6 -z-10 rounded-full blur-3xl"
                style={{ background: `${accent}55` }}
              />
              <div
                className="rounded-[2rem] border-2 p-2 shadow-2xl"
                style={{ borderColor: `${accent}80`, background: "oklch(0.12 0.02 260 / 0.6)" }}
              >
                {server.favicon ? (
                  <img
                    src={server.favicon}
                    alt=""
                    className="h-28 w-28 rounded-2xl [image-rendering:pixelated] sm:h-36 sm:w-36"
                  />
                ) : (
                  <div
                    className="flex h-28 w-28 items-center justify-center rounded-2xl font-display text-6xl font-black text-background sm:h-36 sm:w-36 sm:text-7xl"
                    style={{ background: accent }}
                  >
                    {server.icon_letter}
                  </div>
                )}
              </div>
            </div>

            {server.category && (
              <div
                className="inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                style={{
                  borderColor: `${accent}40`,
                  background: `${accent}10`,
                  color: accent,
                }}
              >
                {server.category}
                {server.is_featured ? " · ★ Featured" : ""}
              </div>
            )}

            <h1 className="font-display text-5xl font-black tracking-tighter sm:text-7xl">
              {server.name}
            </h1>

            {server.motd && (
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {server.motd}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={copyIp}
                className="group inline-flex items-center gap-2 rounded-2xl border-2 px-5 py-3 font-mono text-sm font-bold transition-all hover:scale-[1.02]"
                style={{
                  borderColor: `${accent}60`,
                  background: `${accent}10`,
                  color: accent,
                }}
              >
                {server.ip}
                {server.port && server.port !== 25565 ? `:${server.port}` : ""}
                <Copy className="h-4 w-4 opacity-70 transition-opacity group-hover:opacity-100" />
              </button>
              <HypeButton
                serverId={server.id}
                hypeCount={server.hype_count}
                hyped={server.user_hyped}
                size="lg"
              />
              {server.discord_url && (
                <a
                  href={server.discord_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-bold transition-colors hover:border-white/30 hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" /> Discord
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 pb-24">
        {/* Live stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <ThemedStat
            label="Pelaajia"
            value={server.players.toLocaleString()}
            sub={`/ ${server.max_players}`}
            accent={accent}
            icon={<Users className="h-4 w-4" />}
          />
          <ThemedStat
            label="Tila"
            value={server.online ? "Online" : "Offline"}
            accent={accent}
            valueColor={server.online ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}
            icon={<Wifi className="h-4 w-4" />}
          />
          <ThemedStat
            label="Ping"
            value={server.ping_ms != null ? `${server.ping_ms}ms` : "—"}
            accent={accent}
            icon={<Gauge className="h-4 w-4" />}
          />
          <ThemedStat
            label="Trendi"
            value={server.trend.toUpperCase()}
            accent={accent}
            valueColor={trendColor}
            icon={<TrendIcon className="h-4 w-4" />}
          />
        </div>

        {/* Capacity bar */}
        <div
          className="mt-6 rounded-[2rem] border p-6 backdrop-blur"
          style={{
            borderColor: `${accent}25`,
            background: `linear-gradient(180deg, ${accent}08, transparent)`,
          }}
        >
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Kapasiteetti
            </span>
            <span className="font-mono text-sm text-foreground">
              {server.players} / {server.max_players}{" "}
              <span className="text-muted-foreground">({fillPct.toFixed(0)}%)</span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${fillPct}%`,
                background: `linear-gradient(90deg, ${accent}, ${accent}aa)`,
                boxShadow: `0 0 12px ${accent}`,
              }}
            />
          </div>
        </div>

        {server.description && (
          <div
            className="mt-6 rounded-[2rem] border p-6 backdrop-blur sm:p-8"
            style={{ borderColor: `${accent}20`, background: `${accent}05` }}
          >
            <h2
              className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em]"
              style={{ color: accent }}
            >
              Tietoa serveristä
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 sm:text-base">
              {server.description}
            </p>
          </div>
        )}

        <div className="mt-8">
          <ServerStatsChart serverId={server.id} />
        </div>

        <div className="mt-8">
          <CommentsSection serverId={server.id} />
        </div>
      </div>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Minefin
      </footer>
    </main>
  );
}

function ThemedStat({
  label,
  value,
  sub,
  icon,
  valueColor,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  valueColor?: string;
  accent: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[1.5rem] border p-5 backdrop-blur"
      style={{
        borderColor: `${accent}20`,
        background: `linear-gradient(160deg, ${accent}08, transparent 70%)`,
      }}
    >
      <div className="flex items-center gap-1.5" style={{ color: accent }}>
        {icon}
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{label}</p>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={["font-display text-3xl font-black tabular-nums", valueColor ?? ""].join(" ")}>
          {value}
        </span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}
