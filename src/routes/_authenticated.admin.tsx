import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import type { DBServer } from "@/lib/servers";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — Minefin" }] }),
});

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const [servers, setServers] = useState<DBServer[] | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("servers")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setServers((data ?? []) as DBServer[]));
  }, [isAdmin]);

  if (loading) return null;

  if (!isAdmin) {
    return (
      <main className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-md px-4 py-32 text-center">
          <Shield className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Pääsy estetty</h1>
          <p className="mt-2 text-sm text-muted-foreground">Tämä sivu on vain admineille.</p>
          <Link to="/" className="mt-4 inline-block text-sm text-[color:var(--neon)] hover:underline">
            ← Takaisin etusivulle
          </Link>
        </div>
      </main>
    );
  }

  const updateField = async (id: string, field: keyof DBServer, value: any) => {
    const patch = { [field]: value } as any;
    const { error } = await supabase.from("servers").update(patch).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setServers((prev) => prev?.map((s) => (s.id === id ? { ...s, [field]: value } : s)) ?? prev);
  };

  const toggleOnline = (s: DBServer) => updateField(s.id, "online", !s.online);
  const toggleFeatured = (s: DBServer) => updateField(s.id, "is_featured", !s.is_featured);

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-6 w-6 text-[color:var(--neon)]" />
          <div>
            <h1 className="text-2xl font-bold">Admin paneeli</h1>
            <p className="text-sm text-muted-foreground">Hallinnoi serverilistausta.</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
          <table className="w-full text-sm">
            <thead className="bg-background/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Servu</th>
                <th className="px-4 py-3 text-left">Pelaajia</th>
                <th className="px-4 py-3 text-left">Tila</th>
                <th className="px-4 py-3 text-left">Featured</th>
              </tr>
            </thead>
            <tbody>
              {servers?.map((s) => (
                <tr key={s.id} className="border-t border-border/60">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{s.sort_order}</td>
                  <td className="px-4 py-3">
                    <Link to="/server/$slug" params={{ slug: s.slug }} className="font-semibold hover:text-[color:var(--neon)]">
                      {s.name}
                    </Link>
                    <div className="font-mono text-xs text-muted-foreground">{s.ip}</div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      defaultValue={s.players}
                      onBlur={(e) => updateField(s.id, "players", Number(e.target.value) || 0)}
                      className="w-24 rounded border border-border bg-background/60 px-2 py-1 font-mono text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleOnline(s)}
                      className={[
                        "rounded-full px-3 py-1 text-xs font-bold",
                        s.online
                          ? "bg-[color:var(--success)]/20 text-[color:var(--success)]"
                          : "bg-[color:var(--danger)]/20 text-[color:var(--danger)]",
                      ].join(" ")}
                    >
                      {s.online ? "Online" : "Offline"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleFeatured(s)}
                      className={[
                        "rounded-full px-3 py-1 text-xs font-bold",
                        s.is_featured
                          ? "bg-[color:var(--neon)]/20 text-[color:var(--neon)]"
                          : "bg-muted text-muted-foreground",
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

        <p className="mt-6 text-xs text-muted-foreground">
          Tee itsestäsi admin lisäämällä rivi <code className="font-mono">user_roles</code>-tauluun rooliksi <code className="font-mono">admin</code>.
        </p>
      </div>
    </main>
  );
}
