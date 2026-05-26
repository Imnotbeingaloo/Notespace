import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { SeoHead } from "@/components/SeoHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <SeoHead
        title="404 — Page Not Found | Notebook Archive"
        description="The page you're looking for doesn't exist."
        path="/404"
      />
      <div className="max-w-lg w-full text-center flex flex-col items-center gap-5">
        <div className="space-y-1">
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-foreground">404</h1>
          <p className="text-lg text-muted-foreground">
            This page doesn't exist. Maybe it never did.
          </p>
        </div>
        <img
          src="/404.gif"
          alt="No way reaction"
          loading="eager"
          className="w-full max-w-[200px] rounded-2xl shadow-lg border border-border"
        />
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
