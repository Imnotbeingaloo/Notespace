import { forwardRef, useState } from "react";

/**
 * Friendly ghost icon. Interactive in two ways:
 *  1. Hovering the SVG itself wiggles + winks (works when icon is large enough).
 *  2. If the parent has the `group` class, it also reacts to that hover —
 *     useful when the icon is small inside a larger button.
 */
export const ScratchIcon = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className, style, ...props }, ref) => {
    const [selfHover, setSelfHover] = useState(false);

    return (
      <span
        className="inline-flex group/ghost"
        onMouseEnter={() => setSelfHover(true)}
        onMouseLeave={() => setSelfHover(false)}
        style={{ lineHeight: 0 }}
      >
        <svg
          ref={ref}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${className ?? ""} transition-transform duration-300 ease-out group-hover/ghost:-translate-y-0.5 group-hover/ghost:-rotate-6 group-hover:-translate-y-0.5 group-hover:-rotate-6`}
          style={{ transformOrigin: "center", ...style }}
          {...props}
        >
          {/* Ghost body */}
          <path
            d="M5 11a7 7 0 1 1 14 0v8.2c0 .6-.7.9-1.1.5l-1.4-1.3a.7.7 0 0 0-1 0L14 19.7a.7.7 0 0 1-1 0l-1.5-1.3a.7.7 0 0 0-1 0L9 19.7a.7.7 0 0 1-1 0l-1.5-1.3a.7.7 0 0 0-1 0l-1.4 1.3c-.4.4-1.1.1-1.1-.5V11z"
            fill="currentColor"
            fillOpacity="0.08"
          />
          {/* Left eye (always open) */}
          <circle cx="9.5" cy="11" r="0.9" fill="currentColor" stroke="none" />
          {/* Right eye — open by default, winks (becomes a line) on hover */}
          <circle
            cx="14.5" cy="11" r="0.9"
            fill="currentColor" stroke="none"
            className="transition-opacity duration-150 opacity-100 group-hover/ghost:opacity-0 group-hover:opacity-0"
          />
          <path
            d="M13.4 11h2.2"
            strokeWidth="1.8"
            className="transition-opacity duration-150 opacity-0 group-hover/ghost:opacity-100 group-hover:opacity-100"
          />
          {/* Mouth — small line resting, smiley arc on hover */}
          <path
            d="M11.2 13.8c.4-.4 1.2-.4 1.6 0"
            className="transition-opacity duration-150 opacity-100 group-hover/ghost:opacity-0 group-hover:opacity-0"
          />
          <path
            d="M11 13.5c.5.8 1.5.8 2 0"
            className="transition-opacity duration-150 opacity-0 group-hover/ghost:opacity-100 group-hover:opacity-100"
          />
        </svg>
      </span>
    );
  }
);
ScratchIcon.displayName = "ScratchIcon";
