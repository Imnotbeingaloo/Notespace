import { forwardRef, useState } from "react";

// Friendly ghost icon for temporary notes — floats + winks on hover
export const ScratchIcon = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className, style, ...props }, ref) => {
    const [hover, setHover] = useState(false);
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          transform: hover ? "translateY(-3px) rotate(-7deg) scale(1.08)" : "translateY(0) rotate(0deg) scale(1)",
          transition: "transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          transformOrigin: "center",
          ...style,
        }}
        {...props}
      >
        {/* Ghost body */}
        <path
          d="M5 11.3a7 7 0 0 1 14 0v7.9c0 .6-.7.9-1.1.5l-1.4-1.3a.7.7 0 0 0-1 0L14 19.7a.7.7 0 0 1-1 0l-1.5-1.3a.7.7 0 0 0-1 0L9 19.7a.7.7 0 0 1-1 0l-1.5-1.3a.7.7 0 0 0-1 0l-1.4 1.3c-.4.4-1.1.1-1.1-.5v-7.9z"
          fill="currentColor"
          fillOpacity="0.08"
        />
        {/* Eyes — wink on hover */}
        <circle cx="9.5" cy="11" r="0.9" fill="currentColor" stroke="none" />
        {hover ? (
          <path d="M13.4 11h2.2" strokeWidth="1.8" />
        ) : (
          <circle cx="14.5" cy="11" r="0.9" fill="currentColor" stroke="none" />
        )}
        {/* Mouth */}
        <path
          d={hover ? "M11 13.6c.5.7 1.5.7 2 0" : "M11.2 13.8c.4-.4 1.2-.4 1.6 0"}
        />
      </svg>
    );
  }
);
ScratchIcon.displayName = "ScratchIcon";
