import elzuuSkinAsset from "@/assets/elzuu-skin.jpg.asset.json";

/**
 * Clean player card — just the skin and name, no extra clutter.
 */
export function FounderCard({ username = "Elzuu1" }: { username?: string }) {
  const skinUrl = elzuuSkinAsset.url;

  return (
    <section className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
      <div className="group relative grid gap-6 rounded-2xl p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8 sm:p-8">
        {/* Skin column */}
        <div className="relative z-10 mx-auto flex w-full justify-center sm:w-auto">
          <div className="relative">
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
            </div>
          </div>
        </div>

        {/* Text column */}
        <div className="relative z-10 text-center sm:text-left">
          <h2 className="font-display text-4xl font-black leading-none tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-br from-white via-white to-[color:var(--neon)] bg-clip-text text-transparent text-glow-neon">
              {username}
            </span>
          </h2>

          <p className="mt-3 max-w-md text-sm text-white/70 sm:text-base">
            FinlandSMP:n Perustaja{" "}
            <span className="font-mono font-bold text-[color:var(--neon)]">2026</span>
          </p>
        </div>
      </div>
    </section>
  );
}
