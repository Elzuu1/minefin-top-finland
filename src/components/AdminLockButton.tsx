import { Lock } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function AdminLockButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate({ to: "/admin" })}
      aria-label="Admin login"
      className="group fixed bottom-4 right-4 z-50 grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-black/50 backdrop-blur-xl transition-all duration-300 hover:border-[color:var(--neon)]/60 hover:bg-black/70 hover:shadow-[0_0_30px_-2px_oklch(0.82_0.2_165_/_0.7)] hover:scale-105 sm:bottom-auto sm:right-auto sm:left-4 sm:top-4"
    >
      <Lock className="h-4 w-4 text-white/70 transition-colors duration-300 group-hover:text-[color:var(--neon)]" />
    </button>
  );
}
