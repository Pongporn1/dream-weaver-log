import React, { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MythicParticleConfig } from "@/hooks/useMythicCollection";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
  rotation?: number;
  rotationSpeed?: number;
}

export type BarVariant = 
  | "stars" 
  | "fire" 
  | "snow" 
  | "crystals" 
  | "void" 
  | "blood" 
  | "aurora" 
  | "lightning"
  | "pixels"
  | "mythic"
  | "legendary"
  | "very_rare"
  | "rare"
  | "normal";

interface MythicProgressBarProps {
  value: number;
  max?: number;
  particleConfig?: MythicParticleConfig | null;
  className?: string;
  height?: number;
  showGlow?: boolean;
  animated?: boolean;
  label?: string;
  variant?: BarVariant;
}

// Unique gradients for each variant
const VARIANT_STYLES: Record<BarVariant, {
  gradient: string;
  glowColor: string;
  borderStyle?: string;
  innerPattern?: string;
}> = {
  stars: {
    gradient: "linear-gradient(90deg, #1e3a5f, #3b82f6, #60a5fa, #93c5fd)",
    glowColor: "#3b82f6",
    innerPattern: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 1px, transparent 1px), radial-gradient(circle at 60% 30%, rgba(255,255,255,0.2) 1px, transparent 1px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.25) 1px, transparent 1px)",
  },
  fire: {
    gradient: "linear-gradient(90deg, #7f1d1d, #dc2626, #f97316, #fbbf24)",
    glowColor: "#f97316",
    innerPattern: "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,200,100,0.1) 4px, rgba(255,200,100,0.1) 8px)",
  },
  snow: {
    gradient: "linear-gradient(90deg, #e0f2fe, #bae6fd, #7dd3fc, #38bdf8)",
    glowColor: "#38bdf8",
    innerPattern: "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.5) 1px, transparent 1px), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.4) 1px, transparent 1px)",
  },
  crystals: {
    gradient: "linear-gradient(90deg, #312e81, #4f46e5, #818cf8, #c4b5fd)",
    glowColor: "#818cf8",
    innerPattern: "linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.1) 55%, transparent 60%)",
  },
  void: {
    gradient: "linear-gradient(90deg, #0f0f0f, #1f1f3a, #2d1b4e, #4c1d95)",
    glowColor: "#7c3aed",
    innerPattern: "radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.2) 0%, transparent 70%)",
  },
  blood: {
    gradient: "linear-gradient(90deg, #450a0a, #7f1d1d, #b91c1c, #dc2626)",
    glowColor: "#dc2626",
    innerPattern: "repeating-linear-gradient(180deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)",
  },
  aurora: {
    gradient: "linear-gradient(90deg, #22c55e, #14b8a6, #06b6d4, #8b5cf6, #ec4899)",
    glowColor: "#14b8a6",
    innerPattern: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
  },
  lightning: {
    gradient: "linear-gradient(90deg, #0c4a6e, #0284c7, #38bdf8, #fef08a)",
    glowColor: "#fef08a",
    innerPattern: "linear-gradient(135deg, transparent 40%, rgba(254,240,138,0.3) 45%, transparent 50%)",
  },
  pixels: {
    gradient: "linear-gradient(90deg, #2b1152, #5c2a8a, #ff9ad5, #ffcf9b)",
    glowColor: "#ff9ad5",
    borderStyle: "2px solid rgba(255,190,140,0.5)",
    innerPattern: "repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0 2px, rgba(255,255,255,0) 2px 6px)",
  },
  mythic: {
    gradient: "linear-gradient(90deg, #581c87, #9333ea, #c026d3, #f472b6)",
    glowColor: "#c026d3",
    borderStyle: "2px solid rgba(192,38,211,0.5)",
    innerPattern: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.05) 5px, rgba(255,255,255,0.05) 10px)",
  },
  legendary: {
    gradient: "linear-gradient(90deg, #78350f, #d97706, #f59e0b, #fcd34d)",
    glowColor: "#f59e0b",
    borderStyle: "2px solid rgba(245,158,11,0.5)",
    innerPattern: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
  },
  very_rare: {
    gradient: "linear-gradient(90deg, #1e3a8a, #3b82f6, #60a5fa, #a78bfa)",
    glowColor: "#60a5fa",
    borderStyle: "1px solid rgba(96,165,250,0.4)",
    innerPattern: "radial-gradient(circle at 80% 50%, rgba(167,139,250,0.3) 0%, transparent 50%)",
  },
  rare: {
    gradient: "linear-gradient(90deg, #065f46, #059669, #10b981, #6ee7b7)",
    glowColor: "#10b981",
    borderStyle: "1px solid rgba(16,185,129,0.4)",
  },
  normal: {
    gradient: "linear-gradient(90deg, #374151, #4b5563, #6b7280, #9ca3af)",
    glowColor: "#6b7280",
  },
};

// Unique animations for each variant
const VARIANT_ANIMATIONS: Record<BarVariant, {
  shimmerDuration?: number;
  shimmerStyle?: string;
  pulseAnimation?: boolean;
  waveAnimation?: boolean;
  sparkleAnimation?: boolean;
}> = {
  stars: { shimmerDuration: 3, sparkleAnimation: true },
  fire: { shimmerDuration: 0.8, waveAnimation: true },
  snow: { shimmerDuration: 4, sparkleAnimation: true },
  crystals: { shimmerDuration: 2.5, pulseAnimation: true },
  void: { shimmerDuration: 5, pulseAnimation: true },
  blood: { shimmerDuration: 1.5, waveAnimation: true },
  aurora: { shimmerDuration: 6, waveAnimation: true },
  lightning: { shimmerDuration: 0.3, sparkleAnimation: true },
  pixels: { shimmerDuration: 2.2, sparkleAnimation: true },
  mythic: { shimmerDuration: 2, pulseAnimation: true, sparkleAnimation: true },
  legendary: { shimmerDuration: 1.5, waveAnimation: true, sparkleAnimation: true },
  very_rare: { shimmerDuration: 2.5, sparkleAnimation: true },
  rare: { shimmerDuration: 3 },
  normal: { shimmerDuration: 4 },
};

export function MythicProgressBar({
  value,
  max = 100,
  particleConfig,
  className,
  height = 12,
  showGlow = true,
  animated = true,
  label,
  variant,
}: MythicProgressBarProps) {
  const prefersReducedMotion = useReducedMotion();
  const motionFactor = prefersReducedMotion ? 0.25 : 1;
  const effectiveAnimated = animated && !prefersReducedMotion;
  const effectiveParticleConfig = useMemo(() => {
    if (!particleConfig) return null;
    return {
      ...particleConfig,
      density: particleConfig.density * motionFactor,
    };
  }, [particleConfig, motionFactor]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const progressPercent = Math.min(100, Math.max(0, (value / max) * 100));

  // Determine variant from particleConfig if not provided
  const effectiveVariant =
    variant || (effectiveParticleConfig?.type as BarVariant) || "normal";
  const isPixelVariant = effectiveVariant === "pixels";
  const styles = VARIANT_STYLES[effectiveVariant] || VARIANT_STYLES.normal;
  const animations = VARIANT_ANIMATIONS[effectiveVariant] || VARIANT_ANIMATIONS.normal;

  // Generate particles based on config
  const createParticle = useMemo(() => {
    if (!effectiveParticleConfig) return null;

    return (x: number, y: number, width: number, height: number): Particle => {
      const config = effectiveParticleConfig;
      const isSecondary = Math.random() > 0.6;
      const color = isSecondary && config.secondaryColor ? config.secondaryColor : config.color;
      
      let vx = 0;
      let vy = 0;
      let size = 2;
      let rotation = 0;
      let rotationSpeed = 0;
      
      switch (config.type) {
        case "stars":
          vx = (Math.random() - 0.5) * config.speed * 0.5;
          vy = (Math.random() - 0.3) * config.speed * 0.3;
          size = Math.random() * 3 + 1;
          rotation = Math.random() * Math.PI * 2;
          rotationSpeed = (Math.random() - 0.5) * 0.1;
          break;
        case "fire":
          vx = (Math.random() - 0.5) * config.speed * 0.3;
          vy = -Math.random() * config.speed * 2;
          size = Math.random() * 4 + 2;
          break;
        case "snow":
          vx = (Math.random() - 0.5) * config.speed * 0.2;
          vy = Math.random() * config.speed * 0.5;
          size = Math.random() * 3 + 1;
          rotation = Math.random() * Math.PI * 2;
          rotationSpeed = (Math.random() - 0.5) * 0.05;
          break;
        case "crystals":
          vx = (Math.random() - 0.5) * config.speed * 0.4;
          vy = (Math.random() - 0.5) * config.speed * 0.4;
          size = Math.random() * 4 + 2;
          rotation = Math.random() * Math.PI * 2;
          rotationSpeed = (Math.random() - 0.5) * 0.08;
          break;
        case "void":
          vx = (Math.random() - 0.5) * config.speed * 2;
          vy = (Math.random() - 0.5) * config.speed * 2;
          size = Math.random() * 2 + 1;
          break;
        case "blood":
          vx = (Math.random() - 0.5) * config.speed * 0.3;
          vy = Math.random() * config.speed * 0.8;
          size = Math.random() * 3 + 2;
          break;
        case "aurora":
          vx = config.speed * 0.5;
          vy = Math.sin(x * 0.1) * config.speed * 0.3;
          size = Math.random() * 5 + 3;
          break;
        case "lightning":
          vx = (Math.random() - 0.5) * config.speed * 4;
          vy = (Math.random() - 0.5) * config.speed * 4;
          size = Math.random() * 2 + 1;
          break;
        case "pixels":
          vx = (Math.random() - 0.5) * config.speed * 0.6;
          vy = (Math.random() - 0.7) * config.speed * 0.6;
          size = Math.random() * 3 + 2;
          break;
      }
      
      return {
        x: x + (width * progressPercent / 100),
        y: y + height / 2 + (Math.random() - 0.5) * height * 0.8,
        vx,
        vy,
        size,
        opacity: Math.random() * 0.8 + 0.2,
        color,
        life: 0,
        maxLife: 30 + Math.random() * 30,
        rotation,
        rotationSpeed,
      };
    };
  }, [effectiveParticleConfig, progressPercent]);

  // Animation loop
  useEffect(() => {
    if (!effectiveAnimated || !canvasRef.current || !effectiveParticleConfig) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (effectiveParticleConfig.type === "pixels") {
      ctx.imageSmoothingEnabled = false;
    }
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const width = rect.width;
    const canvasHeight = rect.height;
    
    const animate = () => {
      ctx.clearRect(0, 0, width, canvasHeight);
      
      // Spawn new particles at the progress edge
      if (createParticle && Math.random() < effectiveParticleConfig.density * 0.3) {
        particlesRef.current.push(createParticle(0, 0, width, canvasHeight));
      }
      
      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
          p.rotation += p.rotationSpeed;
        }
        
        const lifePercent = p.life / p.maxLife;
        const alpha = p.opacity * (1 - lifePercent);
        
        if (alpha <= 0) return false;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.rotation !== undefined) {
          ctx.rotate(p.rotation);
        }
        
        if (effectiveParticleConfig.glow) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.size * 3;
        }
        
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        
        // Different shapes based on particle type
        switch (effectiveParticleConfig.type) {
          case "crystals":
            // Diamond shape
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size * 0.7, 0);
            ctx.lineTo(0, p.size);
            ctx.lineTo(-p.size * 0.7, 0);
            ctx.closePath();
            ctx.fill();
            // Inner shine
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.beginPath();
            ctx.moveTo(0, -p.size * 0.5);
            ctx.lineTo(p.size * 0.3, 0);
            ctx.lineTo(0, p.size * 0.3);
            ctx.closePath();
            ctx.fill();
            break;
          case "stars":
            drawStar(ctx, 0, 0, 5, p.size, p.size * 0.4);
            break;
          case "lightning":
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(p.vx * 3, p.vy * 3);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size * 0.5;
            ctx.lineCap = "round";
            ctx.stroke();
            // Add fork
            if (Math.random() > 0.7) {
              ctx.beginPath();
              ctx.moveTo(p.vx * 1.5, p.vy * 1.5);
              ctx.lineTo(p.vx * 2 + (Math.random() - 0.5) * 4, p.vy * 2 + (Math.random() - 0.5) * 4);
              ctx.lineWidth = p.size * 0.3;
              ctx.stroke();
            }
            break;
          case "pixels":
            ctx.imageSmoothingEnabled = false;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.fillRect(-p.size / 2 + 1, -p.size / 2 + 1, Math.max(1, p.size * 0.4), Math.max(1, p.size * 0.4));
            break;
          case "fire":
            // Teardrop shape for fire
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.bezierCurveTo(p.size, -p.size * 0.5, p.size, p.size * 0.5, 0, p.size);
            ctx.bezierCurveTo(-p.size, p.size * 0.5, -p.size, -p.size * 0.5, 0, -p.size);
            ctx.fill();
            break;
          case "snow":
            // Snowflake pattern
            for (let i = 0; i < 6; i++) {
              ctx.save();
              ctx.rotate((Math.PI / 3) * i);
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(0, -p.size);
              ctx.strokeStyle = p.color;
              ctx.lineWidth = p.size * 0.2;
              ctx.stroke();
              ctx.restore();
            }
            break;
          case "void":
            // Swirling void effect
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fill();
            break;
          case "aurora":
            // Elongated aurora streaks
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size * 2, p.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "blood":
            // Blood drop
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(p.size * 0.3, -p.size * 0.3, p.size * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,100,100,0.5)";
            ctx.fill();
            break;
          default:
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        return true;
      });
      
      // Limit particle count
      if (particlesRef.current.length > 60) {
        particlesRef.current = particlesRef.current.slice(-60);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [effectiveAnimated, effectiveParticleConfig, createParticle]);

  const barColor = effectiveParticleConfig?.color || "hsl(var(--primary))";
  const effectiveGradient = effectiveParticleConfig 
    ? styles.gradient 
    : "hsl(var(--primary))";
  const radiusClass = isPixelVariant ? "rounded-md" : "rounded-full";
  const barClass = isPixelVariant ? "pixel-bar" : "";
  const backgroundPattern = isPixelVariant
    ? "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 2px, rgba(255,255,255,0) 2px 6px)"
    : "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)";

  return (
    <div className={cn("relative w-full", className)}>
      {label && (
        <div className="flex justify-between items-center mb-1.5 text-xs">
          <span className="text-muted-foreground font-medium">{label}</span>
          <span className="text-foreground font-semibold">{Math.round(progressPercent)}%</span>
        </div>
      )}
      
      <div
        className={cn(
          "relative overflow-hidden bg-secondary/50 backdrop-blur-sm",
          radiusClass,
          barClass
        )}
        style={{ 
          height,
          border: styles.borderStyle,
          boxShadow: `inset 0 1px 3px rgba(0,0,0,0.2)`,
        }}
      >
        {/* Background pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: backgroundPattern,
          }}
        />

        {/* Progress fill with motion */}
        <motion.div
          className={cn("h-full relative overflow-hidden", radiusClass)}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            background: effectiveGradient,
            boxShadow: showGlow && effectiveParticleConfig?.glow
              ? `0 0 12px ${styles.glowColor}, 0 0 24px ${styles.glowColor}50, inset 0 1px 0 rgba(255,255,255,0.3)`
              : "inset 0 1px 0 rgba(255,255,255,0.3)",
          }}
        >
          {/* Inner pattern overlay */}
          {styles.innerPattern && (
            <div 
              className="absolute inset-0"
              style={{ background: styles.innerPattern }}
            />
          )}

          {/* Pulse animation */}
          {effectiveAnimated && animations.pulseAnimation && progressPercent > 0 && (
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background: `radial-gradient(ellipse at 70% 50%, ${styles.glowColor}40, transparent 70%)`,
              }}
            />
          )}

          {/* Wave animation */}
          {effectiveAnimated && animations.waveAnimation && progressPercent > 0 && (
            <motion.div
              className="absolute inset-0"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: animations.shimmerDuration || 2,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                width: "50%",
              }}
            />
          )}

          {/* Sparkle animation */}
          {effectiveAnimated && animations.sparkleAnimation && progressPercent > 0 && (
            <>
              <motion.div
                className="absolute w-1 h-1 rounded-full bg-white"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0,
                }}
                style={{ left: "20%", top: "30%" }}
              />
              <motion.div
                className="absolute w-0.5 h-0.5 rounded-full bg-white"
                animate={{
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5,
                }}
                style={{ left: "50%", top: "60%" }}
              />
              <motion.div
                className="absolute w-1 h-1 rounded-full bg-white"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: 1,
                }}
                style={{ left: "75%", top: "40%" }}
              />
            </>
          )}

          {/* Shimmer effect */}
          {effectiveAnimated && progressPercent > 0 && (
            <motion.div
              className="absolute inset-0"
              animate={{
                x: ["-200%", "200%"],
              }}
              transition={{
                duration: animations.shimmerDuration || 2,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 75%, transparent 100%)`,
                width: "100%",
              }}
            />
          )}

          {/* Edge glow */}
          {showGlow && progressPercent > 5 && (
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-4"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background: `linear-gradient(90deg, transparent, ${styles.glowColor})`,
              }}
            />
          )}
        </motion.div>
        
        {/* Particle canvas overlay */}
        {effectiveAnimated && effectiveParticleConfig && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ height: height * 4, top: -height * 1.5 }}
          />
        )}

        {/* Progress marker */}
        {progressPercent > 0 && progressPercent < 100 && (
          <motion.div
            className="absolute top-0 bottom-0 w-0.5"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.5, 1, 0.5],
              left: `${progressPercent}%`,
            }}
            transition={{
              opacity: { duration: 1, repeat: Infinity },
              left: { duration: 0.8, ease: "easeOut" },
            }}
            style={{
              background: "rgba(255,255,255,0.8)",
              boxShadow: `0 0 4px ${styles.glowColor}`,
            }}
          />
        )}
      </div>
    </div>
  );
}

// Helper function to draw a star shape
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    let x = cx + Math.cos(rot) * outerRadius;
    let y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }

  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}
