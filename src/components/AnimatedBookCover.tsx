import { useEffect, useRef, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO, isValid } from "date-fns";
import { th } from "date-fns/locale";
import { DreamLog } from "@/types/dream";
import { MapPin, Users, Clock, Shield, LogOut, Sparkles } from "lucide-react";
import { useCoverStyle, AICoverStyle, SymbolType, SymbolRotation } from "@/hooks/useCoverStyle";


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

interface FogLayer {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  color: string;
}

interface AnimatedBookCoverProps {
  dream: DreamLog;
}

interface DreamStyleInput {
  id: DreamLog["id"];
  world: DreamLog["world"];
  threatLevel: DreamLog["threatLevel"];
  timeSystem: DreamLog["timeSystem"];
  safetyOverride: DreamLog["safetyOverride"];
  exit: DreamLog["exit"];
  environments: string[];
  entityCount: number;
}

interface MagneticEntry {
  el: HTMLElement;
  rect: DOMRect;
  center: { x: number; y: number };
}

const magneticRegistry = new Map<string, MagneticEntry>();
let lastMagneticUpdate = 0;
const MAGNETIC_UPDATE_INTERVAL = 250;

function updateMagneticRegistry() {
  magneticRegistry.forEach((entry, key) => {
    if (!entry.el) {
      magneticRegistry.delete(key);
      return;
    }
    const rect = entry.el.getBoundingClientRect();
    entry.rect = rect;
    entry.center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  });
  lastMagneticUpdate = typeof performance !== "undefined" ? performance.now() : Date.now();
}

function maybeUpdateMagneticRegistry(now: number) {
  if (now - lastMagneticUpdate > MAGNETIC_UPDATE_INTERVAL) {
    updateMagneticRegistry();
  }
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
  return str.split("").reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeHue(value: number): number {
  const mod = value % 360;
  return mod < 0 ? mod + 360 : mod;
}

function toValidDate(value: DreamLog["date"] | Date | number | null | undefined): Date | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }
  if (typeof value === "string") {
    const iso = parseISO(value);
    if (isValid(iso)) return iso;
    const parsed = new Date(value);
    return isValid(parsed) ? parsed : null;
  }
  if (typeof value === "number") {
    const parsed = new Date(value);
    return isValid(parsed) ? parsed : null;
  }
  return null;
}

function withAlpha(color: string, alpha: number): string {
  const safeAlpha = Math.min(1, Math.max(0, alpha));

  if (color.startsWith("hsla(")) {
    return color.replace(/hsla\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `hsla($1,$2,$3,${safeAlpha})`);
  }
  if (color.startsWith("hsl(")) {
    return color.replace("hsl(", "hsla(").replace(")", `, ${safeAlpha})`);
  }
  if (color.startsWith("rgba(")) {
    return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${safeAlpha})`);
  }
  if (color.startsWith("rgb(")) {
    return color.replace("rgb(", "rgba(").replace(")", `, ${safeAlpha})`);
  }
  if (color.startsWith("#")) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex.split("").map((char) => char + char).join("");
    }
    if (hex.length >= 6) {
      const alphaHex = Math.round(safeAlpha * 255).toString(16).padStart(2, "0");
      return `#${hex.slice(0, 6)}${alphaHex}`;
    }
  }
  return color;
}

// Generate unique colors based on all dream data - enhanced with AI style
function generateUniqueStyle(dream: DreamStyleInput, aiStyle?: AICoverStyle | null) {
  // If AI style is available, use it as the primary source
  if (aiStyle) {
    const brightnessMap = { dim: 0.6, normal: 1.0, bright: 1.2, glowing: 1.5 };
    const brightness = brightnessMap[aiStyle.brightness] || 1.0;
    const baseSaturation = clamp(aiStyle.saturation, 0, 100);
    const secondarySaturation = clamp(aiStyle.saturation - 10, 0, 100);
    const accentSaturation = clamp(baseSaturation + 20, 0, 90);
    const primaryHue = normalizeHue(aiStyle.primaryHue);
    const secondaryHue = normalizeHue(aiStyle.secondaryHue);
    const accentHue = normalizeHue(aiStyle.accentHue);
    
    // Map AI pattern to internal pattern type
    const aiPatternMap: Record<string, typeof safetyPatterns[keyof typeof safetyPatterns]> = {
      waves: "diagonal",
      circles: "circular",
      stars: "radial",
      lines: "diagonal",
      dots: "grid",
      crystals: "radial",
      smoke: "noise",
      spiral: "circular",
    };
    
    const primary = `hsl(${primaryHue}, ${baseSaturation}%, 25%)`;
    const secondary = `hsl(${secondaryHue}, ${secondarySaturation}%, 35%)`;
    const accent = `hsl(${accentHue}, ${accentSaturation}%, 60%)`;
    
    return {
      primary,
      secondary,
      accent,
      gradientAngle: normalizeHue(aiStyle.gradientAngle),
      particleCount: 20 + dream.threatLevel * 4,
      patternType: aiPatternMap[aiStyle.pattern] || "grid",
      patternSeed: hashString(aiStyle.mood + aiStyle.symbolType),
      timeEffect: timeSystemEffects[dream.timeSystem] || timeSystemEffects.unknown,
      exitStyle: exitVisuals[dream.exit] || exitVisuals.unknown,
      brightness,
      animSpeed: aiStyle.particleStyle === "pulsing" ? 0.8 : 
                 aiStyle.particleStyle === "orbiting" ? 0.6 : 0.4,
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
    const envContributions = dream.environments.map(env => 
      environmentColors[env] || { hue: 200, saturation: 50 }
    );
    avgHue = envContributions.reduce((sum, e) => sum + e.hue, 0) / envContributions.length;
    avgSat = envContributions.reduce((sum, e) => sum + e.saturation, 0) / envContributions.length;
  }

  const threatMod = threatColors[dream.threatLevel] || threatColors[2];
  const timeEffect = timeSystemEffects[dream.timeSystem] || timeSystemEffects.unknown;
  const patternType = safetyPatterns[dream.safetyOverride] || safetyPatterns.unknown;
  const exitStyle = exitVisuals[dream.exit] || exitVisuals.unknown;
  const entityCount = dream.entityCount;
  const particleCount = 10 + entityCount * 3 + dream.threatLevel * 4;
  
  const worldHash = hashString(dream.world || "unknown");
  const idHash = hashString(dream.id);
  const gradientAngle = (worldHash + idHash) % 360;
  
  const primaryHue = (avgHue + dream.threatLevel * 15) % 360;
  const secondaryHue = (primaryHue + 30 + entityCount * 10) % 360;
  
  const primary = `hsl(${primaryHue}, ${Math.min(90, avgSat + 20)}%, ${25 + dream.threatLevel * 3}%)`;
  const secondary = `hsl(${secondaryHue}, ${Math.min(85, avgSat + 10)}%, ${35 + dream.threatLevel * 2}%)`;
  const accent = threatMod.accent;
  
  const patternSeed = worldHash * idHash + dream.threatLevel * 100 + entityCount * 50;
  
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
    aiSymbolType: null as SymbolType | null,
    aiSymbolComplexity: 3,
    aiSymbolRotation: "slow" as SymbolRotation,
    aiKeywords: [] as string[],
    particleStyle: "floating" as const,
  };
}

// Generate particle types based on entities and environments
function generateParticleTypes(
  environments: string[],
  threatLevel: DreamLog["threatLevel"],
  entityCount: number
): Particle["type"][] {
  const types: Particle["type"][] = ["dot"];
  
  if (environments.includes("night") || environments.includes("sunset")) {
    types.push("star");
  }
  if (environments.includes("fog") || environments.includes("sea")) {
    types.push("ring");
  }
  if (threatLevel >= 3) {
    types.push("triangle");
  }
  if (threatLevel >= 4) {
    types.push("diamond");
  }
  if (entityCount > 0) {
    types.push("star", "ring");
  }
  
  return types;
}

export function AnimatedBookCover({ dream }: AnimatedBookCoverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spillCanvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const fogLayersRef = useRef<FogLayer[]>([]);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);
  const lastFrameRef = useRef(0);
  const sizeRef = useRef({ width: 0, height: 0, fieldWidth: 0, fieldHeight: 0 });
  const isVisibleRef = useRef(true);
  const dreamId = dream.id;
  const dreamWorld = dream.world;
  const dreamThreatLevel = dream.threatLevel;
  const dreamTimeSystem = dream.timeSystem;
  const dreamSafetyOverride = dream.safetyOverride;
  const dreamExit = dream.exit;
  const dreamEnvironmentKey = (dream.environments ?? []).join("|");
  const dreamEntityCount = dream.entities?.length ?? 0;
  const dreamDate = useMemo(() => toValidDate(dream.date), [dream.date]);
  const magneticId = useMemo(() => `dream-${dreamId}`, [dreamId]);
  
  // Use AI-generated cover style if notes are available
  const { style: aiStyle } = useCoverStyle(dream);

  const aiHasStyle = aiStyle != null;
  const aiPrimaryHue = aiStyle?.primaryHue;
  const aiSecondaryHue = aiStyle?.secondaryHue;
  const aiAccentHue = aiStyle?.accentHue;
  const aiSaturation = aiStyle?.saturation;
  const aiBrightness = aiStyle?.brightness;
  const aiPattern = aiStyle?.pattern;
  const aiParticleStyle = aiStyle?.particleStyle;
  const aiGradientAngle = aiStyle?.gradientAngle;
  const aiMood = aiStyle?.mood;
  const aiSymbolType = aiStyle?.symbolType;
  const aiSymbolComplexity = aiStyle?.symbolComplexity;
  const aiSymbolRotation = aiStyle?.symbolRotation;
  const aiKeywordsKey = aiStyle?.keywords?.join("\u0001") ?? "";

  const aiStyleSnapshot = useMemo<AICoverStyle | null>(() => {
    if (!aiHasStyle) return null;
    return {
      mood: aiMood ?? "",
      primaryHue: aiPrimaryHue ?? 0,
      secondaryHue: aiSecondaryHue ?? 0,
      accentHue: aiAccentHue ?? 0,
      saturation: aiSaturation ?? 0,
      brightness: aiBrightness ?? "normal",
      pattern: aiPattern ?? "dots",
      particleStyle: aiParticleStyle ?? "floating",
      gradientAngle: aiGradientAngle ?? 0,
      symbolType: aiSymbolType ?? "moon",
      symbolComplexity: aiSymbolComplexity ?? 1,
      symbolRotation: aiSymbolRotation ?? "none",
      keywords: aiKeywordsKey ? aiKeywordsKey.split("\u0001") : [],
    };
  }, [
    aiHasStyle,
    aiMood,
    aiPrimaryHue,
    aiSecondaryHue,
    aiAccentHue,
    aiSaturation,
    aiBrightness,
    aiPattern,
    aiParticleStyle,
    aiGradientAngle,
    aiSymbolType,
    aiSymbolComplexity,
    aiSymbolRotation,
    aiKeywordsKey,
  ]);

  const dreamEnvironments = useMemo(
    () => (dreamEnvironmentKey ? dreamEnvironmentKey.split("|") : []),
    [dreamEnvironmentKey]
  );

  const dreamStyleInput = useMemo<DreamStyleInput>(
    () => ({
      id: dreamId,
      world: dreamWorld,
      threatLevel: dreamThreatLevel,
      timeSystem: dreamTimeSystem,
      safetyOverride: dreamSafetyOverride,
      exit: dreamExit,
      environments: dreamEnvironments,
      entityCount: dreamEntityCount,
    }),
    [
      dreamId,
      dreamWorld,
      dreamThreatLevel,
      dreamTimeSystem,
      dreamSafetyOverride,
      dreamExit,
      dreamEnvironments,
      dreamEntityCount,
    ]
  );

  const style = useMemo(
    () => generateUniqueStyle(dreamStyleInput, aiStyleSnapshot),
    [dreamStyleInput, aiStyleSnapshot]
  );
  const particleTypes = useMemo(
    () => generateParticleTypes(dreamEnvironments, dreamThreatLevel, dreamEntityCount),
    [dreamEnvironments, dreamThreatLevel, dreamEntityCount]
  );
  const [perfConfig, setPerfConfig] = useState(() => ({
    particleScale: 0.75,
    maxDpr: 1.5,
    fps: 30,
    spill: 14,
    speedScale: 1,
    enableSpill: true,
    enablePattern: true,
    enableMagnetic: true,
    magneticStrength: 0.0026,
    magneticRadiusScale: 1.1,
    enableFog: true,
    fogLayerCount: 4,
    fogSpeedScale: 1,
    fogOpacity: 1,
  }));

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const cores = navigator.hardwareConcurrency || 8;
    const lowPower = cores <= 4;

    const nextConfig = {
      particleScale: prefersReduced ? 0.35 : lowPower ? 0.55 : 0.75,
      maxDpr: prefersReduced ? 1 : lowPower ? 1.25 : 1.5,
      fps: prefersReduced ? 18 : lowPower ? 24 : 30,
      spill: prefersReduced ? 10 : 14,
      speedScale: prefersReduced ? 0.6 : lowPower ? 0.8 : 1,
      enableSpill: !prefersReduced,
      enablePattern: !prefersReduced,
      enableMagnetic: !prefersReduced,
      magneticStrength: lowPower ? 0.0018 : 0.0026,
      magneticRadiusScale: lowPower ? 0.9 : 1.1,
      enableFog: !prefersReduced,
      fogLayerCount: lowPower ? 3 : 4,
      fogSpeedScale: lowPower ? 0.8 : 1,
      fogOpacity: lowPower ? 0.8 : 1,
    };

    setPerfConfig((prev) => {
      const isSame = (Object.keys(nextConfig) as Array<keyof typeof nextConfig>).every(
        (key) => prev[key] === nextConfig[key]
      );
      return isSame ? prev : nextConfig;
    });
  }, []);
  const spillSize = perfConfig.spill;

  const accentGlow = withAlpha(style.accent, 0.45);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    magneticRegistry.set(magneticId, {
      el,
      rect: el.getBoundingClientRect(),
      center: { x: 0, y: 0 },
    });
    updateMagneticRegistry();

    return () => {
      magneticRegistry.delete(magneticId);
    };
  }, [magneticId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const spillCanvas = spillCanvasRef.current;
    const spillCtx = perfConfig.enableSpill && spillCanvas ? spillCanvas.getContext("2d") : null;

    const initFog = () => {
      if (!perfConfig.enableFog) {
        fogLayersRef.current = [];
        return;
      }
      const { width, height } = sizeRef.current;
      if (!width || !height) {
        fogLayersRef.current = [];
        return;
      }

      const layers: FogLayer[] = [];
      for (let i = 0; i < perfConfig.fogLayerCount; i++) {
        const radius = width * (0.35 + Math.random() * 0.35);
        const y = height * (0.72 + Math.random() * 0.18);
        const x = Math.random() * width;
        const speed =
          (Math.random() * 0.12 + 0.04) *
          (Math.random() < 0.5 ? -1 : 1) *
          perfConfig.fogSpeedScale;
        const opacity = (0.06 + Math.random() * 0.06) * perfConfig.fogOpacity;
        const color = withAlpha(style.secondary, opacity);
        layers.push({ x, y, radius, speed, opacity, color });
      }

      fogLayersRef.current = layers;
    };

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, perfConfig.maxDpr);
      const fieldWidth = rect.width + spillSize * 2;
      const fieldHeight = rect.height + spillSize * 2;

      sizeRef.current = { width: rect.width, height: rect.height, fieldWidth, fieldHeight };

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      if (spillCanvas && spillCtx) {
        spillCanvas.width = fieldWidth * dpr;
        spillCanvas.height = fieldHeight * dpr;
        spillCtx.setTransform(1, 0, 0, 1, 0, 0);
        spillCtx.scale(dpr, dpr);
      }

      initFog();
    };
    resizeCanvas();

    // Initialize particles with variety based on dream data
    const initParticles = () => {
      const particles: Particle[] = [];
      const effectiveParticleCount = Math.max(
        8,
        Math.round(style.particleCount * perfConfig.particleScale)
      );
      const speedScale = perfConfig.speedScale;

      for (let i = 0; i < effectiveParticleCount; i++) {
        const typeIndex = (i + style.patternSeed) % particleTypes.length;
        particles.push({
          x: Math.random() * sizeRef.current.fieldWidth,
          y: Math.random() * sizeRef.current.fieldHeight,
          vx: (Math.random() - 0.5) * style.animSpeed * speedScale,
          vy: (Math.random() - 0.5) * style.animSpeed * speedScale,
          size: Math.random() * 2.8 + 0.8 + (dream.threatLevel * 0.25),
          opacity: Math.random() * 0.45 + 0.25 + (style.brightness - 1) * 0.25,
          type: particleTypes[typeIndex],
          color: i % 3 === 0 ? style.accent : (i % 3 === 1 ? style.secondary : "#ffffff"),
        });
      }
      particlesRef.current = particles;
    };
    initParticles();

    // Draw unique patterns based on safety override
    const drawPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      ctx.save();
      ctx.globalAlpha = 0.12 * style.brightness;
      ctx.strokeStyle = style.accent;
      ctx.fillStyle = style.accent;
      ctx.lineWidth = 0.6;

      const seed = style.patternSeed;

      switch (style.patternType) {
        case "diagonal":
          // Diagonal lines based on seed
          for (let i = 0; i < 12; i++) {
            const offset = ((seed + i * 20) % 100) - 50 + Math.sin(time * 0.001 + i) * 5;
            ctx.beginPath();
            ctx.moveTo(offset, 0);
            ctx.lineTo(offset + width, height);
            ctx.stroke();
          }
          break;
          
        case "circular":
          // Concentric circles from center
          for (let i = 1; i <= 5; i++) {
            const radius = (i * 30 + Math.sin(time * 0.002 + i) * 10) * (seed % 3 + 1) / 2;
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
          
        case "grid": {
          // Dynamic grid
          const gridSize = 20 + (seed % 20);
          for (let x = 0; x < width; x += gridSize) {
            for (let y = 0; y < height; y += gridSize) {
              const offset = Math.sin(time * 0.002 + x * 0.01 + y * 0.01 + seed * 0.01) * 3;
              ctx.beginPath();
              ctx.arc(x + offset, y + offset, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
        }
          
        case "radial": {
          // Radial lines from center
          const lineCount = 8 + (seed % 8);
          for (let i = 0; i < lineCount; i++) {
            const angle = (i / lineCount) * Math.PI * 2 + time * 0.001;
            const length = 80 + Math.sin(time * 0.003 + i) * 20;
            ctx.beginPath();
            ctx.moveTo(width / 2, height / 2);
            ctx.lineTo(
              width / 2 + Math.cos(angle) * length,
              height / 2 + Math.sin(angle) * length
            );
            ctx.stroke();
          }
          break;
        }
          
        case "noise":
          // Random dots like static noise
          for (let i = 0; i < 40; i++) {
            const x = ((seed * i * 7) % width);
            const y = ((seed * i * 11) % height) + Math.sin(time * 0.003 + i) * 2;
            const size = ((seed + i) % 3) + 1;
            ctx.globalAlpha = (0.05 + ((seed + i) % 10) * 0.01) * style.brightness;
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
      options?: { alpha?: number; blur?: number; offsetX?: number; offsetY?: number; color?: string }
    ) => {
      const alpha = options?.alpha ?? 1;
      const blur = options?.blur ?? 1;
      const offsetX = options?.offsetX ?? 0;
      const offsetY = options?.offsetY ?? 0;
      const color = options?.color ?? particle.color;

      ctx.save();
      ctx.globalAlpha = particle.opacity * alpha;
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.shadowBlur = particle.size * 6 * blur;
      ctx.shadowColor = color;

      const { size, type } = particle;
      const x = particle.x + offsetX;
      const y = particle.y + offsetY;

      switch (type) {
        case "dot":
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case "star": {
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
        }
          
        case "ring":
          ctx.beginPath();
          ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
          ctx.lineWidth = 0.8;
          ctx.stroke();
          break;
          
        case "triangle": {
          const t = size * 2;
          ctx.beginPath();
          ctx.moveTo(x, y - t);
          ctx.lineTo(x + t * 0.866, y + t * 0.5);
          ctx.lineTo(x - t * 0.866, y + t * 0.5);
          ctx.closePath();
          ctx.fill();
          break;
        }
          
        case "diamond": {
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
      }
      ctx.restore();
    };

    const drawFog = (ctx: CanvasRenderingContext2D, width: number, height: number, speedFactor: number) => {
      if (!perfConfig.enableFog || fogLayersRef.current.length === 0) return;

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      fogLayersRef.current.forEach((layer, index) => {
        layer.x += layer.speed * speedFactor;
        if (layer.x < -layer.radius) layer.x = width + layer.radius;
        if (layer.x > width + layer.radius) layer.x = -layer.radius;

        const wobble = Math.sin(timeRef.current * 0.0004 + index) * height * 0.015;
        const y = layer.y + wobble;

        const gradient = ctx.createRadialGradient(layer.x, y, 0, layer.x, y, layer.radius);
        gradient.addColorStop(0, layer.color);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, height * 0.6, width, height * 0.4);
      });
      ctx.restore();
    };

    // Animation loop
    const frameInterval = 1000 / perfConfig.fps;
    const animate = (timestamp: number) => {
      if (document.hidden || !isVisibleRef.current) {
        animationFrameRef.current = undefined;
        return;
      }

      const delta = timestamp - lastFrameRef.current;
      if (delta < frameInterval) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      maybeUpdateMagneticRegistry(timestamp);

      lastFrameRef.current = timestamp;
      timeRef.current += delta;

      const { width, height, fieldWidth, fieldHeight } = sizeRef.current;
      if (!width || !height) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      if (spillCtx) {
        spillCtx.clearRect(0, 0, fieldWidth, fieldHeight);
      }

      // Draw gradient background with unique angle
      const angleRad = (style.gradientAngle * Math.PI) / 180;
      const x1 = width / 2 - Math.cos(angleRad) * width;
      const y1 = height / 2 - Math.sin(angleRad) * height;
      const x2 = width / 2 + Math.cos(angleRad) * width;
      const y2 = height / 2 + Math.sin(angleRad) * height;
      
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, style.primary);
      gradient.addColorStop(0.5, style.secondary);
      gradient.addColorStop(1, style.primary);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Inner light bloom to add depth
      const innerGlow = ctx.createRadialGradient(
        width * 0.5, height * 0.35, width * 0.05,
        width * 0.5, height * 0.35, width * 0.95
      );
      innerGlow.addColorStop(0, withAlpha(style.accent, 0.22));
      innerGlow.addColorStop(0.5, withAlpha(style.secondary, 0.12));
      innerGlow.addColorStop(1, "transparent");
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = innerGlow;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // Subtle directional sheen for clarity
      const sheen = ctx.createLinearGradient(0, 0, width, height);
      sheen.addColorStop(0, "rgba(255,255,255,0.18)");
      sheen.addColorStop(0.35, "rgba(255,255,255,0.04)");
      sheen.addColorStop(0.7, "rgba(255,255,255,0)");
      ctx.save();
      ctx.globalCompositeOperation = "soft-light";
      ctx.fillStyle = sheen;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      const speedFactor = delta / 16;

      // Draw pattern
      if (perfConfig.enablePattern) {
        drawPattern(ctx, width, height, timeRef.current);
      }

      // Nebula fog near the bottom
      drawFog(ctx, width, height, speedFactor);

      // Draw and update particles
      let magneticTarget: { x: number; y: number } | null = null;
      let magneticStrength = perfConfig.magneticStrength;

      if (perfConfig.enableMagnetic) {
        const selfEntry = magneticRegistry.get(magneticId);
        if (selfEntry) {
          const magneticRadius = Math.max(width, height) * perfConfig.magneticRadiusScale;
          let nearestDist = Number.POSITIVE_INFINITY;
          let nearestCenter: { x: number; y: number } | null = null;

          magneticRegistry.forEach((entry, id) => {
            if (id === magneticId) return;
            const dx = entry.center.x - selfEntry.center.x;
            const dy = entry.center.y - selfEntry.center.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < nearestDist && dist < magneticRadius) {
              nearestDist = dist;
              nearestCenter = entry.center;
            }
          });

          if (nearestCenter) {
            magneticTarget = {
              x: nearestCenter.x - selfEntry.rect.left + spillSize,
              y: nearestCenter.y - selfEntry.rect.top + spillSize,
            };
            magneticStrength *= 1 - nearestDist / magneticRadius;
          }
        }
      }

      particlesRef.current.forEach((particle) => {
        if (magneticTarget) {
          const dx = magneticTarget.x - particle.x;
          const dy = magneticTarget.y - particle.y;
          const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const pull = magneticStrength * speedFactor;
          particle.vx += (dx / dist) * pull;
          particle.vy += (dy / dist) * pull;
        }

        const drag = 1 - 0.002 * speedFactor;
        particle.vx *= drag;
        particle.vy *= drag;

        particle.x += particle.vx * speedFactor;
        particle.y += particle.vy * speedFactor;

        if (particle.x < 0) particle.x = fieldWidth;
        if (particle.x > fieldWidth) particle.x = 0;
        if (particle.y < 0) particle.y = fieldHeight;
        if (particle.y > fieldHeight) particle.y = 0;

        drawParticle(ctx, particle, { offsetX: -spillSize, offsetY: -spillSize });
      });

      if (spillCtx) {
        spillCtx.save();
        spillCtx.globalCompositeOperation = "source-over";
        particlesRef.current.forEach((particle) => {
          drawParticle(spillCtx, particle, { alpha: 0.35, blur: 0.7 });
        });
        spillCtx.globalCompositeOperation = "lighter";
        particlesRef.current.forEach((particle) => {
          drawParticle(spillCtx, particle, { alpha: 0.22, blur: 1.6 });
        });
        spillCtx.restore();
      }

      // Exit type glow effect at bottom
      const exitGlow = ctx.createRadialGradient(
        width / 2, height, 0,
        width / 2, height, width * 0.6
      );
      exitGlow.addColorStop(0, style.exitStyle.glow + "20");
      exitGlow.addColorStop(1, "transparent");
      ctx.fillStyle = exitGlow;
      ctx.fillRect(0, 0, width, height);

      // Vignette to focus the center content
      const vignette = ctx.createRadialGradient(
        width * 0.5, height * 0.5, width * 0.2,
        width * 0.5, height * 0.5, width * 0.85
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(0.6, "rgba(0,0,0,0.1)");
      vignette.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (animationFrameRef.current != null) return;
      lastFrameRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
      });
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener("resize", resizeCanvas);
    }

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting && !document.hidden) {
            startAnimation();
          } else {
            stopAnimation();
          }
        },
        { threshold: 0.2 }
      );
      intersectionObserver.observe(canvas);
    }

    const handleVisibility = () => {
      if (document.hidden) {
        stopAnimation();
      } else if (isVisibleRef.current) {
        startAnimation();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    startAnimation();

    return () => {
      stopAnimation();
      document.removeEventListener("visibilitychange", handleVisibility);
      intersectionObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [style, particleTypes, dream.threatLevel, perfConfig, spillSize, magneticId]);

  const hasEnvironments = dream.environments && dream.environments.length > 0;
  const hasEntities = dream.entities && dream.entities.length > 0;

  return (
    <Link to={`/logs/${dream.id}`} className="group block">
      <div className="relative">
        {/* Spill Canvas - allows glow/particles to float into nearby cards */}
        <canvas
          ref={spillCanvasRef}
          className="absolute z-30 pointer-events-none opacity-20 group-hover:opacity-45 transition-opacity duration-300"
          style={{
            top: -spillSize,
            left: -spillSize,
            width: `calc(100% + ${spillSize * 2}px)`,
            height: `calc(100% + ${spillSize * 2}px)`,
            display: perfConfig.enableSpill ? "block" : "none",
            mixBlendMode: "normal",
          }}
        />

        <div 
          className="aspect-[2/3] rounded-xl overflow-hidden relative z-10 isolate transition-shadow duration-300 border border-white/10"
          style={{ 
            boxShadow: "0 6px 16px rgba(2, 6, 23, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.06)"
          }}
          ref={cardRef}
        >
          {/* Animated Canvas Background */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ width: "100%", height: "100%" }}
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/5 to-transparent opacity-70 mix-blend-screen pointer-events-none" />
          <div
            className="absolute inset-0 rounded-xl pointer-events-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18),inset_0_-18px_32px_rgba(0,0,0,0.35)]"
          />

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
            <span className="text-[10px]" style={{ color: style.accent }}>{style.exitStyle.symbol}</span>
            <span className="text-[9px] text-white/80 font-medium">Lv.{dream.threatLevel}</span>
          </div>
        </div>

          {/* Time System Indicator */}
          {dream.timeSystem !== "unknown" && (
            <div className="absolute top-9 right-2">
              <div 
                className="flex items-center gap-0.5 px-1 py-0.5 rounded backdrop-blur-sm text-[8px]"
                style={{ 
                  backgroundColor: dream.timeSystem === "activated" ? "rgba(96, 165, 250, 0.3)" : "rgba(156, 163, 175, 0.2)",
                  color: dream.timeSystem === "activated" ? "#60a5fa" : "#9ca3af"
                }}
              >
                <Clock className="w-2 h-2" />
                {dream.timeSystem === "activated" ? "ON" : "OFF"}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-3">


          {/* World Name */}
          <h3 className="font-bold text-base sm:text-lg text-center leading-snug text-white drop-shadow-lg line-clamp-2 mb-2">
            {dream.world || "Unknown"}
          </h3>

          {/* Tags Row */}
          <div className="flex flex-wrap gap-1 justify-center mb-2">
            {hasEnvironments && (
              <span 
                className="inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full backdrop-blur-sm"
                style={{ backgroundColor: `${style.accent}20`, color: style.accent }}
              >
                <MapPin className="w-2 h-2" />
                {dream.environments.length}
              </span>
            )}
            {hasEntities && (
              <span 
                className="inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full backdrop-blur-sm"
                style={{ backgroundColor: `${style.accent}20`, color: style.accent }}
              >
                <Users className="w-2 h-2" />
                {dream.entities.length}
              </span>
            )}
            {dream.safetyOverride !== "none" && dream.safetyOverride !== "unknown" && (
              <span 
                className="inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full backdrop-blur-sm"
                style={{ backgroundColor: "rgba(167, 139, 250, 0.2)", color: "#a78bfa" }}
              >
                <Shield className="w-2 h-2" />
                {dream.safetyOverride}
              </span>
            )}
            {dream.exit !== "unknown" && (
              <span 
                className="inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full backdrop-blur-sm"
                style={{ backgroundColor: `${style.exitStyle.glow}20`, color: style.exitStyle.glow }}
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
              {dreamDate ? format(dreamDate, "d MMM yyyy", { locale: th }) : "-"}
            </p>
            {dream.wakeTime && (
              <p className="text-[9px] text-white/40">{dream.wakeTime}</p>
            )}
          </div>
          </div>

          {/* Hover Effects */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-transparent group-hover:via-white/20 transition-all duration-700 transform translate-x-full group-hover:translate-x-0" />
          <div 
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ boxShadow: `inset 0 0 40px ${accentGlow}` }}
          />
        </div>
      </div>
    </Link>
  );
}
