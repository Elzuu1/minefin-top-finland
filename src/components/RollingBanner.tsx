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

  const speed = banners[0]?.speed_seconds ?? 30;
  const loop = [...banners, ...banners];

  return (
    <section className="relative mx-auto w-full max-w-5xl px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="group relative overflow-hidden rounded-lg border border-[color:var(--neon)]/30 bg-gradient-to-r from-black/70 via-[color:var(--neon)]/5 to-black/70 py-1.5 backdrop-blur-xl sm:rounded-xl sm:py-2">
        <div className="absolute left-0 top-0 z-10 flex h-full items-center gap-1 bg-gradient-to-r from-black via-black/85 to-transparent pl-2 pr-4 sm:gap-1.5 sm:pl-3 sm:pr-6">
          <Megaphone className="h-3 w-3 text-[color:var(--neon)] sm:h-3.5 sm:w-3.5" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[color:var(--neon)] sm:text-[10px]">
            Live
          </span>
        </div>

        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-black via-black/80 to-transparent sm:w-12" />

        <div
          className="flex w-max items-center whitespace-nowrap pl-16 will-change-transform sm:pl-20"
          style={{ animation: `banner-marquee ${speed}s linear infinite` }}
        >
          {loop.map((b, i) => {
            const inner = (
              <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-wide text-white/90 sm:gap-3 sm:text-sm">
                <span className="h-1 w-1 rounded-full bg-[color:var(--neon)]" />
                {b.text}
                <span className="text-[color:var(--neon)]/60">★</span>
              </span>
            );
            return (
              <span key={`${b.id}-${i}`} className="px-4 sm:px-6">
                {b.link_url ? (
                  <a href={b.link_url} target="_blank" rel="noreferrer" className="transition hover:text-[color:var(--neon)]">
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
