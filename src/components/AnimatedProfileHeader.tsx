import { useEffect, useRef, useState, useCallback } from "react";
import { getSessionPhenomenon } from "@/utils/raritySystem";
import { applyMoonTheme } from "@/utils/moonTheme";
import { getMoonPhase, MoonPhaseInfo } from "@/utils/moonPhases";
import { useParallax } from "@/hooks/useParallax";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useFPSThrottle } from "@/hooks/useFPSThrottle";
import type { MoonPhenomenon } from "@/data/moonPhenomena";

// UI Components
import { MoonInfoOverlay } from "./header/MoonInfoOverlay";

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

// Particle effects
import {
  initMoonFlashes,
  spawnMoonFlash,
  drawMoonFlashes,
  initOrbitingParticles,
  drawOrbitingParticles,
  initSparkles,
  drawSparkles,
  initAuroraWaves,
  drawAurora,
  initFireflies,
  drawFireflies,
  initSnowflakes,
  drawSnowflakes,
  initFogLayers,
  drawFog,
  initMeteorShower,
  drawMeteorShower,
  initFrozenTime,
  drawFrozenTime,
  initVoidRipples,
  spawnVoidRipple,
  drawVoidRipples,
  initMoonFragments,
  drawMoonFragments,
  initShatterDust,
  drawShatterDust,
  initEchoMoons,
  drawEchoMoons,
  initBloodRings,
  drawBloodRings,
  initFadeParticles,
  drawFadeParticles,
  initSilenceWaves,
  drawSilenceWaves,
  initDreamDust,
  drawDreamDust,
  initMemoryFragments,
  drawMemoryFragments,
  initAncientRunes,
  drawAncientRunes,
  initLightRays,
  drawLightRays,
  initShootingStars as initShootingStarsLegendary,
  drawShootingStars as drawShootingStarsLegendary,
  initStarfield,
  drawStarfield,
  initNebula,
  drawNebula,
  initPrismLights,
  drawPrismLights,
  type MoonFlash,
  type OrbitingParticle,
  type Sparkle,
  type AuroraWave,
  type Firefly,
  type Snowflake,
  type FogLayer,
  type MeteorShowerParticle,
  type FrozenTimeParticle,
  type VoidRipple,
  type MoonFragment,
  type ShatterDust,
  type EchoMoon,
  type BloodRing,
  type FadeParticle,
  type SilenceWave,
  type DreamDust,
  type MemoryFragment,
  type AncientRune,
  type LightRay,
  type ShootingStar as ShootingStarParticle,
  type StarfieldParticle,
  type NebulaCloud,
  type PrismLight,
} from "@/utils/particleEffects";

// Content overlay component
import { HeaderContent } from "./header/HeaderContent";

export function AnimatedProfileHeader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const parallaxOffsetRef = useParallax();
  
  // Performance hooks
  const prefersReducedMotion = useReducedMotion();
  const { shouldRenderFrame, metrics, isLowPowerMode } = useFPSThrottle({
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

  // Particle system refs
  const moonFlashesRef = useRef<MoonFlash[]>([]);
  const orbitingParticlesRef = useRef<OrbitingParticle[]>([]);
  const sparklesRef = useRef<Sparkle[]>([]);
  const auroraWavesRef = useRef<AuroraWave[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);
  const snowflakesRef = useRef<Snowflake[]>([]);
  const fogLayersRef = useRef<FogLayer[]>([]);
  const moonFragmentsRef = useRef<MoonFragment[]>([]);
  const shatterDustRef = useRef<ShatterDust[]>([]);
  const meteorShowerRef = useRef<MeteorShowerParticle[]>([]);
  const frozenTimeRef = useRef<FrozenTimeParticle[]>([]);
  const voidRipplesRef = useRef<VoidRipple[]>([]);
  const echoMoonsRef = useRef<EchoMoon[]>([]);
  const bloodRingsRef = useRef<BloodRing[]>([]);
  const fadeParticlesRef = useRef<FadeParticle[]>([]);
  const silenceWavesRef = useRef<SilenceWave[]>([]);
  const dreamDustRef = useRef<DreamDust[]>([]);
  const memoryFragmentsRef = useRef<MemoryFragment[]>([]);
  const ancientRunesRef = useRef<AncientRune[]>([]);
  const lightRaysRef = useRef<LightRay[]>([]);
  const shootingStarsLegendaryRef = useRef<ShootingStarParticle[]>([]);
  const starfieldRef = useRef<StarfieldParticle[]>([]);
  const nebulaRef = useRef<NebulaCloud[]>([]);
  const prismLightsRef = useRef<PrismLight[]>([]);
  const lastShatterResetRef = useRef<number>(Date.now());
  const scrollOffsetRef = useRef({ x: 0, y: 0 });

  // Touch interaction state
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const isTouchMoveRef = useRef<boolean>(false);

  const [phenomenon, setPhenomenon] = useState<MoonPhenomenon | null>(null);
  const [overlayType, setOverlayType] = useState<"phase" | "phenomenon" | null>(null);
  const [currentMoonPhase, setCurrentMoonPhase] = useState<MoonPhaseInfo>(getMoonPhase());

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
      // FPS throttling - skip frame if not enough time has passed
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

      // Draw sky (always drawn)
      drawSky(baseProps);

      // Skip complex effects if reduced motion is preferred
      if (!prefersReducedMotion) {
        // Draw background effects (nebula, starfield)
        drawBackgroundEffects(ctx, phenomenon, width, height, scrollOffsetRef.current);

        // Draw aurora and fog (behind stars)
        drawAtmosphericEffects(ctx, phenomenon, width);
      }

      // Draw stars (simplified for reduced motion)
      drawStars({ ...baseProps, stars: starsRef.current });

      // Skip complex particle effects if reduced motion is preferred
      if (!prefersReducedMotion) {
        // Draw echo moons before main moon
        if (phenomenon.specialEffect === "echo" && echoMoonsRef.current.length > 0) {
          drawEchoMoons(ctx, echoMoonsRef.current, moon.x, moon.y, moon.phase, phenomenon.moonTint);
        }

        // Draw fireflies
        if (phenomenon.specialEffect === "fireflies" && firefliesRef.current.length > 0) {
          drawFireflies(ctx, firefliesRef.current, width, height);
        }
      }

      // Draw moon and update position (always drawn, but with reduced animation)
      const moonPhaseSpeed = prefersReducedMotion ? 0.001 : 0.005;
      const adjustedMoonPosition = { ...moonPositionRef.current };
      if (prefersReducedMotion) {
        // Minimal moon bobbing for reduced motion
        adjustedMoonPosition.phase += moonPhaseSpeed;
      }
      moonPositionRef.current = drawMoon({
        ...baseProps,
        moonPosition: prefersReducedMotion ? adjustedMoonPosition : moonPositionRef.current,
        moonPhase: moonPhaseRef.current,
      });

      // Skip complex effects if reduced motion is preferred
      if (!prefersReducedMotion) {
        // Draw shattered moon effects
        drawShatteredEffects(ctx, phenomenon, moonPositionRef.current);

        // Draw special particle effects
        drawSpecialEffects(ctx, phenomenon, moonPositionRef.current, moonRadius, width, height);

        // Draw orbiting particles for specific phenomena
        drawOrbitingEffects(ctx, phenomenon, moonPositionRef.current);
      }

      // Draw clouds (simplified movement for reduced motion)
      drawClouds({ ...baseProps, clouds: cloudsRef.current });

      // Skip weather effects if reduced motion is preferred
      if (!prefersReducedMotion) {
        // Draw weather effects
        drawWeatherEffects(ctx, phenomenon, width, height);

        // Draw void ripples
        drawVoidEffects(ctx, phenomenon, moonPositionRef.current);

        // Draw shooting stars
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
  }, [phenomenon, prefersReducedMotion, shouldRenderFrame]);

  // Helper functions for initializing and drawing effects
  const initializeParticleEffects = useCallback((
    phenomenon: MoonPhenomenon,
    moon: MoonPosition,
    moonRadius: number,
    width: number,
    height: number
  ) => {
    const intensity = phenomenon.effectIntensity || 0.5;
    const rarityScale = {
      normal: 0,
      rare: 0.3,
      very_rare: 0.5,
      legendary: 0.75,
      mythic: 1.0,
    }[phenomenon.rarity];

    // Orbiting particles for specific phenomena
    if (phenomenon.id === "superBlueBloodMoon") {
      orbitingParticlesRef.current = initOrbitingParticles(20, "#B84060", "#d85080");
    } else if (phenomenon.id === "brokenMoon") {
      orbitingParticlesRef.current = initOrbitingParticles(25, "#9898B8", "#6868a8", 0.008, 0.015);
    } else if (phenomenon.id === "emptySky") {
      orbitingParticlesRef.current = initOrbitingParticles(30, "#606080", "#707090", 0.008, 0.012);
    }

    if (phenomenon.rarity === "normal" || !phenomenon.specialEffect) return;

    const effect = phenomenon.specialEffect;
    if (effect === "flash") moonFlashesRef.current = initMoonFlashes();
    else if (effect === "sparkle") sparklesRef.current = initSparkles(moon.x, moon.y, 60);
    else if (effect === "echo") echoMoonsRef.current = initEchoMoons(moon.x, moon.y, moonRadius, 4);
    else if (effect === "aurora") auroraWavesRef.current = initAuroraWaves(height);
    else if (effect === "fireflies") firefliesRef.current = initFireflies(width, height, Math.floor((10 + intensity * 20) * rarityScale));
    else if (effect === "snow") snowflakesRef.current = initSnowflakes(width, Math.floor((30 + intensity * 70) * rarityScale));
    else if (effect === "fog") fogLayersRef.current = initFogLayers(width, height);
    else if (effect === "meteorShower") meteorShowerRef.current = initMeteorShower(width, height, Math.floor((10 + intensity * 15) * rarityScale));
    else if (effect === "frozenTime") frozenTimeRef.current = initFrozenTime(width, height, Math.floor((20 + intensity * 20) * rarityScale));
    else if (effect === "voidRipples") voidRipplesRef.current = initVoidRipples();
    else if (effect === "shattered") {
      moonFragmentsRef.current = initMoonFragments(moon.x, moon.y, 12);
      shatterDustRef.current = initShatterDust(moon.x, moon.y, 25);
    }
    else if (effect === "bloodRing") bloodRingsRef.current = initBloodRings(moonRadius);
    else if (effect === "fadeParticles") fadeParticlesRef.current = initFadeParticles(width, height);
    else if (effect === "silence") silenceWavesRef.current = initSilenceWaves();
    else if (effect === "dreamDust") dreamDustRef.current = initDreamDust(width, height);
    else if (effect === "memoryFragments") memoryFragmentsRef.current = initMemoryFragments(width, height);
    else if (effect === "ancientRunes") ancientRunesRef.current = initAncientRunes(moon.x, moon.y, moonRadius);
    else if (effect === "lightRays") lightRaysRef.current = initLightRays();
    else if (effect === "shootingStars") shootingStarsLegendaryRef.current = initShootingStarsLegendary();
    else if (effect === "starfield") starfieldRef.current = initStarfield(150);
    else if (effect === "nebula") nebulaRef.current = initNebula(width, height, 5);
    else if (effect === "prismLights") prismLightsRef.current = initPrismLights();
  }, []);

  const drawBackgroundEffects = (
    ctx: CanvasRenderingContext2D,
    phenomenon: MoonPhenomenon,
    width: number,
    height: number,
    scrollOffset: { x: number; y: number }
  ) => {
    if (phenomenon.specialEffect === "nebula" && nebulaRef.current.length > 0) {
      nebulaRef.current = drawNebula(ctx, nebulaRef.current, width, height, scrollOffset.x, scrollOffset.y);
    }
    if (phenomenon.specialEffect === "starfield" && starfieldRef.current.length > 0) {
      starfieldRef.current = drawStarfield(ctx, starfieldRef.current, width, height);
    }
  };

  const drawAtmosphericEffects = (
    ctx: CanvasRenderingContext2D,
    phenomenon: MoonPhenomenon,
    width: number
  ) => {
    if (phenomenon.specialEffect === "aurora" && auroraWavesRef.current.length > 0) {
      drawAurora(ctx, auroraWavesRef.current, width);
    }
    if (phenomenon.specialEffect === "fog" && fogLayersRef.current.length > 0) {
      drawFog(ctx, fogLayersRef.current, width);
    }
  };

  const drawShatteredEffects = (
    ctx: CanvasRenderingContext2D,
    phenomenon: MoonPhenomenon,
    moon: MoonPosition
  ) => {
    if (phenomenon.specialEffect !== "shattered") return;

    const currentTime = Date.now();
    if (currentTime - lastShatterResetRef.current > 10000) {
      shatterDustRef.current = initShatterDust(moon.x, moon.y, 25);
      lastShatterResetRef.current = currentTime;
    }

    if (shatterDustRef.current.length > 0) {
      drawShatterDust(ctx, shatterDustRef.current, phenomenon.moonTint, moon.x, moon.y);
    }
    if (moonFragmentsRef.current.length > 0) {
      drawMoonFragments(ctx, moonFragmentsRef.current, moon.x, moon.y, phenomenon.moonTint);
    }
  };

  const drawSpecialEffects = (
    ctx: CanvasRenderingContext2D,
    phenomenon: MoonPhenomenon,
    moon: MoonPosition,
    moonRadius: number,
    width: number,
    height: number
  ) => {
    const effect = phenomenon.specialEffect;
    if (!effect) return;

    if (effect === "flash" && moonFlashesRef.current.length >= 0) {
      if (Math.random() < 0.025) {
        moonFlashesRef.current.push(spawnMoonFlash(moon.x, moon.y, moonRadius));
      }
      moonFlashesRef.current = drawMoonFlashes(ctx, moonFlashesRef.current);
    }
    if (effect === "sparkle" && sparklesRef.current.length > 0) {
      drawSparkles(ctx, sparklesRef.current);
    }
    if (effect === "bloodRing" && bloodRingsRef.current.length > 0) {
      drawBloodRings(ctx, bloodRingsRef.current, moon.x, moon.y);
    }
    if (effect === "fadeParticles" && fadeParticlesRef.current.length > 0) {
      drawFadeParticles(ctx, fadeParticlesRef.current);
    }
    if (effect === "silence" && silenceWavesRef.current.length >= 0) {
      silenceWavesRef.current = drawSilenceWaves(ctx, silenceWavesRef.current, moon.x, moon.y, moonRadius);
    }
    if (effect === "dreamDust" && dreamDustRef.current.length > 0) {
      drawDreamDust(ctx, dreamDustRef.current);
    }
    if (effect === "memoryFragments" && memoryFragmentsRef.current.length > 0) {
      drawMemoryFragments(ctx, memoryFragmentsRef.current);
    }
    if (effect === "ancientRunes" && ancientRunesRef.current.length > 0) {
      drawAncientRunes(ctx, ancientRunesRef.current, moon.x, moon.y);
    }
    if (effect === "lightRays" && lightRaysRef.current.length > 0) {
      drawLightRays(ctx, lightRaysRef.current, moon.x, moon.y, moonRadius);
    }
    if (effect === "prismLights" && prismLightsRef.current.length > 0) {
      drawPrismLights(ctx, prismLightsRef.current, moon.x, moon.y, moonRadius);
    }
    if (effect === "shootingStars" && shootingStarsLegendaryRef.current.length >= 0) {
      shootingStarsLegendaryRef.current = drawShootingStarsLegendary(ctx, shootingStarsLegendaryRef.current, width, height);
    }
  };

  const drawOrbitingEffects = (
    ctx: CanvasRenderingContext2D,
    phenomenon: MoonPhenomenon,
    moon: MoonPosition
  ) => {
    if (
      (phenomenon.id === "superBlueBloodMoon" ||
        phenomenon.id === "brokenMoon" ||
        phenomenon.id === "emptySky") &&
      orbitingParticlesRef.current.length > 0
    ) {
      drawOrbitingParticles(ctx, orbitingParticlesRef.current, moon.x, moon.y);
    }
  };

  const drawWeatherEffects = (
    ctx: CanvasRenderingContext2D,
    phenomenon: MoonPhenomenon,
    width: number,
    height: number
  ) => {
    if (phenomenon.specialEffect === "snow" && snowflakesRef.current.length > 0) {
      drawSnowflakes(ctx, snowflakesRef.current, width, height);
    }
    if (phenomenon.specialEffect === "meteorShower" && meteorShowerRef.current.length > 0) {
      drawMeteorShower(ctx, meteorShowerRef.current, width, height);
    }
    if (phenomenon.specialEffect === "frozenTime" && frozenTimeRef.current.length > 0) {
      drawFrozenTime(ctx, frozenTimeRef.current);
    }
  };

  const drawVoidEffects = (
    ctx: CanvasRenderingContext2D,
    phenomenon: MoonPhenomenon,
    moon: MoonPosition
  ) => {
    if (phenomenon.specialEffect !== "voidRipples") return;

    const moonRadius = calculateMoonRadius(phenomenon);
    if (Math.random() < 0.015) {
      voidRipplesRef.current.push(
        spawnVoidRipple(moon.x, moon.y + Math.sin(moon.phase) * 3, moonRadius)
      );
    }
    voidRipplesRef.current = drawVoidRipples(ctx, voidRipplesRef.current, moon.x, moon.y);
  };

  // Check if touch/click is on the moon
  const isMoonHit = useCallback((clientX: number, clientY: number): boolean => {
    if (!canvasRef.current || !phenomenon) {
      console.log('🎯 isMoonHit: No canvas or phenomenon');
      return false;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    // Use CSS coordinates (not scaled by devicePixelRatio) since moon position is in CSS pixels
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const moon = moonPositionRef.current;
    const pX = parallaxOffsetRef.current.x * 0.8;
    const pY = parallaxOffsetRef.current.y * 0.8;
    const currentMoonX = moon.x + pX;
    const currentMoonY = moon.y + Math.sin(moon.phase) * 3 + pY;
    const moonRadius = calculateMoonRadius(phenomenon);

    const dist = Math.sqrt(
      Math.pow(clickX - currentMoonX, 2) + Math.pow(clickY - currentMoonY, 2)
    );

    const hit = dist < moonRadius * 1.5;
    console.log('🎯 Moon Hit Check:', { 
      clickX: clickX.toFixed(0), 
      clickY: clickY.toFixed(0), 
      moonX: currentMoonX.toFixed(0), 
      moonY: currentMoonY.toFixed(0), 
      dist: dist.toFixed(0), 
      moonRadius: moonRadius.toFixed(0), 
      threshold: (moonRadius * 1.5).toFixed(0),
      hit 
    });

    return hit;
  }, [phenomenon]);

  // Trigger visual feedback on moon tap
  const triggerMoonEffect = useCallback(() => {
    if (!canvasRef.current || !phenomenon) return;

    const moon = moonPositionRef.current;
    const pX = parallaxOffsetRef.current.x * 0.8;
    const pY = parallaxOffsetRef.current.y * 0.8;
    const currentMoonX = moon.x + pX;
    const currentMoonY = moon.y + Math.sin(moon.phase) * 3 + pY;

    if (navigator.vibrate) navigator.vibrate(20);
    moonFlashesRef.current.push(spawnMoonFlash(currentMoonX, currentMoonY));
    const newSparkles = initSparkles(currentMoonX, currentMoonY, 15);
    sparklesRef.current = [...sparklesRef.current, ...newSparkles];
  }, [phenomenon]);

  // Handle tap (short press) - show Moon Phase Info
  const handleTap = useCallback(() => {
    setCurrentMoonPhase(getMoonPhase());
    setOverlayType("phase");
    triggerMoonEffect();
  }, [triggerMoonEffect]);

  // Handle long press - show Phenomenon Details
  const handleLongPress = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]); // Pattern for long press
    setOverlayType("phenomenon");
  }, []);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    console.log('👆 Touch Start triggered');
    const touch = e.touches[0];
    
    // Prevent default to avoid scroll while touching moon
    const hitMoon = isMoonHit(touch.clientX, touch.clientY);
    if (!hitMoon) return;
    
    e.preventDefault();
    isTouchMoveRef.current = false;
    touchStartTimeRef.current = Date.now();
    
    // Start long press timer (500ms)
    longPressTimerRef.current = setTimeout(() => {
      if (!isTouchMoveRef.current) {
        handleLongPress();
      }
    }, 500);
  }, [isMoonHit, handleLongPress]);

  const handleTouchMove = useCallback(() => {
    isTouchMoveRef.current = true;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // If it was a short tap (less than 500ms) and no move
    const touchDuration = Date.now() - touchStartTimeRef.current;
    if (touchDuration < 500 && !isTouchMoveRef.current) {
      const touch = e.changedTouches[0];
      if (isMoonHit(touch.clientX, touch.clientY)) {
        handleTap();
      }
    }
  }, [isMoonHit, handleTap]);

  // Mouse click handler (for desktop)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMoonHit(e.clientX, e.clientY)) return;
    handleTap();
  };

  // Close overlay
  const handleCloseOverlay = useCallback(() => {
    setOverlayType(null);
  }, []);

  // Cleanup long press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

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
      
      {/* Moon Info Overlay */}
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
