import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchActiveBanners, type Banner } from "@/lib/banners";

export function RollingBanner() {
  const [banners, setBanners] = useState<Banner[] | null>(null);

  const load = () => {
    fetchActiveBanners()
      .then(setBanners)
      .catch(() => setBanners([]));
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("banners-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "banners" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!banners || banners.length === 0) return null;

  // Use the first banner's speed as the rolling speed; concatenate all banner texts.
  const speed = banners[0]?.speed_seconds ?? 30;
  const items = banners;
  // Duplicate content for seamless loop
  const loop = [...items, ...items];

  return (
    <section className="relative mx-auto w-full max-w-5xl px-4 pt-4">
      <div className="group relative overflow-hidden rounded-xl border border-[color:var(--neon)]/30 bg-gradient-to-r from-black/60 via-[color:var(--neon)]/5 to-black/60 py-2 backdrop-blur-xl">
        <div className="absolute left-0 top-0 z-10 flex h-full items-center gap-1.5 bg-gradient-to-r from-black via-black/80 to-transparent px-3 pr-6">
          <Megaphone className="h-3.5 w-3.5 text-[color:var(--neon)]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[color:var(--neon)]">
            Live
          </span>
        </div>

        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-black via-black/80 to-transparent" />

        <div
          className="flex w-max items-center gap-12 whitespace-nowrap"
          style={{
            animation: `banner-marquee ${speed}s linear infinite`,
          }}
        >
          {loop.map((b, i) => {
            const inner = (
              <span className="inline-flex items-center gap-3 font-mono text-sm font-semibold tracking-wide text-white/90">
                <span className="h-1 w-1 rounded-full bg-[color:var(--neon)]" />
                {b.text}
                <span className="text-[color:var(--neon)]/60">★</span>
              </span>
            );
            return (
              <span key={`${b.id}-${i}`} className="px-6">
                {b.link_url ? (
                  <a
                    href={b.link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-[color:var(--neon)]"
                  >
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </span>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes banner-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
