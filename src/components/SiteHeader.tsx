import { Link } from "@tanstack/react-router";
import { LogOut, Shield, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function SiteHeader() {
  const { user, profile, isAdmin, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-[color:var(--neon)] font-mono text-sm font-black text-background">
            M
          </div>
          <span className="font-display text-lg font-bold tracking-tight">Minefin</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/"
            hash="leaderboard"
            className="hidden rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Leaderboard
          </Link>
          <Link
            to="/"
            hash="muut"
            className="hidden rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Muut servut
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10 px-3 py-1.5 text-xs font-semibold text-[color:var(--neon)] transition-colors hover:bg-[color:var(--neon)]/20"
            >
              <Shield className="h-3.5 w-3.5" /> Admin
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="hidden items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs transition-colors hover:border-[color:var(--neon)]/60 sm:flex"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-4 w-4 rounded-full object-cover" />
                ) : (
                  <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span className="font-semibold">{profile?.display_name ?? profile?.username ?? "Pelaaja"}</span>
              </Link>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Kirjaudu ulos</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-[color:var(--neon)] px-4 py-1.5 text-xs font-bold text-background shadow-[0_0_30px_-5px_oklch(0.82_0.2_165_/_0.7)] transition-transform hover:scale-105"
            >
              Kirjaudu
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
