import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseAccessoriesPlugin() {
  function run() {
    const xlsxPath = path.resolve(__dirname, "data/accessories.xlsx");
    const outDir = path.resolve(__dirname, "src/data");
    const outPath = path.resolve(outDir, "accessories.json");

    if (!fs.existsSync(xlsxPath)) {
      console.log("[parse-accessories] No data/accessories.xlsx – skipping.");
      return;
    }

    const req = createRequire(import.meta.url);
    const XLSX = req("xlsx");

    const wb = XLSX.readFile(xlsxPath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });

    const headerIdx = raw.findIndex((r) => r.some((c) => String(c).trim()));
    if (headerIdx === -1) return;

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

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`[parse-accessories] ✓ ${rows.length} rows → ${typeSet.size} types: ${[...typeSet].join(", ")}`);
  }

  return {
    name: "parse-accessories",
    buildStart() { run(); },
    configureServer() { run(); },
  };
}

export default defineConfig({
  base: "/home/",
  plugins: [parseAccessoriesPlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
});
