import { Crown, Sparkles } from "lucide-react";
import elzuuSkinAsset from "@/assets/elzuu-skin.jpg.asset.json";

/**
 * Premium Elzuu1 founder/spotlight card. Cinematic, animated, mobile-clean.
 */
export function FounderCard({ username = "Elzuu1" }: { username?: string }) {
  const skinUrl = elzuuSkinAsset.url;

  return (
    <section className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
      <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl transition-all duration-500 hover:border-[color:var(--neon)]/50 sm:p-8 [perspective:1200px]">
        {/* Animated gradient border */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-60 transition-opacity duration-500 group-hover:opacity-100">
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, oklch(0.82 0.2 165 / 0.6) 25%, transparent 50%, oklch(0.7 0.22 280 / 0.5) 75%, transparent 100%)",
              animation: "founder-rotate 8s linear infinite",
              filter: "blur(20px)",
              opacity: 0.5,
            }}
          />
        </div>

        {/* Inner card */}
        <div className="relative grid gap-6 rounded-2xl bg-gradient-to-br from-black/80 via-black/60 to-black/80 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8 sm:p-8">
          {/* Background particles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            {[...Array(14)].map((_, i) => (
              <span
                key={i}
                className="absolute h-1 w-1 rounded-full bg-[color:var(--neon)]/60"
                style={{
                  left: `${(i * 7.3) % 100}%`,
                  top: `${(i * 13.7) % 100}%`,
                  animation: `founder-float ${4 + (i % 5)}s ease-in-out ${i * 0.4}s infinite`,
                }}
              />
            ))}
          </div>

          {/* Background grid */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl grid-bg opacity-30" />

          {/* Soft lighting blobs */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[color:var(--neon)]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 -bottom-20 h-56 w-56 rounded-full bg-[oklch(0.7_0.22_280)]/20 blur-3xl" />

          {/* Skin column */}
          <div className="relative z-10 mx-auto flex w-full justify-center sm:w-auto">
            <div className="relative">
              {/* Pedestal glow */}
              <div className="pointer-events-none absolute -bottom-4 left-1/2 h-6 w-32 -translate-x-1/2 rounded-full bg-[color:var(--neon)]/40 blur-xl" />

              <div
                className="relative grid place-items-center rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-3 transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(-8deg)_rotateX(4deg)]"
                style={{ width: 180, height: 220 }}
              >
                <img
                  src={skinUrl}
                  alt={`${username} Minecraft skin`}
                  className="h-full w-auto object-contain [image-rendering:pixelated] drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
                  loading="eager"
                />

                {/* Animated shine sweep */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
                >
                  <span
                    className="absolute -inset-y-2 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-20deg]"
                    style={{ animation: "founder-shine 4s ease-in-out infinite" }}
                  />
                </span>

                {/* Online indicator */}
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-[color:var(--success)]/40 bg-black/60 px-2 py-0.5 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--success)] animate-pulse-dot" />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[color:var(--success)]">
                    Online
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Text column */}
          <div className="relative z-10 text-center sm:text-left">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10 px-3 py-1 backdrop-blur">
              <Crown className="h-3 w-3 text-[color:var(--neon)]" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[color:var(--neon)]">
                Founder Spotlight
              </span>
            </div>

            <h2 className="font-display text-4xl font-black leading-none tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-br from-white via-white to-[color:var(--neon)] bg-clip-text text-transparent text-glow-neon">
                {username}
              </span>
            </h2>

            <p className="mt-3 max-w-md text-sm text-white/70 sm:text-base">
              FinlandSMP:n Perustaja{" "}
              <span className="font-mono font-bold text-[color:var(--neon)]">2026</span>
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--neon)]/40 bg-gradient-to-r from-[color:var(--neon)]/15 to-transparent px-3 py-1.5 text-xs font-bold text-[color:var(--neon)] shadow-[0_0_20px_-4px_oklch(0.82_0.2_165_/_0.7)]">
                <Sparkles className="h-3 w-3" />
                FinlandSMP
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--gold)]" />
                Pro Player
              </span>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes founder-rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes founder-shine {
            0% { transform: translateX(0) skewX(-20deg); }
            60%, 100% { transform: translateX(600%) skewX(-20deg); }
          }
          @keyframes founder-float {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
            50% { transform: translateY(-14px) translateX(6px); opacity: 0.9; }
          }
        `}</style>
      </div>
    </section>
  );
}
