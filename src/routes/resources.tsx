import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { caps } from "@/lib/caps";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "CAP Resources — CAPMAP India" },
      { name: "description", content: "Full CAP documents, methodologies and useful references for climate action plan research." },
      { property: "og:title", content: "CAP Resources — CAPMAP India" },
      { property: "og:description", content: "Full CAP documents, methodologies and useful references." },
    ],
  }),
  component: Resources,
});

interface ExtraResource { title: string; url: string; source: string; tags: string[]; description: string }

const EXTRA_RESOURCES: ExtraResource[] = [
  { title: "ICLEI", url: "https://southasia.iclei.org/", source: "ICLEI", tags: ["framework", "methodology"], description: "Guidance and framework adopted by several Indian cities for CAP development and net-zero pathways." },
  { title: "C40 Cities Climate Action Planning Framework", url: "https://www.c40.org/what-we-do/scaling-up-climate-action/climate-action-planning/", source: "C40", tags: ["framework", "methodology"], description: "Global framework for developing Climate Action Plans." },
  { title: "GHG Protocol for Cities (GPC)", url: "https://ghgprotocol.org/ghg-protocol-cities", source: "GHG Protocol", tags: [ "methodology","framework"], description: "Standard methodology for city-level greenhouse gas emissions inventories." },
  { title: "India Cooling Action Plan (ICAP)", url: "https://ozonecell.nic.in/wp-content/uploads/2019/03/INDIA-COOLING-ACTION-PLAN-e-circulation-version080319.pdf", source: "MoEFCC, Government of India", tags: ["national", "policy"], description: "National plan addressing cooling requirements across sectors and reducing associated emissions." },
  { title: "National Action Plan on Climate Change (NAPCC)", url: "https://moef.gov.in/en/division/environment-divisions/climate-changecc-2/national-action-plan-on-climate-change/", source: "MoEFCC", tags: ["national", "policy"], description: "India's overarching climate strategy with eight national missions." },
  { title: "Climate Centre for Cities (C-Cube), NIUA", url: "https://niua.in/c-cube/", source: "NIUA", tags: ["research", "cities"], description: "National knowledge hub supporting Indian cities on climate action." },
];

export default function Resources() { return <ResourcesInner />; }
function ResourcesInner() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string>("all");

  const cityDocs = useMemo(
    () => caps.filter((c) => c.documentLink).map((c) => ({ title: `${c.city} Climate Action Plan (${c.year})`, url: c.documentLink, source: c.organizations.split(/[;,\n]/)[0] || c.city, tags: ["city cap", c.city.toLowerCase()], description: c.vision?.replace(/;\s*$/, "") || `Official CAP document published by/for ${c.city}.` })),
    [],
  );

  const all = [...cityDocs, ...EXTRA_RESOURCES];
  const tags = ["all", "city cap", "framework", "methodology", "national", "policy", "research"];

  const filtered = all.filter(
    (r) =>
      (tag === "all" || r.tags.includes(tag)) &&
      (query.trim() === "" ||
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.source.toLowerCase().includes(query.toLowerCase()) ||
        r.description.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">CAP Resources</h1>
      <p className="mt-2 max-w-3xl text-muted-foreground">
        A curated list of published CAP documents, methodologies, national policies and research references.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search resources…"
          className="w-64 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                tag === t ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r, i) => (
          <a
            key={i}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="group rounded-lg border bg-card p-5 shadow-sm transition hover:border-primary hover:shadow-md"
          >
            <div className="mb-2 flex flex-wrap gap-1.5">
              {r.tags.slice(0, 3).map((t) => (
                <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{t}</span>
              ))}
            </div>
            <h3 className="text-base font-semibold group-hover:text-primary">{r.title}</h3>
            <div className="mt-1 text-xs text-muted-foreground">{r.source}</div>
            <p className="mt-2 line-clamp-3 text-sm text-foreground/75">{r.description}</p>
            <div className="mt-3 text-xs font-medium text-primary">Open resource →</div>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-lg border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
          No resources match your search.
        </div>
      )}
    </div>
  );
}
