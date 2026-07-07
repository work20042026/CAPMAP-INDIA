import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import { caps, GEO_LABEL, type CapEntry, type GeoType } from "@/lib/caps";
import { CapDetailPanel } from "@/components/CapDetailPanel";

const CapMap = lazy(() => import("@/components/CapMap").then((m) => ({ default: m.CapMap })));

export const Route = createFileRoute("/")({ component: Home });

const GEO_TYPES: GeoType[] = ["state", "city", "town", "ward", "village"];

function Home() {
  const [selected, setSelected] = useState<CapEntry | null>(null);
  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<Set<GeoType>>(new Set(GEO_TYPES));

  const filtered = useMemo(
    () =>
      caps.filter(
        (c) =>
          activeTypes.has(c.type) &&
          (query.trim() === "" || c.city.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [query, activeTypes],
  );

  const toggle = (t: GeoType) =>
    setActiveTypes((prev) => {
      const n = new Set(prev);
      if (n.has(t)) n.delete(t);
      else n.add(t);
      return n;
    });

  return (
    <>
      {/* Page intro */}
      <div className="mx-auto max-w-7xl px-6 pt-8 pb-4">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Climate Action Plans in India
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
          Explore India's Climate Action Plans across states, cities, towns, wards and villages.
          Click a pin to view the CAP overview, emissions baseline, climate risk assessment and sectoral strategy — all on one page.
        </p>
      </div>

      {/* Filter bar */}
      <div className="border-y bg-muted/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 py-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cities…"
            className="w-56 rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex flex-wrap items-center gap-1.5">
            {GEO_TYPES.map((t) => {
              const on = activeTypes.has(t);
              return (
                <button
                  key={t}
                  onClick={() => toggle(t)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                    on ? "text-white border-transparent" : "bg-background text-muted-foreground hover:text-foreground"
                  }`}
                  style={on ? { backgroundColor: `var(--geo-${t})` } : undefined}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: on ? "white" : `var(--geo-${t})` }}
                  />
                  {GEO_LABEL[t]}
                </button>
              );
            })}
          </div>
          <div className="ml-auto text-xs text-muted-foreground">
            {filtered.length} CAP{filtered.length === 1 ? "" : "s"} on map
          </div>
        </div>
      </div>

      {/* Split layout */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 px-6 py-6 lg:grid-cols-[1.15fr_1fr]">
        <div className="relative h-[520px] overflow-hidden rounded-lg border shadow-sm lg:h-[720px]">
          <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading map…</div>}>
            <CapMap entries={filtered} selected={selected} onSelect={setSelected} />
          </Suspense>
        </div>
        <div className="mt-6 h-[720px] overflow-hidden rounded-lg border bg-card shadow-sm lg:mt-0 lg:ml-6">
          <CapDetailPanel entry={selected} />
        </div>
      </div>
    </>
  );
}
