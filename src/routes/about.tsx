import { createFileRoute } from "@tanstack/react-router";
import { GEO_LABEL, type GeoType } from "@/lib/caps";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — CAPMAP India" },
      { name: "description", content: "About CAPMAP India: what the platform does, how to use it, and how to contribute." },
      { property: "og:title", content: "About — CAPMAP India" },
      { property: "og:description", content: "What CAPMAP India is and how to use the map and dashboard." },
    ],
  }),
  component: About,
});

const TYPES: GeoType[] = ["state", "city", "town", "ward", "village"];

function About() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">About CAPMAP India</h1>
      <p className="mt-4 text-base leading-relaxed text-foreground/80">
        CAPMAP India is an open, interactive directory of Climate Action Plans (CAPs) published by
        Indian states, cities, towns, wards and villages. The platform brings together publicly
        available CAP documents into a single map-based dashboard so researchers, practitioners and
        citizens can quickly compare vision, emissions baselines, climate risks and sectoral strategies
        across geographies.
      </p>

      <h2 className="mt-10 text-xl font-semibold">How to use this site</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground/80">
        <li>Open the <strong>Home</strong> tab to see all CAPs plotted on the India map.</li>
        <li>Use the filter chips to show only certain geographic units (State, City, Town, Ward, Village) or search by name.</li>
        <li>Click a pin to load its CAP dashboard on the right — with tabs for Overview, Emissions, Risks and Strategies.</li>
        <li>Follow the "View full CAP document" link to open the original published PDF or webpage.</li>
        <li>The <strong>CAP Resources</strong> tab lists frameworks, methodologies and reference documents.</li>
      </ol>

      <h2 className="mt-10 text-xl font-semibold">Geographic units</h2>
      <p className="mt-2 text-sm text-foreground/75">Each pin on the map uses a color that reflects its geographic scale:</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-white"
            style={{ backgroundColor: `var(--geo-${t})` }}
          >
            <span className="h-2 w-2 rounded-full bg-white/95" />
            {GEO_LABEL[t]}
          </span>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold">Contribute to CAPMAP India</h2>
      <p className="mt-2 text-sm leading-relaxed text-foreground/80">
        If you want to contribute to this dashboard by adding new information, or updating existing information, or have a suggestion for us, please {" "}
        <a href="mailto:work20042026@gmail.com" className="font-medium text-primary underline">
          write to
        </a>{" "}
        us with the link to the source document, updated information, or your feedback.
      </p>

      <div className="mt-12 rounded-lg border-l-4 border-[var(--geo-ward)] bg-muted/50 p-5 text-sm leading-relaxed text-foreground/80">
        <div className="mb-1 font-semibold text-foreground">Disclaimer</div>
        The information present is entirely based on review of publicly available Climate Action Plan
        documents, information provided by municipalities or organizations developing the CAP documents,
        and thus does not necessarily reflect the most recent status of progress. If you detect any
        incorrect information on this page, please {" "}
        <a href="mailto:work20042026@gmail.com" className="underline text-primary">contact us</a>{" "}
        to amend it.
      </div>
    </div>
  );
}
