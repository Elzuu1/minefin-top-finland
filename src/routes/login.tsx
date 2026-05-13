import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Kirjaudu — Minefin" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { username, display_name: username },
          },
        });
        if (error) throw error;
        toast.success("Tili luotu!");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Tervetuloa takaisin!");
        navigate({ to: "/" });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Virhe");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google-kirjautuminen epäonnistui");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />

      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card/80 p-8 backdrop-blur-xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-[color:var(--neon)] font-mono text-sm font-black text-background">
            M
          </div>
          <span className="font-display text-lg font-bold">Minefin</span>
        </Link>

        <h1 className="text-2xl font-bold">
          {mode === "signin" ? "Tervetuloa takaisin" : "Liity Minefiniin"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Kirjaudu sisään hypetäksesi ja kommentoidaksesi."
            : "Luo tili osallistuaksesi yhteisöön."}
        </p>

        <button
          onClick={onGoogle}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2.5 text-sm font-semibold transition-colors hover:border-foreground/40 disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          Jatka Googlella
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-mono uppercase text-muted-foreground">tai</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Käyttäjänimi</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={2}
                maxLength={32}
                className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[color:var(--neon)]"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Sähköposti</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[color:var(--neon)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Salasana</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[color:var(--neon)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-[color:var(--neon)] px-4 py-2.5 text-sm font-bold text-background shadow-[0_0_30px_-5px_oklch(0.82_0.2_165_/_0.7)] transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Hetki…" : mode === "signin" ? "Kirjaudu sisään" : "Luo tili"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          {mode === "signin" ? "Ei tiliä? " : "Onko tili jo? "}
          <button
            type="button"
            onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
            className="font-bold text-[color:var(--neon)] hover:underline"
          >
            {mode === "signin" ? "Rekisteröidy" : "Kirjaudu"}
          </button>
        </p>
      </div>
    </main>
  );
}
