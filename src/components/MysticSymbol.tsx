import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MysticSymbolProps {
  environments: string[];
  className?: string;
  color?: string;
  size?: number;
}

// Mystical geometric symbol generator based on environments
export function MysticSymbol({ 
  environments, 
  className, 
  color = "currentColor",
  size = 48 
}: MysticSymbolProps) {
  // Generate a unique symbol based on environments
  const symbolType = useMemo(() => {
    if (!environments || environments.length === 0) return "default";
    
    // Primary environment determines base symbol
    const primary = environments[0];
    
    const symbolMap: Record<string, string> = {
      fog: "nebula",
      sea: "wave",
      mountain: "pyramid",
      city: "circuit",
      tunnel: "portal",
      rain: "crystal",
      night: "star",
      sunset: "sun",
    };
    
    return symbolMap[primary] || "default";
  }, [environments]);

  // Secondary modifiers based on additional environments
  const modifiers = useMemo(() => {
    if (!environments || environments.length <= 1) return [];
    return environments.slice(1, 3);
  }, [environments]);

  const hasRing = modifiers.includes("night") || modifiers.includes("fog");
  const hasDots = modifiers.includes("rain") || modifiers.includes("sea");
  const hasLines = modifiers.includes("city") || modifiers.includes("tunnel");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={cn("transition-all duration-500", className)}
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Outer ring modifier */}
      {hasRing && (
        <circle 
          cx="24" 
          cy="24" 
          r="22" 
          strokeDasharray="4 4" 
          opacity="0.4"
          className="animate-[spin_20s_linear_infinite]"
        />
      )}

      {/* Base symbols */}
      {symbolType === "nebula" && (
        <g className="animate-pulse">
          <circle cx="24" cy="24" r="8" strokeWidth="1" />
          <circle cx="24" cy="24" r="14" strokeWidth="0.5" opacity="0.6" />
          <path d="M24 10 Q30 18 24 24 Q18 30 24 38" strokeWidth="1" />
          <path d="M10 24 Q18 18 24 24 Q30 30 38 24" strokeWidth="1" />
        </g>
      )}

      {symbolType === "wave" && (
        <g>
          <path d="M8 24 Q14 18 20 24 Q26 30 32 24 Q38 18 44 24" strokeWidth="1.5" />
          <path d="M8 30 Q14 24 20 30 Q26 36 32 30 Q38 24 44 30" strokeWidth="1" opacity="0.6" />
          <path d="M8 18 Q14 12 20 18 Q26 24 32 18 Q38 12 44 18" strokeWidth="1" opacity="0.4" />
          <circle cx="24" cy="24" r="4" fill={color} opacity="0.3" />
        </g>
      )}

      {symbolType === "pyramid" && (
        <g>
          <path d="M24 8 L40 38 L8 38 Z" strokeWidth="1.5" />
          <path d="M24 8 L24 38" strokeWidth="0.5" opacity="0.4" />
          <path d="M24 18 L18 28 L30 28 Z" strokeWidth="1" fill={color} fillOpacity="0.2" />
          <circle cx="24" cy="24" r="3" fill={color} opacity="0.5" />
        </g>
      )}

      {symbolType === "circuit" && (
        <g>
          <rect x="16" y="16" width="16" height="16" strokeWidth="1.5" rx="2" />
          <path d="M8 24 L16 24" strokeWidth="1" />
          <path d="M32 24 L40 24" strokeWidth="1" />
          <path d="M24 8 L24 16" strokeWidth="1" />
          <path d="M24 32 L24 40" strokeWidth="1" />
          <circle cx="8" cy="24" r="2" fill={color} opacity="0.5" />
          <circle cx="40" cy="24" r="2" fill={color} opacity="0.5" />
          <circle cx="24" cy="8" r="2" fill={color} opacity="0.5" />
          <circle cx="24" cy="40" r="2" fill={color} opacity="0.5" />
          <circle cx="24" cy="24" r="4" strokeWidth="1" />
        </g>
      )}

      {symbolType === "portal" && (
        <g className="animate-pulse">
          <ellipse cx="24" cy="24" rx="16" ry="20" strokeWidth="1.5" />
          <ellipse cx="24" cy="24" rx="10" ry="14" strokeWidth="1" opacity="0.6" />
          <ellipse cx="24" cy="24" rx="4" ry="8" strokeWidth="0.5" opacity="0.4" />
          <circle cx="24" cy="24" r="2" fill={color} opacity="0.8" />
        </g>
      )}

      {symbolType === "crystal" && (
        <g>
          <path d="M24 6 L30 18 L38 24 L30 30 L24 42 L18 30 L10 24 L18 18 Z" strokeWidth="1.5" />
          <path d="M24 6 L24 42" strokeWidth="0.5" opacity="0.4" />
          <path d="M10 24 L38 24" strokeWidth="0.5" opacity="0.4" />
          <path d="M18 18 L30 30" strokeWidth="0.5" opacity="0.3" />
          <path d="M30 18 L18 30" strokeWidth="0.5" opacity="0.3" />
          <circle cx="24" cy="24" r="5" fill={color} fillOpacity="0.2" />
        </g>
      )}

      {symbolType === "star" && (
        <g>
          <path d="M24 4 L28 18 L42 18 L30 28 L34 42 L24 34 L14 42 L18 28 L6 18 L20 18 Z" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="6" strokeWidth="1" opacity="0.5" />
          <circle cx="24" cy="24" r="2" fill={color} opacity="0.8" />
        </g>
      )}

      {symbolType === "sun" && (
        <g>
          <circle cx="24" cy="24" r="8" strokeWidth="1.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1={24 + Math.cos((angle * Math.PI) / 180) * 12}
              y1={24 + Math.sin((angle * Math.PI) / 180) * 12}
              x2={24 + Math.cos((angle * Math.PI) / 180) * 18}
              y2={24 + Math.sin((angle * Math.PI) / 180) * 18}
              strokeWidth={angle % 90 === 0 ? "2" : "1"}
              opacity={angle % 90 === 0 ? "1" : "0.6"}
            />
          ))}
          <circle cx="24" cy="24" r="3" fill={color} opacity="0.5" />
        </g>
      )}

      {symbolType === "default" && (
        <g>
          <circle cx="24" cy="24" r="12" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="6" strokeWidth="1" opacity="0.6" />
          <circle cx="24" cy="24" r="2" fill={color} opacity="0.8" />
          <path d="M24 12 L24 8" strokeWidth="1" />
          <path d="M24 36 L24 40" strokeWidth="1" />
          <path d="M12 24 L8 24" strokeWidth="1" />
          <path d="M36 24 L40 24" strokeWidth="1" />
        </g>
      )}

      {/* Dots modifier */}
      {hasDots && (
        <g opacity="0.5">
          <circle cx="12" cy="12" r="1.5" fill={color} />
          <circle cx="36" cy="12" r="1.5" fill={color} />
          <circle cx="12" cy="36" r="1.5" fill={color} />
          <circle cx="36" cy="36" r="1.5" fill={color} />
        </g>
      )}

      {/* Lines modifier */}
      {hasLines && (
        <g opacity="0.3">
          <line x1="4" y1="14" x2="10" y2="14" strokeWidth="1" />
          <line x1="38" y1="14" x2="44" y2="14" strokeWidth="1" />
          <line x1="4" y1="34" x2="10" y2="34" strokeWidth="1" />
          <line x1="38" y1="34" x2="44" y2="34" strokeWidth="1" />
        </g>
      )}
    </svg>
  );
}
