/**
 * Helper for building BreadcrumbList JSON-LD.
 * Pass labeled path crumbs starting from the page just under "Home".
 * "Home" is prepended automatically.
 */
const BASE_URL = "https://notebookarchive.lovable.app";

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbsJsonLd(crumbs: Crumb[]) {
  const all: Crumb[] = [{ name: "Home", path: "/" }, ...crumbs];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${BASE_URL}${c.path}`,
    })),
  };
}
