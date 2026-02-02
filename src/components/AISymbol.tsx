import { useState } from "react";
import { Loader2 } from "lucide-react";
import { MysticSymbol } from "./MysticSymbol";
import { SymbolType, SymbolRotation } from "@/hooks/useCoverStyle";

interface AISymbolProps {
  symbolUrl: string | null;
  loading: boolean;
  fallbackType: SymbolType;
  fallbackComplexity: number;
  fallbackRotation: SymbolRotation;
  fallbackEnvironments: string[];
  color: string;
  size: number;
  id: string;
}

export function AISymbol({
  symbolUrl,
  loading,
  fallbackType,
  fallbackComplexity,
  fallbackRotation,
  fallbackEnvironments,
  color,
  size,
  id,
}: AISymbolProps) {
  const [imageError, setImageError] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <div
        className="flex items-center justify-center animate-pulse"
        style={{ width: size, height: size }}
      >
        <Loader2 className="animate-spin" style={{ color, width: size * 0.5, height: size * 0.5 }} />
      </div>
    );
  }

  // Show AI-generated image if available
  if (symbolUrl && !imageError) {
    return (
      <div
        className="relative animate-[spin_60s_linear_infinite]"
        style={{ width: size, height: size }}
      >
        <img
          src={symbolUrl}
          alt="Dream symbol"
          className="w-full h-full object-contain drop-shadow-lg"
          style={{
            filter: `drop-shadow(0 0 10px ${color}80)`,
          }}
          onError={() => setImageError(true)}
          loading="lazy"
        />
        {/* Glow overlay */}
        <div
          className="absolute inset-0 rounded-full opacity-30 blur-md pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          }}
        />
      </div>
    );
  }

  // Fallback to SVG MysticSymbol
  return (
    <MysticSymbol
      environments={fallbackEnvironments}
      symbolType={fallbackType}
      complexity={fallbackComplexity}
      rotation={fallbackRotation}
      color={color}
      size={size}
      id={id}
    />
  );
}
