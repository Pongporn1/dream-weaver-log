import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { DreamLog } from "@/types/dream";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface AnimatedBookCoverProps {
  dream: DreamLog;
}

// Enhanced color schemes based on threat level
const threatColorSchemes: Record<number, {
  gradient: string[];
  particles: string;
  glow: string;
}> = {
  0: {
    gradient: ["#334155", "#475569", "#64748b"],
    particles: "#94a3b8",
    glow: "rgba(148, 163, 184, 0.3)",
  },
  1: {
    gradient: ["#064e3b", "#059669", "#10b981"],
    particles: "#34d399",
    glow: "rgba(52, 211, 153, 0.3)",
  },
  2: {
    gradient: ["#1e3a8a", "#1e40af", "#3b82f6"],
    particles: "#60a5fa",
    glow: "rgba(96, 165, 250, 0.3)",
  },
  3: {
    gradient: ["#713f12", "#ca8a04", "#eab308"],
    particles: "#fde047",
    glow: "rgba(253, 224, 71, 0.3)",
  },
  4: {
    gradient: ["#7c2d12", "#ea580c", "#f97316"],
    particles: "#fb923c",
    glow: "rgba(251, 146, 60, 0.3)",
  },
  5: {
    gradient: ["#7f1d1d", "#dc2626", "#ef4444"],
    particles: "#f87171",
    glow: "rgba(248, 113, 113, 0.4)",
  },
};

// Threat level indicators
const threatIndicators: Record<number, { icon: string; label: string }> = {
  0: { icon: "○", label: "Safe" },
  1: { icon: "◐", label: "Low" },
  2: { icon: "◑", label: "Mild" },
  3: { icon: "◒", label: "Moderate" },
  4: { icon: "◓", label: "High" },
  5: { icon: "●", label: "Critical" },
};

function getColorScheme(threatLevel: number) {
  return threatColorSchemes[threatLevel] || threatColorSchemes[2];
}

export function AnimatedBookCover({ dream }: AnimatedBookCoverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const colorScheme = getColorScheme(dream.threatLevel);
  const threatInfo = threatIndicators[dream.threatLevel] || threatIndicators[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();

    // Initialize particles - more particles for higher threat
    const initParticles = () => {
      const particles: Particle[] = [];
      const rect = canvas.getBoundingClientRect();
      const particleCount = 20 + dream.threatLevel * 8;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * (0.3 + dream.threatLevel * 0.1),
          vy: (Math.random() - 0.5) * (0.3 + dream.threatLevel * 0.1),
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.6 + 0.2,
        });
      }
      particlesRef.current = particles;
    };
    initParticles();

    // Animation loop
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, rect.width * 0.3, rect.height);
      gradient.addColorStop(0, colorScheme.gradient[0]);
      gradient.addColorStop(0.5, colorScheme.gradient[1]);
      gradient.addColorStop(1, colorScheme.gradient[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = rect.width;
        if (particle.x > rect.width) particle.x = 0;
        if (particle.y < 0) particle.y = rect.height;
        if (particle.y > rect.height) particle.y = 0;

        // Draw particle with glow effect
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${colorScheme.particles}${Math.floor(particle.opacity * 255)
          .toString(16)
          .padStart(2, "0")}`;
        ctx.shadowBlur = particle.size * 2;
        ctx.shadowColor = colorScheme.particles;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [colorScheme, dream.threatLevel]);

  return (
    <Link to={`/logs/${dream.id}`} className="group block">
      <div 
        className="aspect-[2/3] rounded-xl overflow-hidden relative shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02] border border-white/10"
        style={{ 
          boxShadow: `0 4px 20px ${colorScheme.glow}, inset 0 1px 0 rgba(255,255,255,0.1)` 
        }}
      >
        {/* Animated Canvas Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

        {/* Threat Level Badge - Top Right */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/20">
          <span className="text-[10px] text-white/90">{threatInfo.icon}</span>
          <span className="text-[10px] text-white/80 font-medium">{dream.threatLevel}</span>
        </div>

        {/* Dream ID - Top Left */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/30 backdrop-blur-sm">
          <span className="text-[9px] text-white/60 font-mono">{dream.id}</span>
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          {/* Top Spacer */}
          <div className="h-8" />

          {/* Center - World Name */}
          <div className="flex-1 flex items-center justify-center px-1">
            <h3 className="font-bold text-lg sm:text-xl text-center leading-snug text-white drop-shadow-lg line-clamp-3 tracking-wide">
              {dream.world || "Unknown"}
            </h3>
          </div>

          {/* Bottom - Date & Info */}
          <div className="space-y-2">
            {/* Decorative Line */}
            <div className="flex items-center justify-center gap-2 opacity-50">
              <div className="h-px w-6 bg-gradient-to-r from-transparent to-white/60" />
              <div className="w-1 h-1 rounded-full bg-white/60" />
              <div className="h-px w-6 bg-gradient-to-l from-transparent to-white/60" />
            </div>
            
            {/* Date */}
            <p className="text-[11px] text-white/70 font-light tracking-wider text-center">
              {format(new Date(dream.date), "d MMM yyyy", { locale: th })}
            </p>

            {/* Wake Time */}
            {dream.wakeTime && (
              <p className="text-[10px] text-white/50 text-center">
                {dream.wakeTime}
              </p>
            )}
          </div>
        </div>

        {/* Hover Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-transparent group-hover:via-white/15 transition-all duration-700 transform translate-x-full group-hover:translate-x-0" />

        {/* Border Glow on Hover */}
        <div 
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ 
            boxShadow: `inset 0 0 20px ${colorScheme.glow}` 
          }}
        />
      </div>
    </Link>
  );
}
