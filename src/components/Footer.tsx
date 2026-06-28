import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const linkClass =
  "inline-block text-sm text-muted-foreground hover:text-primary focus-visible:text-primary transition-all duration-200 hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:hover:translate-x-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm";
const headingClass =
  "text-sm font-semibold text-foreground mb-5 uppercase tracking-wider";

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
          className="grid gap-10 md:gap-x-10 md:gap-y-10 md:grid-cols-2 lg:gap-12 lg:grid-cols-[minmax(0,1fr)_210px_210px_210px_minmax(0,1fr)] mb-16"
        >
          <motion.div className="lg:w-min" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
            <motion.div
              className="flex items-center gap-2 mb-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <img
                src="/logo.png"
                alt="Notebook Archive"
                width={27}
                height={27}
                loading="lazy"
                decoding="async"
                className="h-[1.372rem] w-[1.372rem] object-contain shrink-0"
              />
              <span className="font-serif text-xl font-bold text-foreground whitespace-nowrap leading-none">Notebook Archive</span>
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
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
              <span className="text-xs font-mono text-muted-foreground">All Systems Operational</span>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
            <h4 className={headingClass}>Product</h4>
            <ul className="space-y-3">
              <li><Link to="/#features" className={linkClass}>Features</Link></li>
              <li><Link to="/pricing" className={linkClass}>Pricing</Link></li>
              <li><Link to="/how-it-works" className={linkClass}>How It Works</Link></li>
              <li><Link to="/blog" className={linkClass}>Blog</Link></li>
              <li><Link to="/use-cases" className={linkClass}>Use Cases</Link></li>
              <li><Link to="/templates" className={linkClass}>Templates</Link></li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.25 }}>
            <h4 className={headingClass}>For Students</h4>
            <ul className="space-y-3">
              <li><Link to="/study-planner" className={linkClass}>Study Planner</Link></li>
              <li><Link to="/blog/gcse-revision-guide-2026" className={linkClass}>GCSE Revision Guide</Link></li>
              <li><Link to="/blog/a-level-revision-guide-2026" className={linkClass}>A-Level Revision Guide</Link></li>
              <li><Link to="/pomodoro-notes" className={linkClass}>Pomodoro Timer + Notes</Link></li>
              <li><Link to="/revision-timetable" className={linkClass}>Revision Timetable Maker</Link></li>
              <li><Link to="/templates/revision-timetable-template" className={linkClass}>Revision Timetable Template</Link></li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
            <h4 className={headingClass}>Company</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className={linkClass}>About</Link></li>
              <li><a href="mailto:support@notebookarchive.com" className={linkClass}>Contact</a></li>
              <li><span className="text-sm text-muted-foreground">Privacy Policy</span></li>
              <li><span className="text-sm text-muted-foreground">Terms of Service</span></li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}>
            <h4 className={headingClass}>Get Started</h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Start organizing your thoughts today - it's completely free. No credit card, no commitment, no catch.
            </p>
            <Link
              to={user ? "/app" : "/auth"}
              className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {user ? "Open App" : "Sign Up Free"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
