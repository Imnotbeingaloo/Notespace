import { forwardRef } from "react";

// Pencil with dashed circle outline indicating temporary/scratch
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Dashed circle */}
      <circle cx="12" cy="12" r="9.5" strokeDasharray="3 3" opacity="0.6" />
      {/* Pencil */}
      <path d="M14.5 6.5l3 3" />
      <path d="M15.5 5.5a1.5 1.5 0 1 1 2.121 2.121L9 16.243 6 17l.757-3z" />
    </svg>
  )
);
ScratchIcon.displayName = "ScratchIcon";
