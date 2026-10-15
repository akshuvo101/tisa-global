
"use client";

import { useId } from "react";

export default function TisaBrandMark() {
  const rawId = useId();
  const id = rawId.replace(/:/g, "");

  const ocean = `${id}-ocean`;
  const land = `${id}-land`;
  const rim = `${id}-rim`;
  const glow = `${id}-glow`;
  const sphere = `${id}-sphere`;
  const orbit = `${id}-orbit`;
  const plane = `${id}-plane`;

  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="TISA Global globe with a flying paper airplane"
      className="h-12 w-12 shrink-0 overflow-visible sm:h-14 sm:w-14"
    >
      <defs>
        <radialGradient id={ocean} cx="30%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#155E75" />
          <stop offset="55%" stopColor="#082F49" />
          <stop offset="100%" stopColor="#020817" />
        </radialGradient>

        <linearGradient id={land} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B8FFF1" />
          <stop offset="50%" stopColor="#2DD4BF" />
          <stop offset="100%" stopColor="#0E7490" />
        </linearGradient>

        <linearGradient id={rim} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#E0FBFF" />
          <stop offset="40%" stopColor="#38BDF8" />
          <stop offset="75%" stopColor="#0F766E" />
          <stop offset="100%" stopColor="#D6B779" />
        </linearGradient>

        <radialGradient id={glow} cx="25%" cy="20%" r="85%">
          <stop offset="0%" stopColor="#67E8F9" stopOpacity=".34" />
          <stop offset="65%" stopColor="#38BDF8" stopOpacity=".06" />
          <stop offset="100%" stopColor="#020617" stopOpacity=".42" />
        </radialGradient>

        <clipPath id={sphere}>
          <circle cx="50" cy="50" r="31" />
        </clipPath>

        <path id={orbit} d="M 50,7 A 43,43 0 1 1 49.99,7" />

        <g id={plane}>
          <path
            d="M -14 -7 L 17 0 L -14 7 L -8 1.2 Z"
            fill="#F3D9A0"
            stroke="#FFF5DE"
            strokeWidth=".8"
            strokeLinejoin="round"
          />
          <path
            d="M -14 -7 L -8 1.2 L 17 0"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth=".85"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M -8 1.2 L -10 4.5 L -14 7"
            fill="none"
            stroke="#B98A45"
            strokeWidth=".7"
            strokeLinejoin="round"
          />
        </g>
      </defs>

      {/* Metallic outer rim */}
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke={`url(#${rim})`}
        strokeWidth="1.5"
        opacity=".9"
      />

      {/* Globe base */}
      <circle cx="50" cy="50" r="31" fill={`url(#${ocean})`} />

      {/* Rotating globe geography and coordinate grid */}
      <g clipPath={`url(#${sphere})`}>
        <g className="tisa-globe-spin">
          <g
            fill="none"
            stroke="#8BE7F0"
            strokeWidth=".8"
            strokeOpacity=".55"
          >
            <ellipse cx="50" cy="50" rx="12" ry="31" />
            <ellipse cx="50" cy="50" rx="25" ry="31" />
            <ellipse cx="50" cy="50" rx="31" ry="11" />
            <ellipse cx="50" cy="50" rx="31" ry="22" />
            <path d="M19 50H81" />
          </g>

          {/* Simplified continents */}
          <g fill={`url(#${land})`} stroke="#B8FFF1" strokeWidth=".45">
            <path d="M27 29L34 23L43 25L46 31L41 36L43 41L37 47L34 55L29 49L27 41L23 35Z" />
            <path d="M42 55L50 51L57 55L59 62L54 70L51 80L47 72L46 65L40 60Z" />
            <path d="M56 28L64 24L72 29L77 36L71 42L65 39L61 45L56 40L53 34Z" />
            <path d="M68 57L74 55L78 60L75 66L69 65Z" />
          </g>
        </g>

        <circle cx="50" cy="50" r="31" fill={`url(#${glow})`} />
      </g>

      {/* Atmospheric highlight */}
      <path
        d="M28 27A29 29 0 0 1 49 20"
        fill="none"
        stroke="#E0FBFF"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity=".8"
      />

      {/* Animated paper airplane */}
      <g>
        <animateMotion
          dur="8s"
          repeatCount="indefinite"
          rotate="auto"
          begin="0s"
        >
          <mpath href={`#${orbit}`} />
        </animateMotion>

        <use
          href={`#${plane}`}
          transform="scale(1.12)"
          filter="drop-shadow(0px 2px 3px #0891B255)"
        />
      </g>

      {/* Flight path */}
      <ellipse
        cx="50"
        cy="50"
        rx="43"
        ry="43"
        fill="none"
        stroke={`url(#${rim})`}
        strokeWidth=".65"
        strokeDasharray="2 5"
        opacity=".42"
      />

      <style>
        {`
          .tisa-globe-spin {
            transform-box: view-box;
            transform-origin: 50px 50px;
            animation: tisa-globe-rotation 18s linear infinite;
          }

          @keyframes tisa-globe-rotation {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @media (prefers-reduced-motion: reduce) {
            .tisa-globe-spin {
              animation: none;
            }

            svg animateMotion {
              display: none;
            }
          }
        `}
      </style>
    </svg>
  );
}