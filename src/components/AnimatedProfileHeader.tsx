import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  color: string;
  opacity: number;
  isActive: boolean;
  trailLength: number;
}

export function AnimatedProfileHeader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animationFrameRef = useRef<number>();
  const moonPositionRef = useRef({ x: 0, y: 0, phase: 0 });
  const shootingStarTimerRef = useRef<number>(0);
  const meteorShowerChance = 0.25; // 25% chance for meteor shower

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

    const rect = canvas.getBoundingClientRect();

    // Initialize stars (100+ twinkling stars)
    const initStars = () => {
      const stars: Star[] = [];
      for (let i = 0; i < 120; i++) {
        stars.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height * 0.6, // Upper 60% of canvas
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = stars;
    };
    initStars();

    // Initialize clouds
    const initClouds = () => {
      const clouds: Cloud[] = [];
      for (let i = 0; i < 5; i++) {
        clouds.push({
          x: Math.random() * rect.width,
          y: rect.height * 0.3 + Math.random() * rect.height * 0.3,
          width: Math.random() * 100 + 80,
          height: Math.random() * 30 + 20,
          speed: Math.random() * 0.2 + 0.1,
          opacity: Math.random() * 0.3 + 0.2,
        });
      }
      cloudsRef.current = clouds;
    };
    initClouds();

    // Initialize shooting stars (10 total)
    const shootingStarColors = [
      '#FFFFFF', '#FFE4B5', '#87CEEB', '#DDA0DD', '#F0E68C',
      '#98FB98', '#FFB6C1', '#B0E0E6', '#FFDAB9', '#E6E6FA'
    ];
    
    const initShootingStars = () => {
      const stars: ShootingStar[] = [];
      for (let i = 0; i < 10; i++) {
        stars.push({
          x: rect.width + Math.random() * 100,
          y: Math.random() * rect.height * 0.6,
          length: Math.random() * 60 + 40,
          speed: Math.random() * 1.5 + 1, // Slower speed: 1-2.5
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3, // Roughly 45 degrees
          color: shootingStarColors[i],
          opacity: Math.random() * 0.3 + 0.7,
          isActive: false,
          trailLength: Math.random() * 80 + 60,
        });
      }
      shootingStarsRef.current = stars;
    };
    initShootingStars();

    // Initialize moon
    moonPositionRef.current = {
      x: rect.width * 0.7,
      y: rect.height * 0.25,
      phase: 0,
    };

    // Draw gradient background
    const drawBackground = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
      gradient.addColorStop(0, "#1a1a2e"); // Dark blue-black
      gradient.addColorStop(0.5, "#2d1b4e"); // Purple
      gradient.addColorStop(1, "#4a5568"); // Light gray-blue
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);
    };

    // Draw twinkling stars
    const drawStars = () => {
      starsRef.current.forEach((star) => {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.5 + 0.5;
        const currentOpacity = star.opacity * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.fill();

        // Add glow for larger stars
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.2})`;
          ctx.fill();
        }
      });
    };

    // Draw beautiful crescent moon with iridescent colors
    const drawMoon = () => {
      const moon = moonPositionRef.current;
      moon.phase += 0.005;
      const offsetY = Math.sin(moon.phase) * 3;

      // Outer glow
      const outerGlow = ctx.createRadialGradient(
        moon.x,
        moon.y + offsetY,
        0,
        moon.x,
        moon.y + offsetY,
        60
      );
      outerGlow.addColorStop(0, "rgba(200, 220, 255, 0.3)");
      outerGlow.addColorStop(0.5, "rgba(180, 200, 255, 0.15)");
      outerGlow.addColorStop(1, "rgba(180, 200, 255, 0)");
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(moon.x, moon.y + offsetY, 60, 0, Math.PI * 2);
      ctx.fill();

      // Main moon body with iridescent gradient
      const moonGradient = ctx.createLinearGradient(
        moon.x - 40,
        moon.y + offsetY - 40,
        moon.x + 40,
        moon.y + offsetY + 40
      );
      moonGradient.addColorStop(0, "#e0f0ff"); // Light cyan
      moonGradient.addColorStop(0.3, "#f0e6ff"); // Lavender
      moonGradient.addColorStop(0.6, "#ffe6f0"); // Light pink
      moonGradient.addColorStop(1, "#e6e6fa"); // Pale lavender
      ctx.fillStyle = moonGradient;
      ctx.beginPath();
      ctx.arc(moon.x, moon.y + offsetY, 40, 0, Math.PI * 2);
      ctx.fill();

      // Crescent shadow for depth
      ctx.fillStyle = "rgba(100, 100, 150, 0.4)";
      ctx.beginPath();
      ctx.arc(moon.x + 15, moon.y + offsetY, 38, 0, Math.PI * 2);
      ctx.fill();
    };

    // Draw realistic soft clouds with depth
    const drawClouds = () => {
      cloudsRef.current.forEach((cloud) => {
        cloud.x += cloud.speed;
        if (cloud.x > rect.width + cloud.width) {
          cloud.x = -cloud.width;
        }

        // Cloud shadow/depth layer
        ctx.fillStyle = `rgba(150, 150, 180, ${cloud.opacity * 0.6})`;
        ctx.beginPath();
        ctx.ellipse(
          cloud.x + 5,
          cloud.y + 5,
          cloud.width / 2,
          cloud.height / 2,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Main cloud body with gradient
        const cloudGradient = ctx.createRadialGradient(
          cloud.x,
          cloud.y - cloud.height * 0.3,
          0,
          cloud.x,
          cloud.y,
          cloud.width / 2
        );
        cloudGradient.addColorStop(0, `rgba(230, 230, 250, ${cloud.opacity})`);
        cloudGradient.addColorStop(0.6, `rgba(200, 200, 230, ${cloud.opacity * 0.8})`);
        cloudGradient.addColorStop(1, `rgba(180, 180, 210, ${cloud.opacity * 0.5})`);
        ctx.fillStyle = cloudGradient;
        ctx.beginPath();
        ctx.ellipse(
          cloud.x,
          cloud.y,
          cloud.width / 2,
          cloud.height / 2,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Cloud puffs with varying sizes
        const puffs = [
          { x: -0.4, y: -0.3, w: 0.35, h: 0.5 },
          { x: -0.2, y: -0.4, w: 0.3, h: 0.45 },
          { x: 0.2, y: -0.35, w: 0.32, h: 0.48 },
          { x: 0.4, y: -0.25, w: 0.3, h: 0.45 },
        ];

        puffs.forEach((puff) => {
          const puffGradient = ctx.createRadialGradient(
            cloud.x + cloud.width * puff.x,
            cloud.y + cloud.height * puff.y,
            0,
            cloud.x + cloud.width * puff.x,
            cloud.y + cloud.height * puff.y,
            cloud.width * puff.w
          );
          puffGradient.addColorStop(0, `rgba(240, 240, 255, ${cloud.opacity})`);
          puffGradient.addColorStop(0.7, `rgba(210, 210, 240, ${cloud.opacity * 0.7})`);
          puffGradient.addColorStop(1, `rgba(190, 190, 220, ${cloud.opacity * 0.3})`);
          ctx.fillStyle = puffGradient;
          ctx.beginPath();
          ctx.ellipse(
            cloud.x + cloud.width * puff.x,
            cloud.y + cloud.height * puff.y,
            cloud.width * puff.w,
            cloud.height * puff.h,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
        });
      });
    };

    // Draw shooting stars
    const drawShootingStars = () => {
      shootingStarsRef.current.forEach((star) => {
        if (!star.isActive) return;

        // Update position
        star.x -= Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;

        // Deactivate when off screen
        if (star.x < -star.trailLength || star.y > rect.height + star.trailLength) {
          star.isActive = false;
          return;
        }

        ctx.save();

        // Draw trail with gradient
        const gradient = ctx.createLinearGradient(
          star.x,
          star.y,
          star.x + Math.cos(star.angle) * star.trailLength,
          star.y - Math.sin(star.angle) * star.trailLength
        );
        gradient.addColorStop(0, star.color);
        gradient.addColorStop(0.5, `${star.color}88`);
        gradient.addColorStop(1, `${star.color}00`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.globalAlpha = star.opacity;

        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(
          star.x + Math.cos(star.angle) * star.trailLength,
          star.y - Math.sin(star.angle) * star.trailLength
        );
        ctx.stroke();

        // Draw bright head with glow
        const glowGradient = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          8
        );
        glowGradient.addColorStop(0, '#FFFFFF');
        glowGradient.addColorStop(0.3, star.color);
        glowGradient.addColorStop(1, `${star.color}00`);

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Shooting star activation logic with meteor shower chance
      shootingStarTimerRef.current++;
      const randomInterval = 3600 + Math.random() * 3600; // 1-2 minutes at 60fps
      if (shootingStarTimerRef.current > randomInterval) {
        shootingStarTimerRef.current = 0;
        const inactiveStars: number[] = [];
        shootingStarsRef.current.forEach((s, index) => {
          if (!s.isActive) inactiveStars.push(index);
        });
        
        if (inactiveStars.length > 0) {
          // Check for meteor shower (10% chance)
          const isMeteorShower = Math.random() < meteorShowerChance;
          
          if (isMeteorShower && inactiveStars.length >= 3) {
            // Meteor shower! Activate 3-5 shooting stars
            const showerCount = Math.min(
              Math.floor(Math.random() * 3) + 3, // 3-5 stars
              inactiveStars.length
            );
            
            for (let i = 0; i < showerCount; i++) {
              const randomIndex = inactiveStars[Math.floor(Math.random() * inactiveStars.length)];
              const star = shootingStarsRef.current[randomIndex];
              star.isActive = true;
              // Start from top-right area with slight variation
              star.x = rect.width * 0.6 + Math.random() * rect.width * 0.4;
              star.y = Math.random() * rect.height * 0.4;
              // Remove from inactive list
              inactiveStars.splice(inactiveStars.indexOf(randomIndex), 1);
            }
          } else {
            // Single shooting star
            const randomIndex = inactiveStars[Math.floor(Math.random() * inactiveStars.length)];
            const star = shootingStarsRef.current[randomIndex];
            star.isActive = true;
            // Start from top-right area
            star.x = rect.width * 0.7 + Math.random() * rect.width * 0.3;
            star.y = Math.random() * rect.height * 0.3;
          }
        }
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      drawBackground();
      drawStars();
      drawMoon();
      drawClouds();
      drawShootingStars();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-80 overflow-hidden">
      {/* Animated Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-bold text-white drop-shadow-2xl mb-2">
          Dream book
        </h1>
        <p className="text-lg text-white/90 drop-shadow-lg">
          วันนี้มาเล่าเรื่องอะไรหรอ
        </p>
      </div>

      {/* Bottom gradient fade - Minimal to keep animation vibrant */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/30 to-transparent" />
    </div>
  );
}
