import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Lock, X } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

export function AdminPasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/admin`,
    });
    if (result.error) {
      toast.error("Google-kirjautuminen epäonnistui");
      setGoogleLoading(false);
      return;
    }
    if (!result.redirected) onSuccess();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Tili luotu! Tarkista sähköposti.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Tervetuloa!");
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Kirjautuminen epäonnistui");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => navigate({ to: "/" })}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-black/80 p-6 shadow-[0_0_60px_-10px_oklch(0.82_0.2_165_/_0.4)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10">
            <Lock className="h-4 w-4 text-[color:var(--neon)]" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white">Admin login</h2>
            <p className="text-xs text-white/50">Kirjaudu admin-tilillä jatkaaksesi</p>
          </div>
        </div>

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={googleLoading}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15 disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          {googleLoading ? "Avataan…" : "Jatka Googlella"}
        </button>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[10px] font-mono uppercase text-white/40">tai</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3" method="post" action="#">
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Sähköposti"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[color:var(--neon)]/60"
          />
          <input
            type="password"
            name="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder="Salasana"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[color:var(--neon)]/60"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[color:var(--neon)] px-4 py-2.5 text-sm font-bold text-background shadow-[0_0_30px_-5px_oklch(0.82_0.2_165_/_0.7)] transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Hetki…" : mode === "signin" ? "Kirjaudu sisään" : "Luo tili"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-white/50">
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
    </div>
  );
}
