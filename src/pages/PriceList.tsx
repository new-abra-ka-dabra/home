import { useState, useCallback, useRef } from "react";
import { read, utils } from "xlsx";
import {
  SiApple, SiSamsung, SiXiaomi, SiGoogle, SiMotorola,
  SiVivo, SiSony, SiNokia, SiBoat, SiBose,
} from "react-icons/si";
import { AlertCircle, Loader2, Package, ChevronLeft } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const BASE =
  "https://raw.githubusercontent.com/new-abra-ka-dabra/home/main/pricelist/";

interface TableData {
  headers: string[];
  rows: string[][];
}

type FetchState = "idle" | "loading" | "ok" | "error";

const MOBILE_BRANDS = [
  { name: "Apple",    slug: "apple",    icon: SiApple,    color: "#e0e0e0" },
  { name: "Samsung",  slug: "samsung",  icon: SiSamsung,  color: "#ffffff" },
  { name: "Xiaomi",   slug: "mi",       icon: SiXiaomi,   color: "#FF6900" },
  { name: "Google",   slug: "google",   icon: SiGoogle,   color: "#4285F4" },
  { name: "Motorola", slug: "motorola", icon: SiMotorola, color: "#5DADE2" },
  { name: "Vivo",     slug: "vivo",     icon: SiVivo,     color: "#415FFF" },
  { name: "Sony",     slug: "sony",     icon: SiSony,     color: "#cccccc" },
  { name: "Realme",   slug: "realme",   icon: undefined,  color: "#FF6900" },
  { name: "Nokia",    slug: "nokia",    icon: SiNokia,    color: "#5DADE2" },
  { name: "Itel",     slug: "itel",     icon: undefined,  color: "#00BFFF" },
] as const;

const ACC_BRAND = { name: "Accessories", slug: "accessories", icon: undefined, color: "#d4af37" };

async function parseXls(slug: string): Promise<TableData> {
  const res = await fetch(`${BASE}${slug}.xls?t=${Date.now()}`);
  if (!res.ok) {
    const res2 = await fetch(`${BASE}${slug}.xlsx?t=${Date.now()}`);
    if (!res2.ok) throw new Error("not found");
    const buf2 = await res2.arrayBuffer();
    return extractFirst(buf2);
  }
  const buf = await res.arrayBuffer();
  return extractFirst(buf);
}

function extractFirst(buffer: ArrayBuffer): TableData {
  const wb = read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw: string[][] = utils.sheet_to_json(sheet, {
    header: 1, defval: "", raw: false,
  }) as string[][];
  const first = raw.findIndex((r) => r.some((c) => String(c).trim()));
  if (first === -1) return { headers: [], rows: [] };
  const headers = raw[first].map((c) => String(c).trim());
  const rows = raw
    .slice(first + 1)
    .filter((r) => r.some((c) => String(c).trim()))
    .map((r) => headers.map((_, i) => String(r[i] ?? "").trim()));
  return { headers, rows };
}

function PriceTable({ data }: { data: TableData }) {
  if (!data.headers.length) {
    return (
      <p className="text-center text-xs text-muted-foreground py-10">
        No data in this file yet.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid hsl(45 75% 50% / 0.18)" }}>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr style={{ background: "linear-gradient(90deg,hsl(45 75% 16%),hsl(45 75% 22%))" }}>
            {data.headers.map((h, i) => (
              <th
                key={i}
                className="text-left px-4 py-3 font-semibold whitespace-nowrap"
                style={{
                  color: "hsl(45 75% 75%)",
                  borderBottom: "1px solid hsl(45 75% 50% / 0.22)",
                  borderRight: i < data.headers.length - 1 ? "1px solid hsl(45 75% 50% / 0.1)" : "none",
                }}
              >
                {h || `Col ${i + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr
              key={ri}
              style={{ background: ri % 2 === 0 ? "hsl(0 0% 6%)" : "hsl(0 0% 8%)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(45 75% 50% / 0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = ri % 2 === 0 ? "hsl(0 0% 6%)" : "hsl(0 0% 8%)")}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-4 py-2.5"
                  style={{
                    color: ci === 0 ? "hsl(45 40% 82%)" : "hsl(0 0% 72%)",
                    fontWeight: ci === 0 ? 500 : 400,
                    borderBottom: "1px solid hsl(45 75% 50% / 0.07)",
                    borderRight: ci < row.length - 1 ? "1px solid hsl(45 75% 50% / 0.07)" : "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cell || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div
        className="px-4 py-2 text-[10px] text-muted-foreground"
        style={{ borderTop: "1px solid hsl(45 75% 50% / 0.1)", background: "hsl(0 0% 5%)" }}
      >
        {data.rows.length} item{data.rows.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

const ALL_BRANDS = [
  ...MOBILE_BRANDS,
  ACC_BRAND,
] as const;

export default function PriceList() {
  const [selected, setSelected] = useState<string | null>(null);
  const [cache, setCache] = useState<Record<string, TableData>>({});
  const [states, setStates] = useState<Record<string, FetchState>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectBrand = useCallback(
    async (slug: string) => {
      setSelected(slug);
      if (cache[slug] || states[slug] === "loading") return;
      setStates((s) => ({ ...s, [slug]: "loading" }));
      try {
        const data = await parseXls(slug);
        setCache((c) => ({ ...c, [slug]: data }));
        setStates((s) => ({ ...s, [slug]: "ok" }));
      } catch {
        setStates((s) => ({ ...s, [slug]: "error" }));
      }
    },
    [cache, states],
  );

  const activeBrand = ALL_BRANDS.find((b) => b.slug === selected);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 60% 30% at 50% 0%, hsl(45 75% 50% / 0.10) 0%, transparent 65%)" }}
      />

      {/* ── Page header ── */}
      <div className="relative text-center pt-14 pb-5 px-4">
        <p className="text-xs tracking-[0.3em] uppercase text-[hsl(45_75%_50%)] mb-2">
          New Abra Ka Dabra
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold gold-text">Price List</h1>
        <div
          className="mt-3 h-px w-24 mx-auto"
          style={{ background: "linear-gradient(90deg,transparent,hsl(45 75% 50% / 0.6),transparent)" }}
        />
      </div>

      {/* ── Sticky brand picker ── */}
      <div
        className="sticky top-0 z-30 pb-3 pt-2"
        style={{ background: "hsl(0 0% 4% / 0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid hsl(45 75% 50% / 0.15)" }}
      >
        <p className="text-center text-[11px] text-muted-foreground mb-2 tracking-wide">
          Tap a brand to see prices
        </p>
        {/* Horizontal scroll strip */}
        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto px-4 pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {ALL_BRANDS.map(({ name, slug, icon, color }) => {
            const isActive = selected === slug;
            return (
              <button
                key={slug}
                onClick={() => selectBrand(slug)}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl transition-all"
                style={{
                  minWidth: "64px",
                  background: isActive ? "hsl(45 75% 50% / 0.15)" : "hsl(0 0% 10%)",
                  border: isActive
                    ? "1.5px solid hsl(45 75% 50% / 0.7)"
                    : "1.5px solid hsl(45 75% 50% / 0.12)",
                  boxShadow: isActive ? "0 0 14px hsl(45 75% 50% / 0.18)" : "none",
                }}
              >
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  {slug === "accessories"
                    ? <Package className="w-5 h-5" style={{ color }} />
                    : <BrandLogo
                        name={name}
                        icon={icon as React.ComponentType<{ style?: React.CSSProperties }> | undefined}
                        color={color}
                        size={22}
                      />
                  }
                </div>
                <span
                  className="text-[10px] font-medium leading-none text-center"
                  style={{ color: isActive ? "hsl(45 75% 80%)" : "hsl(0 0% 65%)" }}
                >
                  {name === "Accessories" ? "Acc." : name}
                </span>
                {states[slug] === "loading" && (
                  <Loader2 className="w-2.5 h-2.5 animate-spin text-[hsl(45_75%_50%)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Price table area ── */}
      <div className="relative flex-1 px-4 py-5 max-w-3xl w-full mx-auto">

        {/* Nothing selected yet */}
        {!selected && (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "hsl(45 75% 50% / 0.08)", border: "1px solid hsl(45 75% 50% / 0.2)" }}
            >
              <ChevronLeft className="w-7 h-7 text-[hsl(45_75%_50%)]" />
            </div>
            <p className="text-muted-foreground text-sm">Select a brand above to view its price list</p>
          </div>
        )}

        {/* Brand header + table */}
        {selected && activeBrand && (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                {activeBrand.slug === "accessories"
                  ? <Package className="w-5 h-5 text-[hsl(45_75%_62%)]" />
                  : <BrandLogo
                      name={activeBrand.name}
                      icon={activeBrand.icon as React.ComponentType<{ style?: React.CSSProperties }> | undefined}
                      color={activeBrand.color}
                      size={20}
                    />
                }
              </div>
              <h2 className="text-base font-serif font-semibold text-[hsl(45_75%_75%)]">
                {activeBrand.name}
                {activeBrand.slug !== "accessories" ? " — Current Prices" : " & Screen Protectors"}
              </h2>
            </div>

            {states[selected] === "loading" && (
              <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin text-[hsl(45_75%_50%)]" />
                <span className="text-sm">Loading…</span>
              </div>
            )}

            {states[selected] === "error" && (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <AlertCircle className="w-7 h-7 text-amber-400" />
                <p className="text-sm text-foreground font-medium">Price file not found</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Upload{" "}
                  <code className="text-[hsl(45_75%_62%)]">pricelist/{selected}.xls</code>{" "}
                  to your GitHub repo to show prices here.
                </p>
              </div>
            )}

            {states[selected] === "ok" && cache[selected] && (
              <PriceTable data={cache[selected]} />
            )}
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
