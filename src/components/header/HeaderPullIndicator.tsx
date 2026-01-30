import { RefreshCw, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderPullIndicatorProps {
  pullDistance: number;
  progress: number;
  isRefreshing: boolean;
  isReady: boolean;
  isPulling: boolean;
}

export function HeaderPullIndicator({
  pullDistance,
  progress,
  isRefreshing,
  isReady,
  isPulling,
}: HeaderPullIndicatorProps) {
  const showIndicator = pullDistance > 15 || isRefreshing;
  
  // Calculate visual transformations
  const scale = 0.5 + progress * 0.5;
  const rotation = progress * 180;
  const glowIntensity = progress * 0.6;

  return (
    <div
      className={cn(
        "absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none",
        "transition-all duration-300 ease-out",
        showIndicator ? "opacity-100" : "opacity-0"
      )}
      style={{
        top: Math.max(8, Math.min(pullDistance * 0.8, 80)),
        transform: `translateX(-50%) scale(${scale})`,
      }}
    >
      {/* Outer glow ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-full blur-xl transition-opacity",
          isReady ? "bg-primary/40" : "bg-white/20"
        )}
        style={{
          opacity: glowIntensity,
          transform: `scale(${1.5 + progress * 0.5})`,
        }}
      />

      {/* Main indicator */}
      <div
        className={cn(
          "relative flex items-center justify-center w-12 h-12 rounded-full",
          "backdrop-blur-md border transition-all duration-300",
          isRefreshing
            ? "bg-primary/30 border-primary/50 shadow-lg shadow-primary/20"
            : isReady
            ? "bg-primary/20 border-primary/40"
            : "bg-white/10 border-white/20"
        )}
      >
        {isRefreshing ? (
          <div className="relative">
            <RefreshCw className="w-5 h-5 text-primary animate-spin" />
            {/* Sparkle effects during refresh */}
            <Sparkles
              className="absolute -top-1 -right-1 w-3 h-3 text-primary animate-pulse"
              style={{ animationDelay: "0.2s" }}
            />
            <Sparkles
              className="absolute -bottom-1 -left-1 w-2 h-2 text-primary animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />
          </div>
        ) : (
          <ChevronDown
            className={cn(
              "w-6 h-6 transition-all duration-300",
              isReady ? "text-primary" : "text-white/70"
            )}
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          />
        )}
      </div>

      {/* Pull text */}
      <div
        className={cn(
          "absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap",
          "text-[10px] font-medium transition-all duration-300",
          isReady ? "text-primary" : "text-white/50"
        )}
        style={{
          opacity: progress > 0.3 ? 1 : 0,
          transform: `translateX(-50%) translateY(${(1 - progress) * 10}px)`,
        }}
      >
        {isRefreshing ? "กำลังโหลด..." : isReady ? "ปล่อยเพื่อรีเฟรช" : "ดึงลง..."}
      </div>

      {/* Particle trail effect */}
      {isPulling && progress > 0.2 && (
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/40"
              style={{
                left: `${50 + (i - 1) * 20}%`,
                top: `${-20 - i * 10}%`,
                opacity: progress * (0.8 - i * 0.2),
                transform: `scale(${1 - i * 0.2})`,
                animation: `float ${1 + i * 0.3}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
