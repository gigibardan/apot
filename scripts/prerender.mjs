/**
 * Prerender script pentru paginile critice SEO
 *
 * Generează HTML static (deja randat) pentru:
 *  - homepage
 *  - /obiective + fiecare obiectiv individual
 *  - /blog + fiecare articol
 *  - /ghizi-autorizati (doar pagina de listă, NU cei 2553 ghizi individuali)
 *
 * Rulează DUPĂ "vite build" (vezi package.json -> script "build").
 * Pornește un server local care servește build-ul, deschide fiecare
 * pagină într-un browser headless, așteaptă ca React Query să termine
 * de încărcat datele, apoi salvează HTML-ul rezultat ca fișier static.
 *
 * Vercel servește automat fișierul static dacy.html dacă există,
 * în loc de fallback-ul SPA gol — deci Google primește conținut deja randat.
 */

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { createServer } from "vite";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT, "dist");
const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Lipsesc VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY din environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Construiește lista de rute de prerandat.
 * IMPORTANT: aici limităm intenționat la paginile cu volum mic.
 * Ghizii SITUR individuali (2553) NU sunt incluși — rămân SPA deocamdată.
 */
async function getRoutesToPrerender() {
  const routes = ["/", "/obiective", "/blog", "/ghizi-autorizati"];

  const { data: objectives, error: objError } = await supabase
    .from("objectives")
    .select("slug")
    .eq("published", true)
    .not("slug", "is", null);

  if (objError) {
    console.error("⚠️  Eroare la citirea objectives:", objError.message);
  } else {
    for (const obj of objectives ?? []) {
      routes.push(`/obiective/${obj.slug}`);
    }
  }

  const { data: articles, error: artError } = await supabase
    .from("blog_articles")
    .select("slug")
    .eq("published", true)
    .not("slug", "is", null);

  if (artError) {
    console.error("⚠️  Eroare la citirea blog_articles:", artError.message);
  } else {
    for (const art of articles ?? []) {
      routes.push(`/blog/${art.slug}`);
    }
  }

  return routes;
}

/**
 * Convertește o rută URL în calea fișierului HTML de output.
 * "/" -> dist/index.html (deja există, îl suprascriem cu varianta randată)
 * "/obiective" -> dist/obiective/index.html
 * "/obiective/turnul-x" -> dist/obiective/turnul-x/index.html
 */
function routeToFilePath(route) {
  if (route === "/") {
    return path.join(DIST_DIR, "index.html");
  }
  return path.join(DIST_DIR, route, "index.html");
}

async function main() {
  console.log("🚀 Pornesc prerender pentru paginile SEO critice...\n");

  const routes = await getRoutesToPrerender();
  console.log(`📋 ${routes.length} rute de randat:`);
  routes.forEach((r) => console.log(`   ${r}`));
  console.log("");

  // Servim build-ul static local cu un server minimal
  const { preview } = await import("vite");
  const previewServer = await preview({
    root: ROOT,
    preview: { port: PORT, strictPort: true },
  });

  console.log(`✅ Server local pornit pe ${BASE_URL}\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext();

  let successCount = 0;
  let failCount = 0;

  for (const route of routes) {
    const page = await context.newPage();
    try {
      const url = `${BASE_URL}${route}`;
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

      // Așteptăm puțin în plus ca React Query / componentele lazy să termine randarea
      await page.waitForTimeout(800);

      const html = await page.content();

      const filePath = routeToFilePath(route);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, html, "utf-8");

      console.log(`✅ ${route} -> ${path.relative(ROOT, filePath)}`);
      successCount++;
    } catch (err) {
      console.error(`❌ ${route} -- ${err instanceof Error ? err.message : err}`);
      failCount++;
    } finally {
      await page.close();
    }
  }

  await browser.close();
  await previewServer.close();

  console.log(`\n🎉 Prerender complet: ${successCount} reușite, ${failCount} eșuate.`);

  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("💥 Prerender script a eșuat complet:", err);
  process.exit(1);
});
