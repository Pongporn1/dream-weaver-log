/**
 * Particle Type Definitions
 *
 * All particle effect interface definitions for the Dream Weaver Log animation system.
 * Extracted from the monolithic particleEffects.ts for better organization.
 *
 * Total: 25 particle types across 6 categories
 */

// =================== CORE PARTICLE EFFECTS ===================

export interface MoonFlash {
  x: number;
  y: number;
  size: number;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
}

export interface OrbitingParticle {
  angle: number;
  distance: number;
  size: number;
  speed: number;
  color: string;
  opacity: number;
}

export interface Sparkle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

export interface EchoMoon {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  delay: number;
  scale: number;
  phaseOffset: number;
}

// =================== ATMOSPHERIC EFFECTS ===================

export interface AuroraWave {
  y: number;
  amplitude: number;
  frequency: number;
  phase: number;
  speed: number;
  color: string;
  opacity: number;
}

export interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  blinkPhase: number;
  blinkSpeed: number;
  targetX: number;
  targetY: number;
}

export interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export interface FogLayer {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
  color: string;
  wave: number;
  waveSpeed: number;
}

// =================== COSMIC EFFECTS ===================

export interface MeteorShowerParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  coreColor: string;
  midColor: string;
  tailColor: string;
  glowColor: string;
  width: number;
  headSize: number;
  life: number;
  maxLife: number;
  flickerPhase: number;
  flickerSpeed: number;
  offset: number;
  kind: "hero" | "streak";
  active: boolean;
}

export interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  coreColor: string;
  midColor: string;
  tailColor: string;
  glowColor: string;
  width: number;
  headSize: number;
  life: number;
  maxLife: number;
  flickerPhase: number;
  flickerSpeed: number;
  offset: number;
  kind: "hero" | "streak";
}

export interface StarfieldParticle {
  x: number; // -1 to 1 (normalized)
  y: number; // -1 to 1 (normalized)
  z: number; // depth: 0 (far) to 1 (near)
  speed: number;
  size: number;
  brightness: number;
}

export interface NebulaCloud {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  colors: string[]; // array of colors to blend
  opacity: number;
  pulsePhase: number;
  pulseSpeed: number;
}

export interface PrismLight {
  angle: number;
  distance: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  orbitSpeed: number;
  opacity: number;
  color: string;
  pulsePhase: number;
  shardType: "hexagon" | "diamond" | "triangle";
}

// =================== LEGENDARY EFFECTS ===================

export interface BloodRing {
  radius: number;
  opacity: number;
  pulsePhase: number;
  thickness: number;
}

export interface FadeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  fadeSpeed: number;
  lifetime: number;
  maxLifetime: number;
}

export interface SilenceWave {
  radius: number;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
}

export interface DreamDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  floatPhase: number;
  floatSpeed: number;
}

export interface MemoryFragment {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  lifetime: number;
  maxLifetime: number;
  fragmentType: number;
}

export interface AncientRune {
  x: number;
  y: number;
  symbol: string;
  size: number;
  opacity: number;
  rotation: number;
  pulsePhase: number;
  orbitAngle: number;
  orbitSpeed: number;
  orbitRadius: number;
}

export interface LightRay {
  angle: number;
  length: number;
  opacity: number;
  width: number;
  pulsePhase: number;
  speed: number;
}

// =================== TEMPORAL EFFECTS ===================

export interface FrozenTimeParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
  freezePoint: number;
  isFrozen: boolean;
  trailLength: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  frozenIntensity: number;
}

export interface VoidRipple {
  radius: number;
  maxRadius: number;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
  centerX: number;
  centerY: number;
  speed: number;
  thickness: number;
}

// =================== SHATTERED MOON EFFECTS ===================

export interface MoonCrack {
  startAngle: number;
  length: number;
  width: number;
  branches: { angle: number; length: number }[];
  opacity: number;
}

export interface MoonFragment {
  x: number;
  y: number;
  size: number;
  angle: number;
  distance: number;
  orbitSpeed: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export interface ShatterDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}
