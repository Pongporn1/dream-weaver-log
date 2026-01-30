import { useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { DreamLog } from "@/types/dream";
import { MapPin, Users } from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  type: "dot" | "star" | "ring";
}

interface AnimatedBookCoverProps {
  dream: DreamLog;
}

// Base color palettes - will be mixed based on world name hash
const colorPalettes = [
  { primary: "#1e3a8a", secondary: "#3b82f6", accent: "#60a5fa" }, // Ocean Blue
  { primary: "#581c87", secondary: "#7c3aed", accent: "#a78bfa" }, // Mystic Purple
  { primary: "#065f46", secondary: "#059669", accent: "#34d399" }, // Forest Green
  { primary: "#7c2d12", secondary: "#ea580c", accent: "#fb923c" }, // Sunset Orange
  { primary: "#701a75", secondary: "#c026d3", accent: "#e879f9" }, // Neon Pink
  { primary: "#164e63", secondary: "#0891b2", accent: "#22d3ee" }, // Cyan Ocean
  { primary: "#422006", secondary: "#a16207", accent: "#fbbf24" }, // Golden
  { primary: "#1e1b4b", secondary: "#4338ca", accent: "#818cf8" }, // Indigo Night
];

// Threat level modifications - affects intensity and glow
const threatModifiers: Record<number, { intensity: number; glowOpacity: number; speed: number }> = {
  0: { intensity: 0.6, glowOpacity: 0.15, speed: 0.3 },
  1: { intensity: 0.7, glowOpacity: 0.2, speed: 0.4 },
  2: { intensity: 0.8, glowOpacity: 0.25, speed: 0.5 },
  3: { intensity: 0.9, glowOpacity: 0.3, speed: 0.6 },
  4: { intensity: 1.0, glowOpacity: 0.35, speed: 0.8 },
  5: { intensity: 1.1, glowOpacity: 0.45, speed: 1.0 },
};

// Pattern types based on hash
const patternTypes = ["constellation", "waves", "grid", "spiral", "nebula"] as const;
type PatternType = typeof patternTypes[number];

function hashString(str: string): number {
  return str.split("").reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
}

function getUniqueStyle(dream: DreamLog) {
  const worldHash = hashString(dream.world || "unknown");
  const idHash = hashString(dream.id);
  const combinedHash = worldHash + idHash;
  
  const paletteIndex = worldHash % colorPalettes.length;
  const palette = colorPalettes[paletteIndex];
  const pattern = patternTypes[idHash % patternTypes.length];
  const modifier = threatModifiers[dream.threatLevel] || threatModifiers[2];
  
  // Create gradient angle based on hash
  const gradientAngle = (combinedHash % 180);
  
  return { palette, pattern, modifier, gradientAngle };
}

// Threat indicators
const threatIndicators: Record<number, string> = {
  0: "○", 1: "◐", 2: "◑", 3: "◒", 4: "◓", 5: "●"
};

export function AnimatedBookCover({ dream }: AnimatedBookCoverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);
  
  const style = useMemo(() => getUniqueStyle(dream), [dream]);
  const { palette, pattern, modifier, gradientAngle } = style;

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

    // Initialize particles with variety
    const initParticles = () => {
      const particles: Particle[] = [];
      const rect = canvas.getBoundingClientRect();
      const count = 15 + dream.threatLevel * 5;

      for (let i = 0; i < count; i++) {
        const types: Particle["type"][] = ["dot", "star", "ring"];
        particles.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * modifier.speed,
          vy: (Math.random() - 0.5) * modifier.speed,
          size: Math.random() * 2.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.2,
          type: types[i % 3],
        });
      }
      particlesRef.current = particles;
    };
    initParticles();

    // Draw pattern based on type
    const drawPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      ctx.save();
      ctx.globalAlpha = 0.1 * modifier.intensity;
      ctx.strokeStyle = palette.accent;
      ctx.fillStyle = palette.accent;
      ctx.lineWidth = 0.5;

      switch (pattern) {
        case "constellation":
          // Draw connected dots pattern
          for (let i = 0; i < 8; i++) {
            const x = (Math.sin(time * 0.001 + i) * 0.3 + 0.5) * width;
            const y = (Math.cos(time * 0.0015 + i * 1.5) * 0.3 + 0.5) * height;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
            if (i > 0) {
              const prevX = (Math.sin(time * 0.001 + (i-1)) * 0.3 + 0.5) * width;
              const prevY = (Math.cos(time * 0.0015 + (i-1) * 1.5) * 0.3 + 0.5) * height;
              ctx.beginPath();
              ctx.moveTo(prevX, prevY);
              ctx.lineTo(x, y);
              ctx.stroke();
            }
          }
          break;
          
        case "waves":
          // Flowing wave lines
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            for (let x = 0; x < width; x += 5) {
              const y = height * (0.3 + i * 0.15) + Math.sin(x * 0.02 + time * 0.002 + i) * 15;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
          break;
          
        case "grid":
          // Subtle grid with moving intersections
          const gridSize = 30;
          for (let x = 0; x < width; x += gridSize) {
            for (let y = 0; y < height; y += gridSize) {
              const offset = Math.sin(time * 0.002 + x * 0.01 + y * 0.01) * 3;
              ctx.beginPath();
              ctx.arc(x + offset, y + offset, 1, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
          
        case "spiral":
          // Spiral pattern
          ctx.beginPath();
          for (let i = 0; i < 200; i++) {
            const angle = i * 0.1 + time * 0.001;
            const radius = i * 0.8;
            const x = width / 2 + Math.cos(angle) * radius;
            const y = height / 2 + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          break;
          
        case "nebula":
          // Soft cloudy circles
          for (let i = 0; i < 6; i++) {
            const x = width * (0.2 + (i % 3) * 0.3);
            const y = height * (0.3 + Math.floor(i / 3) * 0.4);
            const radius = 20 + Math.sin(time * 0.001 + i) * 10;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, palette.accent + "40");
            gradient.addColorStop(1, "transparent");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
          }
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
      const angleRad = (gradientAngle * Math.PI) / 180;
      const x1 = rect.width / 2 - Math.cos(angleRad) * rect.width;
      const y1 = rect.height / 2 - Math.sin(angleRad) * rect.height;
      const x2 = rect.width / 2 + Math.cos(angleRad) * rect.width;
      const y2 = rect.height / 2 + Math.sin(angleRad) * rect.height;
      
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, palette.primary);
      gradient.addColorStop(0.5, palette.secondary);
      gradient.addColorStop(1, palette.primary);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw pattern
      drawPattern(ctx, rect.width, rect.height, timeRef.current);

      // Draw particles
      ctx.fillStyle = palette.accent;
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = rect.width;
        if (particle.x > rect.width) particle.x = 0;
        if (particle.y < 0) particle.y = rect.height;
        if (particle.y > rect.height) particle.y = 0;

        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.shadowBlur = particle.size * 3;
        ctx.shadowColor = palette.accent;

        if (particle.type === "dot") {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (particle.type === "star") {
          // 4-point star
          const s = particle.size * 1.5;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y - s);
          ctx.lineTo(particle.x + s * 0.3, particle.y);
          ctx.lineTo(particle.x, particle.y + s);
          ctx.lineTo(particle.x - s * 0.3, particle.y);
          ctx.closePath();
          ctx.fill();
        } else {
          // Ring
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 1.2, 0, Math.PI * 2);
          ctx.strokeStyle = palette.accent;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [palette, pattern, modifier, gradientAngle, dream.threatLevel]);

  const hasEnvironments = dream.environments && dream.environments.length > 0;
  const hasEntities = dream.entities && dream.entities.length > 0;

  return (
    <Link to={`/logs/${dream.id}`} className="group block">
      <div 
        className="aspect-[2/3] rounded-xl overflow-hidden relative shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02] border border-white/10"
        style={{ 
          boxShadow: `0 4px 24px ${palette.accent}${Math.floor(modifier.glowOpacity * 255).toString(16).padStart(2, "0")}` 
        }}
      >
        {/* Animated Canvas Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        {/* Top Bar - ID & Threat */}
        <div className="absolute top-0 left-0 right-0 p-2 flex items-center justify-between">
          <span className="text-[8px] text-white/50 font-mono bg-black/30 px-1.5 py-0.5 rounded backdrop-blur-sm">
            {dream.id}
          </span>
          <div 
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: `${palette.accent}30` }}
          >
            <span className="text-[10px] text-white">{threatIndicators[dream.threatLevel]}</span>
            <span className="text-[9px] text-white/80 font-medium">Lv.{dream.threatLevel}</span>
          </div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-3">
          {/* World Name */}
          <h3 className="font-bold text-base sm:text-lg text-center leading-snug text-white drop-shadow-lg line-clamp-2 mb-2">
            {dream.world || "Unknown"}
          </h3>

          {/* Tags Row */}
          {(hasEnvironments || hasEntities) && (
            <div className="flex flex-wrap gap-1 justify-center mb-2">
              {hasEnvironments && (
                <span className="inline-flex items-center gap-0.5 text-[8px] text-white/70 bg-white/10 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                  <MapPin className="w-2 h-2" />
                  {dream.environments.length}
                </span>
              )}
              {hasEntities && (
                <span className="inline-flex items-center gap-0.5 text-[8px] text-white/70 bg-white/10 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                  <Users className="w-2 h-2" />
                  {dream.entities.length}
                </span>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <div className="h-px w-4 bg-gradient-to-r from-transparent to-white/40" />
            <div 
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: palette.accent }}
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
          style={{ boxShadow: `inset 0 0 30px ${palette.accent}40` }}
        />
      </div>
    </Link>
  );
}
