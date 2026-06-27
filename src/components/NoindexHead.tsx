import { Helmet } from "react-helmet-async";

/**
 * Drop-in head for app-only routes that should never be indexed even if
 * the URL leaks (preview links, shared workspaces, etc.). Pairs with the
 * robots.txt Disallow rules and excludes the route from sitemap.xml.
 */
export function NoindexHead({ title }: { title?: string }) {
  return (
    <Helmet>
      {title && <title>{title}</title>}
      <meta name="robots" content="noindex,nofollow" />
      <meta name="googlebot" content="noindex,nofollow" />
    </Helmet>
  );
}
