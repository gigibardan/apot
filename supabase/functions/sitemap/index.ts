import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Sitemap Generation Edge Function
 * Generates dynamic XML sitemap for SEO
 * 
 * Usage: GET /sitemap
 * Returns: XML sitemap with all public routes
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const baseUrl = "https://apot.ro"; // Update with your actual domain
    const today = new Date().toISOString().split("T")[0];

    // Static pages (high priority)
    const staticPages = [
      { url: "/", changefreq: "daily", priority: "1.0" },
      { url: "/obiective", changefreq: "daily", priority: "0.9" },
      { url: "/blog", changefreq: "weekly", priority: "0.8" },
      { url: "/despre", changefreq: "monthly", priority: "0.7" },
      { url: "/contact", changefreq: "monthly", priority: "0.7" },
    ];

    // TODO: When objectives/blog are in DB, fetch dynamically
    // const { data: objectives } = await supabase
    //   .from('objectives')
    //   .select('slug, updated_at')
    //   .eq('published', true);

    // Build XML sitemap
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach((page) => {
      sitemap += "  <url>\n";
      sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
      sitemap += `    <lastmod>${today}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += "  </url>\n";
    });

    // TODO: Add dynamic objective pages when ready
    // objectives?.forEach((obj) => {
    //   sitemap += '  <url>\n';
    //   sitemap += `    <loc>${baseUrl}/obiective/${obj.slug}</loc>\n`;
    //   sitemap += `    <lastmod>${obj.updated_at}</lastmod>\n`;
    //   sitemap += `    <changefreq>weekly</changefreq>\n`;
    //   sitemap += `    <priority>0.8</priority>\n`;
    //   sitemap += '  </url>\n';
    // });

    sitemap += "</urlset>";

    console.log("Sitemap generated successfully");

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);

    return new Response(
      JSON.stringify({ error: "Failed to generate sitemap" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
