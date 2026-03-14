import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          onClick={() => setTheme(isDark ? "light" : "dark")}
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
