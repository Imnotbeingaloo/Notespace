// Author byline block — small, editorial, makes posts feel human-edited
// rather than machine-spit. Drop above the article body.
export function BlogByline({
  author = "The Notespace editors",
  role = "Written and edited by humans who use this stuff",
  readingTime,
  date,
}: {
  author?: string;
  role?: string;
  readingTime?: string;
  date?: string;
}) {
  const initials = author
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex items-center gap-3 py-4 my-6 border-y border-border/60">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xs font-semibold text-foreground/80 shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-tight">{author}</p>
        <p className="text-xs text-muted-foreground leading-tight mt-0.5">{role}</p>
      </div>
      {(readingTime || date) && (
        <div className="text-xs text-muted-foreground text-right shrink-0">
          {date && <div>{date}</div>}
          {readingTime && <div>{readingTime}</div>}
        </div>
      )}
    </div>
  );
}

export default BlogByline;
