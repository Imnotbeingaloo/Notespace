import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

interface PageHeaderProps {
  activePage?: "features" | "pricing" | "about" | "how-it-works";
}

const navLinks = [
  { to: "/#features", label: "Features", key: "features" },
  { to: "/pricing", label: "Pricing", key: "pricing" },
  { to: "/about", label: "About", key: "about" },
  { to: "/how-it-works", label: "How It Works", key: "how-it-works" },
];

export function PageHeader({ activePage }: PageHeaderProps) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <Link to="/" className="flex items-center gap-2 pt-2">
          <img src="/favicon.png" alt="Notebook Archive" className="h-7 w-7 md:h-8 md:w-8 object-contain" />
          <span className="font-serif text-base md:text-xl font-bold text-foreground translate-y-[1px] whitespace-nowrap">Notebook Archive</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              to={link.to}
              className={`text-sm font-medium transition-colors ${
                activePage === link.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to={user ? "/app" : "/auth"}
            className="magnetic-btn inline-flex items-center gap-1.5 rounded-2xl bg-primary px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 whitespace-nowrap"
          >
            {user ? "Open App" : "Get Started"} <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm font-medium py-2 transition-colors ${
                    activePage === link.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
