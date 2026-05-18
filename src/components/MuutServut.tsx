import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Filter } from "lucide-react";
import { fetchServers, type ServerWithStats } from "@/lib/servers";
import { useAuth } from "@/lib/auth";
import { useHypeRealtime } from "@/lib/use-hype-realtime";
import { ServerIcon } from "./ServerIcon";
import { HypeButton } from "./HypeButton";

const PAGE_SIZE = 12;

export function MuutServut() {
  const { user } = useAuth();
  const [servers, setServers] = useState<ServerWithStats[] | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const reload = useCallback(() => {
    fetchServers(user?.id).then(setServers).catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const hypeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useHypeRealtime(
    useCallback(() => {
      if (hypeTimer.current) clearTimeout(hypeTimer.current);
      hypeTimer.current = setTimeout(reload, 250);
    }, [reload]),
  );

  const rest = useMemo(() => servers?.slice(10) ?? [], [servers]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of rest) if (s.category) set.add(s.category);
    return Array.from(set).sort();
  }, [rest]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rest.filter((s) => {
      if (statusFilter === "online" && !s.online) return false;
      if (statusFilter === "offline" && s.online) return false;
      if (category !== "all" && s.category !== category) return false;
      if (q) {
        const hay = `${s.name} ${s.ip} ${s.category ?? ""} ${s.description ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rest, query, category, statusFilter]);

  useEffect(() => setVisible(PAGE_SIZE), [query, category, statusFilter]);

  if (!servers) return null;
  if (rest.length === 0) return null;

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <section id="muut" className="relative mx-auto w-full max-w-5xl scroll-mt-24 px-4 py-12 sm:py-20">
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Lisää yhteisön servereitä
        </p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Muut serverit</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Kaikki yhteisön loput serverit. Hae, suodata ja löydä uusi suosikkisi.
        </p>
      </div>

      {/* Search + filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hae nimellä, IP:llä tai kategorialla…"
            className="w-full rounded-xl border border-border bg-card/60 py-2.5 pl-10 pr-3 text-sm outline-none backdrop-blur transition focus:border-[color:var(--neon)]/60"
          />
        </div>

        <div className="flex gap-2">
          {categories.length > 0 && (
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="appearance-none rounded-xl border border-border bg-card/60 py-2.5 pl-9 pr-7 text-sm outline-none backdrop-blur focus:border-[color:var(--neon)]/60"
              >
                <option value="all">Kaikki kategoriat</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex rounded-xl border border-border bg-card/60 p-0.5 backdrop-blur">
            {(["all", "online", "offline"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={[
                  "rounded-lg px-3 py-2 text-xs font-semibold transition",
                  statusFilter === s
                    ? "bg-[color:var(--neon)]/15 text-[color:var(--neon)]"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {s === "all" ? "Kaikki" : s === "online" ? "Online" : "Offline"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center text-sm text-muted-foreground">
          Ei tuloksia haulla "{query}".
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {shown.map((s, i) => (
            <Link
              key={s.id}
              to="/server/$slug"
              params={{ slug: s.slug }}
              className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-[color:var(--neon)]/40 animate-rise"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted font-mono text-xs font-bold text-muted-foreground">
                {11 + rest.indexOf(s)}
              </div>
              <ServerIcon color={s.icon_color} letter={s.icon_letter} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{s.name}</p>
                <p className="truncate font-mono text-[11px] text-muted-foreground">{s.ip}</p>
              </div>
              <div className="hidden flex-col items-end text-xs sm:flex">
                <span className="font-mono font-bold tabular-nums">{s.online ? s.players : "—"}</span>
                <span className={["text-[10px]", s.online ? "text-[color:var(--success)]" : "text-muted-foreground"].join(" ")}>
                  {s.online ? "online" : "offline"}
                </span>
              </div>
              <HypeButton serverId={s.id} hypeCount={s.hype_count} hyped={s.user_hyped} />
            </Link>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 backdrop-blur transition hover:border-[color:var(--neon)]/40 hover:bg-[color:var(--neon)]/10 hover:text-[color:var(--neon)]"
          >
            Lataa lisää ({filtered.length - visible})
          </button>
        </div>
      )}
    </section>
  );
}
