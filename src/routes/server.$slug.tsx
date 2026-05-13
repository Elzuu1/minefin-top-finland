import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Copy, ExternalLink, Minus } from "lucide-react";
import { toast } from "sonner";
import { fetchServerBySlug, type ServerWithStats } from "@/lib/servers";
import { useAuth } from "@/lib/auth";
import { ServerIcon } from "@/components/ServerIcon";
import { HypeButton } from "@/components/HypeButton";
import { CommentsSection } from "@/components/CommentsSection";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/server/$slug")({
  component: ServerProfile,
});

function ServerProfile() {
  const { slug } = useParams({ from: "/server/$slug" });
  const { user } = useAuth();
  const [server, setServer] = useState<ServerWithStats | null | "missing">(null);

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

  if (server === null) {
    return (
      <main className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="h-64 animate-shimmer rounded-3xl bg-card/50" />
        </div>
      </main>
    );
  }

  if (server === "missing") {
    return (
      <main className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-md px-4 py-32 text-center">
          <h1 className="text-3xl font-bold">Serveriä ei löytynyt</h1>
          <Link to="/" className="mt-4 inline-block text-sm text-[color:var(--neon)] hover:underline">
            ← Takaisin etusivulle
          </Link>
        </div>
      </main>
    );
  }

  const TrendIcon = server.trend === "up" ? ArrowUp : server.trend === "down" ? ArrowDown : Minus;

  const copyIp = async () => {
    await navigator.clipboard.writeText(server.ip);
    toast.success("IP kopioitu leikepöydälle");
  };

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <div className="relative">
        {/* Banner */}
        <div
          className="relative h-56 overflow-hidden border-b border-border/60 sm:h-72"
          style={{
            background: `linear-gradient(135deg, ${server.icon_color}, oklch(0.18 0.04 260))`,
          }}
        >
          <div className="absolute inset-0 grid-bg opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          {server.is_featured && (
            <div className="absolute right-4 top-4 rounded-full border border-[color:var(--neon)]/40 bg-background/80 px-3 py-1 text-xs font-bold text-[color:var(--neon)] backdrop-blur">
              ★ FEATURED
            </div>
          )}
        </div>

        <div className="mx-auto max-w-4xl px-4">
          <Link
            to="/"
            className="-mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Takaisin
          </Link>

          <div className="-mt-12 flex items-end gap-4">
            <div className="rounded-2xl border-4 border-background bg-background p-1">
              <div className="scale-150 sm:scale-[1.75]">
                <ServerIcon color={server.icon_color} letter={server.icon_letter} />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1
                className={[
                  "text-3xl font-black sm:text-4xl",
                  server.is_featured ? "text-[color:var(--neon)] text-glow-neon" : "",
                ].join(" ")}
              >
                {server.name}
              </h1>
              <button
                onClick={copyIp}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {server.ip} <Copy className="h-3 w-3" />
              </button>
            </div>

            <HypeButton
              serverId={server.id}
              hypeCount={server.hype_count}
              hyped={server.user_hyped}
              size="lg"
            />
          </div>

          {/* Stats grid */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Pelaajia" value={server.players.toLocaleString()} sub={`/ ${server.max_players}`} />
            <Stat
              label="Tila"
              value={server.online ? "Online" : "Offline"}
              valueColor={server.online ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}
              icon={
                <span
                  className={[
                    "inline-block h-2.5 w-2.5 rounded-full",
                    server.online ? "bg-[color:var(--success)] animate-pulse-dot" : "bg-[color:var(--danger)]",
                  ].join(" ")}
                />
              }
            />
            <Stat label="Versio" value={server.version ?? "—"} />
            <Stat
              label="Trendi"
              value={server.trend.toUpperCase()}
              icon={<TrendIcon className="h-4 w-4" />}
              valueColor={
                server.trend === "up"
                  ? "text-[color:var(--success)]"
                  : server.trend === "down"
                    ? "text-[color:var(--danger)]"
                    : ""
              }
            />
          </div>

          {/* Description */}
          {server.description && (
            <div className="mt-6 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur">
              <h2 className="mb-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">Tietoa</h2>
              <p className="whitespace-pre-wrap text-sm text-foreground/90">{server.description}</p>
            </div>
          )}

          {/* Discord */}
          {server.discord_url && (
            <a
              href={server.discord_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-semibold transition-colors hover:border-[color:var(--neon-2)]/60 hover:text-[color:var(--neon-2)]"
            >
              <ExternalLink className="h-4 w-4" /> Discord
            </a>
          )}

          <CommentsSection serverId={server.id} />
        </div>
      </div>

      <footer className="mt-20 border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Minefin
      </footer>
    </main>
  );
}

function Stat({
  label,
  value,
  sub,
  icon,
  valueColor,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  valueColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        {icon}
        <span className={["font-mono text-2xl font-bold tabular-nums", valueColor ?? ""].join(" ")}>
          {value}
        </span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}
