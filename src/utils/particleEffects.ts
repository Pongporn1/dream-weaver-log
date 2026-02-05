/**
 * Particle Effects - Re-Export Module
 * 
 * All particle systems are now modularized in @/animation/particles/
 * This file re-exports everything for backwards compatibility.
 * 
 * @deprecated Import from @/animation or @/animation/types instead
 */

// =================== TYPE DEFINITIONS (from central source) ===================
export type {
  MoonFlash,
  OrbitingParticle,
  Sparkle,
  EchoMoon,
  AuroraWave,
  Firefly,
  Snowflake,
  FogLayer,
  MeteorShowerParticle,
  ShootingStar,
  StarfieldParticle,
  NebulaCloud,
  PrismLight,
  BloodRing,
  FadeParticle,
  SilenceWave,
  DreamDust,
  MemoryFragment,
  AncientRune,
  LightRay,
  FrozenTimeParticle,
  VoidRipple,
  MoonCrack,
  MoonFragment,
  ShatterDust,
} from "@/animation/types/particle-types";

// =================== CORE PARTICLES ===================
export {
  initMoonFlashes,
  spawnMoonFlash,
  drawMoonFlashes,
} from "@/animation/particles/core/MoonFlash";
export {
  initOrbitingParticles,
  drawOrbitingParticles,
} from "@/animation/particles/core/OrbitingParticle";
export { initSparkles, drawSparkles } from "@/animation/particles/core/Sparkle";
export {
  initEchoMoons,
  drawEchoMoons,
} from "@/animation/particles/core/EchoMoon";

// =================== ATMOSPHERIC PARTICLES ===================
export {
  initAuroraWaves,
  drawAurora,
} from "@/animation/particles/atmospheric/AuroraWave";
export {
  initFireflies,
  drawFireflies,
} from "@/animation/particles/atmospheric/Firefly";
export {
  initSnowflakes,
  drawSnowflakes,
} from "@/animation/particles/atmospheric/Snowflake";
export {
  initFogLayers,
  drawFog,
} from "@/animation/particles/atmospheric/FogLayer";

// =================== LEGENDARY PARTICLES ===================
export {
  initBloodRings,
  drawBloodRings,
} from "@/animation/particles/legendary/BloodRing";
export {
  initFadeParticles,
  drawFadeParticles,
} from "@/animation/particles/legendary/FadeParticle";
export {
  initSilenceWaves,
  drawSilenceWaves,
} from "@/animation/particles/legendary/SilenceWave";
export {
  initDreamDust,
  drawDreamDust,
} from "@/animation/particles/legendary/DreamDust";
export {
  initMemoryFragments,
  drawMemoryFragments,
} from "@/animation/particles/legendary/MemoryFragment";
export {
  initAncientRunes,
  drawAncientRunes,
} from "@/animation/particles/legendary/AncientRune";
export {
  initLightRays,
  drawLightRays,
} from "@/animation/particles/legendary/LightRay";

// =================== COSMIC PARTICLES ===================
export {
  initMeteorShower,
  drawMeteorShower,
} from "@/animation/particles/cosmic/MeteorShower";
export { initMeteorNebula } from "@/animation/particles/cosmic/NebulaCloud";
export {
  initShootingStars,
  drawShootingStars,
} from "@/animation/particles/cosmic/ShootingStar";
export {
  initStarfield,
  drawStarfield,
} from "@/animation/particles/cosmic/Starfield";
export {
  initNebula,
  drawNebula,
} from "@/animation/particles/cosmic/NebulaCloud";
export {
  initPrismLights,
  drawPrismLights,
} from "@/animation/particles/cosmic/PrismLight";

// =================== TEMPORAL PARTICLES ===================
export {
  initFrozenTime,
  drawFrozenTime,
} from "@/animation/particles/temporal/FrozenTime";
export {
  initVoidRipples,
  spawnVoidRipple,
  drawVoidRipples,
} from "@/animation/particles/temporal/VoidRipple";

// =================== SHATTERED MOON PARTICLES ===================
export {
  initMoonCracks,
  drawMoonCracks,
} from "@/animation/particles/shattered/MoonCrack";
export {
  initMoonFragments,
  drawMoonFragments,
} from "@/animation/particles/shattered/MoonFragment";
export {
  initShatterDust,
  drawShatterDust,
} from "@/animation/particles/shattered/ShatterDust";
