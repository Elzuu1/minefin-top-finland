import { ArrowDown, Globe, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[120%]" style={{ background: "var(--gradient-hero)" }} />
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[color:var(--neon)]/20 blur-[120px] sm:h-[640px] sm:w-[640px]" />

      <div className="relative mx-auto flex min-h-[62vh] max-w-5xl flex-col items-center justify-center px-4 py-12 text-center sm:min-h-[74vh] sm:py-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-medium tracking-wide text-muted-foreground backdrop-blur animate-rise sm:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--neon)] animate-pulse-dot sm:h-2 sm:w-2" />
          Live · Suomen Minecraft-serverit
        </div>

        <h1
          className="mt-6 font-display text-6xl font-black leading-[0.9] tracking-tight sm:mt-8 sm:text-8xl animate-rise"
          style={{ animationDelay: "80ms" }}
        >
          <span className="bg-gradient-to-br from-white via-white to-[color:var(--neon)] bg-clip-text text-transparent">
            MINEFIN
          </span>
        </h1>

        <p className="mt-4 max-w-md text-sm text-muted-foreground/80 sm:mt-5 sm:text-base animate-rise" style={{ animationDelay: "160ms" }}>
          Suomen Minecraft Leaderboardit
        </p>

        <a
          href="#leaderboard"
          className="group relative mt-6 inline-flex items-center gap-2 overflow-hidden rounded-full bg-[color:var(--neon)] px-6 py-3 text-sm font-bold text-background shadow-[0_0_60px_-10px_oklch(0.82_0.2_165_/_0.9)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_80px_-5px_oklch(0.82_0.2_165)] sm:mt-10 sm:gap-3 sm:px-10 sm:py-5 sm:text-lg animate-rise"
          style={{ animationDelay: "240ms" }}
        >
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          Leaderboardit
          <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5 sm:h-5 sm:w-5" />
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </a>

        <Link
          to="/websitet"
          className="group relative mt-3 inline-flex items-center gap-2 overflow-hidden rounded-full border border-red-500/50 bg-red-500/15 px-4 py-2 text-xs font-bold text-red-300 backdrop-blur shadow-[0_0_30px_-8px_rgba(239,68,68,0.6)] transition-all duration-300 hover:scale-[1.05] hover:border-red-400 hover:bg-red-500/25 hover:text-red-100 hover:shadow-[0_0_40px_-4px_rgba(239,68,68,0.8)] sm:mt-4 sm:gap-2.5 sm:px-6 sm:py-2.5 sm:text-sm animate-rise"
          style={{ animationDelay: "320ms" }}
        >
          <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Muut Websitet
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-red-200/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </Link>

      </div>
    </section>
  );
}

