import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/Hero";
import { Leaderboard } from "@/components/Leaderboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Minefin — Suomen Minecraft Leaderboardit" },
      {
        name: "description",
        content:
          "Live Top 10 Suomen Minecraft-serverit pelaajamäärän mukaan. Reaaliaikaiset tilastot, IP-osoitteet ja trendit.",
      },
      { property: "og:title", content: "Minefin — Suomen Minecraft Leaderboardit" },
      {
        property: "og:description",
        content: "Live Top 10 Suomen Minecraft-serverit pelaajamäärän mukaan.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen">
      <header className="absolute left-0 right-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <a href="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-[color:var(--neon)] font-mono text-sm font-black text-background">
              M
            </div>
            <span className="font-display text-lg font-bold tracking-tight">Minefin</span>
          </a>
          <a
            href="#leaderboard"
            className="rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-semibold text-foreground backdrop-blur transition-colors hover:border-[color:var(--neon)]/60 hover:text-[color:var(--neon)]"
          >
            Leaderboard
          </a>
        </div>
      </header>

      <Hero />
      <Leaderboard />

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Minefin · Suomen Minecraft-yhteisön leaderboardit
      </footer>
    </main>
  );
}
