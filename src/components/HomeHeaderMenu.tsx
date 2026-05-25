import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, Moon, Sun, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface HomeHeaderMenuProps {
  trashCount: number;
}

export function HomeHeaderMenu({ trashCount }: HomeHeaderMenuProps) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(false);

  const initial = (user?.email?.[0] || "U").toUpperCase();

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("app-theme", next);
    setOpen(false);
  };

  const handleSignOut = () => {
    setOpen(false);
    signOut();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Account menu"
          className="relative inline-flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary text-xs font-semibold ring-1 ring-primary/20 hover:ring-primary/40 hover:bg-primary/15 transition-all"
        >
          {initial}
          {trashCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-rose-500" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-56 p-1.5">
        <div className="px-2 py-1.5 mb-1 border-b border-border">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">Signed in</p>
          <p className="text-xs text-foreground truncate" title={user?.email || ""}>
            {user?.email || "—"}
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2 px-2.5 py-2 text-sm text-foreground rounded-md hover:bg-muted transition-colors"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="flex-1 text-left">{isDark ? "Light mode" : "Dark mode"}</span>
        </button>

        <Link
          to="/trash"
          onClick={() => setOpen(false)}
          className="w-full flex items-center gap-2 px-2.5 py-2 text-sm text-foreground rounded-md hover:bg-muted transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          <span className="flex-1 text-left">Trash</span>
          {trashCount > 0 && (
            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 rounded-full">
              {trashCount}
            </span>
          )}
        </Link>

        <div className="my-1 border-t border-border" />

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-2.5 py-2 text-sm text-rose-600 dark:text-rose-400 rounded-md hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="flex-1 text-left">Sign out</span>
        </button>
      </PopoverContent>
    </Popover>
  );
}
