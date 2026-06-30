import { createClient } from "@supabase/supabase-js";

export const config = {
  runtime: "edge",
};

const BASE_URL = "https://apot.club";

function escapeXml(str: string): string {
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

function toISODate(ts: string): string {
  return new Date(ts).toISOString().split("T")[0];
}

interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

function buildXml(urls: SitemapURL[]): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const url of urls) {
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(url.loc)}</loc>`);
    if (url.lastmod) lines.push(`    <lastmod>${url.lastmod}</lastmod>`);
    if (url.changefreq) lines.push(`    <changefreq>${url.changefreq}</changefreq>`);
    if (url.priority !== undefined) lines.push(`    <priority>${url.priority.toFixed(1)}</priority>`);
    lines.push("  </url>");
  }
  lines.push("</urlset>");
  return lines.join("\n");
}

export async function GET(req: Request): Promise<Response> {
  const debug = new URL(req.url).searchParams.get("debug") === "1";
  const debugInfo: Record<string, unknown> = {};

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL!;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

    debugInfo.hasUrl = !!supabaseUrl;
    debugInfo.hasKey = !!supabaseKey;
    debugInfo.urlPrefix = supabaseUrl ? supabaseUrl.slice(0, 25) : null;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const urls: SitemapURL[] = [
      { loc: BASE_URL,                        changefreq: "daily",   priority: 1.0 },
      { loc: `${BASE_URL}/obiective`,          changefreq: "daily",   priority: 0.9 },
      { loc: `${BASE_URL}/ghizi`,              changefreq: "weekly",  priority: 0.8 },
      { loc: `${BASE_URL}/ghizi-autorizati`,   changefreq: "weekly",  priority: 0.8 },
      { loc: `${BASE_URL}/blog`,               changefreq: "daily",   priority: 0.8 },
      { loc: `${BASE_URL}/circuite`,           changefreq: "weekly",  priority: 0.7 },
      { loc: `${BASE_URL}/despre`,             changefreq: "monthly", priority: 0.5 },
      { loc: `${BASE_URL}/contact`,            changefreq: "monthly", priority: 0.5 },
    ];

    const { data: objectives, error: objError } = await supabase
      .from("objectives")
      .select("slug, updated_at")
      .eq("published", true)
      .not("slug", "is", null)
      .order("updated_at", { ascending: false });

    debugInfo.objectivesCount = objectives?.length ?? 0;
    debugInfo.objectivesError = objError?.message ?? null;

    for (const obj of objectives ?? []) {
      urls.push({
        loc: `${BASE_URL}/obiective/${obj.slug}`,
        lastmod: toISODate(obj.updated_at),
        changefreq: "weekly",
        priority: 0.7,
      });
    }

    const { data: guides, error: guidesError } = await supabase
      .from("guides")
      .select("slug, updated_at")
      .eq("active", true)
      .not("slug", "is", null)
      .order("updated_at", { ascending: false });

    debugInfo.guidesCount = guides?.length ?? 0;
    debugInfo.guidesError = guidesError?.message ?? null;

    for (const guide of guides ?? []) {
      urls.push({
        loc: `${BASE_URL}/ghid/${guide.slug}`,
        lastmod: toISODate(guide.updated_at),
        changefreq: "monthly",
        priority: 0.6,
      });
    }

    const { data: authorizedGuides, error: authGuidesError } = await supabase
      .from("authorized_guides")
      .select("slug, updated_at")
      .eq("license_active", true)
      .not("slug", "is", null)
      .order("updated_at", { ascending: false });

    debugInfo.authorizedGuidesCount = authorizedGuides?.length ?? 0;
    debugInfo.authorizedGuidesError = authGuidesError?.message ?? null;

    for (const guide of authorizedGuides ?? []) {
      urls.push({
        loc: `${BASE_URL}/ghid-autorizat/${guide.slug}`,
        lastmod: toISODate(guide.updated_at),
        changefreq: "monthly",
        priority: 0.7,
      });
    }

    const { data: articles, error: articlesError } = await supabase
      .from("blog_articles")
      .select("slug, updated_at")
      .eq("published", true)
      .not("slug", "is", null)
      .order("updated_at", { ascending: false });

    debugInfo.articlesCount = articles?.length ?? 0;
    debugInfo.articlesError = articlesError?.message ?? null;

    for (const article of articles ?? []) {
      urls.push({
        loc: `${BASE_URL}/blog/${article.slug}`,
        lastmod: toISODate(article.updated_at),
        changefreq: "monthly",
        priority: 0.6,
      });
    }

    if (debug) {
      debugInfo.totalUrls = urls.length;
      return new Response(JSON.stringify(debugInfo, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const xml = buildXml(urls);

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("Sitemap error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      debug ? JSON.stringify({ ...debugInfo, fatalError: message }, null, 2) : "Error generating sitemap",
      { status: 500, headers: debug ? { "Content-Type": "application/json" } : undefined }
    );
  }
}