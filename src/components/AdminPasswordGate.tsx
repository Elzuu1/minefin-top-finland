import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Lock, X } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable/index";

export function AdminPasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

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

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
          >
            Peruuta
          </button>
        </div>
      </div>
    </div>
  );
}
