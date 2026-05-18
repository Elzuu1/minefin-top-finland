import { ArrowDown, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[120%]" style={{ background: "var(--gradient-hero)" }} />

      <div className="relative mx-auto flex min-h-[85vh] max-w-5xl flex-col items-center justify-center px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur animate-rise">
          <span className="h-2 w-2 rounded-full bg-[color:var(--neon)] animate-pulse-dot" />
          Live Suomen Minecraft-serverit
        </div>

        <h1
          className="mt-8 font-display text-6xl font-black leading-[0.95] tracking-tight sm:text-8xl md:text-9xl animate-rise"
          style={{ animationDelay: "80ms" }}
        >
          <span className="bg-gradient-to-br from-white via-white to-[color:var(--neon)] bg-clip-text text-transparent text-glow-neon">
            MINEFIN
          </span>
        </h1>

        <p className="mt-6 text-lg text-muted-foreground sm:text-xl animate-rise" style={{ animationDelay: "160ms" }}>
          Suomen Minecraft Leaderboardit
        </p>

        <a
          href="#leaderboard"
          className="group relative mt-10 inline-flex items-center gap-3 overflow-hidden rounded-full bg-[color:var(--neon)] px-8 py-4 text-base font-bold text-background shadow-[0_0_60px_-10px_oklch(0.82_0.2_165_/_0.9)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_80px_-5px_oklch(0.82_0.2_165)] sm:px-10 sm:py-5 sm:text-lg animate-rise"
          style={{ animationDelay: "240ms" }}
        >
          <Sparkles className="h-5 w-5" />
          Leaderboardit
          <ArrowDown className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5" />
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </a>

      </div>
    </section>
  );
}

