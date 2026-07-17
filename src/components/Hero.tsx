import { ArrowDown, Globe } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--neon)]/10 blur-[140px] sm:h-[820px] sm:w-[820px]" />

      <div className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center sm:min-h-[80vh] sm:py-32">
        <div
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 backdrop-blur animate-rise"
        >
          <span className="h-2 w-2 rounded-full bg-[color:var(--neon)] shadow-[0_0_10px_var(--neon)] animate-pulse-dot" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Live · Suomi-servut
          </span>
        </div>

        <h1
          className="mt-8 font-display text-6xl font-black leading-[0.9] tracking-tighter sm:text-8xl md:text-9xl animate-rise"
          style={{ animationDelay: "80ms" }}
        >
          Parhaat{" "}
          <span className="bg-gradient-to-br from-[color:var(--neon)] to-[color:var(--neon-2)] bg-clip-text text-transparent">
            Suomi
          </span>
          <span className="text-foreground/90">-servut</span>
        </h1>

        <p
          className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground animate-rise sm:mt-8 sm:text-lg"
          style={{ animationDelay: "160ms" }}
        >
          Löydä seuraava seikkailusi Suomen suurimmalta Minecraft-listaukselta.
          Live-pelaajamäärät, hype ja yhteisö yhdessä paikassa.
        </p>

        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-rise sm:mt-14 sm:gap-4"
          style={{ animationDelay: "240ms" }}
        >
          <a
            href="#leaderboard"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-[color:var(--neon)] px-7 py-4 text-sm font-extrabold uppercase tracking-wider text-background shadow-[0_0_40px_-8px_var(--neon)] transition-all duration-300 hover:brightness-110 sm:px-9 sm:py-5 sm:text-base"
          >
            Katso Top 10
            <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5 sm:h-5 sm:w-5" />
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </a>
          <Link
            to="/websitet"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground backdrop-blur transition-colors hover:border-white/30 hover:text-foreground sm:px-6 sm:text-sm"
          >
            <Globe className="h-4 w-4" />
            Muut websitet
          </Link>
        </div>
      </div>
    </section>
  );
}
