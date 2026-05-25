import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ThemeToggleProps {
  asSidebarButton?: boolean;
}

export function ThemeToggle({ asSidebarButton = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("app-theme", next);
  };

  if (asSidebarButton) {
    return (
      <button
        onClick={toggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 dark:text-indigo-300 hover:bg-amber-500/10 dark:hover:bg-indigo-500/10 hover:text-amber-700 dark:hover:text-indigo-200 rounded-lg transition-colors"
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
          onClick={toggle}
          className="h-8 gap-2 rounded-xl px-3 text-xs font-medium"
        >
          <div className="relative h-4 w-4">
            <Sun className="absolute inset-0 h-4 w-4 transition-all duration-300 ease-in-out rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute inset-0 h-4 w-4 transition-all duration-300 ease-in-out rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
          </div>
          <span className="hidden sm:inline">{isDark ? "Light Mode" : "Dark Mode"}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{isDark ? "Switch to light mode" : "Switch to dark mode"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
