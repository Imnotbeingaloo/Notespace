import { Helmet } from "react-helmet-async";

interface SeoHeadProps {
  title: string;
  description: string;
  path: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  /**
   * When true, emits `<meta name="robots" content="noindex,nofollow">` so
   * crawlers skip the page even if discovered via a shared preview link.
   * Use for app-only routes: /app, /home, /trash, /shared/*, /auth.
   */
  noindex?: boolean;
  /** Absolute or root-relative path to the social share image. Defaults to /og-image.jpg. */
  image?: string;
  /** og:type value. Use "article" for blog posts; defaults to "website". */
  type?: "website" | "article";
}

const BASE_URL = "https://notebookarchive.lovable.app";

/**
 * Per-route head tags. Overrides the static <title>, meta description,
 * canonical, and og:* shipped in index.html for JS-executing crawlers.
 */
export function SeoHead({ title, description, path, jsonLd, noindex, image }: SeoHeadProps) {
  const url = `${BASE_URL}${path}`;
  const imagePath = image ?? "/og-image.jpg";
  const imageUrl = imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`;
  const schemas = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={title} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

