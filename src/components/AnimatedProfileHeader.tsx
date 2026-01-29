import { useEffect, useRef, useState } from "react";
import { getSessionPhenomenon } from "@/utils/raritySystem";
import { adjustBrightness } from "@/utils/colorUtils";
import { applyMoonTheme } from "@/utils/moonTheme";
import { PhenomenonTransition } from "@/utils/transitionUtils";
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
  initShootingStars,
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
import { getMoonPhase, drawMoonWithPhase } from "@/utils/moonPhases";
import {
  getGlowIntensity,
  applyTimeBasedGlow,
} from "@/utils/timeBasedEffects";
import type { MoonPhenomenon } from "@/data/moonPhenomena";

// Helper function to draw realistic moon phase shadow with gradient
const drawMoonPhaseShadow = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  phase: number,
) => {
  // phase is 0-1 (0 = new moon, 0.5 = full moon, 1 = new moon)
  if (Math.abs(phase - 0.5) < 0.01) return; // Full moon, no shadow

  ctx.save();
  
  // Create clipping path for the moon circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();

  // Shadow color - Deep blue-black for better blending with sky
  const deepShadow = "rgba(5, 10, 25, 0.85)";
  const midShadow = "rgba(5, 10, 25, 0.5)";
  const lightShadow = "rgba(5, 10, 25, 0.1)";

  // Draw shadow with spherical-like gradient for 3D effect
  if (phase < 0.5) {
    // Waxing (shadow on left side)
    const illumination = phase * 2; // 0 to 1
    const shadowWidth = radius * (1 - illumination);
    
    // Gradient simulating spherical curvature
    const gradient = ctx.createLinearGradient(
      x - radius,
      y,
      x - radius + shadowWidth * 2.2, // Extend slightly for soft terminator
      y
    );
    gradient.addColorStop(0, deepShadow);     // Darkest at edge
    gradient.addColorStop(0.4, deepShadow);   // Stay dark longer for volume
    gradient.addColorStop(0.7, midShadow);    // Mid-tone transition
    gradient.addColorStop(1, "rgba(5, 10, 25, 0)"); // Fade to transparent
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, shadowWidth * 2.2, radius * 2);
    
  } else if (phase > 0.5) {
    // Waning (shadow on right side)
    const illumination = 1 - ((phase - 0.5) * 2); // 1 to 0
    const shadowWidth = radius * (1 - illumination);
    
    // Gradient simulating spherical curvature
    const gradient = ctx.createLinearGradient(
      x + radius - shadowWidth * 2.2,
      y,
      x + radius,
      y
    );
    gradient.addColorStop(0, "rgba(5, 10, 25, 0)"); // Fade from transparent
    gradient.addColorStop(0.3, midShadow);    // Mid-tone transition
    gradient.addColorStop(0.6, deepShadow);   // Start getting dark
    gradient.addColorStop(1, deepShadow);     // Darkest at edge
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x + radius - shadowWidth * 2.2, y - radius, shadowWidth * 2.2, radius * 2);
  }

  ctx.restore();
};

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

  // Particle system refs for mythic phenomena
  const moonFlashesRef = useRef<MoonFlash[]>([]);
  const orbitingParticlesRef = useRef<OrbitingParticle[]>([]);
  const sparklesRef = useRef<Sparkle[]>([]);

  // Advanced particle system refs
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

  // Legendary particle system refs
  const bloodRingsRef = useRef<BloodRing[]>([]);
  const fadeParticlesRef = useRef<FadeParticle[]>([]);
  const silenceWavesRef = useRef<SilenceWave[]>([]);
  const dreamDustRef = useRef<DreamDust[]>([]);
  const memoryFragmentsRef = useRef<MemoryFragment[]>([]);
  const ancientRunesRef = useRef<AncientRune[]>([]);
  const lightRaysRef = useRef<LightRay[]>([]);
  const shootingStarsLegendaryRef = useRef<ShootingStarParticle[]>([]);

  // New visual enhancement refs
  const starfieldRef = useRef<StarfieldParticle[]>([]);
  const nebulaRef = useRef<NebulaCloud[]>([]);
  const prismLightsRef = useRef<PrismLight[]>([]);
  const moonPhaseRef = useRef(getMoonPhase());
  const scrollOffsetRef = useRef({ x: 0, y: 0 });
  const currentHourRef = useRef(new Date().getHours());

  // Timer for resetting shatter dust every 10 seconds
  const lastShatterResetRef = useRef<number>(Date.now());

  // Get moon phenomenon for this session
  const [phenomenon, setPhenomenon] = useState<MoonPhenomenon | null>(null);
  const transitionManagerRef = useRef<PhenomenonTransition>(
    new PhenomenonTransition(),
  );

  useEffect(() => {
    const sessionPhenomenon = getSessionPhenomenon();
    setPhenomenon(sessionPhenomenon);

    // Apply moon theme to UI
    applyMoonTheme(sessionPhenomenon);

    console.log(
      "🌙 Moon Phenomenon:",
      sessionPhenomenon.name,
      `(${sessionPhenomenon.rarity})`,
    );
  }, []);

  useEffect(() => {
    if (!phenomenon) return; // Wait for phenomenon to load

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

    starsRef.current = Array.from(
      { length: Math.floor(120 * phenomenon.starDensity) },
      () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height * 0.6,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
      }),
    );

    cloudsRef.current = Array.from({ length: 5 }, () => ({
      x: Math.random() * rect.width,
      y: rect.height * 0.2 + Math.random() * rect.height * 0.3,
      width: Math.random() * 100 + 80,
      height: Math.random() * 40 + 30,
      speed: (Math.random() * 0.15 + 0.05) * phenomenon.cloudSpeed,
      opacity: (Math.random() * 0.15 + 0.1) * phenomenon.cloudOpacity,
    }));

    const shootingStarColors = [
      "#FFFFFF",
      "#FFE4B5",
      "#87CEEB",
      "#DDA0DD",
      "#F0E68C",
      "#98FB98",
      "#FFB6C1",
      "#B0E0E6",
      "#FFDAB9",
      "#E6E6FA",
    ];
    shootingStarsRef.current = Array.from({ length: 10 }, (_, i) => ({
      x: rect.width + Math.random() * 100,
      y: Math.random() * rect.height * 0.6,
      length: Math.random() * 60 + 40,
      speed: Math.random() * 1.5 + 1,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
      color: shootingStarColors[i],
      opacity: Math.random() * 0.3 + 0.7,
      isActive: false,
      trailLength: Math.random() * 80 + 60,
    }));

    // Initialize moon position FIRST
    moonPositionRef.current = {
      x: rect.width * 0.7,
      y: rect.height * 0.25,
      phase: 0,
    };

    // Then init particles at moon position
    const moon = moonPositionRef.current;
    if (phenomenon.id === "superBlueBloodMoon")
      orbitingParticlesRef.current = initOrbitingParticles(
        20,
        "#B84060",
        "#d85080",
      );
    else if (phenomenon.id === "brokenMoon")
      orbitingParticlesRef.current = initOrbitingParticles(
        25,
        "#9898B8",
        "#6868a8",
        0.008,
        0.015,
      );
    else if (phenomenon.id === "emptySky")
      orbitingParticlesRef.current = initOrbitingParticles(
        18,
        "#404050",
        "#505070",
        0.005,
        0.01,
      );

    // Special effects work for rare and above (rare, very_rare, legendary, mythic)
    const intensity = phenomenon.effectIntensity || 0.5;
    const baseMoonRadius = 40;
    const moonRadius = baseMoonRadius * (phenomenon.moonSize || 1.0);

    // Scale effect intensity based on rarity
    const rarityScale = {
      normal: 0,
      rare: 0.3,
      very_rare: 0.5,
      legendary: 0.75,
      mythic: 1.0,
    }[phenomenon.rarity];

    const hasEffect =
      phenomenon.rarity !== "normal" && phenomenon.specialEffect;

    if (hasEffect) {
      if (phenomenon.specialEffect === "flash")
        moonFlashesRef.current = initMoonFlashes();
      else if (phenomenon.specialEffect === "sparkle")
        sparklesRef.current = initSparkles(moon.x, moon.y, 60);
      else if (phenomenon.specialEffect === "echo")
        echoMoonsRef.current = initEchoMoons(moon.x, moon.y, moonRadius, 4);
      else if (phenomenon.specialEffect === "aurora")
        auroraWavesRef.current = initAuroraWaves(rect.height);
      else if (phenomenon.specialEffect === "fireflies")
        firefliesRef.current = initFireflies(
          rect.width,
          rect.height,
          Math.floor((10 + intensity * 20) * rarityScale),
        );
      else if (phenomenon.specialEffect === "snow")
        snowflakesRef.current = initSnowflakes(
          rect.width,
          Math.floor((30 + intensity * 70) * rarityScale),
        );
      else if (phenomenon.specialEffect === "fog")
        fogLayersRef.current = initFogLayers(rect.width, rect.height);
      else if (phenomenon.specialEffect === "meteorShower")
        meteorShowerRef.current = initMeteorShower(
          rect.width,
          rect.height,
          Math.floor((10 + intensity * 15) * rarityScale),
        );
      else if (phenomenon.specialEffect === "frozenTime")
        frozenTimeRef.current = initFrozenTime(
          rect.width,
          rect.height,
          Math.floor((20 + intensity * 20) * rarityScale),
        );
      else if (phenomenon.specialEffect === "voidRipples")
        voidRipplesRef.current = initVoidRipples();
      else if (phenomenon.specialEffect === "shattered") {
        moonFragmentsRef.current = initMoonFragments(moon.x, moon.y, 12);
        shatterDustRef.current = initShatterDust(moon.x, moon.y, 25);
      } else if (phenomenon.specialEffect === "bloodRing")
        bloodRingsRef.current = initBloodRings(moonRadius);
      else if (phenomenon.specialEffect === "fadeParticles")
        fadeParticlesRef.current = initFadeParticles(
          rect.width,
          rect.height,
        );
      else if (phenomenon.specialEffect === "silence")
        silenceWavesRef.current = initSilenceWaves();
      else if (phenomenon.specialEffect === "dreamDust")
        dreamDustRef.current = initDreamDust(rect.width, rect.height);
      else if (phenomenon.specialEffect === "memoryFragments")
        memoryFragmentsRef.current = initMemoryFragments(
          rect.width,
          rect.height,
        );
      else if (phenomenon.specialEffect === "ancientRunes")
        ancientRunesRef.current = initAncientRunes(moon.x, moon.y, moonRadius);
      else if (phenomenon.specialEffect === "lightRays")
        lightRaysRef.current = initLightRays();
      else if (phenomenon.specialEffect === "shootingStars")
        shootingStarsLegendaryRef.current = initShootingStars();
      else if (phenomenon.specialEffect === "starfield")
        starfieldRef.current = initStarfield(150);
      else if (phenomenon.specialEffect === "nebula")
        nebulaRef.current = initNebula(rect.width, rect.height, 5);
      else if (phenomenon.specialEffect === "prismLights")
        prismLightsRef.current = initPrismLights();
    }

    // Initialize moon phase
    moonPhaseRef.current = getMoonPhase();
    console.log(
      "🌙 Moon Phase:",
      moonPhaseRef.current.phaseNameTh,
      `(${Math.round(moonPhaseRef.current.illumination * 100)}% illuminated)`,
    );

    // Setup scroll listener for parallax effect
    const handleScroll = () => {
      scrollOffsetRef.current = {
        x: window.scrollX,
        y: window.scrollY,
      };
    };
    window.addEventListener("scroll", handleScroll, { passive: true });


    const drawSky = () => {
      const g = ctx.createLinearGradient(0, 0, 0, rect.height);
      g.addColorStop(0, phenomenon.skyPalette[0]);
      g.addColorStop(0.5, phenomenon.skyPalette[1]);
      g.addColorStop(1, phenomenon.skyPalette[2]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, rect.width, rect.height);
    };

    const drawStars = () => {
      if (phenomenon.starDensity === 0) return;
      starsRef.current.forEach((s) => {
        s.twinklePhase += s.twinkleSpeed;
        const o = s.opacity * (Math.sin(s.twinklePhase) * 0.5 + 0.5);

        const starX = s.x;
        const starY = s.y;

        ctx.beginPath();
        ctx.arc(starX, starY, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${o})`;
        ctx.fill();
        if (s.size > 1.5) {
          ctx.beginPath();
          ctx.arc(starX, starY, s.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${o * 0.2})`;
          ctx.fill();
        }
      });
    };

    // Draw beautiful crescent moon with phenomenon-specific colors
    const drawMoon = () => {
      const moon = moonPositionRef.current;
      moon.phase += 0.005;
      const offsetY = Math.sin(moon.phase) * 3;

      const moonX = moon.x;
      const moonY = moon.y;

      // Dynamic moon size based on phenomenon and rarity
      const baseMoonRadius = 40;
      // Apply both phenomenon moonSize and rarity scaling
      const rarityMoonScale = {
        normal: 1.0,
        rare: 1.05,
        very_rare: 1.1,
        legendary: 1.15,
        mythic: 1.2,
      }[phenomenon.rarity];
      const moonRadius =
        baseMoonRadius * (phenomenon.moonSize || 1.0) * rarityMoonScale;

      // Outer glow - uses phenomenon moonTint with very low opacity
      const glowColor = phenomenon.moonTint;
      const outerGlow = ctx.createRadialGradient(
        moonX,
        moonY + offsetY,
        0,
        moonX,
        moonY + offsetY,
        moonRadius * 1.5,
      );
      outerGlow.addColorStop(0, `${glowColor}50`); // 30% opacity
      outerGlow.addColorStop(0.5, `${glowColor}26`); // 15% opacity
      outerGlow.addColorStop(1, `${glowColor}00`); // transparent
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY + offsetY, moonRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Main moon body with phenomenon-specific tint
      const moonGradient = ctx.createLinearGradient(
        moonX - moonRadius,
        moonY + offsetY - moonRadius,
        moonX + moonRadius,
        moonY + offsetY + moonRadius,
      );
      moonGradient.addColorStop(0, phenomenon.moonTint);
      moonGradient.addColorStop(
        0.3,
        adjustBrightness(phenomenon.moonTint, 0.9),
      );
      moonGradient.addColorStop(
        0.6,
        adjustBrightness(phenomenon.moonTint, 0.8),
      );
      moonGradient.addColorStop(1, adjustBrightness(phenomenon.moonTint, 0.7));
      ctx.fillStyle = moonGradient;
      ctx.beginPath();
      ctx.arc(moonX, moonY + offsetY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // MYTHIC EXCLUSIVE: Enhanced glow layers and rim light
      if (phenomenon.rarity === "mythic") {
        // Multi-layer ethereal glow
        const innerGlow = ctx.createRadialGradient(
          moonX,
          moonY + offsetY,
          moonRadius * 0.7,
          moonX,
          moonY + offsetY,
          moonRadius * 1.8,
        );
        innerGlow.addColorStop(0, `${phenomenon.uiAccent}00`);
        innerGlow.addColorStop(0.3, `${phenomenon.uiAccent}40`);
        innerGlow.addColorStop(0.6, `${phenomenon.uiAccent}20`);
        innerGlow.addColorStop(1, `${phenomenon.uiAccent}00`);
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(moonX, moonY + offsetY, moonRadius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Rim light on edge
        ctx.strokeStyle = `${phenomenon.uiAccent}60`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(moonX, moonY + offsetY, moonRadius - 1, 0, Math.PI * 2);
        ctx.stroke();

        // Subtle pulsing highlight
        const pulsePhase = moon.phase * 2;
        const pulseOpacity = (Math.sin(pulsePhase) * 0.15 + 0.25) * 255;
        const pulseHex = Math.floor(pulseOpacity).toString(16).padStart(2, "0");
        const highlight = ctx.createRadialGradient(
          moonX - moonRadius * 0.3,
          moonY + offsetY - moonRadius * 0.3,
          0,
          moonX - moonRadius * 0.3,
          moonY + offsetY - moonRadius * 0.3,
          moonRadius * 0.6,
        );
        highlight.addColorStop(0, `#ffffff${pulseHex}`);
        highlight.addColorStop(1, `#ffffff00`);
        ctx.fillStyle = highlight;
        ctx.beginPath();
        ctx.arc(moonX, moonY + offsetY, moonRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // LUNAR TRANSIENT PHENOMENA EXCLUSIVE: Spectacular flash effects
      if (phenomenon.id === "lunarTransientPhenomena") {
        // Intense pulsing outer glow
        const flashPhase = moon.phase * 3;
        const flashIntensity = Math.sin(flashPhase) * 0.3 + 0.7; // 0.4 to 1.0

        // Massive outer glow (3x normal size)
        const massiveGlow = ctx.createRadialGradient(
          moonX,
          moonY + offsetY,
          moonRadius * 0.5,
          moonX,
          moonY + offsetY,
          moonRadius * 3,
        );
        massiveGlow.addColorStop(
          0,
          `${phenomenon.uiAccent}${Math.floor(flashIntensity * 120)
            .toString(16)
            .padStart(2, "0")}`,
        );
        massiveGlow.addColorStop(
          0.3,
          `${phenomenon.uiAccent}${Math.floor(flashIntensity * 80)
            .toString(16)
            .padStart(2, "0")}`,
        );
        massiveGlow.addColorStop(
          0.6,
          `${phenomenon.uiAccent}${Math.floor(flashIntensity * 40)
            .toString(16)
            .padStart(2, "0")}`,
        );
        massiveGlow.addColorStop(1, `${phenomenon.uiAccent}00`);
        ctx.fillStyle = massiveGlow;
        ctx.beginPath();
        ctx.arc(moonX, moonY + offsetY, moonRadius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Color shifting rim (purple to pink to blue)
        const colorPhase = moon.phase * 4;
        const hue = (Math.sin(colorPhase) * 60 + 280) % 360; // 220-340 degrees
        ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${flashIntensity * 0.8})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(moonX, moonY + offsetY, moonRadius + 2, 0, Math.PI * 2);
        ctx.stroke();

        // Inner bright flash
        const innerFlash = ctx.createRadialGradient(
          moonX,
          moonY + offsetY,
          0,
          moonX,
          moonY + offsetY,
          moonRadius * 0.8,
        );
        innerFlash.addColorStop(
          0,
          `rgba(255, 255, 255, ${flashIntensity * 0.4})`,
        );
        innerFlash.addColorStop(
          0.5,
          `${phenomenon.uiAccent}${Math.floor(flashIntensity * 100)
            .toString(16)
            .padStart(2, "0")}`,
        );
        innerFlash.addColorStop(1, `${phenomenon.uiAccent}00`);
        ctx.fillStyle = innerFlash;
        ctx.beginPath();
        ctx.arc(moonX, moonY + offsetY, moonRadius * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Particle ring effect
        const particleCount = 12;
        const ringRadius = moonRadius * 2;
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + moon.phase;
          const px = moonX + Math.cos(angle) * ringRadius;
          const py = moonY + offsetY + Math.sin(angle) * ringRadius;

          const particleGlow = ctx.createRadialGradient(px, py, 0, px, py, 4);
          particleGlow.addColorStop(
            0,
            `${phenomenon.uiAccent}${Math.floor(flashIntensity * 200)
              .toString(16)
              .padStart(2, "0")}`,
          );
          particleGlow.addColorStop(1, `${phenomenon.uiAccent}00`);
          ctx.fillStyle = particleGlow;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw realistic moon phase shadow
      drawMoonPhaseShadow(
        ctx,
        moonX,
        moonY + offsetY,
        moonRadius,
        moonPhaseRef.current.phase,
      );
    };

    const drawClouds = () => {
      if (phenomenon.cloudOpacity === 0) return;
      cloudsRef.current.forEach((c) => {
        if (phenomenon.cloudSpeed > 0.2) {
          c.x += c.speed;
          if (c.x > rect.width + c.width) c.x = -c.width;
        }
        ctx.fillStyle = `rgba(150,150,180,${c.opacity * 0.6})`;
        ctx.beginPath();
        ctx.ellipse(
          c.x + 5,
          c.y + 5,
          c.width / 2,
          c.height / 2,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        const g = ctx.createRadialGradient(
          c.x,
          c.y - c.height * 0.3,
          0,
          c.x,
          c.y,
          c.width / 2,
        );
        g.addColorStop(0, `rgba(230,230,250,${c.opacity})`);
        g.addColorStop(0.6, `rgba(200,200,230,${c.opacity * 0.8})`);
        g.addColorStop(1, `rgba(180,180,210,${c.opacity * 0.5})`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.width / 2, c.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        [
          { x: -0.4, y: -0.3, w: 0.35, h: 0.5 },
          { x: -0.2, y: -0.4, w: 0.3, h: 0.45 },
          { x: 0.2, y: -0.35, w: 0.32, h: 0.48 },
          { x: 0.4, y: -0.25, w: 0.3, h: 0.45 },
        ].forEach((p) => {
          const pg = ctx.createRadialGradient(
            c.x + c.width * p.x,
            c.y + c.height * p.y,
            0,
            c.x + c.width * p.x,
            c.y + c.height * p.y,
            c.width * p.w,
          );
          pg.addColorStop(0, `rgba(240,240,255,${c.opacity})`);
          pg.addColorStop(0.7, `rgba(210,210,240,${c.opacity * 0.7})`);
          pg.addColorStop(1, `rgba(190,190,220,${c.opacity * 0.3})`);
          ctx.fillStyle = pg;
          ctx.beginPath();
          ctx.ellipse(
            c.x + c.width * p.x,
            c.y + c.height * p.y,
            c.width * p.w,
            c.height * p.h,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        });
      });
    };

    const drawShootingStars = () => {
      if (phenomenon.shootingStarChance === 0) return;
      shootingStarsRef.current.forEach((s) => {
        if (!s.isActive) return;
        s.x -= Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        if (s.x < -s.trailLength || s.y > rect.height + s.trailLength) {
          s.isActive = false;
          return;
        }
        ctx.save();
        const g = ctx.createLinearGradient(
          s.x,
          s.y,
          s.x + Math.cos(s.angle) * s.trailLength,
          s.y - Math.sin(s.angle) * s.trailLength,
        );
        g.addColorStop(0, s.color);
        g.addColorStop(0.5, `${s.color}88`);
        g.addColorStop(1, `${s.color}00`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.globalAlpha = s.opacity;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
          s.x + Math.cos(s.angle) * s.trailLength,
          s.y - Math.sin(s.angle) * s.trailLength,
        );
        ctx.stroke();
        const gg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 8);
        gg.addColorStop(0, "#FFFFFF");
        gg.addColorStop(0.3, s.color);
        gg.addColorStop(1, `${s.color}00`);
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      shootingStarTimerRef.current++;
      if (shootingStarTimerRef.current > 3600 + Math.random() * 3600) {
        shootingStarTimerRef.current = 0;
        const inactive = shootingStarsRef.current
          .map((s, i) => (!s.isActive ? i : -1))
          .filter((i) => i !== -1);
        if (inactive.length > 0) {
          const shower =
            Math.random() < phenomenon.shootingStarChance &&
            inactive.length >= 3;
          const count = shower
            ? Math.min(Math.floor(Math.random() * 3) + 3, inactive.length)
            : 1;
          for (let i = 0; i < count; i++) {
            const idx = inactive.splice(
              Math.floor(Math.random() * inactive.length),
              1,
            )[0];
            const s = shootingStarsRef.current[idx];
            s.isActive = true;
            // Start from outside the screen (top-right area)
            s.x =
              rect.width + Math.random() * 100; // Start from right edge + offset
            s.y = -50 - Math.random() * 100; // Start from above the screen
          }
        }
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      drawSky();

      // Draw nebula first (background layer)
      if (
        phenomenon.specialEffect === "nebula" &&
        nebulaRef.current.length > 0
      ) {
        nebulaRef.current = drawNebula(
          ctx,
          nebulaRef.current,
          rect.width,
          rect.height,
          scrollOffsetRef.current.x,
          scrollOffsetRef.current.y,
        );
      }

      // Draw starfield (behind regular stars)
      if (
        phenomenon.specialEffect === "starfield" &&
        starfieldRef.current.length > 0
      ) {
        starfieldRef.current = drawStarfield(
          ctx,
          starfieldRef.current,
          rect.width,
          rect.height,
        );
      }

      // Draw advanced particle effects based on phenomenon (rare and above)
      if (phenomenon.specialEffect) {
        if (
          phenomenon.specialEffect === "aurora" &&
          auroraWavesRef.current.length > 0
        ) {
          drawAurora(ctx, auroraWavesRef.current, rect.width);
        }

        if (
          phenomenon.specialEffect === "fog" &&
          fogLayersRef.current.length > 0
        ) {
          drawFog(ctx, fogLayersRef.current, rect.width);
        }
      }

      drawStars();

      // Draw echo moons BEFORE main moon
      if (
        phenomenon.specialEffect === "echo" &&
        echoMoonsRef.current.length > 0
      ) {
        const moon = moonPositionRef.current;
        drawEchoMoons(
          ctx,
          echoMoonsRef.current,
          moon.x,
          moon.y,
          moon.phase,
          phenomenon.moonTint,
        );
      }

      if (
        phenomenon.specialEffect === "fireflies" &&
        firefliesRef.current.length > 0
      ) {
        drawFireflies(ctx, firefliesRef.current, rect.width, rect.height);
      }

      // Always draw main moon (fragments are drawn on top for shattered effect)
      drawMoon();

      // Draw Shattered Moon fragments and dust
      if (phenomenon.specialEffect === "shattered") {
        const moon = moonPositionRef.current;

        // Reset shatter dust every 10 seconds (10000ms)
        const currentTime = Date.now();
        if (currentTime - lastShatterResetRef.current > 10000) {
          shatterDustRef.current = initShatterDust(moon.x, moon.y, 25);
          lastShatterResetRef.current = currentTime;
        }

        if (shatterDustRef.current.length > 0) {
          drawShatterDust(
            ctx,
            shatterDustRef.current,
            phenomenon.moonTint,
            moon.x,
            moon.y,
          );
        }
        if (moonFragmentsRef.current.length > 0) {
          drawMoonFragments(
            ctx,
            moonFragmentsRef.current,
            moon.x,
            moon.y,
            phenomenon.moonTint,
          );
        }
      }

      // Draw special phenomena particles
      if (phenomenon.specialEffect) {
        // Flash effect for mysterious flashing phenomena
        if (
          phenomenon.specialEffect === "flash" &&
          moonFlashesRef.current.length >= 0
        ) {
          const moon = moonPositionRef.current;
          // Spawn random flashes
          if (Math.random() < 0.025) {
            const baseMoonRadius = 40;
            const moonRadius = baseMoonRadius * (phenomenon.moonSize || 1.0);
            moonFlashesRef.current.push(
              spawnMoonFlash(moon.x, moon.y, moonRadius),
            );
          }
          moonFlashesRef.current = drawMoonFlashes(ctx, moonFlashesRef.current);
        }

        if (
          phenomenon.specialEffect === "sparkle" &&
          sparklesRef.current.length > 0
        ) {
          drawSparkles(ctx, sparklesRef.current);
        }

        // Legendary effects
        if (
          phenomenon.specialEffect === "bloodRing" &&
          bloodRingsRef.current.length > 0
        ) {
          const moon = moonPositionRef.current;
          drawBloodRings(ctx, bloodRingsRef.current, moon.x, moon.y);
        }

        if (
          phenomenon.specialEffect === "fadeParticles" &&
          fadeParticlesRef.current.length > 0
        ) {
          drawFadeParticles(ctx, fadeParticlesRef.current);
        }

        if (
          phenomenon.specialEffect === "silence" &&
          silenceWavesRef.current.length >= 0
        ) {
          const moon = moonPositionRef.current;
          const baseMoonRadius = 40;
          const moonRadius = baseMoonRadius * (phenomenon.moonSize || 1.0);
          silenceWavesRef.current = drawSilenceWaves(
            ctx,
            silenceWavesRef.current,
            moon.x,
            moon.y,
            moonRadius,
          );
        }

        if (
          phenomenon.specialEffect === "dreamDust" &&
          dreamDustRef.current.length > 0
        ) {
          drawDreamDust(ctx, dreamDustRef.current);
        }

        if (
          phenomenon.specialEffect === "memoryFragments" &&
          memoryFragmentsRef.current.length > 0
        ) {
          drawMemoryFragments(ctx, memoryFragmentsRef.current);
        }

        if (
          phenomenon.specialEffect === "ancientRunes" &&
          ancientRunesRef.current.length > 0
        ) {
          const moon = moonPositionRef.current;
          drawAncientRunes(ctx, ancientRunesRef.current, moon.x, moon.y);
        }

        if (
          phenomenon.specialEffect === "lightRays" &&
          lightRaysRef.current.length > 0
        ) {
          const moon = moonPositionRef.current;
          const baseMoonRadius = 40;
          const rarityMoonScale = {
            normal: 1.0,
            rare: 1.05,
            very_rare: 1.1,
            legendary: 1.15,
            mythic: 1.2,
          }[phenomenon.rarity];
          const moonRadius =
            baseMoonRadius * (phenomenon.moonSize || 1.0) * rarityMoonScale;
          drawLightRays(ctx, lightRaysRef.current, moon.x, moon.y, moonRadius);
        }

        if (
          phenomenon.specialEffect === "prismLights" &&
          prismLightsRef.current.length > 0
        ) {
          const moon = moonPositionRef.current;
          const baseMoonRadius = 40;
          const rarityMoonScale = {
            normal: 1.0,
            rare: 1.05,
            very_rare: 1.1,
            legendary: 1.15,
            mythic: 1.2,
          }[phenomenon.rarity];
          const moonRadius =
            baseMoonRadius * (phenomenon.moonSize || 1.0) * rarityMoonScale;
          drawPrismLights(
            ctx,
            prismLightsRef.current,
            moon.x,
            moon.y,
            moonRadius,
          );
        }

        if (
          phenomenon.specialEffect === "shootingStars" &&
          shootingStarsLegendaryRef.current.length >= 0
        ) {
          const moon = moonPositionRef.current;
          const baseMoonRadius = 40;
          const moonRadius = baseMoonRadius * (phenomenon.moonSize || 1.0);
          shootingStarsLegendaryRef.current = drawShootingStarsLegendary(
            ctx,
            shootingStarsLegendaryRef.current,
            rect.width,
            rect.height,
          );
        }
      }

      if (
        (phenomenon.id === "superBlueBloodMoon" ||
          phenomenon.id === "brokenMoon" ||
          phenomenon.id === "emptySky") &&
        orbitingParticlesRef.current.length > 0
      ) {
        const moon = moonPositionRef.current;
        drawOrbitingParticles(
          ctx,
          orbitingParticlesRef.current,
          moon.x,
          moon.y,
        );
      }

      drawClouds();

      if (phenomenon.specialEffect) {
        if (
          phenomenon.specialEffect === "snow" &&
          snowflakesRef.current.length > 0
        ) {
          drawSnowflakes(ctx, snowflakesRef.current, rect.width, rect.height);
        }

        if (
          phenomenon.specialEffect === "meteorShower" &&
          meteorShowerRef.current.length > 0
        ) {
          drawMeteorShower(
            ctx,
            meteorShowerRef.current,
            rect.width,
            rect.height,
          );
        }

        if (
          phenomenon.specialEffect === "frozenTime" &&
          frozenTimeRef.current.length > 0
        ) {
          drawFrozenTime(ctx, frozenTimeRef.current);
        }
      }

      if (phenomenon.specialEffect === "voidRipples") {
        const moon = moonPositionRef.current;
        const baseMoonRadius = 40;
        const moonRadius = baseMoonRadius * (phenomenon.moonSize || 1.0);

        // Spawn void ripples periodically
        if (Math.random() < 0.015) {
          voidRipplesRef.current.push(
            spawnVoidRipple(
              moon.x,
              moon.y + Math.sin(moon.phase) * 3,
              moonRadius,
            ),
          );
        }

        voidRipplesRef.current = drawVoidRipples(
          ctx,
          voidRipplesRef.current,
          moon.x,
          moon.y,
        );
      }

      drawShootingStars();

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [phenomenon]);

  return (
    <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden">
      {/* Animated Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <h1
          className={`font-bold text-white mb-2 tracking-wide transition-all duration-500 ${
            phenomenon?.rarity === "mythic"
              ? "text-6xl"
              : phenomenon?.rarity === "legendary"
                ? "text-5xl"
                : phenomenon?.rarity === "very_rare"
                  ? "text-5xl"
                  : phenomenon?.rarity === "rare"
                    ? "text-4xl"
                    : "text-4xl"
          }`}
          style={{
            fontFamily:
              phenomenon?.rarity === "mythic"
                ? // Mythic: แต่ละดวงมีฟอนต์เฉพาะตัว
                  phenomenon.id === "superBloodMoon"
                  ? "'Cinzel', serif" // ดวงจันทร์เลือดยักษ์: โบราณ ดุดัน
                  : phenomenon.id === "superBlueBloodMoon"
                    ? "'UnifrakturMaguntia', cursive" // ซูเปอร์บลูบลัดมูน: Gothic เวทมนตร์
                    : phenomenon.id === "lunarTransientPhenomena"
                      ? "'Orbitron', sans-serif" // แสงวาบลึกลับ: อนาคต เทคโนโลยี
                      : phenomenon.id === "hybridEclipse"
                        ? "'Spectral', serif" // อุปราคาผสม: สง่างาม ลึกลับ
                        : phenomenon.id === "stillMoon"
                          ? "'Abril Fatface', serif" // ดวงจันทร์หยุดนิ่ง: หนัก นิ่ง
                          : phenomenon.id === "echoMoon"
                            ? "'Righteous', cursive" // ดวงจันทร์เสียงสะท้อน: ทันสมัย สะท้อน
                            : phenomenon.id === "brokenMoon"
                              ? "'Creepster', cursive" // ดวงจันทร์แตกร้าว: แตกหัก สยองขวัญ
                              : phenomenon.id === "emptySky"
                                ? "'Nosifer', cursive" // ท้องฟ้าว่างเปล่า: ว่างเปล่า น่ากลัว
                                : phenomenon.id === "crystalMoon"
                                  ? "'Poiret One', cursive" // ดวงจันทร์คริสตัล: เรขาคณิต คริสตัล
                                  : phenomenon.id === "shatteredMoon"
                                    ? "'Creepster', cursive" // ดวงจันทร์แตกร้าว: แตกหัก
                                    : "'Cinzel', serif" // Default mythic
                : phenomenon?.rarity === "legendary"
                  ? "'Playfair Display', serif"
                  : phenomenon?.rarity === "very_rare"
                    ? "'Cormorant Garamond', serif"
                    : phenomenon?.rarity === "rare"
                      ? // Rare: ดวงจันทร์หิมะมีฟอนต์พิเศษ
                        phenomenon.id === "snowMoon"
                        ? "'Mountains of Christmas', cursive" // ดวงจันทร์หิมะ: ฟอนต์หิมะ
                        : "'Philosopher', sans-serif"
                      : "'Inter', sans-serif",
            textShadow:
              phenomenon?.rarity === "mythic"
                ? `0 0 10px ${phenomenon.uiAccent}aa, 0 0 20px ${phenomenon.uiAccent}66, 0 4px 12px rgba(0, 0, 0, 0.9)`
                : phenomenon?.rarity === "legendary"
                  ? `0 0 12px ${phenomenon.uiAccent}, 0 0 25px ${phenomenon.uiAccent}aa, 0 4px 10px rgba(0, 0, 0, 0.8)`
                  : phenomenon?.rarity === "very_rare"
                    ? `0 0 20px ${phenomenon.uiAccent}aa, 0 0 40px ${phenomenon.uiAccent}66, 0 4px 8px rgba(0, 0, 0, 0.6)`
                    : phenomenon?.rarity === "rare"
                      ? "0 0 15px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.3), 0 4px 8px rgba(0, 0, 0, 0.5)"
                      : "0 0 10px rgba(255, 255, 255, 0.4), 0 2px 6px rgba(0, 0, 0, 0.5)",
            color:
              phenomenon?.rarity === "mythic" ||
              phenomenon?.rarity === "legendary"
                ? phenomenon.uiAccent
                : "#ffffff",
            animation:
              phenomenon?.rarity === "mythic"
                ? "pulse 3s ease-in-out infinite"
                : phenomenon?.rarity === "legendary"
                  ? "pulse 4s ease-in-out infinite"
                  : "none",
          }}
        >
          Dream book
        </h1>
        {phenomenon && (
          <p
            className={`italic font-light transition-all duration-500 ${
              phenomenon.rarity === "mythic"
                ? "text-xl"
                : phenomenon.rarity === "legendary"
                  ? "text-lg"
                  : "text-lg"
            }`}
            style={{
              fontFamily:
                phenomenon.rarity === "mythic" ||
                phenomenon.rarity === "legendary"
                  ? "'Cormorant Garamond', serif"
                  : phenomenon.rarity === "very_rare"
                    ? "'Philosopher', sans-serif"
                    : "'Inter', sans-serif",
              textShadow:
                phenomenon.rarity === "mythic"
                  ? `0 0 12px ${phenomenon.uiAccent}aa, 0 0 25px ${phenomenon.uiAccent}44, 0 2px 6px rgba(0, 0, 0, 0.7)`
                  : phenomenon.rarity === "legendary"
                    ? `0 0 15px ${phenomenon.uiAccent}99, 0 2px 5px rgba(0, 0, 0, 0.6)`
                    : phenomenon.rarity === "very_rare"
                      ? `0 0 12px ${phenomenon.uiAccent}66, 0 2px 4px rgba(0, 0, 0, 0.5)`
                      : "0 0 10px rgba(255, 255, 255, 0.4), 0 2px 4px rgba(0, 0, 0, 0.5)",
            color:
                phenomenon.rarity === "mythic" ||
                phenomenon.rarity === "legendary"
                  ? phenomenon.uiAccent
                  : "rgba(255, 255, 255, 0.95)",
            }}
          >
            {phenomenon.subtitle}
          </p>
        )}
      </div>

      {/* Bottom gradient fade - Smooth transition to background */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />
    </div>
  );
}
