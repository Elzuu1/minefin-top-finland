import { createFileRoute } from "@tanstack/react-router";
import { AdminLockButton } from "@/components/AdminLockButton";
import { FounderCard } from "@/components/FounderCard";
import { GlobalStatsMini } from "@/components/GlobalStatsMini";
import { Hero } from "@/components/Hero";
import { Leaderboard } from "@/components/Leaderboard";
import { MuutServut } from "@/components/MuutServut";
import { RollingBanner } from "@/components/RollingBanner";
import { SiteHeader } from "@/components/SiteHeader";
import { SubmitServerButton } from "@/components/SubmitServerButton";
import { TotalPlayers } from "@/components/TotalPlayers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Minefin — Suomen Minecraft Leaderboardit" },
      {
        name: "description",
        content:
          "Live Top 10 Suomen Minecraft-serverit pelaajamäärän mukaan. Hype, kommentit ja yhteisön serveriprofiilit.",
      },
      { property: "og:title", content: "Minefin — Suomen Minecraft Leaderboardit" },
      { property: "og:description", content: "Live Top 10 Suomen Minecraft-serverit, hype ja kommentit." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen">
      <AdminLockButton />
      <SiteHeader />
      <Hero />
      <TotalPlayers />
      <GlobalStatsMini />
      <FounderCard />
      <RollingBanner />
      <Leaderboard />
      <SubmitServerButton />
      <MuutServut />
      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Minefin · Suomen Minecraft-yhteisön leaderboardit
      </footer>
    </main>
  );
}
