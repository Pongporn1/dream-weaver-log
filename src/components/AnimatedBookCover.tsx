import { useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { DreamLog, ENVIRONMENTS } from "@/types/dream";
import { MapPin, Users, Clock, Shield, LogOut, Sparkles } from "lucide-react";
import {
  useCoverStyle,
  AICoverStyle,
  SymbolType,
  SymbolRotation,
} from "@/hooks/useCoverStyle";
import { AISymbol } from "./AISymbol";
import { useSymbolImage } from "@/hooks/useSymbolImage";
import { generateSymbolFromAI } from "@/utils/symbolGenerator";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  type: "dot" | "star" | "ring" | "triangle" | "diamond";
  color: string;
  // AI-enhanced properties
  behaviorSeed?: number;
}

interface AnimatedBookCoverProps {
  dream: DreamLog;
}

// Environment-based color contributions
const environmentColors: Record<string, { hue: number; saturation: number }> = {
  fog: { hue: 200, saturation: 20 },
  sea: { hue: 200, saturation: 70 },
  mountain: { hue: 30, saturation: 40 },
  city: { hue: 45, saturation: 60 },
  tunnel: { hue: 280, saturation: 30 },
  rain: { hue: 220, saturation: 50 },
  night: { hue: 260, saturation: 80 },
  sunset: { hue: 15, saturation: 90 },
};

// Time system effects
const timeSystemEffects = {
  inactive: { brightness: 0.7, animSpeed: 0.3 },
  activated: { brightness: 1.2, animSpeed: 0.8 },
  unknown: { brightness: 0.9, animSpeed: 0.5 },
};

// Safety override patterns
const safetyPatterns = {
  none: "diagonal",
  helper: "circular",
  separation: "grid",
  wake: "radial",
  unknown: "noise",
} as const;

// Exit type visual cues
const exitVisuals = {
  wake: { glow: "#60a5fa", symbol: "◇" },
  separation: { glow: "#a78bfa", symbol: "◈" },
  collapse: { glow: "#f87171", symbol: "◆" },
  unknown: { glow: "#9ca3af", symbol: "○" },
};

// Threat level color intensity
const threatColors: Record<number, { base: string; accent: string }> = {
  0: { base: "#064e3b", accent: "#34d399" },
  1: { base: "#1e3a5f", accent: "#60a5fa" },
  2: { base: "#312e81", accent: "#818cf8" },
  3: { base: "#581c87", accent: "#c084fc" },
  4: { base: "#7c2d12", accent: "#fb923c" },
  5: { base: "#7f1d1d", accent: "#f87171" },
};

function hashString(str: string): number {
  return str
    .split("")
    .reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
}

// Generate unique colors based on all dream data - enhanced with AI style
function generateUniqueStyle(dream: DreamLog, aiStyle?: AICoverStyle | null) {
  // If AI style is available, use it as the primary source
  if (aiStyle) {
    const brightnessMap = { dim: 0.6, normal: 1.0, bright: 1.2, glowing: 1.5 };
    const brightness = brightnessMap[aiStyle.brightness] || 1.0;

    // Map AI pattern to internal pattern type
    const aiPatternMap: Record<
      string,
      (typeof safetyPatterns)[keyof typeof safetyPatterns]
    > = {
      waves: "diagonal",
      circles: "circular",
      stars: "radial",
      lines: "diagonal",
      dots: "grid",
      crystals: "radial",
      smoke: "noise",
      spiral: "circular",
    };

    const primary = `hsl(${aiStyle.primaryHue}, ${aiStyle.saturation}%, 25%)`;
    const secondary = `hsl(${aiStyle.secondaryHue}, ${aiStyle.saturation - 10}%, 35%)`;
    const accent = `hsl(${aiStyle.accentHue}, ${Math.min(90, aiStyle.saturation + 20)}%, 60%)`;

    return {
      primary,
      secondary,
      accent,
      gradientAngle: aiStyle.gradientAngle,
      particleCount: 20 + dream.threatLevel * 4,
      patternType: aiPatternMap[aiStyle.pattern] || "grid",
      patternSeed: hashString(aiStyle.mood + aiStyle.symbolType),
      timeEffect:
        timeSystemEffects[dream.timeSystem] || timeSystemEffects.unknown,
      exitStyle: exitVisuals[dream.exit] || exitVisuals.unknown,
      brightness,
      animSpeed:
        aiStyle.particleStyle === "pulsing"
          ? 0.8
          : aiStyle.particleStyle === "orbiting"
            ? 0.6
            : 0.4,
      aiEnhanced: true,
      aiMood: aiStyle.mood,
      aiSymbolType: aiStyle.symbolType as SymbolType,
      aiSymbolComplexity: aiStyle.symbolComplexity,
      aiSymbolRotation: aiStyle.symbolRotation as SymbolRotation,
      aiKeywords: aiStyle.keywords,
      particleStyle: aiStyle.particleStyle,
    };
  }

  // Fallback to original logic
  let avgHue = 240;
  let avgSat = 50;

  if (dream.environments && dream.environments.length > 0) {
    const envContributions = dream.environments.map(
      (env) => environmentColors[env] || { hue: 200, saturation: 50 },
    );
    avgHue =
      envContributions.reduce((sum, e) => sum + e.hue, 0) /
      envContributions.length;
    avgSat =
      envContributions.reduce((sum, e) => sum + e.saturation, 0) /
      envContributions.length;
  }

  const threatMod = threatColors[dream.threatLevel] || threatColors[2];
  const timeEffect =
    timeSystemEffects[dream.timeSystem] || timeSystemEffects.unknown;
  const patternType =
    safetyPatterns[dream.safetyOverride] || safetyPatterns.unknown;
  const exitStyle = exitVisuals[dream.exit] || exitVisuals.unknown;
  const entityCount = dream.entities?.length || 0;
  const particleCount = 10 + entityCount * 3 + dream.threatLevel * 4;

  const worldHash = hashString(dream.world || "unknown");
  const idHash = hashString(dream.id);
  const gradientAngle = (worldHash + idHash) % 360;

  const primaryHue = (avgHue + dream.threatLevel * 15) % 360;
  const secondaryHue = (primaryHue + 30 + entityCount * 10) % 360;

  const primary = `hsl(${primaryHue}, ${Math.min(90, avgSat + 20)}%, ${25 + dream.threatLevel * 3}%)`;
  const secondary = `hsl(${secondaryHue}, ${Math.min(85, avgSat + 10)}%, ${35 + dream.threatLevel * 2}%)`;
  const accent = threatMod.accent;

  const patternSeed =
    worldHash * idHash + dream.threatLevel * 100 + entityCount * 50;

  // Generate unique symbol from dream content
  const generatedSymbol = generateSymbolFromAI(
    dream.world,
    dream.environments,
    dream.entities,
    dream.threatLevel,
    dream.notes || "",
  );

  return {
    primary,
    secondary,
    accent,
    gradientAngle,
    particleCount,
    patternType,
    patternSeed,
    timeEffect,
    exitStyle,
    brightness: timeEffect.brightness,
    animSpeed: timeEffect.animSpeed * (1 + dream.threatLevel * 0.15),
    aiEnhanced: false,
    aiMood: null as string | null,
    aiSymbolType: generatedSymbol.type,
    aiSymbolComplexity: generatedSymbol.complexity,
    aiSymbolRotation: generatedSymbol.rotation,
    aiKeywords: [] as string[],
    particleStyle: "floating" as const,
  };
}

// Generate particle types based on entities and environments
function generateParticleTypes(dream: DreamLog): Particle["type"][] {
  const types: Particle["type"][] = ["dot"];

  if (
    dream.environments?.includes("night") ||
    dream.environments?.includes("sunset")
  ) {
    types.push("star");
  }
  if (
    dream.environments?.includes("fog") ||
    dream.environments?.includes("sea")
  ) {
    types.push("ring");
  }
  if (dream.threatLevel >= 3) {
    types.push("triangle");
  }
  if (dream.threatLevel >= 4) {
    types.push("diamond");
  }
  if (dream.entities && dream.entities.length > 0) {
    types.push("star", "ring");
  }

  return types;
}

export function AnimatedBookCover({ dream }: AnimatedBookCoverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  // Use AI-generated cover style if notes are available
  const { style: aiStyle, loading: aiLoading } = useCoverStyle(dream);

  // Use AI-generated symbol image
  const symbolImage = useSymbolImage(dream, aiStyle?.mood);

  const style = useMemo(
    () => generateUniqueStyle(dream, aiStyle),
    [dream, aiStyle],
  );
  const particleTypes = useMemo(() => generateParticleTypes(dream), [dream]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();

    // Initialize particles with variety based on dream data
    const initParticles = () => {
      const particles: Particle[] = [];
      const rect = canvas.getBoundingClientRect();

      for (let i = 0; i < style.particleCount; i++) {
        const typeIndex = (i + style.patternSeed) % particleTypes.length;
        particles.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * style.animSpeed,
          vy: (Math.random() - 0.5) * style.animSpeed,
          size: Math.random() * 2.5 + 0.5 + dream.threatLevel * 0.2,
          opacity: Math.random() * 0.4 + 0.2 + (style.brightness - 1) * 0.2,
          type: particleTypes[typeIndex],
          color:
            i % 3 === 0
              ? style.accent
              : i % 3 === 1
                ? style.secondary
                : "#ffffff",
        });
      }
      particlesRef.current = particles;
    };
    initParticles();

    // Draw unique patterns based on safety override
    const drawPattern = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      time: number,
    ) => {
      ctx.save();
      ctx.globalAlpha = 0.08 * style.brightness;
      ctx.strokeStyle = style.accent;
      ctx.fillStyle = style.accent;
      ctx.lineWidth = 0.5;

      const seed = style.patternSeed;

      switch (style.patternType) {
        case "diagonal":
          // Diagonal lines based on seed
          for (let i = 0; i < 12; i++) {
            const offset =
              ((seed + i * 20) % 100) - 50 + Math.sin(time * 0.001 + i) * 5;
            ctx.beginPath();
            ctx.moveTo(offset, 0);
            ctx.lineTo(offset + width, height);
            ctx.stroke();
          }
          break;

        case "circular":
          // Concentric circles from center
          for (let i = 1; i <= 5; i++) {
            const radius =
              ((i * 30 + Math.sin(time * 0.002 + i) * 10) * ((seed % 3) + 1)) /
              2;
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;

        case "grid":
          // Dynamic grid
          const gridSize = 20 + (seed % 20);
          for (let x = 0; x < width; x += gridSize) {
            for (let y = 0; y < height; y += gridSize) {
              const offset =
                Math.sin(time * 0.002 + x * 0.01 + y * 0.01 + seed * 0.01) * 3;
              ctx.beginPath();
              ctx.arc(x + offset, y + offset, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;

        case "radial":
          // Radial lines from center
          const lineCount = 8 + (seed % 8);
          for (let i = 0; i < lineCount; i++) {
            const angle = (i / lineCount) * Math.PI * 2 + time * 0.001;
            const length = 80 + Math.sin(time * 0.003 + i) * 20;
            ctx.beginPath();
            ctx.moveTo(width / 2, height / 2);
            ctx.lineTo(
              width / 2 + Math.cos(angle) * length,
              height / 2 + Math.sin(angle) * length,
            );
            ctx.stroke();
          }
          break;

        case "noise":
          // Random dots like static noise
          for (let i = 0; i < 40; i++) {
            const x = (seed * i * 7) % width;
            const y =
              ((seed * i * 11) % height) + Math.sin(time * 0.003 + i) * 2;
            const size = ((seed + i) % 3) + 1;
            ctx.globalAlpha =
              (0.05 + ((seed + i) % 10) * 0.01) * style.brightness;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
      }
      ctx.restore();
    };

    // Draw particle shapes
    const drawParticle = (
      ctx: CanvasRenderingContext2D,
      particle: Particle,
    ) => {
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;
      ctx.strokeStyle = particle.color;
      ctx.shadowBlur = particle.size * 4;
      ctx.shadowColor = particle.color;

      const { x, y, size, type } = particle;

      switch (type) {
        case "dot":
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          break;

        case "star":
          // 4-point star
          const s = size * 1.8;
          ctx.beginPath();
          ctx.moveTo(x, y - s);
          ctx.lineTo(x + s * 0.3, y);
          ctx.lineTo(x, y + s);
          ctx.lineTo(x - s * 0.3, y);
          ctx.closePath();
          ctx.fill();
          // Cross
          ctx.beginPath();
          ctx.moveTo(x - s, y);
          ctx.lineTo(x + s, y);
          ctx.moveTo(x, y - s);
          ctx.lineTo(x, y + s);
          ctx.lineWidth = 0.3;
          ctx.stroke();
          break;

        case "ring":
          ctx.beginPath();
          ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
          ctx.lineWidth = 0.8;
          ctx.stroke();
          break;

        case "triangle":
          const t = size * 2;
          ctx.beginPath();
          ctx.moveTo(x, y - t);
          ctx.lineTo(x + t * 0.866, y + t * 0.5);
          ctx.lineTo(x - t * 0.866, y + t * 0.5);
          ctx.closePath();
          ctx.fill();
          break;

        case "diamond":
          const d = size * 1.5;
          ctx.beginPath();
          ctx.moveTo(x, y - d);
          ctx.lineTo(x + d, y);
          ctx.lineTo(x, y + d);
          ctx.lineTo(x - d, y);
          ctx.closePath();
          ctx.fill();
          break;
      }
      ctx.restore();
    };

    // Animation loop
    const animate = () => {
      timeRef.current += 16;
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw gradient background with unique angle
      const angleRad = (style.gradientAngle * Math.PI) / 180;
      const x1 = rect.width / 2 - Math.cos(angleRad) * rect.width;
      const y1 = rect.height / 2 - Math.sin(angleRad) * rect.height;
      const x2 = rect.width / 2 + Math.cos(angleRad) * rect.width;
      const y2 = rect.height / 2 + Math.sin(angleRad) * rect.height;

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, style.primary);
      gradient.addColorStop(0.5, style.secondary);
      gradient.addColorStop(1, style.primary);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw pattern
      drawPattern(ctx, rect.width, rect.height, timeRef.current);

      // Draw and update particles
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = rect.width;
        if (particle.x > rect.width) particle.x = 0;
        if (particle.y < 0) particle.y = rect.height;
        if (particle.y > rect.height) particle.y = 0;

        drawParticle(ctx, particle);
      });

      // Exit type glow effect at bottom
      const exitGlow = ctx.createRadialGradient(
        rect.width / 2,
        rect.height,
        0,
        rect.width / 2,
        rect.height,
        rect.width * 0.6,
      );
      exitGlow.addColorStop(0, style.exitStyle.glow + "20");
      exitGlow.addColorStop(1, "transparent");
      ctx.fillStyle = exitGlow;
      ctx.fillRect(0, 0, rect.width, rect.height);

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [style, particleTypes, dream.threatLevel]);

  const hasEnvironments = dream.environments && dream.environments.length > 0;
  const hasEntities = dream.entities && dream.entities.length > 0;

  return (
    <Link to={`/logs/${dream.id}`} className="group block">
      <div
        className="aspect-[2/3] rounded-xl overflow-hidden relative shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02] border border-white/10"
        style={{
          boxShadow: `0 4px 24px ${style.accent}30, 0 0 40px ${style.exitStyle.glow}15`,
        }}
      >
        {/* AI-generated Cover Image (full background) */}
        {symbolImage.symbolUrl && !symbolImage.loading && (
          <img
            src={symbolImage.symbolUrl}
            alt="Dream cover"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {/* Animated Canvas Effects (overlay on top of AI image) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full mix-blend-overlay opacity-60"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Bar - ID & Threat */}
        <div className="absolute top-0 left-0 right-0 p-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-[8px] text-white/50 font-mono bg-black/30 px-1.5 py-0.5 rounded backdrop-blur-sm">
              {dream.id}
            </span>
            {/* AI Enhanced Indicator */}
            {style.aiEnhanced && (
              <span className="flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded backdrop-blur-sm bg-primary/30 text-primary-foreground">
                <Sparkles className="w-2 h-2" />
                AI
              </span>
            )}
          </div>
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: `${style.accent}30` }}
          >
            <span className="text-[10px]" style={{ color: style.accent }}>
              {style.exitStyle.symbol}
            </span>
            <span className="text-[9px] text-white/80 font-medium">
              Lv.{dream.threatLevel}
            </span>
          </div>
        </div>

        {/* Time System Indicator */}
        {dream.timeSystem !== "unknown" && (
          <div className="absolute top-9 right-2">
            <div
              className="flex items-center gap-0.5 px-1 py-0.5 rounded backdrop-blur-sm text-[8px]"
              style={{
                backgroundColor:
                  dream.timeSystem === "activated"
                    ? "rgba(96, 165, 250, 0.3)"
                    : "rgba(156, 163, 175, 0.2)",
                color: dream.timeSystem === "activated" ? "#60a5fa" : "#9ca3af",
              }}
            >
              <Clock className="w-2 h-2" />
              {dream.timeSystem === "activated" ? "ON" : "OFF"}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-3">
          {/* Loading indicator for AI cover */}
          {symbolImage.loading && (
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex flex-col items-center gap-2">
                <Sparkles className="w-6 h-6 text-white/60 animate-pulse" />
                <span className="text-[10px] text-white/40">
                  กำลังสร้างปก...
                </span>
              </div>
            </div>
          )}

          {/* World Name */}
          <h3 className="font-bold text-base sm:text-lg text-center leading-snug text-white drop-shadow-lg line-clamp-2 mb-2">
            {dream.world || "Unknown"}
          </h3>

          {/* Tags Row */}
          <div className="flex flex-wrap gap-1 justify-center mb-2">
            {hasEnvironments && (
              <span
                className="inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full backdrop-blur-sm"
                style={{
                  backgroundColor: `${style.accent}20`,
                  color: style.accent,
                }}
              >
                <MapPin className="w-2 h-2" />
                {dream.environments.length}
              </span>
            )}
            {hasEntities && (
              <span
                className="inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full backdrop-blur-sm"
                style={{
                  backgroundColor: `${style.accent}20`,
                  color: style.accent,
                }}
              >
                <Users className="w-2 h-2" />
                {dream.entities.length}
              </span>
            )}
            {dream.safetyOverride !== "none" &&
              dream.safetyOverride !== "unknown" && (
                <span
                  className="inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full backdrop-blur-sm"
                  style={{
                    backgroundColor: "rgba(167, 139, 250, 0.2)",
                    color: "#a78bfa",
                  }}
                >
                  <Shield className="w-2 h-2" />
                  {dream.safetyOverride}
                </span>
              )}
            {dream.exit !== "unknown" && (
              <span
                className="inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full backdrop-blur-sm"
                style={{
                  backgroundColor: `${style.exitStyle.glow}20`,
                  color: style.exitStyle.glow,
                }}
              >
                <LogOut className="w-2 h-2" />
                {dream.exit}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <div className="h-px w-4 bg-gradient-to-r from-transparent to-white/40" />
            <div
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: style.accent }}
            />
            <div className="h-px w-4 bg-gradient-to-l from-transparent to-white/40" />
          </div>

          {/* Date & Time */}
          <div className="text-center space-y-0.5">
            <p className="text-[10px] text-white/60 font-light tracking-wider">
              {format(new Date(dream.date), "d MMM yyyy", { locale: th })}
            </p>
            {dream.wakeTime && (
              <p className="text-[9px] text-white/40">{dream.wakeTime}</p>
            )}
          </div>
        </div>

        {/* Hover Effects */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-transparent group-hover:via-white/10 transition-all duration-700 transform translate-x-full group-hover:translate-x-0" />
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `inset 0 0 30px ${style.accent}40` }}
        />
      </div>
    </Link>
  );
}
