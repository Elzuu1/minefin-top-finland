import { useEffect, useRef, useState } from "react";
import { Lock, Eye, EyeOff, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

const ADMIN_PASSWORD = "123.OOOKKEooooo2.!";

export function AdminLockButton() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    setPassword("");
    setShow(false);
    setError(false);
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("admin_access", "true");
      sessionStorage.removeItem("admin_access");
      close();
      navigate({ to: "/admin" });
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Admin login"
        className="group fixed bottom-4 right-4 z-50 grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-black/50 backdrop-blur-xl transition-all duration-300 hover:border-[color:var(--neon)]/60 hover:bg-black/70 hover:shadow-[0_0_30px_-2px_oklch(0.82_0.2_165_/_0.7)] hover:scale-105 sm:bottom-auto sm:right-auto sm:left-4 sm:top-4"
      >
        <Lock className="h-4 w-4 text-white/70 transition-colors duration-300 group-hover:text-[color:var(--neon)]" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={close}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-black/80 p-6 shadow-[0_0_60px_-10px_oklch(0.82_0.2_165_/_0.4)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={close}
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
                <p className="text-xs text-white/50">Syötä salasana jatkaaksesi</p>
              </div>
            </div>

            <div className={shake ? "animate-[shake_0.4s_ease-in-out]" : ""}>
              <div className="relative">
                <input
                  ref={inputRef}
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="Salasana"
                  className={[
                    "w-full rounded-xl border bg-white/5 px-4 py-3 pr-11 font-mono text-sm text-white placeholder:text-white/30 outline-none transition",
                    error
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-white/10 focus:border-[color:var(--neon)]/60 focus:bg-white/[0.07]",
                  ].join(" ")}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-xs font-medium text-red-400">Virheellinen salasana</p>
              )}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={close}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
              >
                Peruuta
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-[color:var(--neon)] px-4 py-2.5 text-sm font-bold text-background shadow-[0_0_30px_-5px_oklch(0.82_0.2_165_/_0.8)] transition hover:scale-[1.02] hover:shadow-[0_0_40px_-2px_oklch(0.82_0.2_165)]"
              >
                Kirjaudu
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
