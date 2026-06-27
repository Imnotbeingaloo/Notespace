import { motion } from "framer-motion";
import { BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-6 pt-16 md:pt-24 pb-8 md:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-10 md:grid-cols-4 mb-16"
        >
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
            <motion.div
              className="flex items-center gap-2 mb-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-bold text-foreground whitespace-nowrap">Notebook Archive</span>
            </motion.div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              The intelligent note-taking app that helps you capture, organize, and truly understand your ideas. Built for thinkers who demand more from their tools.
            </p>
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-muted-foreground">All Systems Operational</span>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
            <h4 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              <li><Link to="/#features" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Features</Link></li>
              <li><Link to="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Pricing</Link></li>
              <li><Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">How It Works</Link></li>
              <li><Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Blog</Link></li>
              <li><Link to="/use-cases" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Use Cases</Link></li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
            <h4 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">About</Link></li>
              <li><a href="mailto:support@notebookarchive.com" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Contact</a></li>
              <li><span className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer">Privacy Policy</span></li>
              <li><span className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer">Terms of Service</span></li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}>
            <h4 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-wider">Get Started</h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Start organizing your thoughts today - it's completely free. No credit card, no commitment, no catch.
            </p>
            <Link to={user ? "/app" : "/auth"} className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow duration-300">
              {user ? "Open App" : "Sign Up Free"} <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }}>
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Notebook Archive. All rights reserved.</p>
            <p className="text-xs text-muted-foreground">Built with ❤️ for thinkers everywhere</p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
