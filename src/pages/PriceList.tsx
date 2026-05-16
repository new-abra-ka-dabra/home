import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { read, utils } from "xlsx";
import {
  SiApple, SiSamsung, SiXiaomi, SiGoogle, SiMotorola, SiNokia,
} from "react-icons/si";
import {
  AlertCircle, Loader2, Package,
  ArrowUp, ArrowDown, ArrowUpDown, X, Check,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import accData from "@/data/accessories.json";

// ── Types ─────────────────────────────────────────────────────
interface TableData { headers: string[]; rows: string[][]; }
type FetchState = "idle" | "loading" | "ok" | "error";
type PriceSort  = "none" | "asc" | "desc";

type SubMap   = Record<string, string[]>;
type BrandMap = Record<string, SubMap>;

interface BrandDef {
  name:  string;
  slug:  string;
  icon?: React.ComponentType<{ style?: React.CSSProperties }>;
  color: string;
}

// ── Brand display config ───────────────────────────────────────
const BRAND_CONFIG: BrandDef[] = [
  { name: "Apple",    slug: "apple",    icon: SiApple    as React.ComponentType<{ style?: React.CSSProperties }>, color: "#e0e0e0" },
  { name: "Samsung",  slug: "samsung",  icon: SiSamsung  as React.ComponentType<{ style?: React.CSSProperties }>, color: "#ffffff" },
  { name: "Xiaomi",   slug: "mi",       icon: SiXiaomi   as React.ComponentType<{ style?: React.CSSProperties }>, color: "#FF6900" },
  { name: "Google",   slug: "google",   icon: SiGoogle   as React.ComponentType<{ style?: React.CSSProperties }>, color: "#4285F4" },
  { name: "Realme",   slug: "realme",   icon: undefined,                                                           color: "#FF6900" },
  { name: "Motorola", slug: "motorola", icon: SiMotorola as React.ComponentType<{ style?: React.CSSProperties }>, color: "#5DADE2" },
  { name: "Nokia",    slug: "nokia",    icon: SiNokia    as React.ComponentType<{ style?: React.CSSProperties }>, color: "#5DADE2" },
  { name: "Itel",     slug: "itel",     icon: undefined,                                                           color: "#00BFFF" },
];
const ACC_DEF: BrandDef = { name: "Accessories", slug: "accessories", color: "#d4af37" };

// ── File fetching ──────────────────────────────────────────────
const GITHUB_RAW = "https://raw.githubusercontent.com/new-abra-ka-dabra/home/main/pricelist/";

async function parseXls(filename: string): Promise<TableData> {
  for (const ext of [".xlsx", ".xls"]) {
    try {
      const r = await fetch(`./pricelist/${filename}${ext}?t=${Date.now()}`);
      if (r.ok) return extractFirst(await r.arrayBuffer());
    } catch { /* ignore */ }
  }
  for (const ext of [".xls", ".xlsx"]) {
    try {
      const r = await fetch(`${GITHUB_RAW}${filename}${ext}?t=${Date.now()}`);
      if (r.ok) return extractFirst(await r.arrayBuffer());
    } catch { /* ignore */ }
  }
  throw new Error("not found");
}

function extractFirst(buffer: ArrayBuffer): TableData {
  const wb    = read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw   = utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "", raw: false });
  const first = raw.findIndex((r) => r.some((c) => String(c).trim()));
  if (first === -1) return { headers: [], rows: [] };
  const headers = raw[first].map((c) => String(c).trim());
  const rows    = raw
    .slice(first + 1)
    .filter((r) => r.some((c) => String(c).trim()))
    .map((r) => headers.map((_, i) => String(r[i] ?? "").trim()));
  return { headers, rows };
}

async function loadBrandMap(): Promise<BrandMap> {
  try {
    const r = await fetch(`./pricelist/index.json?t=${Date.now()}`);
    if (r.ok) return await r.json();
  } catch { /* ignore */ }
  try {
    const r = await fetch(
      "https://api.github.com/repos/new-abra-ka-dabra/home/contents/pricelist"
    );
    if (r.ok) {
      const files: Array<{ name: string; type: string }> = await r.json();
      const map: BrandMap = {};
      files
        .filter((f) => f.type === "file" && /\.(xls|xlsx)$/i.test(f.name))
        .forEach((f) => {
          const base  = f.name.replace(/\.(xlsx?)$/i, "");
          const parts = base.split("-");
          if (parts.length === 1) {
            if (!map[parts[0]]) map[parts[0]] = {};
          } else if (parts.length === 2) {
            const [slug, sub] = parts;
            if (!map[slug])      map[slug] = {};
            if (!map[slug][sub]) map[slug][sub] = [];
          } else {
            const slug   = parts[0];
            const sub    = parts[1];
            const subsub = parts.slice(2).join("-");
            if (!map[slug])      map[slug] = {};
            if (!map[slug][sub]) map[slug][sub] = [];
            map[slug][sub].push(subsub);
          }
        });
      return map;
    }
  } catch { /* ignore */ }
  return {};
}

// ── Accessory helpers ──────────────────────────────────────────
function getTypeImg(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("speak") || t.includes("sound")) return "speaker.svg";
  if (t.includes("cable") || t.includes("wire"))  return "cable.svg";
  if (t.includes("charg") || t.includes("adapt") || t.includes("travel")) return "charger.svg";
  if (t.includes("blue") || t.includes("tws") || t.includes("wireless")) return "earphones.svg";
  if (t.includes("head") || t.includes("ear") || t.includes("bud")) return "headphones.svg";
  if (t.includes("watch") || t.includes("smart") || t.includes("band")) return "smartwatch.svg";
  if (t.includes("case") || t.includes("cover")) return "case.svg";
  if (t.includes("screen") || t.includes("glass") || t.includes("protect") ||
      t.includes("scratch") || t.includes("guard")) return "screen-protector.svg";
  if (t.includes("power") || t.includes("bank") || t.includes("batter")) return "power-bank.svg";
  if (t.includes("trip") || t.includes("stand") || t.includes("mount") || t.includes("cam")) return "tripod.svg";
  if (t.includes("pencil") || t.includes("stylus") || t.includes("pen")) return "stylus.svg";
  if (t.includes("mouse")) return "mouse.svg";
  if (t.includes("keyboard") || t.includes("keyb")) return "keyboard.svg";
  return "package.svg";
}

// ── Price table ────────────────────────────────────────────────
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
              <th key={i}
                className="text-left px-4 py-3 font-semibold whitespace-nowrap"
                style={{
                  color:       "hsl(45 75% 75%)",
                  borderBottom: "1px solid hsl(45 75% 50% / 0.22)",
                  borderRight:  i < data.headers.length - 1 ? "1px solid hsl(45 75% 50% / 0.1)" : "none",
                }}>
                {h || `Col ${i + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr key={ri}
              style={{ background: ri % 2 === 0 ? "hsl(0 0% 6%)" : "hsl(0 0% 8%)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(45 75% 50% / 0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = ri % 2 === 0 ? "hsl(0 0% 6%)" : "hsl(0 0% 8%)")}
            >
              {row.map((cell, ci) => (
                <td key={ci}
                  className="px-4 py-2.5"
                  style={{
                    color:       ci === 0 ? "hsl(45 40% 82%)" : "hsl(0 0% 72%)",
                    fontWeight:  ci === 0 ? 500 : 400,
                    borderBottom: "1px solid hsl(45 75% 50% / 0.07)",
                    borderRight:  ci < row.length - 1 ? "1px solid hsl(45 75% 50% / 0.07)" : "none",
                    whiteSpace:  "nowrap",
                  }}>
                  {cell || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 text-[10px] text-muted-foreground"
        style={{ borderTop: "1px solid hsl(45 75% 50% / 0.1)", background: "hsl(0 0% 5%)" }}>
        {data.rows.length} item{data.rows.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

// ── Accessory type view ────────────────────────────────────────
function AccessoryTypeView({ type }: { type: string }) {
  const byType    = accData.byType as Record<string, string[][]>;
  const headers   = accData.headers as string[];
  const rawRows   = useMemo(() => byType[type] ?? [], [type]);

  const brandColIdx = headers.findIndex((h) => h.toLowerCase() === "brand");
  const priceColIdx = headers.findIndex((h) => h.toLowerCase().includes("price"));

  const typeBrands = useMemo(() => {
    if (brandColIdx < 0) return [];
    return [...new Set(rawRows.map((r) => r[brandColIdx]).filter(Boolean))].sort();
  }, [rawRows, brandColIdx]);

  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [priceSort,      setPriceSort]      = useState<PriceSort>("none");

  const toggleBrand  = (b: string) =>
    setSelectedBrands((p) => { const n = new Set(p); n.has(b) ? n.delete(b) : n.add(b); return n; });
  const cyclePriceSort = () =>
    setPriceSort((s) => s === "none" ? "asc" : s === "asc" ? "desc" : "none");

  const filteredRows = useMemo(() => {
    let rows = rawRows;
    if (selectedBrands.size > 0 && brandColIdx >= 0)
      rows = rows.filter((r) => selectedBrands.has(r[brandColIdx]));
    if (priceSort !== "none" && priceColIdx >= 0)
      rows = [...rows].sort((a, b) => {
        const pa = parseFloat(a[priceColIdx].replace(/[^0-9.]/g, "")) || 0;
        const pb = parseFloat(b[priceColIdx].replace(/[^0-9.]/g, "")) || 0;
        return priceSort === "asc" ? pa - pb : pb - pa;
      });
    return rows;
  }, [rawRows, selectedBrands, priceSort, brandColIdx, priceColIdx]);

  const hasFilters = selectedBrands.size > 0 || priceSort !== "none";

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <button onClick={cyclePriceSort}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{
            background: priceSort !== "none" ? "hsl(45 75% 50% / 0.15)" : "hsl(0 0% 10%)",
            border:     priceSort !== "none" ? "1.5px solid hsl(45 75% 50% / 0.6)" : "1.5px solid hsl(45 75% 50% / 0.15)",
            color:      priceSort !== "none" ? "hsl(45 75% 80%)" : "hsl(0 0% 60%)",
          }}>
          {priceSort === "asc"
            ? <ArrowUp    className="w-3.5 h-3.5" />
            : priceSort === "desc"
            ? <ArrowDown  className="w-3.5 h-3.5" />
            : <ArrowUpDown className="w-3.5 h-3.5" />}
          {priceSort === "asc" ? "Price: Low → High"
            : priceSort === "desc" ? "Price: High → Low"
            : "Sort by Price"}
        </button>
        {typeBrands.map((brand) => {
          const active = selectedBrands.has(brand);
          return (
            <button key={brand} onClick={() => toggleBrand(brand)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: active ? "hsl(45 75% 50% / 0.15)" : "hsl(0 0% 10%)",
                border:     active ? "1.5px solid hsl(45 75% 50% / 0.6)" : "1.5px solid hsl(45 75% 50% / 0.15)",
                color:      active ? "hsl(45 75% 80%)" : "hsl(0 0% 60%)",
              }}>
              {active && <Check className="w-3 h-3" />}
              {brand}
            </button>
          );
        })}
        {hasFilters && (
          <button onClick={() => { setSelectedBrands(new Set()); setPriceSort("none"); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] transition-all"
            style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 22%)", color: "hsl(0 0% 50%)" }}>
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground mb-3 pl-1">
        Showing {filteredRows.length} of {rawRows.length} item{rawRows.length !== 1 ? "s" : ""}
        {selectedBrands.size > 0 ? ` · ${[...selectedBrands].join(", ")}` : ""}
        {priceSort !== "none" ? ` · sorted ${priceSort === "asc" ? "low→high" : "high→low"}` : ""}
      </p>
      {filteredRows.length === 0
        ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center rounded-xl"
            style={{ background: "hsl(0 0% 6%)", border: "1px solid hsl(45 75% 50% / 0.1)" }}>
            <Package className="w-7 h-7 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No items match the selected filters.</p>
          </div>
        ) : (
          <PriceTable data={{ headers, rows: filteredRows }} />
        )}
    </div>
  );
}

// ── Centered scrollable pill row ───────────────────────────────
// Items are centered when they fit; scroll horizontally when they overflow.
function PillRow({
  items,
  active,
  onSelect,
  rowRef,
}: {
  items:    string[];
  active:   string | null;
  onSelect: (k: string) => void;
  rowRef?:  React.RefObject<HTMLDivElement>;
}) {
  return (
    <div style={{ borderTop: "1px solid hsl(45 75% 50% / 0.10)" }}>
      {/* overflow-x-auto enables scrolling; inner div uses width:max-content + margin:auto for centering */}
      <div className="overflow-x-auto py-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <div
          ref={rowRef}
          className="flex gap-2 px-4 mx-auto"
          style={{ width: "max-content" }}
        >
          {items.map((item) => {
            const isActive = active === item;
            const label    = item.charAt(0).toUpperCase() + item.slice(1);
            return (
              <button key={item} onClick={() => onSelect(item)}
                className="flex-shrink-0 rounded-xl transition-all"
                style={{
                  padding:    "5px 14px",
                  background:  isActive ? "hsl(45 75% 50% / 0.15)" : "hsl(0 0% 10%)",
                  border:      isActive ? "1.5px solid hsl(45 75% 50% / 0.7)" : "1.5px solid hsl(45 75% 50% / 0.12)",
                  boxShadow:   isActive ? "0 0 10px hsl(45 75% 50% / 0.18)" : "none",
                  color:       isActive ? "hsl(45 75% 82%)" : "hsl(0 0% 65%)",
                  fontSize:    "11px",
                  fontWeight:  isActive ? 600 : 400,
                  whiteSpace:  "nowrap",
                }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Prompt card ────────────────────────────────────────────────
function PickPrompt({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <Package className="w-8 h-8" style={{ color: "hsl(45 75% 50% / 0.4)" }} />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function PriceList() {
  const [brandMap,  setBrandMap]  = useState<BrandMap | null>(null);
  const [selected,  setSelected]  = useState<string | null>(null);
  const [subSel,    setSubSel]    = useState<string | null>(null);
  const [subsubSel, setSubsubSel] = useState<string | null>(null);
  const [cache,     setCache]     = useState<Record<string, TableData>>({});
  const [states,    setStates]    = useState<Record<string, FetchState>>({});
  const brandRowRef  = useRef<HTMLDivElement>(null);
  const subRowRef    = useRef<HTMLDivElement>(null);
  const subsubRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadBrandMap().then(setBrandMap); }, []);

  const fetchFile = useCallback(async (fileKey: string) => {
    if (cache[fileKey] || states[fileKey] === "loading") return;
    setStates((s) => ({ ...s, [fileKey]: "loading" }));
    try {
      const data = await parseXls(fileKey);
      setCache((c)  => ({ ...c,  [fileKey]: data }));
      setStates((s) => ({ ...s,  [fileKey]: "ok" }));
    } catch {
      setStates((s) => ({ ...s,  [fileKey]: "error" }));
    }
  }, [cache, states]);

  const selectBrand = useCallback((slug: string) => {
    setSelected(slug);
    setSubSel(null);
    setSubsubSel(null);
    if (slug === "accessories") return;
    const subs = Object.keys(brandMap?.[slug] ?? {});
    if (subs.length === 0) fetchFile(slug);
  }, [brandMap, fetchFile]);

  const selectSub = useCallback((slug: string, sub: string) => {
    setSubSel(sub);
    setSubsubSel(null);
    const subSubs = brandMap?.[slug]?.[sub] ?? [];
    if (subSubs.length === 0) fetchFile(`${slug}-${sub}`);
  }, [brandMap, fetchFile]);

  const selectSubSub = useCallback((slug: string, sub: string, subsub: string) => {
    setSubsubSel(subsub);
    fetchFile(`${slug}-${sub}-${subsub}`);
  }, [fetchFile]);

  // ── Derived values ──
  const visibleBrands: BrandDef[] = brandMap
    ? [ACC_DEF, ...BRAND_CONFIG.filter((b) => b.slug in brandMap)]
    : [ACC_DEF, ...BRAND_CONFIG];

  const activeBrand = BRAND_CONFIG.find((b) => b.slug === selected);
  const subMap      = (brandMap && selected && selected !== "accessories")
    ? (brandMap[selected] ?? {})
    : {};
  const subs        = Object.keys(subMap);
  const subSubs     = (subSel && subMap[subSel]) ? subMap[subSel] : [];
  const hasLevel2   = subs.length > 0;
  const hasLevel3   = subSubs.length > 0;

  const accTypes  = accData.productTypes as string[];

  type ContentState =
    | "none" | "acc_pick_sub" | "acc_table"
    | "brand_pick_sub" | "brand_pick_subsub"
    | "brand_table" | "brand_loading" | "brand_error";

  let content: ContentState = "none";
  let tableFileKey = "";

  if (!selected) {
    content = "none";
  } else if (selected === "accessories") {
    content = subSel ? "acc_table" : "acc_pick_sub";
  } else if (!hasLevel2) {
    const fs = states[selected] ?? "idle";
    if      (fs === "loading") content = "brand_loading";
    else if (fs === "error")   { content = "brand_error"; tableFileKey = selected; }
    else if (fs === "ok")      { content = "brand_table"; tableFileKey = selected; }
  } else if (!subSel) {
    content = "brand_pick_sub";
  } else if (hasLevel3 && !subsubSel) {
    content = "brand_pick_subsub";
  } else {
    const fk = subsubSel
      ? `${selected}-${subSel}-${subsubSel}`
      : `${selected}-${subSel}`;
    const fs = states[fk] ?? "idle";
    if      (fs === "loading") { content = "brand_loading"; }
    else if (fs === "error")   { content = "brand_error"; tableFileKey = fk; }
    else if (fs === "ok")      { content = "brand_table";  tableFileKey = fk; }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* bg glow */}
      <div className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 60% 30% at 50% 0%, hsl(45 75% 50% / 0.10) 0%, transparent 65%)" }} />

      {/* ── Page header ── */}
      <div className="relative text-center pt-14 pb-5 px-4">
        <p className="text-xs tracking-[0.3em] uppercase text-[hsl(45_75%_50%)] mb-2">New Abra Ka Dabra</p>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold gold-text">Price List</h1>
        <div className="mt-3 h-px w-24 mx-auto"
          style={{ background: "linear-gradient(90deg,transparent,hsl(45 75% 50% / 0.6),transparent)" }} />
      </div>

      {/* ── Sticky nav ── */}
      <div className="sticky top-0 z-30"
        style={{
          background:   "hsl(0 0% 4% / 0.96)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid hsl(45 75% 50% / 0.15)",
        }}>

        {/* ROW 1 — Brand tiles (icon + name), centered */}
        <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div
            ref={brandRowRef}
            className="flex gap-2.5 px-4 mx-auto"
            style={{ width: "max-content" }}
          >
            {visibleBrands.map(({ name, slug, icon, color }) => {
              const isActive = selected === slug;
              const isAcc    = slug === "accessories";
              return (
                <React.Fragment key={slug}>
                  <button onClick={() => selectBrand(slug)}
                    className="flex-shrink-0 flex flex-col items-center gap-1.5 rounded-2xl transition-all"
                    style={{
                      minWidth:   isAcc ? "80px" : "68px",
                      padding:    "10px 10px",
                      background: isActive ? "hsl(45 75% 50% / 0.15)" : "hsl(0 0% 10%)",
                      border:     isActive ? "1.5px solid hsl(45 75% 50% / 0.7)" : "1.5px solid hsl(45 75% 50% / 0.12)",
                      boxShadow:  isActive ? "0 0 16px hsl(45 75% 50% / 0.22)" : "none",
                    }}>
                    <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                      {isAcc
                        ? <Package className="w-6 h-6" style={{ color }} />
                        : <BrandLogo name={name} icon={icon} color={color} size={24} />}
                    </div>
                    <span className="text-[10px] font-medium leading-none text-center"
                      style={{ color: isActive ? "hsl(45 75% 80%)" : "hsl(0 0% 65%)" }}>
                      {name}
                    </span>
                    {states[slug] === "loading" && (
                      <Loader2 className="w-2.5 h-2.5 animate-spin text-[hsl(45_75%_50%)]" />
                    )}
                  </button>
                  {isAcc && (
                    <div className="flex-shrink-0 self-center"
                      style={{ width: "1px", height: "48px", background: "hsl(45 75% 50% / 0.35)", borderRadius: "1px" }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ROW 2 — Sub-category pills (text-only, centered) */}
        {selected === "accessories" && (
          <PillRow
            items={accTypes}
            active={subSel}
            onSelect={(k) => { setSubSel(k); setSubsubSel(null); }}
            rowRef={subRowRef}
          />
        )}
        {selected && selected !== "accessories" && hasLevel2 && (
          <PillRow
            items={subs}
            active={subSel}
            onSelect={(sub) => selectSub(selected, sub)}
            rowRef={subRowRef}
          />
        )}

        {/* ROW 3 — Sub-sub-category pills (text-only, centered, only when present) */}
        {selected && selected !== "accessories" && subSel && hasLevel3 && (
          <PillRow
            items={subSubs}
            active={subsubSel}
            onSelect={(ss) => selectSubSub(selected, subSel, ss)}
            rowRef={subsubRowRef}
          />
        )}
      </div>

      {/* ── Content area ── */}
      <div className="relative flex-1 px-4 py-5 max-w-3xl w-full mx-auto">

        {content === "none" && (
          <PickPrompt text="Select Accessories or a mobile brand above" />
        )}

        {content === "acc_pick_sub" && (
          <PickPrompt text="Choose a category from the bar above" />
        )}

        {content === "acc_table" && subSel && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src={`${import.meta.env.BASE_URL}logos/accessories/${getTypeImg(subSel)}`}
                alt={subSel}
                className="w-5 h-5 object-contain"
                draggable={false}
              />
              <h2 className="text-base font-serif font-semibold text-[hsl(45_75%_75%)]">{subSel}</h2>
            </div>
            <AccessoryTypeView key={subSel} type={subSel} />
          </div>
        )}

        {content === "brand_pick_sub" && (
          <PickPrompt text="Choose a category from the bar above" />
        )}

        {content === "brand_pick_subsub" && (
          <PickPrompt text="Choose a variant from the bar above" />
        )}

        {content === "brand_loading" && (
          <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-[hsl(45_75%_50%)]" />
            <span className="text-sm">Loading…</span>
          </div>
        )}

        {content === "brand_error" && activeBrand && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertCircle className="w-7 h-7 text-amber-400" />
            <p className="text-sm font-medium">Price file not found</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Add <code className="text-[hsl(45_75%_62%)]">pricelist/{tableFileKey}.xlsx</code> to your repo.
            </p>
          </div>
        )}

        {content === "brand_table" && activeBrand && cache[tableFileKey] && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                <BrandLogo name={activeBrand.name} icon={activeBrand.icon} color={activeBrand.color} size={18} />
              </div>
              <h2 className="text-base font-serif font-semibold text-[hsl(45_75%_75%)]">
                {activeBrand.name}
                {subSel    && ` — ${subSel.charAt(0).toUpperCase()    + subSel.slice(1)}`}
                {subsubSel && ` · ${subsubSel.charAt(0).toUpperCase() + subsubSel.slice(1)}`}
              </h2>
            </div>
            <PriceTable data={cache[tableFileKey]} />
          </div>
        )}
      </div>
    </div>
  );
}
