import { useState } from "react";
import { BookOpen, ArrowRight, Menu, X } from "lucide-react";
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
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-serif text-xl font-bold text-foreground">Notebook Archive</span>
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
            className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20"
          >
            {user ? "Open App" : "Get Started"} <ArrowRight className="h-4 w-4" />
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
