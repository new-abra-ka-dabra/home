import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

const xlsxPath = join(rootDir, "data", "accessories.xlsx");
const outDir = join(rootDir, "src", "data");
const outPath = join(outDir, "accessories.json");

if (!existsSync(xlsxPath)) {
  console.warn("[parse-accessories] No data/accessories.xlsx found – skipping.");
  process.exit(0);
}

const req = createRequire(import.meta.url);
const XLSX = req("xlsx");

const wb = XLSX.readFile(xlsxPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });

const headerIdx = raw.findIndex((r) => r.some((c) => String(c).trim()));
if (headerIdx === -1) {
  console.warn("[parse-accessories] Empty sheet.");
  process.exit(0);
}

const allHeaders = raw[headerIdx].map((c) => String(c).trim());
const typeIdx = allHeaders.findIndex(
  (h) => h.toLowerCase().replace(/\s+/g, "") === "producttype" || h.toLowerCase() === "type"
);
const brandIdx = allHeaders.findIndex((h) => h.toLowerCase() === "brand");
const dataHeaders = allHeaders.filter((_, i) => i !== typeIdx);

const rows = raw
  .slice(headerIdx + 1)
  .filter((r) => r.some((c) => String(c).trim()))
  .map((r) => allHeaders.map((_, i) => String(r[i] ?? "").trim()));

const byType = {};
const typeSet = new Set();
const brandSet = new Set();

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

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, JSON.stringify(result, null, 2));

console.log(
  `[parse-accessories] ✓ ${rows.length} rows → ${typeSet.size} types: ${[...typeSet].join(", ")}`
);
