import skinUrl from "@/assets/elzuu-skin-nobg.png";

/**
 * FinlandSMP founder spotlight — large, glowing player card.
 * Strong hover lift + shimmer sweep, works on touch (active:) too.
 */
export function FounderCard({ username = "Elzuu1" }: { username?: string }) {
  return (
    <section className="relative mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
      {/* Ambient halo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[110%] w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-[40%] bg-[color:var(--neon)]/25 blur-[80px] sm:blur-[120px] animate-pulse" />
      </div>

      <div
        className="group relative cursor-pointer overflow-hidden rounded-3xl border-2 border-[color:var(--neon)]/50 bg-gradient-to-br from-black/85 via-black/70 to-[color:var(--neon)]/15 p-5 backdrop-blur-xl shadow-[0_0_50px_-10px_oklch(0.82_0.2_165_/_0.8),inset_0_0_30px_-10px_oklch(0.82_0.2_165_/_0.3)] transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-[color:var(--neon)] hover:shadow-[0_0_120px_-5px_oklch(0.82_0.2_165),inset_0_0_60px_-10px_oklch(0.82_0.2_165_/_0.6)] active:-translate-y-1 active:scale-[1.01] sm:p-10 animate-float-glow"
      >
        {/* Shimmer sweep on hover/touch */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full group-active:translate-x-full" />

        {/* Glow orbs */}
        <div className="pointer-events-none absolute -left-[15%] -top-[15%] h-[60%] w-[60%] rounded-full bg-[color:var(--neon)]/40 blur-3xl transition-all duration-500 group-hover:bg-[color:var(--neon)]/70 group-hover:scale-125" />
        <div className="pointer-events-none absolute -bottom-[20%] -right-[10%] h-[70%] w-[70%] rounded-full bg-[color:var(--neon-2)]/25 blur-3xl transition-all duration-500 group-hover:bg-[color:var(--neon-2)]/55 group-hover:scale-125" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_60%)] transition-opacity duration-500 group-hover:opacity-150" />
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />

        <div className="relative flex flex-col items-center gap-4 text-center sm:gap-5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-[color:var(--neon)] text-glow-neon sm:text-xs">
            FinlandSMP
          </p>

          <div className="relative">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-[color:var(--neon)]/40 blur-3xl transition-all duration-500 group-hover:bg-[color:var(--neon)]/80 group-hover:scale-125" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[100%] w-[100%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--neon-2)]/30 blur-2xl transition-all duration-500 group-hover:bg-[color:var(--neon-2)]/60" />
            <img
              src={skinUrl}
              alt={`${username} Minecraft skin`}
              className="relative h-64 w-auto object-contain [image-rendering:pixelated] drop-shadow-[0_0_25px_oklch(0.82_0.2_165_/_0.8)] transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_45px_oklch(0.82_0.2_165)] sm:h-96"
              loading="eager"
            />
          </div>

          <div className="space-y-1">
            <h2 className="font-display text-4xl font-black tracking-tight transition-all duration-500 group-hover:scale-105 sm:text-6xl">
              <span className="bg-gradient-to-br from-white via-white to-[color:var(--neon)] bg-clip-text text-transparent text-glow-neon">
                {username}
              </span>
            </h2>
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-white/85 sm:text-base">
              FinlandSMP:n Omistaja <span className="text-yellow-400">👑</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
