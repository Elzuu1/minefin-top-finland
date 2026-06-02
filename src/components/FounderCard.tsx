import skinUrl from "@/assets/elzuu-skin-nobg.png";

/**
 * Minimal player card — transparent character only, no background, no extra text.
 */
export function FounderCard({ username = "Elzuu1" }: { username?: string }) {
  return (
    <section className="relative mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      <div className="flex flex-col items-center gap-3">
        <img
          src={skinUrl}
          alt={`${username} Minecraft skin`}
          className="h-56 w-auto object-contain [image-rendering:pixelated] drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)] sm:h-72"
          loading="eager"
        />
        <h2 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
          <span className="bg-gradient-to-br from-white to-[color:var(--neon)] bg-clip-text text-transparent text-glow-neon">
            {username}
          </span>
        </h2>
      </div>
    </section>
  );
}
