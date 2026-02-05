import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { getSessionPhenomenon } from "@/utils/raritySystem";
import { applyMoonTheme } from "@/utils/moonTheme";
import { getMoonPhase } from "@/utils/moonPhases";
import { useParallax } from "@/hooks/useParallax";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useFPSThrottle } from "@/hooks/useFPSThrottle";
import { useParticleSystem } from "@/hooks/useParticleSystem";
import { useMoonInteraction } from "@/hooks/useMoonInteraction";
import { useHeaderGestures } from "@/hooks/useHeaderGestures";
import { useMythicCollection } from "@/hooks/useMythicCollection";
import type { MoonPhenomenon } from "@/data/moonPhenomena";
import type { DreamLog } from "@/types/dream";
import { toast } from "sonner";

// UI Components
import { MoonInfoOverlay } from "./header/MoonInfoOverlay";
import { HeaderContent } from "./header/HeaderContent";
import { HeaderPullIndicator } from "./header/HeaderPullIndicator";

// Canvas renderers
import {
  drawSky,
  drawStars,
  initConstellations,
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

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildDreamSeed(dreams: DreamLog[]): string {
  let hash = 0;
  const sorted = [...dreams].sort((a, b) => a.id.localeCompare(b.id));
  sorted.forEach((dream) => {
    const entityCount = dream.entities?.length ?? 0;
    const envCount = dream.environments?.length ?? 0;
    const piece = `${dream.id}|${dream.world}|${dream.date}|${dream.threatLevel}|${entityCount}|${envCount}`;
    hash ^= hashString(piece);
  });
  return `${hash}`;
}

import { PixelTransitionOverlay } from "./mythic/PixelTransitionOverlay";

const PIXEL_INTRO_SEEN_KEY = "pixel-intro-seen";

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentDreamStreak(dreams: DreamLog[]): number {
  if (dreams.length === 0) return 0;
  const dreamDates = new Set(
    dreams.map((dream) => formatDateKey(new Date(dream.date)))
  );

  let currentStreak = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  while (dreamDates.has(formatDateKey(checkDate))) {
    currentStreak += 1;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  if (currentStreak === 0) {
    checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - 1);
    checkDate.setHours(0, 0, 0, 0);
    if (dreamDates.has(formatDateKey(checkDate))) {
      currentStreak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
      while (dreamDates.has(formatDateKey(checkDate))) {
        currentStreak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
  }

  return currentStreak;
}

interface AnimatedProfileHeaderProps {
  dreams?: DreamLog[];
}

export function AnimatedProfileHeader({ dreams = [] }: AnimatedProfileHeaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const parallaxOffsetRef = useParallax();
  const lastDreamCountRef = useRef<number>(dreams.length);
  const revealStartRef = useRef<number | null>(null);

  // Mythic collection hook
  const { recordEncounter, getStats } = useMythicCollection();

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
  const constellationsRef = useRef<
    import("@/components/canvas").Constellation[]
  >([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const shootingStarTimerRef = useRef<number>(0);
  const moonPositionRef = useRef<MoonPosition>({ x: 0, y: 0, phase: 0 });
  const moonPhaseRef = useRef(getMoonPhase());
  const scrollOffsetRef = useRef({ x: 0, y: 0 });
  const [showPixelIntro, setShowPixelIntro] = useState(false);

  const [phenomenon, setPhenomenon] = useState<MoonPhenomenon | null>(null);
  const currentStreak = useMemo(() => getCurrentDreamStreak(dreams), [dreams]);

  const handlePixelIntroComplete = useCallback(() => {
    setShowPixelIntro(false);
  }, []);

  const handleForcePixelIntro = useCallback(() => {
    sessionStorage.removeItem(PIXEL_INTRO_SEEN_KEY);
    setShowPixelIntro(true);
  }, []);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    // Regenerate moon phenomenon
    const { phenomenon: newPhenomenon, isNewEncounter } =
      getSessionPhenomenon();
    setPhenomenon(newPhenomenon);
    applyMoonTheme(newPhenomenon);

    // Trigger Intro for Pixel Theme
    if (newPhenomenon.id === 'pixelDreamMoon') {
       setShowPixelIntro(true);
    }

    // Record encounter in collection only if it's a new encounter
    if (isNewEncounter) {
      recordEncounter(newPhenomenon);
    }

    // Show toast with new phenomenon
    const rarityLabel =
      newPhenomenon.rarity === "mythic" ? "✨ MYTHIC ✨ " : "";
    toast.success(`🌙 ${rarityLabel}${newPhenomenon.name}`, {
      description: newPhenomenon.subtitle,
      duration: newPhenomenon.rarity === "mythic" ? 5000 : 3000,
    });

    // Small delay for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 800));
  }, [recordEncounter]);

  // Header gesture hook
  const {
    containerRef: gestureContainerRef,
    pullDistance,
    isRefreshing,
    isPulling,
    progress,
    isReady,
  } = useHeaderGestures({
    onRefresh: handleRefresh,
    pullThreshold: 100,
  });

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
    handleTouchStart: handleMoonTouchStart,
    handleTouchMove: handleMoonTouchMove,
    handleTouchEnd: handleMoonTouchEnd,
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
    const { phenomenon: sessionPhenomenon, isNewEncounter } =
      getSessionPhenomenon();
    setPhenomenon(sessionPhenomenon);
    applyMoonTheme(sessionPhenomenon);

    if (sessionPhenomenon.id === "pixelDreamMoon") {
      const introSeen = sessionStorage.getItem(PIXEL_INTRO_SEEN_KEY);
      if (!introSeen) {
        setShowPixelIntro(true);
        sessionStorage.setItem(PIXEL_INTRO_SEEN_KEY, "1");
      }
    }

    // Record initial encounter in collection only if it's a new encounter
    if (isNewEncounter) {
      recordEncounter(sessionPhenomenon);
    }

    if (import.meta.env.DEV) {
      console.log(
        "🌙 Moon Phenomenon:",
        sessionPhenomenon.name,
        `(${sessionPhenomenon.rarity})`,
      );
    }
  }, [recordEncounter]);

  // Main animation effect
  useEffect(() => {
    if (!phenomenon) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sizeRef = { width: 0, height: 0, dpr: 1 };

    // Setup canvas
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      sizeRef.width = rect.width;
      sizeRef.height = rect.height;
      sizeRef.dpr = dpr;

      // Initialize basic elements
      starsRef.current = initStars(rect.width, rect.height, phenomenon, dreams.length);
      const stats = getStats();
      const seedSource =
        dreams.length > 0
          ? `${phenomenon.id}|${buildDreamSeed(dreams)}`
          : `${phenomenon.id}|${stats.totalEncounters}|${stats.totalDiscovered}|${stats.mythicCount}`;
      const densityBoost = Math.min(0.5, dreams.length / 200);
      constellationsRef.current = initConstellations(
        starsRef.current,
        seedSource,
        Math.min(1, phenomenon.starDensity + densityBoost),
      );
      cloudsRef.current = initClouds(rect.width, rect.height, phenomenon);
      shootingStarsRef.current = initShootingStars(rect.width, rect.height);
      moonPositionRef.current = {
        x: rect.width * 0.7,
        y: rect.height * 0.25,
        phase: 0,
      };
      moonPhaseRef.current = getMoonPhase();

      const moon = moonPositionRef.current;
      const moonRadius = calculateMoonRadius(phenomenon);

      // Initialize particle effects based on phenomenon
      initializeParticleEffects(phenomenon, moon, moonRadius, rect.width, rect.height);
    };
    resizeCanvas();

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

      const width = sizeRef.width;
      const height = sizeRef.height;
      ctx.clearRect(0, 0, width, height);

      const baseProps = {
        ctx,
        width,
        height,
        phenomenon,
        parallaxOffset: prefersReducedMotion
          ? { x: 0, y: 0 }
          : parallaxOffsetRef.current,
      };

      // Draw sky
      drawSky({ ...baseProps, time: currentTime });

      if (!prefersReducedMotion) {
        drawBackgroundEffects(
          ctx,
          phenomenon,
          width,
          height,
          scrollOffsetRef.current,
        );
        drawAtmosphericEffects(ctx, phenomenon, width, height);
      }

      const streakBoost = Math.min(0.8, currentStreak / 14);
      const constellationScale = 1 + streakBoost * 0.5;
      const constellationIntensity = 1 + streakBoost * 0.7;
      const revealDuration = prefersReducedMotion ? 300 : 1600;
      const revealProgress = revealStartRef.current
        ? Math.min(
            1,
            (currentTime - revealStartRef.current) / revealDuration
          )
        : 1;

      // Draw stars
      drawStars({
        ...baseProps,
        stars: starsRef.current,
        constellations: constellationsRef.current,
        timeMs: currentTime,
        constellationScale,
        constellationIntensity,
        constellationReveal: revealProgress,
      });

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
        moonPosition: prefersReducedMotion
          ? adjustedMoonPosition
          : moonPositionRef.current,
        moonPhase: moonPhaseRef.current,
      });

      if (!prefersReducedMotion) {
        const moonRadius = calculateMoonRadius(phenomenon);
        drawShatteredEffects(ctx, phenomenon, moonPositionRef.current);
        drawSpecialEffects(
          ctx,
          phenomenon,
          moonPositionRef.current,
          moonRadius,
          width,
          height,
        );
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

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
      });
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener("resize", resizeCanvas);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resizeCanvas);
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
    parallaxOffsetRef,
    getStats,
    currentStreak,
    dreams,
  ]);

  useEffect(() => {
    if (dreams.length !== lastDreamCountRef.current) {
      revealStartRef.current = performance.now();
      lastDreamCountRef.current = dreams.length;
    }
  }, [dreams.length]);

  return (
    <div
      ref={gestureContainerRef}
      className="relative w-full h-[60vh] min-h-[400px] overflow-hidden"
      style={{
        transform: `translateY(${isRefreshing ? 20 : pullDistance * 0.3}px)`,
        transition: isPulling ? "none" : "transform 0.3s ease-out",
      }}
    >
     
      {/* Pull-to-refresh indicator */}
      <HeaderPullIndicator
        pullDistance={pullDistance}
        progress={progress}
        isRefreshing={isRefreshing}
        isReady={isReady}
        isPulling={isPulling}
      />

      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onTouchStart={handleMoonTouchStart}
        onTouchMove={handleMoonTouchMove}
        onTouchEnd={handleMoonTouchEnd}
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
      
      {/* Pixel Mythic Theme Intro */ }
      <PixelTransitionOverlay 
        show={showPixelIntro} 
        onComplete={handlePixelIntroComplete} 
      />
    </div>
  );
}
