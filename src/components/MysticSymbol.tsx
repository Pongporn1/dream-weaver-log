import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { SymbolType, SymbolRotation } from "@/hooks/useCoverStyle";

interface MysticSymbolProps {
  // Fallback: use environments for basic symbol
  environments?: string[];
  // AI-generated symbol settings
  symbolType?: SymbolType | null;
  complexity?: number;
  rotation?: SymbolRotation;
  className?: string;
  color?: string;
  size?: number;
  // Unique identifier for consistent animation variations
  id?: string;
}

// Animation presets for different symbol types
const symbolAnimations: Record<string, string> = {
  moon: "animate-[float_6s_ease-in-out_infinite]",
  void: "animate-[pulse_4s_ease-in-out_infinite]",
  spiral: "animate-[spin_20s_linear_infinite]",
  eye: "animate-[blink_3s_steps(2,end)_infinite]",
  flame: "animate-[flicker_2s_ease-in-out_infinite]",
  heart: "animate-[heartbeat_1.5s_ease-in-out_infinite]",
  lotus: "animate-[sway_4s_ease-in-out_infinite]",
  tree: "animate-[grow_5s_ease-in-out_infinite]",
  gate: "animate-[gateWave_3s_ease-in-out_infinite]",
  crown: "animate-[crown_4s_ease-in-out_infinite]",
  compass: "animate-[spin_8s_linear_infinite]",
  infinity: "animate-[spin_12s_linear_infinite]",
};

// Animation classes for rotation
const rotationClasses: Record<SymbolRotation, string> = {
  none: "",
  slow: "animate-[spin_30s_linear_infinite]",
  medium: "animate-[spin_15s_linear_infinite]",
  pulse: "animate-pulse",
};

// Mystical geometric symbol generator
export function MysticSymbol({
  environments = [],
  symbolType: aiSymbolType,
  complexity = 3,
  rotation = "slow",
  className,
  color = "currentColor",
  size = 48,
  id = "symbol",
}: MysticSymbolProps) {
  // Determine symbol type: AI-generated or fallback to environment-based
  const symbolType = useMemo(() => {
    if (aiSymbolType) {
      console.log(
        `[MysticSymbol] Using AI symbol type: ${aiSymbolType} for ${id}`,
      );
      return aiSymbolType;
    }

    // Fallback: generate from environments
    if (!environments || environments.length === 0) {
      console.log(
        `[MysticSymbol] No environments, using default: moon for ${id}`,
      );
      return "moon";
    }

    const primary = environments[0];
    const symbolMap: Record<string, SymbolType> = {
      fog: "void",
      sea: "spiral",
      mountain: "tree",
      city: "gate",
      tunnel: "gate",
      rain: "lotus",
      night: "moon",
      sunset: "flame",
    };

    const fallbackType = symbolMap[primary] || "moon";
    console.log(
      `[MysticSymbol] Using fallback from environment "${primary}": ${fallbackType} for ${id}`,
    );
    return fallbackType;
  }, [aiSymbolType, environments, id]);

  // Get symbol-specific animation based on complexity
  const symbolAnimClass = useMemo(() => {
    // Use symbol animation unless rotation is explicitly set
    if (rotation === "none") {
      return symbolAnimations[symbolType] || "";
    }
    // If rotation is set, combine with symbol animation
    if (
      rotation === "slow" &&
      symbolType !== "spiral" &&
      symbolType !== "compass"
    ) {
      return `${symbolAnimations[symbolType] || ""} ${rotationClasses[rotation]}`;
    }
    return rotationClasses[rotation] || "";
  }, [symbolType, rotation]);

  // Complexity affects detail level (1-5)
  const showInnerRing = complexity >= 2;
  const showDecorations = complexity >= 3;
  const showOrbits = complexity >= 4;
  const showParticles = complexity >= 5;

  // Generate unique glow effect based on id and symbol type
  const glowId = `glow-${id}-${symbolType}`;
  const filterId = `filter-${id}-${symbolType}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={cn("transition-all duration-500", symbolAnimClass, className)}
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* Glow effect for mystical feel */}
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Additional filter for particles */}
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Animation styles */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          @keyframes blink {
            0%, 49%, 100% { opacity: 1; }
            50%, 99% { opacity: 0.3; }
          }
          @keyframes flicker {
            0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
            20%, 24%, 55% { opacity: 0.4; }
          }
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            14% { transform: scale(1.15); }
            28% { transform: scale(1); }
          }
          @keyframes sway {
            0%, 100% { transform: rotate(-2deg); }
            50% { transform: rotate(2deg); }
          }
          @keyframes grow {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(1.1); }
          }
          @keyframes gateWave {
            0%, 100% { transform: scaleX(1); }
            50% { transform: scaleX(0.95); }
          }
          @keyframes crown {
            0%, 100% { transform: rotate(0deg) translateY(0); }
            50% { transform: rotate(1deg) translateY(-2px); }
          }
        `}</style>
      </defs>

      {/* Outer decorations based on complexity */}
      {showOrbits && (
        <circle
          cx="24"
          cy="24"
          r="22"
          strokeDasharray="2 4"
          opacity="0.3"
          filter={`url(#${glowId})`}
        />
      )}

      {showParticles && (
        <g opacity="0.4" filter={`url(#${filterId})`}>
          <circle cx="8" cy="8" r="1" fill={color} />
          <circle cx="40" cy="8" r="1" fill={color} />
          <circle cx="8" cy="40" r="1" fill={color} />
          <circle cx="40" cy="40" r="1" fill={color} />
          <circle cx="24" cy="4" r="0.8" fill={color} />
          <circle cx="24" cy="44" r="0.8" fill={color} />
          <circle cx="4" cy="24" r="0.8" fill={color} />
          <circle cx="44" cy="24" r="0.8" fill={color} />
        </g>
      )}

      {/* Eye Symbol - Mystery, Observation */}
      {symbolType === "eye" && (
        <g>
          <ellipse cx="24" cy="24" rx="16" ry="10" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="6" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="2.5" fill={color} />
          {showInnerRing && (
            <ellipse
              cx="24"
              cy="24"
              rx="12"
              ry="7"
              strokeWidth="0.5"
              opacity="0.5"
            />
          )}
          {showDecorations && (
            <>
              <path d="M8 24 L4 24" strokeWidth="1" opacity="0.6" />
              <path d="M40 24 L44 24" strokeWidth="1" opacity="0.6" />
              <path d="M24 14 L24 10" strokeWidth="1" opacity="0.4" />
              <path d="M24 34 L24 38" strokeWidth="1" opacity="0.4" />
            </>
          )}
        </g>
      )}

      {/* Moon Symbol - Dreams, Night */}
      {symbolType === "moon" && (
        <g>
          <path
            d="M28 8 A16 16 0 1 0 28 40 A12 12 0 1 1 28 8"
            strokeWidth="1.5"
            fill={color}
            fillOpacity="0.1"
          />
          {showInnerRing && (
            <circle
              cx="20"
              cy="24"
              r="8"
              strokeWidth="0.5"
              opacity="0.4"
              strokeDasharray="2 2"
            />
          )}
          {showDecorations && (
            <>
              <circle cx="16" cy="18" r="1.5" fill={color} opacity="0.3" />
              <circle cx="14" cy="28" r="1" fill={color} opacity="0.2" />
              <circle cx="22" cy="32" r="0.8" fill={color} opacity="0.25" />
            </>
          )}
        </g>
      )}

      {/* Tree Symbol - Growth, Life */}
      {symbolType === "tree" && (
        <g>
          <path d="M24 40 L24 24" strokeWidth="2" />
          <path
            d="M24 8 L16 20 L20 20 L14 28 L18 28 L12 36 L36 36 L30 28 L34 28 L28 20 L32 20 Z"
            strokeWidth="1.5"
          />
          {showInnerRing && (
            <circle cx="24" cy="20" r="6" strokeWidth="0.5" opacity="0.3" />
          )}
          {showDecorations && (
            <>
              <circle cx="24" cy="16" r="2" fill={color} opacity="0.2" />
              <path d="M20 40 L20 38" strokeWidth="1" opacity="0.5" />
              <path d="M28 40 L28 38" strokeWidth="1" opacity="0.5" />
            </>
          )}
        </g>
      )}

      {/* Gate Symbol - Passage, Transition */}
      {symbolType === "gate" && (
        <g>
          <rect
            x="12"
            y="10"
            width="24"
            height="32"
            rx="12"
            strokeWidth="1.5"
          />
          <path d="M12 42 L36 42" strokeWidth="2" />
          {showInnerRing && (
            <rect
              x="18"
              y="16"
              width="12"
              height="20"
              rx="6"
              strokeWidth="0.5"
              opacity="0.5"
            />
          )}
          {showDecorations && (
            <>
              <circle cx="24" cy="34" r="2" fill={color} opacity="0.5" />
              <path d="M20 10 L20 6" strokeWidth="1" opacity="0.5" />
              <path d="M28 10 L28 6" strokeWidth="1" opacity="0.5" />
            </>
          )}
        </g>
      )}

      {/* Spiral Symbol - Journey, Infinity */}
      {symbolType === "spiral" && (
        <g>
          <path
            d="M24 24 C24 20 28 18 30 22 C32 26 28 30 24 28 C20 26 18 22 22 18 C26 14 32 16 34 22 C36 28 30 34 24 32 C18 30 14 24 18 18 C22 12 30 14 34 20"
            strokeWidth="1.5"
            fill="none"
          />
          {showInnerRing && (
            <circle cx="24" cy="24" r="3" fill={color} opacity="0.3" />
          )}
          {showDecorations && <circle cx="24" cy="24" r="1.5" fill={color} />}
        </g>
      )}

      {/* Flame Symbol - Power, Danger */}
      {symbolType === "flame" && (
        <g>
          <path
            d="M24 6 C20 14 14 18 14 28 C14 34 18 40 24 40 C30 40 34 34 34 28 C34 18 28 14 24 6"
            strokeWidth="1.5"
            fill={color}
            fillOpacity="0.15"
          />
          {showInnerRing && (
            <path
              d="M24 16 C22 20 18 22 18 28 C18 32 20 36 24 36 C28 36 30 32 30 28 C30 22 26 20 24 16"
              strokeWidth="0.8"
              opacity="0.5"
            />
          )}
          {showDecorations && (
            <path
              d="M24 24 C23 26 21 27 21 30 C21 32 22 34 24 34 C26 34 27 32 27 30 C27 27 25 26 24 24"
              fill={color}
              opacity="0.4"
              strokeWidth="0"
            />
          )}
        </g>
      )}

      {/* Void Symbol - Emptiness, Black Hole */}
      {symbolType === "void" && (
        <g>
          <circle cx="24" cy="24" r="14" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="8" fill={color} fillOpacity="0.8" />
          {showInnerRing && (
            <circle
              cx="24"
              cy="24"
              r="11"
              strokeWidth="0.5"
              strokeDasharray="3 3"
              opacity="0.5"
            />
          )}
          {showDecorations && (
            <>
              <path d="M24 4 L24 10" strokeWidth="1" opacity="0.4" />
              <path d="M24 38 L24 44" strokeWidth="1" opacity="0.4" />
              <path d="M4 24 L10 24" strokeWidth="1" opacity="0.4" />
              <path d="M38 24 L44 24" strokeWidth="1" opacity="0.4" />
            </>
          )}
        </g>
      )}

      {/* Crown Symbol - Power, Victory */}
      {symbolType === "crown" && (
        <g>
          <path
            d="M8 32 L12 16 L20 24 L24 12 L28 24 L36 16 L40 32 L8 32"
            strokeWidth="1.5"
          />
          <rect x="8" y="32" width="32" height="6" strokeWidth="1.5" />
          {showInnerRing && (
            <path d="M12 32 L12 28" strokeWidth="1" opacity="0.5" />
          )}
          {showDecorations && (
            <>
              <circle cx="24" cy="16" r="2" fill={color} opacity="0.5" />
              <circle cx="12" cy="20" r="1.5" fill={color} opacity="0.4" />
              <circle cx="36" cy="20" r="1.5" fill={color} opacity="0.4" />
            </>
          )}
        </g>
      )}

      {/* Key Symbol - Secret, Unlock */}
      {symbolType === "key" && (
        <g>
          <circle cx="18" cy="16" r="8" strokeWidth="1.5" />
          <circle cx="18" cy="16" r="4" strokeWidth="1" opacity="0.5" />
          <path d="M24 20 L40 36" strokeWidth="2" />
          <path d="M36 32 L40 28" strokeWidth="2" />
          <path d="M32 36 L36 40" strokeWidth="2" />
          {showDecorations && (
            <circle cx="18" cy="16" r="2" fill={color} opacity="0.5" />
          )}
        </g>
      )}

      {/* Heart Symbol - Emotion, Love */}
      {symbolType === "heart" && (
        <g>
          <path
            d="M24 40 L12 28 C6 22 6 14 12 10 C18 6 24 12 24 16 C24 12 30 6 36 10 C42 14 42 22 36 28 L24 40"
            strokeWidth="1.5"
            fill={color}
            fillOpacity="0.15"
          />
          {showInnerRing && (
            <path
              d="M24 34 L16 26 C12 22 12 18 16 15 C20 12 24 16 24 18 C24 16 28 12 32 15 C36 18 36 22 32 26 L24 34"
              strokeWidth="0.5"
              opacity="0.4"
            />
          )}
        </g>
      )}

      {/* Skull Symbol - Death, Danger */}
      {symbolType === "skull" && (
        <g>
          <ellipse cx="24" cy="20" rx="12" ry="14" strokeWidth="1.5" />
          <rect x="18" y="32" width="12" height="8" strokeWidth="1.5" />
          <circle cx="18" cy="18" r="4" fill={color} fillOpacity="0.8" />
          <circle cx="30" cy="18" r="4" fill={color} fillOpacity="0.8" />
          {showDecorations && (
            <>
              <path d="M20 28 L20 32" strokeWidth="1.5" />
              <path d="M24 28 L24 32" strokeWidth="1.5" />
              <path d="M28 28 L28 32" strokeWidth="1.5" />
            </>
          )}
        </g>
      )}

      {/* Hourglass Symbol - Time */}
      {symbolType === "hourglass" && (
        <g>
          <path
            d="M14 8 L34 8 L24 24 L34 40 L14 40 L24 24 L14 8"
            strokeWidth="1.5"
          />
          <path d="M12 8 L36 8" strokeWidth="2" />
          <path d="M12 40 L36 40" strokeWidth="2" />
          {showDecorations && (
            <>
              <path
                d="M20 14 L28 14 L24 20 L20 14"
                fill={color}
                opacity="0.3"
                strokeWidth="0"
              />
              <circle cx="24" cy="24" r="2" fill={color} opacity="0.5" />
            </>
          )}
        </g>
      )}

      {/* Compass Symbol - Direction, Journey */}
      {symbolType === "compass" && (
        <g>
          <circle cx="24" cy="24" r="16" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="3" strokeWidth="1" />
          <path d="M24 8 L26 20 L24 24 L22 20 Z" fill={color} strokeWidth="0" />
          <path
            d="M24 40 L22 28 L24 24 L26 28 Z"
            strokeWidth="1"
            opacity="0.5"
          />
          <path
            d="M8 24 L20 22 L24 24 L20 26 Z"
            strokeWidth="1"
            opacity="0.5"
          />
          <path
            d="M40 24 L28 26 L24 24 L28 22 Z"
            strokeWidth="1"
            opacity="0.5"
          />
          {showDecorations && (
            <>
              <text
                x="24"
                y="6"
                textAnchor="middle"
                fontSize="4"
                fill={color}
                opacity="0.7"
              >
                N
              </text>
              <text
                x="24"
                y="44"
                textAnchor="middle"
                fontSize="4"
                fill={color}
                opacity="0.5"
              >
                S
              </text>
            </>
          )}
        </g>
      )}

      {/* Infinity Symbol */}
      {symbolType === "infinity" && (
        <g>
          <path
            d="M12 24 C12 18 18 14 24 20 C30 26 36 22 36 16 C36 10 30 10 24 16 C18 22 12 18 12 12 C12 6 18 6 24 12 C30 18 36 14 36 8"
            strokeWidth="0"
          />
          <path
            d="M8 24 C8 16 14 12 24 24 C34 36 40 32 40 24 C40 16 34 12 24 24 C14 36 8 32 8 24"
            strokeWidth="1.5"
          />
          {showDecorations && (
            <circle cx="24" cy="24" r="2" fill={color} opacity="0.5" />
          )}
        </g>
      )}

      {/* Lotus Symbol - Peace, Awakening */}
      {symbolType === "lotus" && (
        <g>
          <ellipse
            cx="24"
            cy="38"
            rx="12"
            ry="4"
            strokeWidth="1"
            opacity="0.5"
          />
          <path d="M24 38 L24 28" strokeWidth="1.5" />
          <path
            d="M24 12 C24 18 28 22 24 28 C20 22 24 18 24 12"
            strokeWidth="1.5"
            fill={color}
            fillOpacity="0.2"
          />
          <path
            d="M16 20 C20 22 22 26 24 28 C22 24 18 22 14 22 C14 18 16 16 16 20"
            strokeWidth="1.5"
            fill={color}
            fillOpacity="0.15"
          />
          <path
            d="M32 20 C28 22 26 26 24 28 C26 24 30 22 34 22 C34 18 32 16 32 20"
            strokeWidth="1.5"
            fill={color}
            fillOpacity="0.15"
          />
          {showDecorations && (
            <>
              <path
                d="M10 26 C14 26 18 28 24 28 C18 26 14 24 10 26"
                strokeWidth="1"
                opacity="0.4"
              />
              <path
                d="M38 26 C34 26 30 28 24 28 C30 26 34 24 38 26"
                strokeWidth="1"
                opacity="0.4"
              />
            </>
          )}
        </g>
      )}
    </svg>
  );
}
