import { Helmet } from "react-helmet-async";
import { siteConfig } from "@/lib/config/site.config";
import { seoDefaults } from "@/lib/constants/seo-defaults";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
  noindex?: boolean;
  structuredData?: object;
}

/**
 * SEO Component
 * Manages meta tags, Open Graph, structured data for each page
 * Uses React Helmet Async for dynamic head management
 */
export function SEO({
  title,
  description = seoDefaults.defaultDescription,
  canonical,
  ogType = "website",
  ogImage = seoDefaults.defaultOgImage,
  article,
  noindex = false,
  structuredData,
}: SEOProps) {
  const pageTitle = title
    ? `${title} | ${siteConfig.name}`
    : seoDefaults.defaultTitle;

  const fullCanonical = canonical
    ? `${siteConfig.url}${canonical}`
    : siteConfig.url;

  const fullOgImage = ogImage.startsWith("http")
    ? ogImage
    : `${siteConfig.url}${ogImage}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonical} />

      {/* Keywords */}
      <meta name="keywords" content={seoDefaults.keywords.join(", ")} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:locale" content={siteConfig.locale} />
      <meta property="og:site_name" content={siteConfig.fullName} />

      {/* Article specific tags */}
      {article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && (
            <meta property="article:author" content={article.author} />
          )}
          {article.tags?.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content={seoDefaults.twitterCard} />
      <meta name="twitter:site" content={seoDefaults.twitterSite} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Default Structured Data - Organization */}
      {!structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(seoDefaults.structuredData)}
        </script>
      )}
    </Helmet>
  );
}
