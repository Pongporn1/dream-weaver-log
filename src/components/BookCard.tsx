import { Badge } from "@/components/ui/badge";
import { DreamLog } from "@/types/dream";
import { useEffect, useRef } from "react";

interface BookCardProps {
  dream: DreamLog;
  onClick?: () => void;
  variant?: "grid" | "list";
}

// Animated Canvas Book Cover Component
function AnimatedBookCover({ worldName, className }: { worldName: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 200;
    canvas.height = 300;

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    // Create particles based on world name
    const seed = worldName.charCodeAt(0);
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    // Color schemes based on world name
    const colorSchemes = [
      { bg: ['#1e3a8a', '#3b82f6', '#60a5fa'], particle: '#93c5fd' }, // Blue
      { bg: ['#581c87', '#a855f7', '#c084fc'], particle: '#e9d5ff' }, // Purple
      { bg: ['#c2410c', '#f97316', '#fb923c'], particle: '#fed7aa' }, // Orange
      { bg: ['#065f46', '#10b981', '#34d399'], particle: '#a7f3d0' }, // Green
    ];
    
    const colorScheme = colorSchemes[seed % colorSchemes.length];

    // Animation loop
    let animationId: number;
    const animate = () => {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, colorScheme.bg[0]);
      gradient.addColorStop(0.5, colorScheme.bg[1]);
      gradient.addColorStop(1, colorScheme.bg[2]);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw world name
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(worldName.charAt(0).toUpperCase(), canvas.width / 2, canvas.height / 2);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [worldName]);

  return <canvas ref={canvasRef} className={className} />;
}

export function BookCard({ dream, onClick, variant = "list" }: BookCardProps) {
  const getDaysLeft = () => {
    return Math.floor(Math.random() * 10) + 1;
  };

  const daysLeft = getDaysLeft();
  const isDueSoon = daysLeft <= 2;

  if (variant === "grid") {
    return (
      <button
        onClick={onClick}
        className="flex-shrink-0 w-24 md:w-32 group cursor-pointer"
      >
        {/* Animated Book Cover */}
        <div className="relative w-full h-32 md:h-44 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
          <AnimatedBookCover 
            worldName={dream.world} 
            className="w-full h-full object-cover"
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          
          {/* Glow Effect on Hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br from-white/20 to-transparent" />
          
          {/* World Name */}
          <div className="absolute inset-0 flex items-end justify-center p-2 md:p-3">
            <div className="text-[10px] md:text-xs text-center font-bold text-white drop-shadow-lg line-clamp-2">
              {dream.world}
            </div>
          </div>
        </div>
        
        {/* Book Info */}
        <div className="mt-1 md:mt-2 text-left">
          <p className="text-[10px] md:text-xs text-white/90 font-medium truncate">
            {dream.world}
          </p>
          <p className="text-[9px] md:text-xs text-white/60 truncate">
            {daysLeft} days left
          </p>
        </div>
      </button>
    );
  }

  // List variant
  return (
    <button
      onClick={onClick}
      className="w-full bg-white/95 dark:bg-white/90 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
    >
      <div className="flex gap-4">
        {/* Animated Book Cover */}
        <div className="relative flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden shadow-md">
          <AnimatedBookCover 
            worldName={dream.world} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0 text-left">
          <h3 className="font-bold text-gray-900 dark:text-gray-900 truncate mb-1">
            {dream.world}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-600 mb-2">
            {dream.date}
          </p>
          
          {/* Status */}
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${isDueSoon ? 'bg-orange-500' : 'bg-blue-500'}`} />
            <span className="text-xs text-gray-600 dark:text-gray-600">
              {isDueSoon ? 'Due tomorrow' : `${daysLeft} days left`}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {dream.environments.slice(0, 2).map((env, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {env}
              </Badge>
            ))}
            {dream.environments.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{dream.environments.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
