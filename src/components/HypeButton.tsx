import { Flame } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { toggleHype } from "@/lib/servers";

export function HypeButton({
  serverId,
  hypeCount,
  hyped,
  size = "sm",
  onChange,
}: {
  serverId: string;
  hypeCount: number;
  hyped: boolean;
  size?: "sm" | "lg";
  onChange?: (next: { hyped: boolean; count: number }) => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [optimistic, setOptimistic] = useState({ hyped, count: hypeCount });
  const [loading, setLoading] = useState(false);
  const [burst, setBurst] = useState(0);

  // sync if parent changes
  if (optimistic.count !== hypeCount && !loading && optimistic.hyped === hyped) {
    setOptimistic({ hyped, count: hypeCount });
  }

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast("Kirjaudu sisään hypetäksesi", { description: "Tarvitset tilin hypetykseen." });
      navigate({ to: "/login" });
      return;
    }
    if (loading) return;
    const next = { hyped: !optimistic.hyped, count: optimistic.count + (optimistic.hyped ? -1 : 1) };
    setOptimistic(next);
    if (next.hyped) setBurst((b) => b + 1);
    setLoading(true);
    try {
      await toggleHype(serverId, user.id, optimistic.hyped);
      onChange?.(next);
    } catch (err: any) {
      setOptimistic({ hyped, count: hypeCount });
      toast.error("Hype ei onnistunut", { description: err?.message });
    } finally {
      setLoading(false);
    }
  };

  const big = size === "lg";

  return (
    <button
      onClick={onClick}
      className={[
        "group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-full border font-mono font-bold tabular-nums transition-all duration-200",
        big ? "px-5 py-3 text-base" : "px-3 py-1.5 text-xs",
        optimistic.hyped
          ? "border-[color:var(--neon)] bg-[color:var(--neon)]/15 text-[color:var(--neon)] shadow-[0_0_24px_-4px_oklch(0.82_0.2_165_/_0.7)]"
          : "border-border bg-card/60 text-muted-foreground hover:border-[color:var(--neon)]/60 hover:text-foreground",
      ].join(" ")}
    >
      <Flame
        className={[
          big ? "h-5 w-5" : "h-3.5 w-3.5",
          "transition-transform duration-300",
          optimistic.hyped ? "scale-110" : "group-hover:scale-110",
        ].join(" ")}
      />
      <span>{optimistic.count.toLocaleString()}</span>
      <span className="text-[10px] font-normal opacity-70">{big ? "HYPE" : ""}</span>

      {burst > 0 && (
        <span
          key={burst}
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ animation: "hype-burst 600ms ease-out forwards" }}
        >
          <span className="absolute inset-0 rounded-full bg-[color:var(--neon)]/40 blur-md" />
        </span>
      )}

      <style>{`
        @keyframes hype-burst {
          0% { transform: scale(0.8); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </button>
  );
}
