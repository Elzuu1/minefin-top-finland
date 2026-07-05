import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { GlobalPlayersChart } from "@/components/GlobalPlayersChart";
import { SiteHeader } from "@/components/SiteHeader";
import { TotalPlayers } from "@/components/TotalPlayers";

export const Route = createFileRoute("/tilastot")({
  head: () => ({
    meta: [
      { title: "Ammattitilastot — Minefin" },
      {
        name: "description",
        content:
          "Suomen Minecraft-servereiden syvät analytiikat: pelaajamäärät, huiput, prime time, top movers ja trendit.",
      },
      { property: "og:title", content: "Ammattitilastot — Minefin" },
      {
        property: "og:description",
        content: "Live-tilastot Suomen Minecraft-verkostosta — analytiikka, huiput ja trendit.",
      },
    ],
  }),
  component: TilastotPage,
});

function TilastotPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Takaisin etusivulle
        </Link>
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[color:var(--neon)]">
            Minefin Analytics
          </p>
          <h1 className="mt-1 text-3xl font-black sm:text-4xl">
            Ammatti­tilastot &{" "}
            <span className="bg-gradient-to-r from-[color:var(--neon)] via-[color:var(--neon-2)] to-[color:var(--gold)] bg-clip-text text-transparent">
              analytiikka
            </span>
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Kaikki verkoston tilastot yhdessä paikassa — pelaajamäärät, huiput, prime time ja
            liikkujat.
          </p>
        </div>
      </div>

      <TotalPlayers />
      <GlobalPlayersChart />

      <footer className="mt-16 border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Minefin
      </footer>
    </main>
  );
}
