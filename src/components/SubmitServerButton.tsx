import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, X, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  checkEligibility,
  createSubmission,
  type EligibilityResult,
} from "@/lib/submissions";

export function SubmitServerButton() {
  const { user } = useAuth();
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    ip: "",
    port: "25565",
    description: "",
    version: "",
    category: "",
    banner_url: "",
    logo_url: "",
  });
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) {
      setEligibility(null);
      return;
    }
    checkEligibility(user.id).then(setEligibility).catch(() => null);
  }, [user?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const eligible = !!eligibility?.eligible;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim() || !form.ip.trim()) {
      toast.error("Nimi ja IP ovat pakollisia");
      return;
    }
    setSubmitting(true);
    try {
      await createSubmission(user.id, {
        name: form.name,
        ip: form.ip,
        port: Number(form.port) || 25565,
        description: form.description,
        version: form.version,
        category: form.category,
        banner_url: form.banner_url,
        logo_url: form.logo_url,
      });
      toast.success("Serveri lähetetty arvioitavaksi!");
      setOpen(false);
      setForm({
        name: "",
        ip: "",
        port: "25565",
        description: "",
        version: "",
        category: "",
        banner_url: "",
        logo_url: "",
      });
    } catch (err: any) {
      toast.error(err?.message ?? "Lähetys epäonnistui");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative mx-auto w-full max-w-5xl px-4 py-6">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[color:var(--neon)]/10 via-black/40 to-black/60 p-5 backdrop-blur-xl">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[color:var(--neon)]">
              Yhteisön servereitä
            </p>
            <h3 className="mt-1 font-display text-xl font-bold">Lisää oma Minecraft-serverisi</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Avaa ehdotus kerää aktiivisuuspisteitä yhteisössä — admin hyväksyy serverin.
            </p>

            {!user && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
                <Lock className="h-3.5 w-3.5" /> Kirjaudu sisään aloittaaksesi
              </p>
            )}

            {user && eligibility && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Pill
                  ok={eligibility.hypes >= eligibility.hypesRequired}
                  label={`Hypeä ${eligibility.hypes}/${eligibility.hypesRequired}`}
                />
                <Pill
                  ok={eligibility.comments >= eligibility.commentsRequired}
                  label={`Kommentteja ${eligibility.comments}/${eligibility.commentsRequired}`}
                />
              </div>
            )}
          </div>

          {!user ? (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Kirjaudu
            </Link>
          ) : (
            <button
              onClick={() => eligible && setOpen(true)}
              disabled={!eligible}
              className={[
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition",
                eligible
                  ? "bg-[color:var(--neon)] text-background shadow-[0_0_30px_-5px_oklch(0.82_0.2_165_/_0.8)] hover:scale-[1.03]"
                  : "cursor-not-allowed border border-white/10 bg-white/5 text-white/40",
              ].join(" ")}
            >
              <Plus className="h-4 w-4" />
              Lisää serveri
            </button>
          )}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        >
          <div
            ref={dialogRef}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-white"
              aria-label="Sulje"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="mb-1 font-display text-xl font-bold">Lisää uusi serveri</h2>
            <p className="mb-5 text-xs text-muted-foreground">
              Tiedot menevät adminille arvioitavaksi. Saat ilmoituksen kun serveri on hyväksytty.
            </p>

            <form onSubmit={submit} className="space-y-3">
              <FormField label="Serverin nimi *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <FormField label="IP *" value={form.ip} onChange={(v) => setForm({ ...form, ip: v })} placeholder="play.example.fi" />
                </div>
                <FormField label="Portti" value={form.port} onChange={(v) => setForm({ ...form, port: v })} type="number" />
              </div>
              <FormField label="Versio" value={form.version} onChange={(v) => setForm({ ...form, version: v })} placeholder="1.21" />
              <FormField label="Kategoria" value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="SMP, Skyblock, PvP…" />
              <label className="block">
                <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">Kuvaus</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-[color:var(--neon)]/60"
                />
              </label>
              <FormField label="Banneri-URL" value={form.banner_url} onChange={(v) => setForm({ ...form, banner_url: v })} placeholder="https://…" />
              <FormField label="Logo/kuva-URL" value={form.logo_url} onChange={(v) => setForm({ ...form, logo_url: v })} placeholder="https://…" />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                >
                  Peruuta
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-[color:var(--neon)] px-4 py-2.5 text-sm font-bold text-background transition hover:scale-[1.02] disabled:opacity-50"
                >
                  {submitting ? "Lähetetään…" : "Lähetä ehdotus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function Pill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono",
        ok ? "bg-[color:var(--neon)]/15 text-[color:var(--neon)]" : "bg-white/5 text-white/60",
      ].join(" ")}
    >
      {ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
      {label}
    </span>
  );
}

function FormField({
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
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
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
