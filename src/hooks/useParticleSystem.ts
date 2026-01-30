import { useRef, useCallback } from "react";
import type { MoonPhenomenon } from "@/data/moonPhenomena";
import type { MoonPosition } from "@/components/canvas";
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
import { calculateMoonRadius } from "@/components/canvas";

export function useParticleSystem() {
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

  const drawBackgroundEffects = useCallback((
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
  }, []);

  const drawAtmosphericEffects = useCallback((
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
  }, []);

  const drawShatteredEffects = useCallback((
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
  }, []);

  const drawSpecialEffects = useCallback((
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
  }, []);

  const drawOrbitingEffects = useCallback((
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
  }, []);

  const drawWeatherEffects = useCallback((
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
  }, []);

  const drawVoidEffects = useCallback((
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
  }, []);

  const drawEchoMoonsEffect = useCallback((
    ctx: CanvasRenderingContext2D,
    phenomenon: MoonPhenomenon,
    moon: MoonPosition
  ) => {
    if (phenomenon.specialEffect === "echo" && echoMoonsRef.current.length > 0) {
      drawEchoMoons(ctx, echoMoonsRef.current, moon.x, moon.y, moon.phase, phenomenon.moonTint);
    }
  }, []);

  const drawFirefliesEffect = useCallback((
    ctx: CanvasRenderingContext2D,
    phenomenon: MoonPhenomenon,
    width: number,
    height: number
  ) => {
    if (phenomenon.specialEffect === "fireflies" && firefliesRef.current.length > 0) {
      drawFireflies(ctx, firefliesRef.current, width, height);
    }
  }, []);

  return {
    moonFlashesRef,
    sparklesRef,
    echoMoonsRef,
    firefliesRef,
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
  };
}
