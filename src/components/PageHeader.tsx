import { useState, useEffect } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth, hasLikelySession } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

interface PageHeaderProps {
  activePage?: "features" | "pricing" | "about" | "how-it-works" | "blog";
}

const navLinks = [
  { to: "/features", label: "Features", key: "features" },
  { to: "/pricing", label: "Pricing", key: "pricing" },
  { to: "/about", label: "About", key: "about" },
  { to: "/how-it-works", label: "How It Works", key: "how-it-works" },
  
];

export function PageHeader({ activePage }: PageHeaderProps) {
  const { user, loading } = useAuth();
  // Render the authenticated CTA on first paint when a prior session existed,
  // so the button doesn't flip from "Get Started" → "Open App" after hydrate.
  const showAuthed = !!user || (loading && hasLikelySession());
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-4 inset-x-0 mx-auto z-50 w-[92%] max-w-5xl transition-all duration-500 rounded-2xl ${
        scrolled ? "border border-border bg-background/70 backdrop-blur-xl shadow-lg shadow-primary/5" : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between gap-3 md:gap-6 px-3 sm:px-5 py-3">
        <Link to="/" className="flex items-center gap-2 pb-1 min-w-0 shrink-0 group">
          <img
            src="/logo.png"
            alt="Notespace"
            width={32}
            height={32}
            loading="eager"
            decoding="sync"
            {...({ fetchpriority: "high" } as any)}
            className="h-[1.224rem] w-[1.224rem] object-contain shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
          />
          <span className="font-serif text-sm sm:text-base md:text-lg font-bold text-foreground translate-y-[1px] whitespace-nowrap leading-none">
            Notespace
          </span>
        </Link>

        {/* Desktop/Tablet nav */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 shrink-0">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              to={link.to}
              className={`px-2.5 lg:px-3.5 py-1.5 rounded-xl text-[13px] lg:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activePage === link.key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to={showAuthed ? "/home" : "/auth"}
            className="magnetic-btn inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 sm:px-4 py-1.5 sm:py-2 text-[13px] sm:text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 whitespace-nowrap"
          >
            {showAuthed ? "Open App" : "Get Started"} <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((p) => !p)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="md:hidden p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 overflow-hidden bg-background/95 backdrop-blur-xl rounded-b-2xl"
          >
            <nav className="flex flex-col gap-1 p-3">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    activePage === link.key ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
