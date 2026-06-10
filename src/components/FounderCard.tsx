import skinUrl from "@/assets/elzuu-skin-nobg.png";

/**
 * FinlandSMP founder spotlight — large, glowing player card.
 * Subtle always-on sheen + rotating conic neon border + strong hover lift.
 */
export function FounderCard({ username = "Elzuu1" }: { username?: string }) {
  return (
    <section className="relative mx-auto w-full max-w-4xl overflow-hidden px-4 py-10 sm:overflow-visible sm:py-16">
      {/* Ambient multi-layer halo — stronger breathing pulse */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-[40%] bg-[color:var(--neon)]/45 blur-[90px] sm:h-[150%] sm:w-[150%] sm:blur-[180px] animate-strong-pulse" />
        <div className="absolute left-1/2 top-1/2 h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--neon-2)]/35 blur-[80px] sm:h-[110%] sm:w-[110%] sm:blur-[150px] animate-strong-pulse" style={{ animationDelay: '0.6s' }} />
      </div>

      {/* Rotating conic border wrapper */}
      <div className="group relative rounded-[28px] p-[3px] [background:conic-gradient(from_0deg,transparent_0deg,oklch(0.82_0.2_165)_60deg,oklch(0.7_0.22_200)_120deg,transparent_200deg,transparent_360deg)] overflow-hidden">
        <div className="pointer-events-none absolute inset-[-50%] animate-conic-spin [background:conic-gradient(from_0deg,transparent_0deg,oklch(0.82_0.2_165/_1)_40deg,oklch(0.7_0.22_200/_0.9)_120deg,transparent_220deg,transparent_360deg)]" />

        <div className="relative cursor-pointer overflow-hidden rounded-[26px] border border-[color:var(--neon)]/70 bg-gradient-to-br from-black/90 via-black/75 to-[color:var(--neon)]/25 p-4 backdrop-blur-xl shadow-[0_0_100px_-5px_oklch(0.82_0.2_165_/_0.95),inset_0_0_50px_-10px_oklch(0.82_0.2_165_/_0.55)] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-3 hover:scale-[1.06] hover:shadow-[0_0_260px_0px_oklch(0.82_0.2_165),0_0_160px_-10px_oklch(0.7_0.22_200_/_0.95),inset_0_0_100px_-10px_oklch(0.82_0.2_165_/_0.85)] active:-translate-y-1 active:scale-[1.03] sm:p-10 sm:shadow-[0_0_140px_-5px_oklch(0.82_0.2_165_/_0.98),0_0_80px_-15px_oklch(0.7_0.22_200_/_0.8),inset_0_0_70px_-10px_oklch(0.82_0.2_165_/_0.6)] animate-float-glow">
          {/* Always-on subtle sheen sweep */}
          <div className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-sheen" />

          {/* Stronger sheen on hover/touch */}
          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full group-active:translate-x-full" />

          {/* Glow orbs */}
          <div className="pointer-events-none absolute -left-[15%] -top-[15%] h-[70%] w-[70%] rounded-full bg-[color:var(--neon)]/60 blur-3xl transition-all duration-500 group-hover:bg-[color:var(--neon)]/90 group-hover:scale-125" />
          <div className="pointer-events-none absolute -bottom-[20%] -right-[10%] h-[80%] w-[80%] rounded-full bg-[color:var(--neon-2)]/40 blur-3xl transition-all duration-500 group-hover:bg-[color:var(--neon-2)]/75 group-hover:scale-125" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />

          <div className="relative flex flex-col items-center gap-4 text-center sm:gap-5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[color:var(--neon)] shadow-[0_0_12px_oklch(0.82_0.2_165)] animate-pulse" />
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-[color:var(--neon)] text-glow-neon sm:text-xs">
                #1 · FinlandSMP
              </p>
              <span className="h-2 w-2 rounded-full bg-[color:var(--neon)] shadow-[0_0_12px_oklch(0.82_0.2_165)] animate-pulse" />
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[160%] w-[160%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--neon)]/55 blur-3xl transition-all duration-500 group-hover:bg-[color:var(--neon)]/95 group-hover:scale-125 animate-neon-ring" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--neon-2)]/45 blur-2xl transition-all duration-500 group-hover:bg-[color:var(--neon-2)]/75" />
              <img
                src={skinUrl}
                alt={`${username} Minecraft skin`}
                className="relative h-44 w-auto object-contain [image-rendering:pixelated] drop-shadow-[0_0_30px_oklch(0.82_0.2_165)] transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_70px_oklch(0.82_0.2_165)] sm:h-96"
                loading="eager"
              />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-3xl font-black tracking-tight transition-all duration-500 group-hover:scale-105 sm:text-6xl">
                <span className="bg-gradient-to-br from-white via-white to-[color:var(--neon)] bg-clip-text text-transparent text-glow-neon">
                  {username}
                </span>
              </h2>
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--neon)]/60 bg-black/50 px-3 py-1 shadow-[0_0_24px_-4px_oklch(0.82_0.2_165_/_0.8)] backdrop-blur">
                <span className="text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.9)]">👑</span>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-white sm:text-sm">
                  FinlandSMP:n Omistaja
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
