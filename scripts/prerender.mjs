/**
 * Prerender script pentru paginile critice SEO
 *
 * RULEAZĂ LOCAL (pe mașina ta), NU pe Vercel -- mediul de build Vercel
 * nu are librăriile de sistem necesare pentru Chromium headless.
 *
 * Flux:
 *   1. npm run build:prerender   (local, pe mașina ta)
 *   2. git add public/obiective public/blog public/ghizi-autorizati
 *   3. git commit + push
 *   4. Vercel face build normal (fără Playwright) și servește fișierele statice
 *
 * Generează HTML static (deja randat) pentru:
 *  - homepage
 *  - /obiective + fiecare obiectiv individual
 *  - /blog + fiecare articol
 *  - /ghizi-autorizati (doar pagina de listă, NU cei 2553 ghizi individuali)
 */

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Node nu citește automat .env.local ca Vite -- îl încărcăm explicit.
// Încercăm .env.local întâi (prioritate, ca la Vite), apoi .env ca fallback.
dotenv.config({ path: path.join(ROOT, ".env.local") });
dotenv.config({ path: path.join(ROOT, ".env") });

const PUBLIC_DIR = path.join(ROOT, "public");
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
  const routes = ["/obiective", "/blog", "/ghizi-autorizati"];

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
 * Scriem în public/, NU în dist/, pentru că acest script rulează
 * local înainte de commit -- fișierele trebuie să fie în Git, ca să
 * existe deja când Vercel face build-ul normal (vite build le copiază
 * automat din public/ în dist/).
 *
 * "/" -> NU suprascriem public/index.html (ar strica index-ul SPA normal
 *        pe care vite build îl generează din src/) -- homepage rămâne SPA.
 * "/obiective" -> public/obiective/index.html
 * "/obiective/turnul-x" -> public/obiective/turnul-x/index.html
 */
function routeToFilePath(route) {
  return path.join(PUBLIC_DIR, route, "index.html");
}

async function main() {
  console.log("🚀 Pornesc prerender LOCAL pentru paginile SEO critice...\n");
  console.log("ℹ️  Acest script rulează doar pe mașina ta, NU pe Vercel.\n");

  const routes = await getRoutesToPrerender();
  console.log(`📋 ${routes.length} rute de randat:`);
  routes.forEach((r) => console.log(`   ${r}`));
  console.log("");

  // Servim build-ul existent din dist/ (rulează "npm run build" normal ÎNAINTE
  // de acest script, ca dist/ să existe deja cu ultima variantă a aplicației).
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
    console.log(`⏳ Randez: ${route}...`);
    const page = await context.newPage();
    try {
      const url = `${BASE_URL}${route}`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

      // Așteptăm explicit ca un element de conținut real să apară în DOM,
      // în loc să ne bazăm pe "networkidle" (nesigur pe SPA cu conexiuni
      // persistente: Supabase realtime, polling, websockets etc).
      try {
        await page.waitForSelector("h1", { timeout: 15000 });
      } catch {
        // Dacă nu apare niciun <h1> în 15s, continuăm oricum --
        // mai bine salvăm ce avem decât să blocăm tot build-ul.
      }

      // Mic buffer suplimentar pentru randări asincrone (imagini, hidratare)
      await page.waitForTimeout(1000);

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

// Plasă de siguranță: dacă scriptul agață mai mult de 4 minute, oprim forțat
// procesul ca să nu blocăm build-ul Vercel la infinit.
setTimeout(() => {
  console.error("⏰ Timeout global (4 min) atins -- opresc forțat scriptul.");
  process.exit(1);
}, 4 * 60 * 1000).unref?.();
