import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User, Save, ArrowLeft, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { updateProfile } from "@/lib/profile";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profiili — Minefin" }] }),
});

function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setUsername(profile.username ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
    }
  }, [profile]);

  if (!user) return null;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(user.id, {
        display_name: displayName.trim() || null,
        username: username.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      });
      toast.success("Profiili päivitetty");
    } catch (err: any) {
      toast.error(err?.message ?? "Tallennus epäonnistui");
    } finally {
      setSaving(false);
    }
  };

  const previewName = displayName || username || "Pelaaja";
  const previewLetter = previewName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Etusivulle
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10">
            <User className="h-5 w-5 text-[color:var(--neon)]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Profiili</h1>
            <p className="text-sm text-muted-foreground">Muokkaa nimeäsi ja profiilikuvaasi</p>
          </div>
        </div>

        {/* Preview */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-card/60 p-5 backdrop-blur">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar preview"
              className="h-16 w-16 rounded-full border border-white/10 object-cover"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />
          ) : (
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[color:var(--neon)] to-[color:var(--neon-2)] font-mono text-2xl font-black text-background">
              {previewLetter}
            </div>
          )}
          <div>
            <p className="font-bold">{previewName}</p>
            <p className="font-mono text-xs text-muted-foreground">@{username || "käyttäjänimi"}</p>
          </div>
        </div>

        <form onSubmit={onSave} className="space-y-4 rounded-2xl border border-white/10 bg-card/60 p-5 backdrop-blur">
          <Field
            label="Display name"
            value={displayName}
            onChange={setDisplayName}
            placeholder="Näkyvä nimi"
            hint="Tämä näytetään kommenteissa ja profiilissa."
          />
          <Field
            label="Käyttäjänimi"
            value={username}
            onChange={setUsername}
            placeholder="käyttäjänimi"
            hint="Vain pienet kirjaimet, numerot ja alaviivat."
          />
          <Field
            label="Profiilikuvan URL"
            value={avatarUrl}
            onChange={setAvatarUrl}
            placeholder="https://…"
            icon={<ImagePlus className="h-3.5 w-3.5" />}
            hint="Liitä linkki kuvaan (esim. Imgur). Tulevaisuudessa lisäämme suoran lataustoiminnon."
          />

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--neon)] px-5 py-2.5 text-sm font-bold text-background shadow-[0_0_30px_-5px_oklch(0.82_0.2_165_/_0.8)] transition hover:scale-[1.02] disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Tallennetaan…" : "Tallenna muutokset"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none transition focus:border-[color:var(--neon)]/60"
      />
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </label>
  );
}
