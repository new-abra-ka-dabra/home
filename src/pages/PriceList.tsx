import React, { useState, useCallback, useMemo, useRef } from "react";
import { read, utils } from "xlsx";
import {
  SiApple, SiSamsung, SiXiaomi, SiGoogle, SiMotorola,
  SiVivo, SiSony, SiNokia, SiBoat,
} from "react-icons/si";
import {
  AlertCircle, Loader2, Package, ChevronLeft,
  Volume2, Zap, Plug, Headphones, Watch, Smartphone, Shield,
  BatteryCharging, Check, ArrowUp, ArrowDown, ArrowUpDown, X,
  Camera, Pencil, Mouse, Keyboard, Bluetooth,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import accData from "@/data/accessories.json";

// ── Types ────────────────────────────────────────────────────
interface TableData {
  headers: string[];
  rows: string[][];
}
type FetchState = "idle" | "loading" | "ok" | "error";
type PriceSort = "none" | "asc" | "desc";

// ── Mobile brands (Accessories FIRST) ───────────────────────
const MOBILE_BRANDS = [
  { name: "Apple",    slug: "apple",    icon: SiApple,    color: "#e0e0e0" },
  { name: "Samsung",  slug: "samsung",  icon: undefined,  color: "#ffffff" },
  { name: "Xiaomi",   slug: "mi",       icon: SiXiaomi,   color: "#FF6900" },
  { name: "Google",   slug: "google",   icon: SiGoogle,   color: "#4285F4" },
  { name: "Motorola", slug: "motorola", icon: SiMotorola, color: "#5DADE2" },
  { name: "Vivo",     slug: "vivo",     icon: SiVivo,     color: "#415FFF" },
  { name: "Sony",     slug: "sony",     icon: SiSony,     color: "#cccccc" },
  { name: "Realme",   slug: "realme",   icon: undefined,  color: "#FF6900" },
  { name: "Nokia",    slug: "nokia",    icon: SiNokia,    color: "#5DADE2" },
  { name: "Itel",     slug: "itel",     icon: undefined,  color: "#00BFFF" },
] as const;

const ACC_BRAND = {
  name: "Accessories",
  slug: "accessories",
  icon: undefined,
  color: "#d4af37",
};

const ALL_BRANDS = [ACC_BRAND, ...MOBILE_BRANDS] as const;

// ── XLS fetch (mobile brands only) ──────────────────────────
const BASE =
  "https://raw.githubusercontent.com/new-abra-ka-dabra/home/main/pricelist/";

async function parseXls(slug: string): Promise<TableData> {
  const res = await fetch(`${BASE}${slug}.xls?t=${Date.now()}`);
  if (!res.ok) {
    const res2 = await fetch(`${BASE}${slug}.xlsx?t=${Date.now()}`);
    if (!res2.ok) throw new Error("not found");
    return extractFirst(await res2.arrayBuffer());
  }
  return extractFirst(await res.arrayBuffer());
}

function extractFirst(buffer: ArrayBuffer): TableData {
  const wb = read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw = utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });
  const first = raw.findIndex((r) => r.some((c) => String(c).trim()));
  if (first === -1) return { headers: [], rows: [] };
  const headers = raw[first].map((c) => String(c).trim());
  const rows = raw
    .slice(first + 1)
    .filter((r) => r.some((c) => String(c).trim()))
    .map((r) => headers.map((_, i) => String(r[i] ?? "").trim()));
  return { headers, rows };
}

// ── Icon mapping for accessory product types ─────────────────
function getTypeIcon(type: string): LucideIcon {
  const t = type.toLowerCase();
  if (t.includes("speak") || t.includes("sound")) return Volume2;
  if (t.includes("cable") || t.includes("wire")) return Zap;
  if (t.includes("charg") || t.includes("adapt") || t.includes("travel")) return Plug;
  if (t.includes("blue") || t.includes("tws") || t.includes("wireless")) return Bluetooth;
  if (t.includes("head") || t.includes("ear") || t.includes("bud")) return Headphones;
  if (t.includes("watch") || t.includes("smart") || t.includes("band")) return Watch;
  if (t.includes("case") || t.includes("cover")) return Smartphone;
  if (
    t.includes("screen") || t.includes("glass") ||
    t.includes("protect") || t.includes("scratch") || t.includes("guard")
  )
    return Shield;
  if (t.includes("power") || t.includes("bank") || t.includes("batter")) return BatteryCharging;
  if (t.includes("trip") || t.includes("stand") || t.includes("mount") || t.includes("cam")) return Camera;
  if (t.includes("pencil") || t.includes("stylus") || t.includes("pen")) return Pencil;
  if (t.includes("mouse")) return Mouse;
  if (t.includes("keyboard") || t.includes("keyb")) return Keyboard;
  return Package;
}

// Map accessory type → local SVG filename in public/logos/accessories/
function getTypeImgSrc(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("speak") || t.includes("sound"))                                           return "speaker.svg";
  if (t.includes("cable") || t.includes("wire"))                                            return "cable.svg";
  if (t.includes("charg") || t.includes("adapt") || t.includes("travel"))                  return "charger.svg";
  if (t.includes("blue") || t.includes("tws") || t.includes("wireless"))                   return "earphones.svg";
  if (t.includes("head") || t.includes("ear") || t.includes("bud"))                        return "headphones.svg";
  if (t.includes("watch") || t.includes("smart") || t.includes("band"))                    return "smartwatch.svg";
  if (t.includes("case") || t.includes("cover"))                                            return "case.svg";
  if (t.includes("screen") || t.includes("glass") || t.includes("protect") ||
      t.includes("scratch") || t.includes("guard"))                                         return "screen-protector.svg";
  if (t.includes("power") || t.includes("bank") || t.includes("batter"))                   return "power-bank.svg";
  if (t.includes("trip") || t.includes("stand") || t.includes("mount") ||
      t.includes("cam"))                                                                     return "tripod.svg";
  if (t.includes("pencil") || t.includes("stylus") || t.includes("pen"))                   return "stylus.svg";
  if (t.includes("mouse"))                                                                   return "mouse.svg";
  if (t.includes("keyboard") || t.includes("keyb"))                                        return "keyboard.svg";
  return "package.svg";
}

// ── Shared price table ───────────────────────────────────────
function PriceTable({ data }: { data: TableData }) {
  if (!data.headers.length) {
    return (
      <p className="text-center text-xs text-muted-foreground py-10">
        No data in this file yet.
      </p>
    );
  }
  return (
    <div
      className="overflow-x-auto rounded-xl"
      style={{ border: "1px solid hsl(45 75% 50% / 0.18)" }}
    >
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr
            style={{
              background:
                "linear-gradient(90deg,hsl(45 75% 16%),hsl(45 75% 22%))",
            }}
          >
            {data.headers.map((h, i) => (
              <th
                key={i}
                className="text-left px-4 py-3 font-semibold whitespace-nowrap"
                style={{
                  color: "hsl(45 75% 75%)",
                  borderBottom: "1px solid hsl(45 75% 50% / 0.22)",
                  borderRight:
                    i < data.headers.length - 1
                      ? "1px solid hsl(45 75% 50% / 0.1)"
                      : "none",
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
              style={{
                background: ri % 2 === 0 ? "hsl(0 0% 6%)" : "hsl(0 0% 8%)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "hsl(45 75% 50% / 0.06)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  ri % 2 === 0 ? "hsl(0 0% 6%)" : "hsl(0 0% 8%)")
              }
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-4 py-2.5"
                  style={{
                    color:
                      ci === 0 ? "hsl(45 40% 82%)" : "hsl(0 0% 72%)",
                    fontWeight: ci === 0 ? 500 : 400,
                    borderBottom: "1px solid hsl(45 75% 50% / 0.07)",
                    borderRight:
                      ci < row.length - 1
                        ? "1px solid hsl(45 75% 50% / 0.07)"
                        : "none",
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
        style={{
          borderTop: "1px solid hsl(45 75% 50% / 0.1)",
          background: "hsl(0 0% 5%)",
        }}
      >
        {data.rows.length} item{data.rows.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

// ── Accessories: product-type grid (3 cols) ──────────────────
function AccessoryTypeGrid({
  onSelect,
}: {
  onSelect: (type: string) => void;
}) {
  const types = accData.productTypes as string[];
  const byType = accData.byType as Record<string, string[][]>;

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-4 text-center tracking-wide">
        Choose a category to view prices
      </p>
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {types.map((type) => {
          const imgSrc = `${import.meta.env.BASE_URL}logos/accessories/${getTypeImgSrc(type)}`;
          const count = byType[type]?.length ?? 0;
          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl transition-all active:scale-95 group"
              style={{
                background: "hsl(0 0% 9%)",
                border: "1.5px solid hsl(45 75% 50% / 0.15)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.border =
                  "1.5px solid hsl(45 75% 50% / 0.6)";
                (e.currentTarget as HTMLButtonElement).style.background =
                  "hsl(45 75% 50% / 0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.border =
                  "1.5px solid hsl(45 75% 50% / 0.15)";
                (e.currentTarget as HTMLButtonElement).style.background =
                  "hsl(0 0% 9%)";
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "hsl(45 75% 50% / 0.1)" }}
              >
                <img src={imgSrc} alt={type} className="w-6 h-6 object-contain" draggable={false} />
              </div>
              <span
                className="text-xs font-medium text-center leading-tight"
                style={{ color: "hsl(45 40% 82%)" }}
              >
                {type}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {count} item{count !== 1 ? "s" : ""}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Accessories: filtered & sorted price view ────────────────
function AccessoryTypeView({
  type,
  onBack,
}: {
  type: string;
  onBack: () => void;
}) {
  const byType = accData.byType as Record<string, string[][]>;
  const headers = accData.headers as string[];
  const rawRows = useMemo(() => byType[type] ?? [], [type]);

  const brandColIdx = headers.findIndex((h) => h.toLowerCase() === "brand");
  const priceColIdx = headers.findIndex((h) =>
    h.toLowerCase().includes("price")
  );

  const typeBrands = useMemo(() => {
    if (brandColIdx < 0) return [];
    return [
      ...new Set(rawRows.map((r) => r[brandColIdx]).filter(Boolean)),
    ].sort();
  }, [rawRows, brandColIdx]);

  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(
    new Set()
  );
  const [priceSort, setPriceSort] = useState<PriceSort>("none");

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  };

  const cyclePriceSort = () => {
    setPriceSort((s) =>
      s === "none" ? "asc" : s === "asc" ? "desc" : "none"
    );
  };

  const filteredRows = useMemo(() => {
    let rows = rawRows;
    if (selectedBrands.size > 0 && brandColIdx >= 0) {
      rows = rows.filter((r) => selectedBrands.has(r[brandColIdx]));
    }
    if (priceSort !== "none" && priceColIdx >= 0) {
      rows = [...rows].sort((a, b) => {
        const pa =
          parseFloat(a[priceColIdx].replace(/[^0-9.]/g, "")) || 0;
        const pb =
          parseFloat(b[priceColIdx].replace(/[^0-9.]/g, "")) || 0;
        return priceSort === "asc" ? pa - pb : pb - pa;
      });
    }
    return rows;
  }, [rawRows, selectedBrands, priceSort, brandColIdx, priceColIdx]);

  const typeImgSrc = `${import.meta.env.BASE_URL}logos/accessories/${getTypeImgSrc(type)}`;
  const hasFilters = selectedBrands.size > 0 || priceSort !== "none";

  return (
    <div>
      {/* Back + title */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all"
          style={{
            background: "hsl(0 0% 10%)",
            border: "1px solid hsl(45 75% 50% / 0.2)",
            color: "hsl(45 75% 70%)",
          }}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          All Types
        </button>
        <div className="flex items-center gap-2">
          <img src={typeImgSrc} alt={type} className="w-5 h-5 object-contain" draggable={false} />
          <h2
            className="text-sm font-serif font-semibold"
            style={{ color: "hsl(45 75% 75%)" }}
          >
            {type}
          </h2>
        </div>
      </div>

      {/* Filter + sort bar */}
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        {/* Price sort */}
        <button
          onClick={cyclePriceSort}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{
            background:
              priceSort !== "none"
                ? "hsl(45 75% 50% / 0.15)"
                : "hsl(0 0% 10%)",
            border:
              priceSort !== "none"
                ? "1.5px solid hsl(45 75% 50% / 0.6)"
                : "1.5px solid hsl(45 75% 50% / 0.15)",
            color:
              priceSort !== "none"
                ? "hsl(45 75% 80%)"
                : "hsl(0 0% 60%)",
          }}
        >
          {priceSort === "asc" ? (
            <ArrowUp className="w-3.5 h-3.5" />
          ) : priceSort === "desc" ? (
            <ArrowDown className="w-3.5 h-3.5" />
          ) : (
            <ArrowUpDown className="w-3.5 h-3.5" />
          )}
          {priceSort === "asc"
            ? "Price: Low → High"
            : priceSort === "desc"
            ? "Price: High → Low"
            : "Sort by Price"}
        </button>

        {/* Brand filter chips */}
        {typeBrands.map((brand) => {
          const active = selectedBrands.has(brand);
          return (
            <button
              key={brand}
              onClick={() => toggleBrand(brand)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: active
                  ? "hsl(45 75% 50% / 0.15)"
                  : "hsl(0 0% 10%)",
                border: active
                  ? "1.5px solid hsl(45 75% 50% / 0.6)"
                  : "1.5px solid hsl(45 75% 50% / 0.15)",
                color: active ? "hsl(45 75% 80%)" : "hsl(0 0% 60%)",
              }}
            >
              {active && <Check className="w-3 h-3" />}
              {brand}
            </button>
          );
        })}

        {/* Clear all filters */}
        {hasFilters && (
          <button
            onClick={() => {
              setSelectedBrands(new Set());
              setPriceSort("none");
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] transition-all"
            style={{
              background: "hsl(0 0% 8%)",
              border: "1px solid hsl(0 0% 22%)",
              color: "hsl(0 0% 50%)",
            }}
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="text-[11px] text-muted-foreground mb-3 pl-1">
        Showing {filteredRows.length} of {rawRows.length} item
        {rawRows.length !== 1 ? "s" : ""}
        {selectedBrands.size > 0
          ? ` · ${[...selectedBrands].join(", ")}`
          : ""}
        {priceSort !== "none"
          ? ` · sorted ${priceSort === "asc" ? "low→high" : "high→low"}`
          : ""}
      </p>

      {filteredRows.length === 0 ? (
        <div
          className="flex flex-col items-center gap-2 py-12 text-center rounded-xl"
          style={{
            background: "hsl(0 0% 6%)",
            border: "1px solid hsl(45 75% 50% / 0.1)",
          }}
        >
          <Package className="w-7 h-7 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No items match the selected filters.
          </p>
        </div>
      ) : (
        <PriceTable data={{ headers, rows: filteredRows }} />
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────
export default function PriceList() {
  const [selected, setSelected] = useState<string | null>(null);
  const [accType, setAccType] = useState<string | null>(null);
  const [cache, setCache] = useState<Record<string, TableData>>({});
  const [states, setStates] = useState<Record<string, FetchState>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectBrand = useCallback(
    async (slug: string) => {
      setSelected(slug);
      setAccType(null);
      if (slug === "accessories") return;
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
    [cache, states]
  );

  const activeBrand = ALL_BRANDS.find((b) => b.slug === selected);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 30% at 50% 0%, hsl(45 75% 50% / 0.10) 0%, transparent 65%)",
        }}
      />

      {/* ── Page header ── */}
      <div className="relative text-center pt-14 pb-5 px-4">
        <p className="text-xs tracking-[0.3em] uppercase text-[hsl(45_75%_50%)] mb-2">
          New Abra Ka Dabra
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold gold-text">
          Price List
        </h1>
        <div
          className="mt-3 h-px w-24 mx-auto"
          style={{
            background:
              "linear-gradient(90deg,transparent,hsl(45 75% 50% / 0.6),transparent)",
          }}
        />
      </div>

      {/* ── Sticky brand picker ── */}
      <div
        className="sticky top-0 z-30 pb-3 pt-2"
        style={{
          background: "hsl(0 0% 4% / 0.96)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid hsl(45 75% 50% / 0.15)",
        }}
      >
        <p className="text-center text-[11px] text-muted-foreground mb-2 tracking-wide">
          Tap a brand to see prices
        </p>
        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto px-4 pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {ALL_BRANDS.map(({ name, slug, icon, color }) => {
            const isActive = selected === slug;
            const isAcc = slug === "accessories";
            return (
              <React.Fragment key={slug}>

                <button
                  onClick={() => selectBrand(slug)}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl transition-all"
                  style={{
                    minWidth: isAcc ? "84px" : "64px",
                    background: isActive
                      ? "hsl(45 75% 50% / 0.15)"
                      : "hsl(0 0% 10%)",
                    border: isActive
                      ? "1.5px solid hsl(45 75% 50% / 0.7)"
                      : "1.5px solid hsl(45 75% 50% / 0.12)",
                    boxShadow: isActive
                      ? "0 0 14px hsl(45 75% 50% / 0.18)"
                      : "none",
                  }}
                >
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    {isAcc ? (
                      <Package className="w-5 h-5" style={{ color }} />
                    ) : (
                      <BrandLogo
                        name={name}
                        icon={
                          icon as
                            | React.ComponentType<{
                                style?: React.CSSProperties;
                              }>
                            | undefined
                        }
                        color={color}
                        size={22}
                      />
                    )}
                  </div>
                  <span
                    className="text-[10px] font-medium leading-none text-center"
                    style={{
                      color: isActive ? "hsl(45 75% 80%)" : "hsl(0 0% 65%)",
                    }}
                  >
                    {name}
                  </span>
                  {states[slug] === "loading" && (
                    <Loader2 className="w-2.5 h-2.5 animate-spin text-[hsl(45_75%_50%)]" />
                  )}
                </button>
                {/* thin separator after Accessories tile */}
                {isAcc && (
                  <div
                    className="flex-shrink-0 self-center"
                    style={{
                      width: "1px",
                      height: "52px",
                      background: "hsl(45 75% 50% / 0.35)",
                      borderRadius: "1px",
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Content area ── */}
      <div className="relative flex-1 px-4 py-5 max-w-3xl w-full mx-auto">
        {/* Nothing selected */}
        {!selected && (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "hsl(45 75% 50% / 0.08)",
                border: "1px solid hsl(45 75% 50% / 0.2)",
              }}
            >
              <Package className="w-7 h-7 text-[hsl(45_75%_50%)]" />
            </div>
            <p className="text-muted-foreground text-sm">
              Select Accessories or a mobile brand above
            </p>
          </div>
        )}

        {/* ── Accessories section ── */}
        {selected === "accessories" && (
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <Package className="w-5 h-5 text-[hsl(45_75%_62%)]" />
              <h2 className="text-base font-serif font-semibold text-[hsl(45_75%_75%)]">
                Accessories
              </h2>
            </div>

            {accType === null ? (
              <AccessoryTypeGrid onSelect={setAccType} />
            ) : (
              <AccessoryTypeView
                key={accType}
                type={accType}
                onBack={() => setAccType(null)}
              />
            )}
          </div>
        )}

        {/* ── Mobile brand price table ── */}
        {selected && selected !== "accessories" && activeBrand && (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                <BrandLogo
                  name={activeBrand.name}
                  icon={
                    activeBrand.icon as
                      | React.ComponentType<{ style?: React.CSSProperties }>
                      | undefined
                  }
                  color={activeBrand.color}
                  size={20}
                />
              </div>
              <h2 className="text-base font-serif font-semibold text-[hsl(45_75%_75%)]">
                {activeBrand.name} — Current Prices
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
                <p className="text-sm text-foreground font-medium">
                  Price file not found
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Upload{" "}
                  <code className="text-[hsl(45_75%_62%)]">
                    pricelist/{selected}.xls
                  </code>{" "}
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
  );
}
