import { forwardRef } from "react";

// Sticky note with a clock corner — signals a temporary, time-limited note
export const ScratchIcon = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Sticky note body with folded corner */}
      <path d="M4 4h11l5 5v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="currentColor" fillOpacity="0.08" />
      <path d="M15 4v5h5" opacity="0.7" />
      {/* Lines */}
      <path d="M6 13h7" opacity="0.6" />
      <path d="M6 17h5" opacity="0.6" />
      {/* Small clock pip (temporary) */}
      <circle cx="17.5" cy="16.5" r="3.2" fill="hsl(var(--background))" />
      <path d="M17.5 14.6v1.9l1.3 0.8" />
    </svg>
  )
);
ScratchIcon.displayName = "ScratchIcon";
