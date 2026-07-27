import { GEO_LABEL, parseSectorGroups, parseRiskFindings, splitBullets, splitList, splitNumbered, type CapEntry } from "@/lib/caps";
import { useState } from "react";

const SECTOR_COLORS = [
  "var(--geo-city)",
  "var(--geo-ward)",
  "var(--geo-village)",
  "var(--geo-state)",
  "var(--geo-town)",
  "oklch(0.6 0.2 30)",
  "oklch(0.55 0.15 170)",
  "oklch(0.45 0.2 330)",
  "oklch(0.65 0.15 100)",
];

function GeoBadge({ type }: { type: CapEntry["type"] }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: `var(--geo-${type})` }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
      {GEO_LABEL[type]}
    </span>
  );
}

function DonutChart({ segments }: { segments: { label: string; pct: number }[] }) {
  if (segments.length === 0) return null;
  const total = segments.reduce((s, x) => s + x.pct, 0) || 100;
  let offset = 0;
  const R = 60;
  const C = 2 * Math.PI * R;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90">
        <circle cx="80" cy="80" r={R} fill="none" stroke="var(--muted)" strokeWidth="22" />
        {segments.map((s, i) => {
          const frac = s.pct / total;
          const dash = frac * C;
          const el = (
            <circle
              key={i}
              cx="80"
              cy="80"
              r={R}
              fill="none"
              stroke={SECTOR_COLORS[i % SECTOR_COLORS.length]}
              strokeWidth="22"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <ul className="flex-1 space-y-1.5 text-xs">
        {segments.map((s, i) => (
          <li key={i} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: SECTOR_COLORS[i % SECTOR_COLORS.length] }} />
              <span className="text-foreground/80">{s.label}</span>
            </span>
            <span className="font-mono text-foreground/60">{s.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t px-6 py-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

export function CapDetailPanel({ entry }: { entry: CapEntry | null }) {
  const [tab, setTab] = useState<"overview" | "emissions" | "risks" | "strategies">("overview");

  if (!entry) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-10 text-center">
        <div className="mb-4 text-5xl">🗺️</div>
        <h2 className="text-lg font-semibold">Select a location on the map</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Click any pin to view the city's Climate Action Plan: emissions baseline, climate risks, and sectoral strategies.
        </p>
      </div>
    );
  }

  const sectorGroups = parseSectorGroups(entry.sectorContribution);
  const risks = splitList(entry.climateRisks);
  const riskSections = parseRiskFindings(entry.riskFindings, risks);
  const orgs = splitList(entry.organizations);
  const goals = splitList(entry.goals);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <div className="mb-2 flex items-center gap-2">
          <GeoBadge type={entry.type} />
          <span className="text-xs text-muted-foreground">CAP · Published {entry.year}</span>
          {entry.iterations && (
            <span className="text-xs text-muted-foreground">· Iteration {entry.iterations}</span>
          )}
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{entry.city}</h2>
        {entry.vision && (
          <p className="mt-2 text-sm italic text-foreground/70">"{entry.vision.replace(/;\s*$/, "")}"</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {entry.documentLink && (
            <a
              href={entry.documentLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              View full CAP document ↗
            </a>
          )}
        </div>
      </div>

      <div className="border-b bg-muted/40 px-6">
        <nav className="flex gap-1 text-xs font-medium">
          {(["overview", "emissions", "risks", "strategies"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-3 py-2.5 capitalize transition ${
                tab === t ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
              {tab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-primary" />}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "overview" && (
          <>
            <Section title="Publication details">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Geographic unit</div>
                  <div className="font-semibold">{GEO_LABEL[entry.type]}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Year published</div>
                  <div className="font-semibold">{entry.year || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Iteration</div>
                  <div className="font-semibold">{entry.iterations || "—"}</div>
                </div>
              </div>
            </Section>
            {entry.vision && (
              <Section title="Vision">
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                  {entry.vision.replace(/;\s*$/, "")}
                </p>
              </Section>
            )}
            {goals.length > 0 && (
              <Section title="Goals">
                <ul className="space-y-1.5 text-sm">
                  {goals.map((g, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
                      <span className="whitespace-pre-line">{g}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {orgs.length > 0 && (
              <Section title="Organizations involved">
                <div className="flex flex-wrap gap-2">
                  {orgs.map((o, i) => (
                    <span key={i} className="rounded-md border bg-card px-2.5 py-1 text-xs">{o}</span>
                  ))}
                </div>
              </Section>
            )}
            {entry.documentLink && (
              <Section title="CAP document">
                <a
                  href={entry.documentLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline break-all"
                >
                  {entry.documentLink} ↗
                </a>
              </Section>
            )}
          </>
        )}

        {tab === "emissions" && (
          <>
            <Section title="Baseline">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Base year</div>
                  <div className="font-semibold">{entry.baseYear || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Per capita</div>
                  <div className="font-semibold">{entry.perCapita || "—"}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground">Total emissions</div>
                  <div className="font-semibold">{entry.totalEmissions || "—"}</div>
                </div>
              </div>
            </Section>
            {sectorGroups.length > 0 &&
              sectorGroups.map((g, gi) => (
                <Section key={gi} title={g.title ? `Sector contribution — ${g.title}` : "Sector contribution"}>
                  <DonutChart segments={g.segments} />
                </Section>
              ))}
            {sectorGroups.length === 0 && entry.sectorContribution && (
              <Section title="Sector contribution">
                <p className="whitespace-pre-line text-sm text-foreground/80">{entry.sectorContribution}</p>
              </Section>
            )}
          </>
        )}

        {tab === "risks" && (
          <>
            {risks.length > 0 && (
              <Section title="Identified climate risks">
                <div className="flex flex-wrap gap-2">
                  {risks.map((r, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive"
                    >
                      ⚠ {r}
                    </span>
                  ))}
                </div>
              </Section>
            )}
            {riskSections.length > 0 && riskSections.some((s) => s.body) ? (
              riskSections.map((s, i) => (
                <Section key={i} title={s.name ? `Risk assessment — ${s.name}` : "Risk assessment findings"}>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">{s.body}</p>
                </Section>
              ))
            ) : entry.riskFindings ? (
              <Section title="Risk assessment findings">
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">{entry.riskFindings}</p>
              </Section>
            ) : null}
          </>
        )}

        {tab === "strategies" && (
          <div>
            {entry.strategies.map((s, i) => {
              const sectors = splitNumbered(s.sector);
              const strategies = splitNumbered(s.strategy);
              const actions = splitNumbered(s.action);
              const interventions = splitNumbered(s.intervention);
              const maxLen = Math.max(sectors.length, strategies.length, actions.length, interventions.length);
              const rows = Array.from({ length: maxLen }, (_, idx) => ({
                sector: sectors[idx] || "",
                strategy: strategies[idx] || "",
                action: actions[idx] || "",
                intervention: interventions[idx] || "",
              }));
              const hasStructuredRows = maxLen > 1;
              return (
                <div key={i} className="border-t">
                  {entry.strategies.length > 1 && (
                    <div className="bg-muted/40 px-6 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Strategy set {i + 1}
                    </div>
                  )}
                  {hasStructuredRows ? (
                    <div className="divide-y">
                      {rows.map((r, ri) => (
                        <details key={ri} className="group px-6 py-4" open={ri === 0}>
                          <summary className="flex cursor-pointer items-start justify-between gap-3 list-none">
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Sector {ri + 1}
                              </div>
                              <div className="mt-1 whitespace-pre-line text-sm font-semibold">
                                {r.sector.replace(/^\d+[).]\s*/, "") || "—"}
                              </div>
                            </div>
                            <span className="mt-1 text-muted-foreground transition group-open:rotate-180">▾</span>
                          </summary>
                          <div className="mt-3 space-y-3 text-sm">
                            {r.strategy && (
                              <div>
                                <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Strategy</div>
                                <p className="whitespace-pre-line text-foreground/80">{r.strategy.replace(/^\d+[).]\s*/, "")}</p>
                              </div>
                            )}
                            {r.action && (
                              <div>
                                <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Actions / Targets</div>
                                <ul className="space-y-1">
                                  {splitBullets(r.action.replace(/^\d+[).]\s*/, "")).map((a, ai) => (
                                    <li key={ai} className="flex gap-2 text-foreground/80">
                                      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
                                      <span>{a}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {r.intervention && (
                              <div>
                                <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Interventions</div>
                                <ul className="space-y-1">
                                  {splitBullets(r.intervention.replace(/^\d+[).]\s*/, "")).map((a, ai) => (
                                    <li key={ai} className="flex gap-2 text-foreground/80">
                                      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-accent-foreground/60" />
                                      <span>{a}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </details>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3 px-6 py-4 text-sm">
                      {s.sector && (
                        <div>
                          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sector</div>
                          <p className="whitespace-pre-line font-semibold">{s.sector}</p>
                        </div>
                      )}
                      {s.strategy && (
                        <div>
                          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Strategy</div>
                          <p className="whitespace-pre-line text-foreground/80">{s.strategy}</p>
                        </div>
                      )}
                      {s.action && (
                        <div>
                          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Actions / Targets</div>
                          <ul className="space-y-1">
                            {splitBullets(s.action).map((a, ai) => (
                              <li key={ai} className="flex gap-2 text-foreground/80">
                                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
                                <span>{a}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {s.intervention && (
                        <div>
                          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Interventions</div>
                          <ul className="space-y-1">
                            {splitBullets(s.intervention).map((a, ai) => (
                              <li key={ai} className="flex gap-2 text-foreground/80">
                                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-accent-foreground/60" />
                                <span>{a}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {s.info && (
                    <div className="border-t bg-muted/30 px-6 py-4">
                      <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Additional information & co-benefits</div>
                      <p className="whitespace-pre-line text-sm text-foreground/70">{s.info}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
