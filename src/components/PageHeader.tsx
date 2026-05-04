import { useState, useEffect } from "react";
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
      <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-3">
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 pt-2 min-w-0 flex-shrink">
          <img src="/favicon.png" alt="Notebook Archive" className="h-6 w-6 md:h-8 md:w-8 object-contain shrink-0" />
          <span className="font-serif text-sm sm:text-base md:text-xl font-bold text-foreground translate-y-[1px] whitespace-nowrap truncate">Notebook Archive</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              to={link.to}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activePage === link.key ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            to={user ? "/app" : "/auth"}
            className="magnetic-btn inline-flex items-center gap-1 sm:gap-1.5 rounded-xl bg-primary px-2.5 py-1.5 md:px-5 md:py-2 text-[11px] sm:text-xs md:text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 whitespace-nowrap"
          >
            {user ? "Open App" : "Get Started"} <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="md:hidden p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
            className="md:hidden border-t border-border/50 overflow-hidden"
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
