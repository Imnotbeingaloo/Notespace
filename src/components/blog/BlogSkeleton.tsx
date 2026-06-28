// Progressive-render skeleton shown while a blog post chunk loads.
// Matches PageHeader + hero + article rhythm so layout doesn't jump.
export function BlogSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border" />
      <div className="max-w-3xl mx-auto px-6 py-16 animate-pulse">
        <div className="h-3 w-24 bg-muted rounded mb-6" />
        <div className="h-10 w-11/12 bg-muted rounded mb-4" />
        <div className="h-10 w-3/4 bg-muted rounded mb-8" />
        <div className="h-4 w-40 bg-muted rounded mb-10" />
        <div className="aspect-[16/10] w-full bg-muted rounded-xl mb-10" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-11/12 bg-muted rounded" />
          <div className="h-4 w-10/12 bg-muted rounded" />
          <div className="h-4 w-9/12 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
