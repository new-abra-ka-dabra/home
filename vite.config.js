import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Plugin: accessories.xlsx → src/data/accessories.json ─────
function parseAccessoriesPlugin() {
  function run() {
    const xlsxPath = path.resolve(__dirname, "data/accessories.xlsx");
    const outDir   = path.resolve(__dirname, "src/data");
    const outPath  = path.resolve(outDir, "accessories.json");

    if (!fs.existsSync(xlsxPath)) {
      console.log("[parse-accessories] No data/accessories.xlsx – skipping.");
      return;
    }

    const req  = createRequire(import.meta.url);
    const XLSX = req("xlsx");

    const wb    = XLSX.readFile(xlsxPath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const raw   = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });

    const headerIdx = raw.findIndex((r) => r.some((c) => String(c).trim()));
    if (headerIdx === -1) return;

    const allHeaders = raw[headerIdx].map((c) => String(c).trim());
    const typeIdx    = allHeaders.findIndex(
      (h) => h.toLowerCase().replace(/\s+/g, "") === "producttype" || h.toLowerCase() === "type"
    );
    const brandIdx   = allHeaders.findIndex((h) => h.toLowerCase() === "brand");
    const dataHeaders = allHeaders.filter((_, i) => i !== typeIdx);

    const rows = raw
      .slice(headerIdx + 1)
      .filter((r) => r.some((c) => String(c).trim()))
      .map((r) => allHeaders.map((_, i) => String(r[i] ?? "").trim()));

    const byType = {}, typeSet = new Set(), brandSet = new Set();
    rows.forEach((r) => {
      const type = (typeIdx >= 0 ? r[typeIdx] : "") || "Other";
      typeSet.add(type);
      if (brandIdx >= 0 && r[brandIdx]) brandSet.add(r[brandIdx]);
      if (!byType[type]) byType[type] = [];
      byType[type].push(r.filter((_, i) => i !== typeIdx));
    });

    const result = {
      headers: dataHeaders,
      productTypes: [...typeSet].sort(),
      brands: [...brandSet].sort(),
      byType,
    };

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`[parse-accessories] ✓ ${rows.length} rows → ${typeSet.size} types`);
  }

  return { name: "parse-accessories", buildStart() { run(); }, configureServer() { run(); } };
}

// ── Plugin: pricelist/ → public/pricelist/ + index.json ──────
//
// Supports up to 3 levels:
//   brand.xls(x)                  → brand=slug,  sub=none,   subsub=none
//   brand-sub.xls(x)              → brand=slug,  sub="sub",  subsub=none
//   brand-sub-subsub.xls(x)       → brand=slug,  sub="sub",  subsub="subsub"
//
// index.json shape:
//   { "apple": { "mobiles": ["global","indian"], "tablets": [] }, "mi": {} }
//   Empty object  {} = single file (brand.xls)
//   Empty array   [] = single sub file (brand-sub.xls), no level-3
//   Non-empty arr    = level-3 files exist (brand-sub-subsub.xls)
//
function pricelistPlugin() {
  function run() {
    const srcDir  = path.resolve(__dirname, "pricelist");
    const destDir = path.resolve(__dirname, "public/pricelist");

    if (!fs.existsSync(srcDir)) {
      console.log("[pricelist] No pricelist/ folder – skipping.");
      return;
    }

    fs.mkdirSync(destDir, { recursive: true });

    const files = fs.readdirSync(srcDir).filter((f) => /\.(xls|xlsx)$/i.test(f));

    // Copy every file to public/pricelist/
    files.forEach((f) => fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f)));

    // Build 3-level map
    const map = {};
    files.forEach((f) => {
      const base  = f.replace(/\.(xlsx?)$/i, "");
      const parts = base.split("-");

      if (parts.length === 1) {
        // brand.xlsx
        if (!map[parts[0]]) map[parts[0]] = {};

      } else if (parts.length === 2) {
        // brand-sub.xlsx
        const [slug, sub] = parts;
        if (!map[slug])       map[slug] = {};
        if (!map[slug][sub])  map[slug][sub] = [];

      } else {
        // brand-sub-subsub.xlsx  (subsub may itself contain dashes)
        const slug   = parts[0];
        const sub    = parts[1];
        const subsub = parts.slice(2).join("-");
        if (!map[slug])      map[slug] = {};
        if (!map[slug][sub]) map[slug][sub] = [];
        map[slug][sub].push(subsub);
      }
    });

    fs.writeFileSync(path.join(destDir, "index.json"), JSON.stringify(map, null, 2));

    const total  = files.length;
    const brands = Object.keys(map).length;
    console.log(`[pricelist] ✓ ${total} file(s) → ${brands} brand(s): ${Object.keys(map).join(", ")}`);
  }

  return { name: "pricelist", buildStart() { run(); }, configureServer() { run(); } };
}

export default defineConfig({
  base: "/home/",
  plugins: [parseAccessoriesPlugin(), pricelistPlugin(), react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  build: { outDir: "docs", emptyOutDir: true },
  server: { port: 5000, host: "0.0.0.0", allowedHosts: true },
});
