import { useEffect, useState } from "react";
import { Globe, Plus, Save, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createWebsite,
  deleteWebsite,
  fetchAllWebsites,
  updateWebsite,
  type ExternalWebsite,
} from "@/lib/websites";

export function WebsitesAdmin() {
  const [sites, setSites] = useState<ExternalWebsite[] | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [accent, setAccent] = useState("#22c55e");
  const [creating, setCreating] = useState(false);

  const load = () => fetchAllWebsites().then(setSites).catch(() => setSites([]));
  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      toast.error("Nimi ja URL vaaditaan");
      return;
    }
    setCreating(true);
    try {
      await createWebsite({
        title,
        url,
        description,
        image_url: imageUrl,
        accent,
        sort_order: (sites?.length ?? 0) * 10 + 100,
      });
      setTitle("");
      setUrl("");
      setDescription("");
      setImageUrl("");
      setAccent("#22c55e");
      toast.success("Sivusto lisätty");
      load();
    } catch (err: any) {
      toast.error(err?.message ?? "Tallennus epäonnistui");
    } finally {
      setCreating(false);
    }
  };

  const onSave = async (s: ExternalWebsite, patch: Partial<ExternalWebsite>) => {
    try {
      await updateWebsite(s.id, patch);
      toast.success("Päivitetty");
      load();
    } catch (err: any) {
      toast.error(err?.message ?? "Päivitys epäonnistui");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Poistetaanko sivusto?")) return;
    await deleteWebsite(id);
    load();
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-card/60 p-5 backdrop-blur">
      <div className="mb-4 flex items-center gap-2">
        <Globe className="h-4 w-4 text-red-400" />
        <h2 className="font-display text-lg font-bold">Muut Websitet</h2>
        <span className="ml-auto text-xs text-muted-foreground">{sites?.length ?? 0} kpl</span>
      </div>

      <form
        onSubmit={onCreate}
        className="mb-5 grid gap-2 rounded-xl border border-white/10 bg-white/5 p-3 sm:grid-cols-2"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Otsikko"
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-red-400/60"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-red-400/60"
        />
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Kuvan URL"
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-red-400/60 sm:col-span-2"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Kuvaus (emojit sallittu)"
          rows={2}
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-red-400/60 sm:col-span-2"
        />
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Korostusväri</label>
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            className="h-8 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Lisää sivusto
        </button>
      </form>

      <div className="space-y-2">
        {sites?.length === 0 && (
          <p className="rounded-lg border border-dashed border-white/10 p-4 text-center text-sm text-muted-foreground">
            Ei sivustoja.
          </p>
        )}
        {sites?.map((s) => (
          <WebsiteRow key={s.id} site={s} onSave={onSave} onDelete={onDelete} />
        ))}
      </div>
    </section>
  );
}

function WebsiteRow({
  site,
  onSave,
  onDelete,
}: {
  site: ExternalWebsite;
  onSave: (s: ExternalWebsite, patch: Partial<ExternalWebsite>) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState(site.title);
  const [url, setUrl] = useState(site.url);
  const [description, setDescription] = useState(site.description ?? "");
  const [imageUrl, setImageUrl] = useState(site.image_url ?? "");
  const [accent, setAccent] = useState(site.accent ?? "#22c55e");
  const [sortOrder, setSortOrder] = useState(site.sort_order);

  const dirty =
    title !== site.title ||
    url !== site.url ||
    description !== (site.description ?? "") ||
    imageUrl !== (site.image_url ?? "") ||
    accent !== (site.accent ?? "#22c55e") ||
    sortOrder !== site.sort_order;

  return (
    <div className="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-3 sm:grid-cols-[80px_1fr_auto]">
      {site.image_url ? (
        <img src={site.image_url} alt="" className="h-16 w-full rounded-lg object-cover sm:h-full" />
      ) : (
        <div className="h-16 w-full rounded-lg bg-white/5 sm:h-full" />
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-sm outline-none focus:border-red-400/60"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 font-mono text-xs outline-none focus:border-red-400/60"
        />
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Kuvan URL"
          className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs outline-none focus:border-red-400/60 sm:col-span-2"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs outline-none focus:border-red-400/60 sm:col-span-2"
        />
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            className="h-7 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
          />
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            className="w-20 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs outline-none focus:border-red-400/60"
            title="Sort order"
          />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onSave(site, { is_active: !site.is_active })}
          title={site.is_active ? "Aktiivinen" : "Piilotettu"}
          className={`grid h-8 w-10 place-items-center rounded-lg border text-xs font-bold transition ${
            site.is_active
              ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/15 text-[color:var(--success)]"
              : "border-white/10 bg-white/5 text-muted-foreground"
          }`}
        >
          {site.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
        </button>
        <button
          onClick={() =>
            onSave(site, {
              title: title.trim(),
              url: url.trim(),
              description: description.trim() || null,
              image_url: imageUrl.trim() || null,
              accent: accent.trim() || null,
              sort_order: sortOrder,
            })
          }
          disabled={!dirty}
          className="inline-flex items-center gap-1 rounded-lg border border-red-400/40 bg-red-400/10 px-2.5 py-1.5 text-xs font-bold text-red-300 disabled:opacity-40"
        >
          <Save className="h-3.5 w-3.5" /> Tallenna
        </button>
        <button
          onClick={() => onDelete(site.id)}
          className="grid h-8 w-8 place-items-center rounded-lg border border-[color:var(--danger)]/40 text-[color:var(--danger)] transition hover:bg-[color:var(--danger)]/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
