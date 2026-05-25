import { forwardRef } from "react";

// Pencil drawing on a dashed-outline page — signals temporary / scratch
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
      {/* Dashed page outline */}
      <rect x="3" y="3" width="14" height="18" rx="2" strokeDasharray="2.5 2.5" opacity="0.55" />
      {/* Pencil overlay */}
      <path d="M16.2 7.6l3.2 3.2" />
      <path d="M17.6 6.2a1.7 1.7 0 0 1 2.4 2.4L11 17.6l-3.4.8.8-3.4z" fill="currentColor" fillOpacity="0.08" />
      {/* tip mark */}
      <path d="M8.4 15l1.6 1.6" opacity="0.7" />
    </svg>
  )
);
ScratchIcon.displayName = "ScratchIcon";
