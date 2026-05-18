import { useEffect, useState } from "react";
import { Megaphone, Plus, Trash2, ToggleLeft, ToggleRight, Save } from "lucide-react";
import { toast } from "sonner";
import { fetchAllBanners, createBanner, updateBanner, deleteBanner, type Banner } from "@/lib/banners";

export function BannersAdmin() {
  const [banners, setBanners] = useState<Banner[] | null>(null);
  const [text, setText] = useState("");
  const [speed, setSpeed] = useState(30);
  const [link, setLink] = useState("");
  const [creating, setCreating] = useState(false);

  const load = () => fetchAllBanners().then(setBanners).catch(() => setBanners([]));

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setCreating(true);
    try {
      await createBanner({ text, speed_seconds: speed, link_url: link });
      setText("");
      setLink("");
      setSpeed(30);
      toast.success("Banneri lisätty");
      load();
    } catch (err: any) {
      toast.error(err?.message ?? "Tallennus epäonnistui");
    } finally {
      setCreating(false);
    }
  };

  const onSave = async (b: Banner, patch: Partial<Banner>) => {
    try {
      await updateBanner(b.id, patch);
      toast.success("Päivitetty");
      load();
    } catch (err: any) {
      toast.error(err?.message ?? "Päivitys epäonnistui");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Poistetaanko banneri?")) return;
    await deleteBanner(id);
    load();
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-card/60 p-5 backdrop-blur">
      <div className="mb-4 flex items-center gap-2">
        <Megaphone className="h-4 w-4 text-[color:var(--neon)]" />
        <h2 className="font-display text-lg font-bold">Mainosbannerit</h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {banners?.length ?? 0} kpl
        </span>
      </div>

      <form
        onSubmit={onCreate}
        className="mb-5 grid gap-2 rounded-xl border border-white/10 bg-white/5 p-3 sm:grid-cols-[1fr_120px_1fr_auto]"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Banneriteksti"
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[color:var(--neon)]/60"
        />
        <input
          type="number"
          min={5}
          max={300}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value) || 30)}
          placeholder="Nopeus (s)"
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[color:var(--neon)]/60"
        />
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Linkki (valinnainen)"
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[color:var(--neon)]/60"
        />
        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--neon)] px-3 py-2 text-sm font-bold text-background disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Lisää
        </button>
      </form>

      <div className="space-y-2">
        {banners?.length === 0 && (
          <p className="rounded-lg border border-dashed border-white/10 p-4 text-center text-sm text-muted-foreground">
            Ei bannereita.
          </p>
        )}
        {banners?.map((b) => (
          <BannerRow key={b.id} banner={b} onSave={onSave} onDelete={onDelete} />
        ))}
      </div>
    </section>
  );
}

function BannerRow({
  banner,
  onSave,
  onDelete,
}: {
  banner: Banner;
  onSave: (b: Banner, patch: Partial<Banner>) => void;
  onDelete: (id: string) => void;
}) {
  const [text, setText] = useState(banner.text);
  const [speed, setSpeed] = useState(banner.speed_seconds);
  const [link, setLink] = useState(banner.link_url ?? "");
  const dirty =
    text !== banner.text || speed !== banner.speed_seconds || (link || null) !== (banner.link_url || null);

  return (
    <div className="grid items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 sm:grid-cols-[1fr_100px_1fr_auto_auto_auto]">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-sm outline-none focus:border-[color:var(--neon)]/60"
      />
      <input
        type="number"
        min={5}
        max={300}
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value) || 30)}
        className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-sm outline-none focus:border-[color:var(--neon)]/60"
      />
      <input
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Linkki"
        className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-sm outline-none focus:border-[color:var(--neon)]/60"
      />
      <button
        onClick={() => onSave(banner, { is_active: !banner.is_active })}
        title={banner.is_active ? "Aktiivinen" : "Piilotettu"}
        className={`grid h-8 w-12 place-items-center rounded-lg border text-xs font-bold transition ${
          banner.is_active
            ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/15 text-[color:var(--success)]"
            : "border-white/10 bg-white/5 text-muted-foreground"
        }`}
      >
        {banner.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
      </button>
      <button
        onClick={() =>
          onSave(banner, { text: text.trim(), speed_seconds: speed, link_url: link.trim() || null })
        }
        disabled={!dirty}
        className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10 px-2.5 py-1.5 text-xs font-bold text-[color:var(--neon)] disabled:opacity-40"
      >
        <Save className="h-3.5 w-3.5" /> Tallenna
      </button>
      <button
        onClick={() => onDelete(banner.id)}
        className="grid h-8 w-8 place-items-center rounded-lg border border-[color:var(--danger)]/40 text-[color:var(--danger)] transition hover:bg-[color:var(--danger)]/10"
        title="Poista"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
