import skinUrl from "@/assets/elzuu-skin-nobg.png";

/**
 * FinlandSMP founder spotlight — large, glowing player card.
 */
export function FounderCard({ username = "Elzuu1" }: { username?: string }) {
  return (
    <section className="relative mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
      <div className="relative overflow-hidden rounded-3xl border border-[color:var(--neon)]/30 bg-gradient-to-br from-black/80 via-black/60 to-[color:var(--neon)]/10 p-6 backdrop-blur-xl sm:p-10">
        {/* Glow orbs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[color:var(--neon)]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-[color:var(--neon)]/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_60%)]" />

        <div className="relative flex flex-col items-center gap-5 text-center">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-[color:var(--neon)] sm:text-xs">
            FinlandSMP
          </p>

          <div className="relative">
            {/* Pulsing glow behind character */}
            <div className="pointer-events-none absolute inset-0 -m-8 animate-pulse rounded-full bg-[color:var(--neon)]/30 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 -m-4 rounded-full bg-[color:var(--neon)]/20 blur-2xl" />
            <img
              src={skinUrl}
              alt={`${username} Minecraft skin`}
              className="relative h-72 w-auto object-contain [image-rendering:pixelated] drop-shadow-[0_18px_40px_rgba(0,0,0,0.7)] sm:h-96"
              loading="eager"
            />
          </div>

          <div className="space-y-1">
            <h2 className="font-display text-4xl font-black tracking-tight sm:text-6xl">
              <span className="bg-gradient-to-br from-white via-white to-[color:var(--neon)] bg-clip-text text-transparent text-glow-neon">
                {username}
              </span>
            </h2>
            <p className="font-mono text-sm font-semibold uppercase tracking-widest text-white/80 sm:text-base">
              FinlandSMP:n Omistaja <span className="text-yellow-400">👑</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
