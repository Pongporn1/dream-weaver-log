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

// Color schemes for different worlds
const colorSchemes = [
  {
    // Blue Ocean
    gradient: ["#1e3a8a", "#1e40af", "#3b82f6"],
    particles: "#60a5fa",
  },
  {
    // Purple Mystery
    gradient: ["#581c87", "#7c3aed", "#a855f7"],
    particles: "#c084fc",
  },
  {
    // Orange Sunset
    gradient: ["#c2410c", "#ea580c", "#f97316"],
    particles: "#fb923c",
  },
  {
    // Green Forest
    gradient: ["#065f46", "#059669", "#10b981"],
    particles: "#34d399",
  },
];

function getColorScheme(dreamId: string) {
  const hash = dreamId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colorSchemes[hash % colorSchemes.length];
}

export function AnimatedBookCover({ dream }: AnimatedBookCoverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const colorScheme = getColorScheme(dream.id);

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

    // Initialize particles
    const initParticles = () => {
      const particles: Particle[] = [];
      const rect = canvas.getBoundingClientRect();

      for (let i = 0; i < 30; i++) {
        particles.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.3,
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
      const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
      gradient.addColorStop(0, colorScheme.gradient[0]);
      gradient.addColorStop(0.5, colorScheme.gradient[1]);
      gradient.addColorStop(1, colorScheme.gradient[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = rect.width;
        if (particle.x > rect.width) particle.x = 0;
        if (particle.y < 0) particle.y = rect.height;
        if (particle.y > rect.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${colorScheme.particles}${Math.floor(
          particle.opacity * 255,
        )
          .toString(16)
          .padStart(2, "0")}`;
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [colorScheme]);

  const worldInitial = dream.world?.[0]?.toUpperCase() || "?";

  return (
    <Link to={`/logs/${dream.id}`} className="group block">
      <div className="aspect-[2/3] rounded-lg overflow-hidden relative shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.03]">
        {/* Animated Canvas Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center p-6">
          {/* Center - World Name */}
          <div className="flex-1 flex items-center justify-center px-2">
            <h3 className="font-bold text-2xl sm:text-3xl text-center leading-tight text-white drop-shadow-2xl uppercase tracking-wider line-clamp-3">
              {dream.world || "Unknown"}
            </h3>
          </div>

          {/* Bottom - Date */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 opacity-60">
              <div className="h-px w-8 bg-white/50" />
              <div className="w-1 h-1 rounded-full bg-white/50" />
              <div className="h-px w-8 bg-white/50" />
            </div>
            <p className="text-xs text-white/80 font-light tracking-wide text-center uppercase">
              {format(new Date(dream.date), "d MMM yyyy", { locale: th })}
            </p>
          </div>
        </div>

        {/* Hover Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-transparent group-hover:via-white/20 transition-all duration-700 transform translate-x-full group-hover:translate-x-0" />
      </div>
    </Link>
  );
}
