import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Inbox, LogOut, Plus, RefreshCw, Shield, Star, Trash2, Users, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { refreshAllServers } from "@/lib/ping.functions";
import type { DBServer } from "@/lib/servers";
import {
  approveSubmission,
  deleteSubmission,
  fetchSubmissions,
  rejectSubmission,
  type ServerSubmission,
} from "@/lib/submissions";
import { AdminPasswordGate } from "@/components/AdminPasswordGate";
import { BannersAdmin } from "@/components/BannersAdmin";
import { WebsitesAdmin } from "@/components/WebsitesAdmin";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — Minefin" }] }),
});

type Draft = {
  name: string;
  slug: string;
  ip: string;
  port: number;
  description: string;
  category: string;
  banner_url: string;
  is_featured: boolean;
};

const emptyDraft: Draft = {
  name: "",
  slug: "",
  ip: "",
  port: 25565,
  description: "",
  category: "",
  banner_url: "",
  is_featured: false,
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function AdminPage() {
  const navigate = useNavigate();
  const refresh = useServerFn(refreshAllServers);
  const [authed, setAuthed] = useState(false);
  const [servers, setServers] = useState<DBServer[] | null>(null);
  const [submissions, setSubmissions] = useState<ServerSubmission[] | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [adding, setAdding] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("admin_access") === "true") setAuthed(true);
  }, []);

  const load = async () => {
    const { data } = await supabase.from("servers").select("*").order("sort_order");
    setServers((data ?? []) as DBServer[]);
  };

  const loadSubmissions = async () => {
    try {
      const data = await fetchSubmissions();
      setSubmissions(data);
    } catch (err: any) {
      toast.error(err?.message ?? "Ehdotusten lataus epäonnistui");
    }
  };

  useEffect(() => {
    if (authed) {
      load();
      loadSubmissions();
    }
  }, [authed]);

  if (!authed) return <AdminPasswordGate onSuccess={() => setAuthed(true)} />;

  const logout = () => {
    sessionStorage.removeItem("admin_access");
    navigate({ to: "/" });
  };

  const updateField = async (id: string, field: keyof DBServer, value: any) => {
    const { error } = await supabase
      .from("servers")
      .update({ [field]: value } as any)
      .eq("id", id);
    if (error) return toast.error(error.message);
    setServers((prev) => prev?.map((s) => (s.id === id ? { ...s, [field]: value } : s)) ?? prev);
  };

  const addServer = async () => {
    if (!draft.name.trim() || !draft.ip.trim()) {
      toast.error("Name and IP are required");
      return;
    }
    setAdding(true);
    const slug = draft.slug.trim() || slugify(draft.name);
    const sort_order = (servers?.length ?? 0) + 1;
    const { error } = await supabase.from("servers").insert({
      name: draft.name.trim(),
      slug,
      ip: draft.ip.trim(),
      port: draft.port || 25565,
      description: draft.description.trim() || null,
      category: draft.category.trim() || null,
      banner_url: draft.banner_url.trim() || null,
      is_featured: draft.is_featured,
      icon_letter: draft.name.trim().charAt(0).toUpperCase() || "M",
      sort_order,
    });
    setAdding(false);
    if (error) return toast.error(error.message);
    toast.success("Server added");
    setDraft(emptyDraft);
    await load();
  };

  const deleteServer = async (id: string, name: string) => {
    if (!confirm(`Delete server "${name}"?`)) return;
    const { error } = await supabase.from("servers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    await load();
  };

  const pingNow = async () => {
    setPinging(true);
    try {
      const res = await refresh();
      toast.success(`Pinged ${res.count} servers`);
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Ping failed");
    } finally {
      setPinging(false);
    }
  };

  const onApprove = async (sub: ServerSubmission) => {
    setProcessingId(sub.id);
    try {
      await approveSubmission(sub);
      toast.success(`Hyväksytty: ${sub.name}`);
      await Promise.all([load(), loadSubmissions()]);
    } catch (err: any) {
      toast.error(err?.message ?? "Hyväksyntä epäonnistui");
    } finally {
      setProcessingId(null);
    }
  };

  const onReject = async (sub: ServerSubmission) => {
    const note = prompt(`Hylkää "${sub.name}"? Anna halutessasi syy:`, "") ?? undefined;
    setProcessingId(sub.id);
    try {
      await rejectSubmission(sub.id, note || undefined);
      toast.success("Hylätty");
      await loadSubmissions();
    } catch (err: any) {
      toast.error(err?.message ?? "Hylkäys epäonnistui");
    } finally {
      setProcessingId(null);
    }
  };

  const onDeleteSubmission = async (id: string) => {
    if (!confirm("Poistetaanko ehdotus pysyvästi?")) return;
    try {
      await deleteSubmission(id);
      await loadSubmissions();
    } catch (err: any) {
      toast.error(err?.message ?? "Poisto epäonnistui");
    }
  };

  const totalPlayers = servers?.reduce((sum, s) => sum + (s.online ? s.players : 0), 0) ?? 0;
  const onlineCount = servers?.filter((s) => s.online).length ?? 0;
  const featuredCount = servers?.filter((s) => s.is_featured).length ?? 0;
  const pendingCount = submissions?.filter((s) => s.status === "pending").length ?? 0;

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
          <div className="flex items-center gap-2">
            <button
              onClick={pingNow}
              disabled={pinging}
              className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10 px-4 py-2 text-sm font-semibold text-[color:var(--neon)] transition hover:bg-[color:var(--neon)]/20 disabled:opacity-50"
            >
              <RefreshCw className={["h-4 w-4", pinging ? "animate-spin" : ""].join(" ")} />
              {pinging ? "Pingataan…" : "Ping now"}
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={<Users className="h-4 w-4" />} label="Pelaajia online" value={totalPlayers} />
          <StatCard
            icon={<Shield className="h-4 w-4" />}
            label="Serverit online"
            value={`${onlineCount} / ${servers?.length ?? 0}`}
          />
          <StatCard icon={<Star className="h-4 w-4" />} label="Featured" value={featuredCount} />
          <StatCard icon={<Inbox className="h-4 w-4" />} label="Odottavat ehdotukset" value={pendingCount} />
        </div>

        {/* Pending submissions */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Inbox className="h-4 w-4 text-[color:var(--neon)]" />
              Käyttäjien serveriehdotukset
              {pendingCount > 0 && (
                <span className="rounded-full bg-[color:var(--neon)]/15 px-2 py-0.5 text-xs font-bold text-[color:var(--neon)]">
                  {pendingCount} uutta
                </span>
              )}
            </h2>
          </div>
          {submissions === null ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">Ladataan…</div>
          ) : submissions.length === 0 ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">Ei ehdotuksia vielä.</div>
          ) : (
            <ul className="divide-y divide-white/5">
              {submissions.map((s) => (
                <li key={s.id} className="px-5 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold">{s.name}</p>
                        <SubmissionStatusBadge status={s.status} />
                        {s.category && (
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
                            {s.category}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {s.ip}:{s.port} {s.version ? `· v${s.version}` : ""}
                      </p>
                      {s.description && (
                        <p className="mt-2 text-sm text-white/80">{s.description}</p>
                      )}
                      {(s.banner_url || s.logo_url) && (
                        <div className="mt-2 flex gap-2 text-xs">
                          {s.banner_url && (
                            <a href={s.banner_url} target="_blank" rel="noreferrer" className="text-[color:var(--neon)] underline">
                              Banneri
                            </a>
                          )}
                          {s.logo_url && (
                            <a href={s.logo_url} target="_blank" rel="noreferrer" className="text-[color:var(--neon)] underline">
                              Logo
                            </a>
                          )}
                        </div>
                      )}
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Lähetetty: {new Date(s.created_at).toLocaleString("fi-FI")}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {s.status === "pending" && (
                        <>
                          <button
                            onClick={() => onApprove(s)}
                            disabled={processingId === s.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/15 px-3 py-1.5 text-xs font-bold text-[color:var(--neon)] transition hover:bg-[color:var(--neon)]/25 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Hyväksy
                          </button>
                          <button
                            onClick={() => onReject(s)}
                            disabled={processingId === s.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Hylkää
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onDeleteSubmission(s.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs font-semibold text-white/60 transition hover:text-white"
                        title="Poista ehdotus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add server */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
            <Plus className="h-4 w-4 text-[color:var(--neon)]" /> Lisää uusi serveri
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nimi" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v, slug: draft.slug || slugify(v) })} />
            <Field label="Slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} placeholder="auto-generated" />
            <Field label="IP" value={draft.ip} onChange={(v) => setDraft({ ...draft, ip: v })} placeholder="play.example.fi" />
            <Field label="Port" type="number" value={String(draft.port)} onChange={(v) => setDraft({ ...draft, port: Number(v) || 25565 })} />
            <Field label="Kategoria" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} placeholder="SMP, Skyblock…" />
            <Field label="Banner URL" value={draft.banner_url} onChange={(v) => setDraft({ ...draft, banner_url: v })} />
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Kuvaus" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} />
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.is_featured}
                onChange={(e) => setDraft({ ...draft, is_featured: e.target.checked })}
                className="h-4 w-4 rounded border-white/20 bg-black/40 accent-[color:var(--neon)]"
              />
              Featured
            </label>
          </div>
          <button
            onClick={addServer}
            disabled={adding}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[color:var(--neon)] px-4 py-2 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50"
          >
            <Zap className="h-4 w-4" />
            {adding ? "Lisätään…" : "Lisää serveri"}
          </button>
        </div>

        {/* Servers table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="font-display text-lg font-semibold">Serverit</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Servu</th>
                  <th className="px-4 py-3 text-left">IP : Port</th>
                  <th className="px-4 py-3 text-left">Pelaajat</th>
                  <th className="px-4 py-3 text-left">Live</th>
                  <th className="px-4 py-3 text-left">Aktiivinen</th>
                  <th className="px-4 py-3 text-left">Featured</th>
                  <th className="px-4 py-3 text-right">·</th>
                </tr>
              </thead>
              <tbody>
                {servers?.map((s) => (
                  <tr key={s.id} className="border-t border-white/5 transition hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-muted-foreground">{s.sort_order}</td>
                    <td className="px-4 py-3">
                      <input
                        defaultValue={s.name}
                        onBlur={(e) => updateField(s.id, "name", e.target.value)}
                        className="w-40 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm outline-none focus:border-[color:var(--neon)]/60"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <input
                          defaultValue={s.ip}
                          onBlur={(e) => updateField(s.id, "ip", e.target.value)}
                          className="w-40 rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs outline-none focus:border-[color:var(--neon)]/60"
                        />
                        <input
                          type="number"
                          defaultValue={s.port}
                          onBlur={(e) => updateField(s.id, "port", Number(e.target.value) || 25565)}
                          className="w-20 rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs outline-none focus:border-[color:var(--neon)]/60"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {s.players}/{s.max_players}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-bold",
                          s.online
                            ? "bg-[color:var(--neon)]/15 text-[color:var(--neon)]"
                            : "bg-red-500/15 text-red-400",
                        ].join(" ")}
                      >
                        <span className={["h-1.5 w-1.5 rounded-full", s.online ? "bg-[color:var(--neon)] animate-pulse" : "bg-red-400"].join(" ")} />
                        {s.online ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => updateField(s.id, "is_active", !s.is_active)}
                        className={[
                          "rounded-full px-3 py-1 text-xs font-bold transition",
                          s.is_active
                            ? "bg-white/10 text-white hover:bg-white/15"
                            : "bg-white/5 text-white/40 hover:bg-white/10",
                        ].join(" ")}
                      >
                        {s.is_active ? "Aktiivinen" : "Pois käytöstä"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteServer(s.id, s.name)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <BannersAdmin />
          <WebsitesAdmin />
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

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-[color:var(--neon)]/60"
      />
    </label>
  );
}

function SubmissionStatusBadge({ status }: { status: ServerSubmission["status"] }) {
  const map = {
    pending: { label: "Odottaa", cls: "bg-amber-500/15 text-amber-300" },
    approved: { label: "Hyväksytty", cls: "bg-[color:var(--neon)]/15 text-[color:var(--neon)]" },
    rejected: { label: "Hylätty", cls: "bg-red-500/15 text-red-300" },
  } as const;
  const { label, cls } = map[status];
  return (
    <span className={["rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", cls].join(" ")}>
      {label}
    </span>
  );
}
