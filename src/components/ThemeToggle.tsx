import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ThemeToggleProps {
  asSidebarButton?: boolean;
}

export function ThemeToggle({ asSidebarButton = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    const root = document.documentElement;
    root.classList.add("theme-transition");
    setTheme(next);
    localStorage.setItem("app-theme", next);
    window.setTimeout(() => root.classList.remove("theme-transition"), 350);
  };

  if (asSidebarButton) {
    return (
      <button
        onClick={toggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-amber-500/10 dark:hover:bg-indigo-500/10 hover:text-amber-600 dark:hover:text-indigo-300 rounded-lg transition-colors"
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <div className="relative h-4 w-4">
          <Sun className="absolute inset-0 h-4 w-4 transition-all duration-300 ease-in-out rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute inset-0 h-4 w-4 transition-all duration-300 ease-in-out rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
        </div>
        <span className="flex-1 text-left">{isDark ? "Light Mode" : "Dark Mode"}</span>
      </button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="h-9 w-9 rounded-lg"
        >
          <div className="relative h-4 w-4">
            <Sun className="absolute inset-0 h-4 w-4 transition-all duration-300 ease-in-out rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute inset-0 h-4 w-4 transition-all duration-300 ease-in-out rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
          </div>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{isDark ? "Switch to light mode" : "Switch to dark mode"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
