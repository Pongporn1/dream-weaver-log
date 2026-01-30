import { useEffect, useRef, useState } from "react";
import { getSessionPhenomenon } from "@/utils/raritySystem";
import { applyMoonTheme } from "@/utils/moonTheme";
import { getMoonPhase } from "@/utils/moonPhases";
import { useParallax } from "@/hooks/useParallax";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useFPSThrottle } from "@/hooks/useFPSThrottle";
import { useParticleSystem } from "@/hooks/useParticleSystem";
import { useMoonInteraction } from "@/hooks/useMoonInteraction";
import type { MoonPhenomenon } from "@/data/moonPhenomena";

// UI Components
import { MoonInfoOverlay } from "./header/MoonInfoOverlay";
import { HeaderContent } from "./header/HeaderContent";

// Canvas renderers
import {
  drawSky,
  drawStars,
  drawMoon,
  drawClouds,
  drawShootingStars,
  initStars,
  initClouds,
  initShootingStars,
  calculateMoonRadius,
  type Star,
  type Cloud,
  type ShootingStar,
  type MoonPosition,
} from "@/components/canvas";

export function AnimatedProfileHeader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const parallaxOffsetRef = useParallax();
  
  // Performance hooks
  const prefersReducedMotion = useReducedMotion();
  const { shouldRenderFrame } = useFPSThrottle({
    targetFPS: prefersReducedMotion ? 15 : 60,
    enableAdaptive: true,
    minFPS: 15,
    maxFPS: 60,
  });

  // Basic elements
  const starsRef = useRef<Star[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const shootingStarTimerRef = useRef<number>(0);
  const moonPositionRef = useRef<MoonPosition>({ x: 0, y: 0, phase: 0 });
  const moonPhaseRef = useRef(getMoonPhase());
  const scrollOffsetRef = useRef({ x: 0, y: 0 });

  const [phenomenon, setPhenomenon] = useState<MoonPhenomenon | null>(null);

  // Particle system hook
  const {
    moonFlashesRef,
    sparklesRef,
    initializeParticleEffects,
    drawBackgroundEffects,
    drawAtmosphericEffects,
    drawShatteredEffects,
    drawSpecialEffects,
    drawOrbitingEffects,
    drawWeatherEffects,
    drawVoidEffects,
    drawEchoMoonsEffect,
    drawFirefliesEffect,
  } = useParticleSystem();

  // Moon interaction hook
  const {
    overlayType,
    currentMoonPhase,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleCanvasClick,
    handleCloseOverlay,
  } = useMoonInteraction({
    canvasRef,
    phenomenon,
    moonPositionRef,
    parallaxOffsetRef,
    moonFlashesRef,
    sparklesRef,
  });

  // Initialize phenomenon
  useEffect(() => {
    const sessionPhenomenon = getSessionPhenomenon();
    setPhenomenon(sessionPhenomenon);
    applyMoonTheme(sessionPhenomenon);
    console.log("🌙 Moon Phenomenon:", sessionPhenomenon.name, `(${sessionPhenomenon.rarity})`);
  }, []);

  // Main animation effect
  useEffect(() => {
    if (!phenomenon) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Setup canvas
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Initialize basic elements
    starsRef.current = initStars(width, height, phenomenon);
    cloudsRef.current = initClouds(width, height, phenomenon);
    shootingStarsRef.current = initShootingStars(width, height);
    moonPositionRef.current = { x: width * 0.7, y: height * 0.25, phase: 0 };
    moonPhaseRef.current = getMoonPhase();

    const moon = moonPositionRef.current;
    const moonRadius = calculateMoonRadius(phenomenon);

    // Initialize particle effects based on phenomenon
    initializeParticleEffects(phenomenon, moon, moonRadius, width, height);

    // Scroll handler
    const handleScroll = () => {
      scrollOffsetRef.current = { x: window.scrollX, y: window.scrollY };
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Animation loop with FPS throttling
    const animate = (currentTime: number) => {
      if (!shouldRenderFrame(currentTime)) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      
      const baseProps = {
        ctx,
        width,
        height,
        phenomenon,
        parallaxOffset: prefersReducedMotion ? { x: 0, y: 0 } : parallaxOffsetRef.current,
      };

      // Draw sky
      drawSky(baseProps);

      if (!prefersReducedMotion) {
        drawBackgroundEffects(ctx, phenomenon, width, height, scrollOffsetRef.current);
        drawAtmosphericEffects(ctx, phenomenon, width);
      }

      // Draw stars
      drawStars({ ...baseProps, stars: starsRef.current });

      if (!prefersReducedMotion) {
        drawEchoMoonsEffect(ctx, phenomenon, moonPositionRef.current);
        drawFirefliesEffect(ctx, phenomenon, width, height);
      }

      // Draw moon
      const moonPhaseSpeed = prefersReducedMotion ? 0.001 : 0.005;
      const adjustedMoonPosition = { ...moonPositionRef.current };
      if (prefersReducedMotion) {
        adjustedMoonPosition.phase += moonPhaseSpeed;
      }
      moonPositionRef.current = drawMoon({
        ...baseProps,
        moonPosition: prefersReducedMotion ? adjustedMoonPosition : moonPositionRef.current,
        moonPhase: moonPhaseRef.current,
      });

      if (!prefersReducedMotion) {
        drawShatteredEffects(ctx, phenomenon, moonPositionRef.current);
        drawSpecialEffects(ctx, phenomenon, moonPositionRef.current, moonRadius, width, height);
        drawOrbitingEffects(ctx, phenomenon, moonPositionRef.current);
      }

      // Draw clouds
      drawClouds({ ...baseProps, clouds: cloudsRef.current });

      if (!prefersReducedMotion) {
        drawWeatherEffects(ctx, phenomenon, width, height);
        drawVoidEffects(ctx, phenomenon, moonPositionRef.current);

        const shootingResult = drawShootingStars({
          ...baseProps,
          shootingStars: shootingStarsRef.current,
          timer: shootingStarTimerRef.current,
        });
        shootingStarsRef.current = shootingResult.shootingStars;
        shootingStarTimerRef.current = shootingResult.timer;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [
    phenomenon,
    prefersReducedMotion,
    shouldRenderFrame,
    initializeParticleEffects,
    drawBackgroundEffects,
    drawAtmosphericEffects,
    drawShatteredEffects,
    drawSpecialEffects,
    drawOrbitingEffects,
    drawWeatherEffects,
    drawVoidEffects,
    drawEchoMoonsEffect,
    drawFirefliesEffect,
  ]);

  return (
    <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="absolute inset-0 w-full h-full cursor-pointer"
        style={{ width: "100%", height: "100%", touchAction: "pan-y" }}
      />
      <HeaderContent phenomenon={phenomenon} />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />
      
      {overlayType && (
        <MoonInfoOverlay
          type={overlayType}
          moonPhase={currentMoonPhase}
          phenomenon={phenomenon}
          onClose={handleCloseOverlay}
        />
      )}
    </div>
  );
}
