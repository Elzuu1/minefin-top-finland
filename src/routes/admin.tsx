import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Shield, Star, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { DBServer } from "@/lib/servers";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — Minefin" }] }),
});

function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [servers, setServers] = useState<DBServer[] | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("admin_access") !== "true") {
      navigate({ to: "/" });
      return;
    }
    setAuthed(true);
  }, [navigate]);

  useEffect(() => {
    if (!authed) return;
    supabase
      .from("servers")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setServers((data ?? []) as DBServer[]));
  }, [authed]);

  if (!authed) return null;

  const logout = () => {
    sessionStorage.removeItem("admin_access");
    navigate({ to: "/" });
  };

  const updateField = async (id: string, field: keyof DBServer, value: any) => {
    const { error } = await supabase.from("servers").update({ [field]: value } as any).eq("id", id);
    if (error) return toast.error(error.message);
    setServers((prev) => prev?.map((s) => (s.id === id ? { ...s, [field]: value } : s)) ?? prev);
  };

  const totalPlayers = servers?.reduce((sum, s) => sum + (s.online ? s.players : 0), 0) ?? 0;
  const onlineCount = servers?.filter((s) => s.online).length ?? 0;
  const featuredCount = servers?.filter((s) => s.is_featured).length ?? 0;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10">
              <Shield className="h-5 w-5 text-[color:var(--neon)]" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Hallinnoi Minefin-servereitä</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={<Users className="h-4 w-4" />} label="Pelaajia online" value={totalPlayers} />
          <StatCard icon={<Shield className="h-4 w-4" />} label="Serverit online" value={`${onlineCount} / ${servers?.length ?? 0}`} />
          <StatCard icon={<Star className="h-4 w-4" />} label="Featured" value={featuredCount} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="font-display text-lg font-semibold">Serverit</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Servu</th>
                  <th className="px-5 py-3 text-left">Pelaajia</th>
                  <th className="px-5 py-3 text-left">Tila</th>
                  <th className="px-5 py-3 text-left">Featured</th>
                </tr>
              </thead>
              <tbody>
                {servers?.map((s) => (
                  <tr key={s.id} className="border-t border-white/5 transition hover:bg-white/[0.02]">
                    <td className="px-5 py-3 font-mono text-muted-foreground">{s.sort_order}</td>
                    <td className="px-5 py-3">
                      <div className="font-semibold">{s.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{s.ip}</div>
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        defaultValue={s.players}
                        onBlur={(e) => updateField(s.id, "players", Number(e.target.value) || 0)}
                        className="w-24 rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-mono text-sm outline-none focus:border-[color:var(--neon)]/60"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => updateField(s.id, "online", !s.online)}
                        className={[
                          "rounded-full px-3 py-1 text-xs font-bold transition",
                          s.online
                            ? "bg-[color:var(--neon)]/15 text-[color:var(--neon)] hover:bg-[color:var(--neon)]/25"
                            : "bg-red-500/15 text-red-400 hover:bg-red-500/25",
                        ].join(" ")}
                      >
                        {s.online ? "Online" : "Offline"}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => updateField(s.id, "is_featured", !s.is_featured)}
                        className={[
                          "rounded-full px-3 py-1 text-xs font-bold transition",
                          s.is_featured
                            ? "bg-[color:var(--neon)]/15 text-[color:var(--neon)] hover:bg-[color:var(--neon)]/25"
                            : "bg-white/5 text-white/50 hover:bg-white/10",
                        ].join(" ")}
                      >
                        {s.is_featured ? "★ Featured" : "—"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl transition hover:border-[color:var(--neon)]/30 hover:shadow-[0_0_30px_-10px_oklch(0.82_0.2_165_/_0.6)]">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <span className="text-[color:var(--neon)]">{icon}</span>
        {label}
      </div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}
