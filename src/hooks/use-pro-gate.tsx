import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export function useProGate() {
  const navigate = useNavigate();

  const requirePro = useCallback(
    (featureName: string): boolean => {
      // For now, all users are free-tier. Connect to a real subscription check later.
      toast({
        title: `${featureName} is a Pro feature`,
        description: "Upgrade to Pro to unlock this feature.",
        action: (
          <button
            onClick={() => navigate("/pricing")}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            View Plans
          </button>
        ),
      });
      return false; // not allowed
    },
    [navigate]
  );

  const isPro = false; // placeholder

  return { isPro, requirePro };
}
