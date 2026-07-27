import raw from "@/data/caps.json";

export type GeoType = "state" | "city" | "town" | "ward" | "village";

export interface Strategy {
  sector: string;
  strategy: string;
  action: string;
  intervention: string;
  info: string;
}

export interface CapEntry {
  city: string;
  lat: number;
  lng: number;
  type: GeoType;
  iterations: string;
  year: string;
  vision: string;
  goals: string;
  organizations: string;
  documentLink: string;
  baseYear: string;
  totalEmissions: string;
  sectorContribution: string;
  perCapita: string;
  climateRisks: string;
  riskFindings: string;
  strategies: Strategy[];
}

export const caps: CapEntry[] = raw as CapEntry[];

export const GEO_LABEL: Record<GeoType, string> = {
  state: "State",
  city: "City",
  town: "Town",
  ward: "Ward",
  village: "Village",
};

export const GEO_COLOR_VAR: Record<GeoType, string> = {
  state: "var(--geo-state)",
  city: "var(--geo-city)",
  town: "var(--geo-town)",
  ward: "var(--geo-ward)",
  village: "var(--geo-village)",
};

export interface SectorSegment { label: string; pct: number }
export interface SectorGroup { title: string; segments: SectorSegment[] }

function parseSegments(chunk: string): SectorSegment[] {
  return chunk
    .split(/;|\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(/(.+?)[\s\-–:]+(\d+(?:\.\d+)?)\s*%/);
      if (!m) return null;
      return { label: m[1].replace(/[-–:]\s*$/, "").trim(), pct: parseFloat(m[2]) };
    })
    .filter((x): x is SectorSegment => !!x);
}

/** Parse "Label - 12%; Other - 8%" style strings into segments (flat). */
export function parseSectorContribution(text: string): SectorSegment[] {
  if (!text) return [];
  return parseSegments(text);
}

/** Parse sector contribution supporting multiple headed sections like "City Scale:\n..." */
export function parseSectorGroups(text: string): SectorGroup[] {
  if (!text) return [];
  // Split on blank line or lines ending with ":" acting as headings.
  const lines = text.split(/\n/);
  const groups: SectorGroup[] = [];
  let currentTitle = "";
  let buffer: string[] = [];
  const flush = () => {
    const segs = parseSegments(buffer.join("\n"));
    if (segs.length) groups.push({ title: currentTitle, segments: segs });
    buffer = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    // heading detection: line ends with ":" and no percent
    if (/:\s*$/.test(line) && !/%/.test(line)) {
      flush();
      currentTitle = line.replace(/:\s*$/, "");
      continue;
    }
    buffer.push(line);
  }
  flush();
  // If no explicit headings, return single unnamed group
  if (groups.length === 0) {
    const segs = parseSegments(text);
    if (segs.length) return [{ title: "", segments: segs }];
  }
  return groups;
}

export function splitList(text: string): string[] {
  if (!text) return [];
  return text
    .split(/;|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Split numbered "1) foo;2) bar" lists into individual items. Falls back to line/semicolon split. */
export function splitNumbered(text: string): string[] {
  if (!text) return [];
  const trimmed = text.trim();
  // If starts with "1)" or "1." style, split by that pattern
  if (/^\s*\d+[).]/.test(trimmed)) {
    return trimmed
      .split(/(?=(?:^|[\n;])\s*\d+[).])/)
      .map((s) => s.replace(/^[\s;]+/, "").trim())
      .filter(Boolean);
  }
  return trimmed
    .split(/\n{2,}|;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Split bullet points using • or newlines. */
export function splitBullets(text: string): string[] {
  if (!text) return [];
  return text
    .split(/•|\n/)
    .map((s) => s.trim().replace(/^[-–]\s*/, ""))
    .filter(Boolean);
}

/** Parse risk findings text into sections keyed by risk name headings from a list of risk names. */
export function parseRiskFindings(text: string, riskNames: string[]): { name: string; body: string }[] {
  if (!text) return [];
  const names = riskNames.map((n) => n.trim()).filter(Boolean);
  if (names.length === 0) return [{ name: "", body: text.trim() }];
  // Build regex that matches any risk name as a line/section header
  const escaped = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(^|\\n)\\s*(${escaped.join("|")})\\s*(?:\\n|:)`, "gi");
  const matches: { name: string; index: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    matches.push({ name: m[2], index: m.index + m[1].length, end: re.lastIndex });
  }
  if (matches.length === 0) return [{ name: "", body: text.trim() }];
  const out: { name: string; body: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].end;
    const stop = i + 1 < matches.length ? matches[i + 1].index : text.length;
    out.push({ name: matches[i].name, body: text.slice(start, stop).trim() });
  }
  return out;
}
