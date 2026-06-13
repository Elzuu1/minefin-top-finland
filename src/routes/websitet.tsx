import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Globe } from "lucide-react";
import { fetchActiveWebsites, type ExternalWebsite } from "@/lib/websites";

export const Route = createFileRoute("/websitet")({
  component: WebsitetPage,
  head: () => ({
    meta: [
      { title: "Muut Websitet — Minefin" },
      {
        name: "description",
        content:
          "Tutustu FinlandSMP:n ja Elzuu1:n muihin projekteihin: kotisivut, mobiili-API, VIP-peli ja paljon muuta.",
      },
      { property: "og:title", content: "Muut Websitet — Minefin" },
      {
        property: "og:description",
        content: "FinlandSMP:n ja Elzuu1:n muut projektit yhdessä paikassa.",
      },
    ],
  }),
});

function WebsitetPage() {
  const [sites, setSites] = useState<ExternalWebsite[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveWebsites()
      .then(setSites)
      .catch((e) => setError(e?.message ?? "Lataus epäonnistui"));
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="absolute inset-x-0 top-0 -z-10 h-[60vh]" style={{ background: "var(--gradient-hero)" }} />
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition hover:text-[color:var(--neon)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Etusivu
        </Link>

        <div className="mt-5 mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-red-300">
            <Globe className="h-3 w-3" />
            Muut Websitet
          </div>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-6xl">
            <span className="bg-gradient-to-br from-white via-white to-red-400 bg-clip-text text-transparent">
              Muut projektit
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            FinlandSMP:n ja Elzuu1:n muut sivut, mobiili-API ja pelit yhdessä paikassa.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!sites && !error && (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="relative h-64 overflow-hidden rounded-2xl border border-border/60 bg-card/50">
                <div className="absolute inset-0 animate-shimmer" />
              </div>
            ))}
          </div>
        )}

        {sites && sites.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center text-sm text-muted-foreground">
            Ei vielä yhtään sivustoa.
          </div>
        )}

        {sites && sites.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {sites.map((s, i) => (
              <WebsiteCard key={s.id} site={s} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function WebsiteCard({ site, index }: { site: ExternalWebsite; index: number }) {
  const accent = site.accent || "#22c55e";
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noreferrer noopener"
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1.5 hover:scale-[1.015] animate-rise"
      style={{
        animationDelay: `${index * 80}ms`,
        boxShadow: `0 0 0 0 ${accent}00`,
      }}
    >
      <div
        className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: `0 30px 80px -20px ${accent}55, 0 0 40px -10px ${accent}66`, borderRadius: "1rem" }}
      />
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {site.image_url ? (
          <img
            src={site.image_url}
            alt={site.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: `linear-gradient(135deg, ${accent}33, ${accent}11)` }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        <span
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur transition group-hover:scale-110"
          style={{ color: accent, boxShadow: `0 0 0 1px ${accent}55` }}
        >
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <h2 className="font-display text-lg font-bold leading-tight sm:text-xl" style={{ color: accent }}>
          {site.title}
        </h2>
        {site.description && (
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{site.description}</p>
        )}
        <span className="mt-auto truncate pt-1 font-mono text-[10px] text-muted-foreground sm:text-xs">
          {site.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </span>
      </div>
    </a>
  );
}
