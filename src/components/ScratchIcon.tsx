import { forwardRef } from "react";

// Temporary chat icon — chat bubble + small hourglass (Claude/ChatGPT-style "temporary chat")
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
      {/* Chat bubble with dashed outline = ephemeral */}
      <path
        d="M21 12a8 8 0 1 1-3.2-6.4L21 4l-1 4.2A8 8 0 0 1 21 12z"
        strokeDasharray="3 2"
        fill="currentColor"
        fillOpacity="0.06"
      />
      {/* Hourglass inside bubble */}
      <path d="M9.5 9h5" strokeDasharray="0" />
      <path d="M9.5 15h5" strokeDasharray="0" />
      <path d="M9.5 9c0 2 2.5 2.6 2.5 3s-2.5 1-2.5 3" strokeDasharray="0" />
      <path d="M14.5 9c0 2-2.5 2.6-2.5 3s2.5 1 2.5 3" strokeDasharray="0" />
    </svg>
  )
);
ScratchIcon.displayName = "ScratchIcon";
