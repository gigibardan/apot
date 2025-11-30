import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml",
};

interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

/**
 * Generate XML sitemap for better SEO
 * Includes all published objectives, guides, blog articles, and static pages
 */
serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("VITE_SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = "https://apot.ro";
    const urls: SitemapURL[] = [];

    // Static pages with high priority
    urls.push({
      loc: baseUrl,
      changefreq: "daily",
      priority: 1.0,
    });

    urls.push(
      { loc: `${baseUrl}/obiective`, changefreq: "daily", priority: 0.9 },
      { loc: `${baseUrl}/ghizi`, changefreq: "weekly", priority: 0.8 },
      { loc: `${baseUrl}/blog`, changefreq: "daily", priority: 0.8 },
      { loc: `${baseUrl}/despre`, changefreq: "monthly", priority: 0.5 },
      { loc: `${baseUrl}/contact`, changefreq: "monthly", priority: 0.5 }
    );

    // Fetch published objectives
    const { data: objectives } = await supabase
      .from("objectives")
      .select("slug, updated_at")
      .eq("published", true)
      .order("updated_at", { ascending: false });

    if (objectives) {
      objectives.forEach((obj) => {
        urls.push({
          loc: `${baseUrl}/obiective/${obj.slug}`,
          lastmod: new Date(obj.updated_at).toISOString(),
          changefreq: "weekly",
          priority: 0.7,
        });
      });
    }

    // Fetch active guides
    const { data: guides } = await supabase
      .from("guides")
      .select("slug, updated_at")
      .eq("active", true)
      .order("updated_at", { ascending: false });

    if (guides) {
      guides.forEach((guide) => {
        urls.push({
          loc: `${baseUrl}/ghizi/${guide.slug}`,
          lastmod: new Date(guide.updated_at).toISOString(),
          changefreq: "monthly",
          priority: 0.6,
        });
      });
    }

    // Fetch published blog articles
    const { data: articles } = await supabase
      .from("blog_articles")
      .select("slug, updated_at")
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (articles) {
      articles.forEach((article) => {
        urls.push({
          loc: `${baseUrl}/blog/${article.slug}`,
          lastmod: new Date(article.updated_at).toISOString(),
          changefreq: "monthly",
          priority: 0.6,
        });
      });
    }

    // Fetch continents
    const { data: continents } = await supabase
      .from("continents")
      .select("slug")
      .order("order_index");

    if (continents) {
      continents.forEach((continent) => {
        urls.push({
          loc: `${baseUrl}/obiective?continent=${continent.slug}`,
          changefreq: "weekly",
          priority: 0.5,
        });
      });
    }

    // Generate XML
    const xml = generateSitemapXML(urls);

    return new Response(xml, {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate sitemap";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function generateSitemapXML(urls: SitemapURL[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  urls.forEach((url) => {
    xml += "  <url>\n";
    xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
    if (url.lastmod) {
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    }
    if (url.changefreq) {
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    }
    if (url.priority !== undefined) {
      xml += `    <priority>${url.priority}</priority>\n`;
    }
    xml += "  </url>\n";
  });

  xml += "</urlset>";
  return xml;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
