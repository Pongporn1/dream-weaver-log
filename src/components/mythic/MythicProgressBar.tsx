import React, { useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { MythicParticleConfig } from "@/hooks/useMythicCollection";

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
}

interface MythicProgressBarProps {
  value: number; // 0-100
  max?: number;
  particleConfig?: MythicParticleConfig | null;
  className?: string;
  height?: number;
  showGlow?: boolean;
  animated?: boolean;
  label?: string;
}

export function MythicProgressBar({
  value,
  max = 100,
  particleConfig,
  className,
  height = 12,
  showGlow = true,
  animated = true,
  label,
}: MythicProgressBarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const progressPercent = Math.min(100, Math.max(0, (value / max) * 100));

  // Generate particles based on config
  const createParticle = useMemo(() => {
    if (!particleConfig) return null;
    
    return (x: number, y: number, width: number, height: number): Particle => {
      const config = particleConfig;
      const isSecondary = Math.random() > 0.6;
      const color = isSecondary && config.secondaryColor ? config.secondaryColor : config.color;
      
      let vx = 0;
      let vy = 0;
      let size = 2;
      
      switch (config.type) {
        case "stars":
          vx = (Math.random() - 0.5) * config.speed * 0.5;
          vy = (Math.random() - 0.3) * config.speed * 0.3;
          size = Math.random() * 3 + 1;
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
          break;
        case "crystals":
          vx = (Math.random() - 0.5) * config.speed * 0.4;
          vy = (Math.random() - 0.5) * config.speed * 0.4;
          size = Math.random() * 4 + 2;
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
      };
    };
  }, [particleConfig, progressPercent]);

  // Animation loop
  useEffect(() => {
    if (!animated || !canvasRef.current || !particleConfig) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const width = rect.width;
    const height = rect.height;
    
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Spawn new particles at the progress edge
      if (createParticle && Math.random() < particleConfig.density * 0.3) {
        particlesRef.current.push(createParticle(0, 0, width, height));
      }
      
      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        
        const lifePercent = p.life / p.maxLife;
        const alpha = p.opacity * (1 - lifePercent);
        
        if (alpha <= 0) return false;
        
        ctx.save();
        
        if (particleConfig.glow) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.size * 2;
        }
        
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        
        // Different shapes based on particle type
        switch (particleConfig.type) {
          case "crystals":
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - p.size);
            ctx.lineTo(p.x + p.size * 0.7, p.y);
            ctx.lineTo(p.x, p.y + p.size);
            ctx.lineTo(p.x - p.size * 0.7, p.y);
            ctx.closePath();
            ctx.fill();
            break;
          case "stars":
            drawStar(ctx, p.x, p.y, 4, p.size, p.size * 0.5);
            break;
          case "lightning":
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.vx * 3, p.y + p.vy * 3);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size * 0.5;
            ctx.stroke();
            break;
          default:
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        return true;
      });
      
      // Limit particle count
      if (particlesRef.current.length > 50) {
        particlesRef.current = particlesRef.current.slice(-50);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animated, particleConfig, createParticle]);

  const barColor = particleConfig?.color || "hsl(var(--primary))";
  const glowColor = particleConfig?.color || "hsl(var(--primary))";

  return (
    <div className={cn("relative w-full", className)}>
      {label && (
        <div className="flex justify-between items-center mb-1 text-xs text-muted-foreground">
          <span>{label}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
      )}
      
      <div
        className="relative overflow-hidden rounded-full bg-secondary"
        style={{ height }}
      >
        {/* Progress fill */}
        <div
          className="h-full transition-all duration-500 ease-out rounded-full"
          style={{
            width: `${progressPercent}%`,
            background: particleConfig
              ? `linear-gradient(90deg, ${particleConfig.secondaryColor || barColor}, ${barColor})`
              : barColor,
            boxShadow: showGlow && particleConfig?.glow
              ? `0 0 10px ${glowColor}, 0 0 20px ${glowColor}40`
              : undefined,
          }}
        />
        
        {/* Shimmer effect */}
        {animated && progressPercent > 0 && (
          <div
            className="absolute inset-0 overflow-hidden rounded-full"
            style={{ width: `${progressPercent}%` }}
          >
            <div
              className="absolute inset-0 animate-shimmer"
              style={{
                background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        )}
        
        {/* Particle canvas overlay */}
        {animated && particleConfig && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ height: height * 3, top: -height }}
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
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
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
