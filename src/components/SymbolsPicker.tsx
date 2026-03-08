import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface SymbolEntry {
  char: string;
  name: string;
}

const SYMBOLS: Record<string, SymbolEntry[]> = {
  Math: [
  { char: "∑", name: "summation" }, { char: "∫", name: "integral" }, { char: "√", name: "square root" },
  { char: "∞", name: "infinity" }, { char: "≠", name: "not equal" }, { char: "≈", name: "approximately" },
  { char: "≤", name: "less than or equal" }, { char: "≥", name: "greater than or equal" },
  { char: "±", name: "plus minus" }, { char: "×", name: "times" }, { char: "÷", name: "divide" },
  { char: "∂", name: "partial derivative" }, { char: "∇", name: "nabla gradient" },
  { char: "∈", name: "element of" }, { char: "∉", name: "not element of" },
  { char: "⊂", name: "subset" }, { char: "⊃", name: "superset" },
  { char: "∪", name: "union" }, { char: "∩", name: "intersection" }, { char: "∅", name: "empty set" },
  { char: "ℝ", name: "real numbers" }, { char: "ℤ", name: "integers" },
  { char: "ℕ", name: "natural numbers" }, { char: "ℚ", name: "rationals" },
  { char: "Δ", name: "delta" }, { char: "∝", name: "proportional" },
  { char: "∀", name: "for all" }, { char: "∃", name: "there exists" }],

  Greek: [
  { char: "α", name: "alpha" }, { char: "β", name: "beta" }, { char: "γ", name: "gamma" },
  { char: "δ", name: "delta" }, { char: "ε", name: "epsilon" }, { char: "ζ", name: "zeta" },
  { char: "η", name: "eta" }, { char: "θ", name: "theta" }, { char: "ι", name: "iota" },
  { char: "κ", name: "kappa" }, { char: "λ", name: "lambda" }, { char: "μ", name: "mu" },
  { char: "ν", name: "nu" }, { char: "ξ", name: "xi" }, { char: "π", name: "pi" },
  { char: "ρ", name: "rho" }, { char: "σ", name: "sigma" }, { char: "τ", name: "tau" },
  { char: "υ", name: "upsilon" }, { char: "φ", name: "phi" }, { char: "χ", name: "chi" },
  { char: "ψ", name: "psi" }, { char: "ω", name: "omega" },
  { char: "Γ", name: "Gamma" }, { char: "Θ", name: "Theta" }, { char: "Λ", name: "Lambda" },
  { char: "Σ", name: "Sigma" }, { char: "Φ", name: "Phi" }, { char: "Ψ", name: "Psi" }, { char: "Ω", name: "Omega" }],

  Arrows: [
  { char: "→", name: "right arrow" }, { char: "←", name: "left arrow" },
  { char: "↑", name: "up arrow" }, { char: "↓", name: "down arrow" },
  { char: "↔", name: "left right arrow" }, { char: "⇒", name: "implies" },
  { char: "⇐", name: "implied by" }, { char: "⇔", name: "if and only if" },
  { char: "↦", name: "maps to" }],

  "Super/Sub": [
  { char: "⁰", name: "superscript 0" }, { char: "¹", name: "superscript 1" },
  { char: "²", name: "superscript 2" }, { char: "³", name: "superscript 3" },
  { char: "⁴", name: "superscript 4" }, { char: "ⁿ", name: "superscript n" },
  { char: "₀", name: "subscript 0" }, { char: "₁", name: "subscript 1" },
  { char: "₂", name: "subscript 2" }, { char: "₃", name: "subscript 3" },
  { char: "₄", name: "subscript 4" }],

  Science: [
  { char: "°", name: "degree" }, { char: "℃", name: "celsius" }, { char: "℉", name: "fahrenheit" },
  { char: "Å", name: "angstrom" }, { char: "ħ", name: "h-bar planck" },
  { char: "µ", name: "micro" }, { char: "Ω", name: "ohm" }],

  Misc: [
  { char: "©", name: "copyright" }, { char: "®", name: "registered" }, { char: "™", name: "trademark" },
  { char: "†", name: "dagger" }, { char: "‡", name: "double dagger" },
  { char: "§", name: "section" }, { char: "¶", name: "paragraph" },
  { char: "•", name: "bullet" }, { char: "‰", name: "per mille" },
  { char: "✓", name: "check mark" }, { char: "✗", name: "cross mark" }]

};

interface SymbolsPickerProps {
  onInsert: (symbol: string) => void;
}

export function SymbolsPicker({ onInsert }: SymbolsPickerProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return SYMBOLS;
    const q = search.toLowerCase();
    const result: Record<string, SymbolEntry[]> = {};
    for (const [cat, entries] of Object.entries(SYMBOLS)) {
      const matches = entries.filter(
        (e) => e.name.toLowerCase().includes(q) || e.char.includes(q)
      );
      if (matches.length) result[cat] = matches;
    }
    return result;
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 hover:scale-105 flex-shrink-0"
          title="Insert Symbol">
          <span className="flex items-center justify-center h-4 w-4 text-[16px] font-medium leading-none">Ω</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symbols..."
              className="h-8 pl-8 text-xs" />
            
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto p-2 space-y-3">
          {Object.entries(filtered).map(([cat, entries]) =>
          <div key={cat}>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-1 mb-1">{cat}</p>
              <div className="grid grid-cols-8 gap-0.5">
                {entries.map((e) =>
              <button
                key={e.char + e.name}
                onClick={() => {onInsert(e.char);}}
                title={e.name}
                className="h-8 w-full flex items-center justify-center text-base rounded-md hover:bg-muted text-foreground transition-colors">
                
                    {e.char}
                  </button>
              )}
              </div>
            </div>
          )}
          {Object.keys(filtered).length === 0 &&
          <p className="text-xs text-muted-foreground text-center py-4">No symbols found</p>
          }
        </div>
      </PopoverContent>
    </Popover>);

}