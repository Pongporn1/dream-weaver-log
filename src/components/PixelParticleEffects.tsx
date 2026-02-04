import { useEffect, useRef, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: "dust" | "sparkle" | "ripple";
}

export function PixelParticleEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);
  const lastScrollY = useRef(0);
  const animationFrameRef = useRef<number>();

  // Check if pixel theme is active
  const [isPixelTheme, setIsPixelTheme] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-mythic-theme");
      setIsPixelTheme(theme === "pixelDreamMoon");
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-mythic-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Scroll Dust Trail
  useEffect(() => {
    if (!isPixelTheme) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);

      if (scrollDelta > 5) {
        // Create dust particles
        const particleCount = Math.min(Math.floor(scrollDelta / 10), 5);
        const newParticles: Particle[] = [];

        for (let i = 0; i < particleCount; i++) {
          newParticles.push({
            id: particleIdRef.current++,
            x: Math.random() * window.innerWidth,
            y: window.innerHeight * 0.5 + (Math.random() - 0.5) * 200,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 0,
            maxLife: 30,
            size: Math.random() > 0.5 ? 2 : 3,
            color: ["#818cf8", "#06b6d4", "#3b82f6"][Math.floor(Math.random() * 3)],
            type: "dust",
          });
        }

        setParticles((prev) => [...prev, ...newParticles]);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isPixelTheme]);

  // Click Sparkle
  useEffect(() => {
    if (!isPixelTheme) return;

    const handleClick = (e: MouseEvent) => {
      const sparkleCount = 8;
      const newParticles: Particle[] = [];

      for (let i = 0; i < sparkleCount; i++) {
        const angle = (i / sparkleCount) * Math.PI * 2;
        const speed = 2 + Math.random() * 2;

        newParticles.push({
          id: particleIdRef.current++,
          x: e.clientX + window.scrollX,
          y: e.clientY + window.scrollY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 40,
          size: Math.random() > 0.7 ? 4 : 3,
          color: ["#ffffff", "#06b6d4", "#818cf8", "#ff8fd6"][Math.floor(Math.random() * 4)],
          type: "sparkle",
        });
      }

      setParticles((prev) => [...prev, ...newParticles]);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isPixelTheme]);

  // Animation loop
  useEffect(() => {
    if (!isPixelTheme) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;

      setParticles((prev) => {
        const updated = prev
          .map((p) => {
            // Update position
            const newP = {
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              life: p.life + 1,
            };

            // Apply gravity for sparkles
            if (p.type === "sparkle") {
              newP.vy += 0.15;
            }

            // Draw particle
            const alpha = 1 - p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;

            if (p.type === "sparkle") {
              // Cross shape for sparkles
              ctx.fillRect(newP.x - p.size / 2, newP.y - p.size / 2, p.size, p.size);
              ctx.fillRect(newP.x - p.size * 1.5, newP.y - 1, p.size * 3, 2);
              ctx.fillRect(newP.x - 1, newP.y - p.size * 1.5, 2, p.size * 3);
            } else {
              // Square for dust
              ctx.fillRect(newP.x, newP.y, p.size, p.size);
            }

            // Glow effect
            if (alpha > 0.5) {
              ctx.globalAlpha = alpha * 0.3;
              ctx.fillRect(newP.x - 1, newP.y - 1, p.size + 2, p.size + 2);
            }

            return newP;
          })
          .filter((p) => p.life < p.maxLife);

        return updated;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", updateSize);
    };
  }, [isPixelTheme]);

  if (!isPixelTheme) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 pointer-events-none z-[90]"
      style={{
        imageRendering: "pixelated",
      }}
    />
  );
}
