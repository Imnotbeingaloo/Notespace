import { Check, X } from "lucide-react";

export interface AppDetailCardProps {
  index: number;
  name: string;
  pricing: string;
  imageUrl: string;
  imageAlt: string;
  siteUrl: string;
  tagline: string;
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  ourTake?: string;
  disclosure?: string;
}

export function AppDetailCard(p: AppDetailCardProps) {
  const isOurSite = /notespace\.lovable\.app/i.test(p.siteUrl);
  let resolvedHref = p.siteUrl;
  if (isOurSite && typeof window !== "undefined") {
    try {
      const url = new URL(p.siteUrl);
      const slug = window.location.pathname.replace(/^\/+|\/+$/g, "").replace(/\//g, "-") || "blog";
      if (!url.searchParams.has("ref")) url.searchParams.set("ref", "blog");
      if (!url.searchParams.has("utm_source")) url.searchParams.set("utm_source", "blog");
      if (!url.searchParams.has("utm_medium")) url.searchParams.set("utm_medium", "organic");
      if (!url.searchParams.has("utm_campaign")) url.searchParams.set("utm_campaign", slug);
      resolvedHref = url.toString();
    } catch { /* ignore */ }
  }
  const linkRel = isOurSite ? "noopener noreferrer" : "noopener noreferrer nofollow";

  const m = /([^/]+)\.(png|jpg|jpeg)(?:\?|$)/i.exec(p.imageUrl);
  const slug = m ? m[1] : null;
  const eager = p.index === 1;

  return (
    <section className="border-t border-border pt-8 mt-8 first:border-t-0 first:pt-0 first:mt-0">
      <div className="flex items-baseline justify-between gap-4 mb-2 flex-wrap">
        <h3 className="font-serif text-2xl font-bold text-foreground">
          {p.index}. {p.name}
        </h3>
        <span className="text-sm text-muted-foreground whitespace-nowrap">{p.pricing}</span>
      </div>
      <p className="italic text-foreground/80 mb-4">{p.tagline}</p>

      {slug ? (
        <a href={resolvedHref} target="_blank" rel={linkRel} className="block mb-5">
          <picture>
            <source
              type="image/avif"
              srcSet={`/blog-img/${slug}-800.avif 800w, /blog-img/${slug}-1600.avif 1600w`}
              sizes="(max-width: 768px) 100vw, 760px"
            />
            <source
              type="image/webp"
              srcSet={`/blog-img/${slug}-800.webp 800w, /blog-img/${slug}-1600.webp 1600w`}
              sizes="(max-width: 768px) 100vw, 760px"
            />
            <img
              src={`/blog-img/${slug}-1600.webp`}
              alt={p.imageAlt}
              width={1600}
              height={1000}
              loading={eager ? "eager" : "lazy"}
              decoding="async"
              className="w-full h-auto rounded-md border border-border"
            />
          </picture>
        </a>
      ) : (
        <a href={resolvedHref} target="_blank" rel={linkRel} className="block mb-5">
          <img
            src={p.imageUrl}
            alt={p.imageAlt}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="w-full h-auto rounded-md border border-border"
          />
        </a>
      )}

      <p className="text-foreground/80 leading-relaxed mb-5">{p.description}</p>

      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Pros</h4>
          <ul className="space-y-1.5">
            {p.pros.map((pro) => (
              <li key={pro} className="flex gap-2 text-sm text-foreground/80">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Cons</h4>
          <ul className="space-y-1.5">
            {p.cons.map((con) => (
              <li key={con} className="flex gap-2 text-sm text-foreground/80">
                <X className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-sm text-foreground/80">
        <strong className="text-foreground">Best for: </strong>
        {p.bestFor}
      </p>

      {p.ourTake && (
        <p className="text-sm text-foreground/80 mt-3">
          <strong className="text-foreground">Where Notespace wins: </strong>
          {p.ourTake}
        </p>
      )}

      {p.disclosure && (
        <p className="text-xs italic text-muted-foreground mt-4">{p.disclosure}</p>
      )}
    </section>
  );
}
