/**
 * COMPLETE MIGRATION: Re-exporting all particle modules from /animation/
 * All 25/25 particles have been extracted to modular files
 *
 * @deprecated Import from @/animation instead
 * This file is maintained for backwards compatibility during migration
 */

// =================== CORE PARTICLES (4/4) ===================
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

// =================== ATMOSPHERIC PARTICLES (4/4) ===================
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

// =================== LEGENDARY PARTICLES (7/7) ===================
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

// =================== COSMIC PARTICLES (5/5) ===================
export {
  initMeteorShower,
  drawMeteorShower,
  initMeteorNebula,
} from "@/animation/particles/cosmic/MeteorShower";
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

// =================== TEMPORAL PARTICLES (2/2) ===================
export {
  initFrozenTime,
  drawFrozenTime,
} from "@/animation/particles/temporal/FrozenTime";
export {
  initVoidRipples,
  spawnVoidRipple,
  drawVoidRipples,
} from "@/animation/particles/temporal/VoidRipple";

// =================== SHATTERED MOON PARTICLES (3/3) ===================
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

// =================== INTERFACE DEFINITIONS ===================

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

// Shattered Moon effect interfaces
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

export interface EchoMoon {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  delay: number;
  scale: number;
  phaseOffset: number;
}

// =================== LEGENDARY EFFECTS INTERFACES ===================
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

// =================== NEW VISUAL EFFECTS INTERFACES ===================

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

// =================== COSMIC EFFECTS ===================

const METEOR_COLOR_SCHEMES = [
  {
    core: "#fff4d6",
    mid: "#ffd28a",
    tail: "#7ac9ff",
    glow: "#ffe0b3",
  },
  {
    core: "#fff0ff",
    mid: "#ff8dd4",
    tail: "#8a6bff",
    glow: "#ffb7e8",
  },
  {
    core: "#f7fbff",
    mid: "#9fe6ff",
    tail: "#5aa8ff",
    glow: "#d2f4ff",
  },
  {
    core: "#f9f2ff",
    mid: "#c7a3ff",
    tail: "#6f5bff",
    glow: "#d9c2ff",
  },
  {
    core: "#fff2e6",
    mid: "#ffb07a",
    tail: "#ff6a8f",
    glow: "#ffd3b8",
  },
];

const METEOR_DIRECTION: "right" | "left" = "right";
const METEOR_BASE_ANGLE = Math.PI / 4.6;
const METEOR_ANGLE_VARIANCE = 0.16;
const METEOR_ACTIVE_RANGE: [number, number] = [420, 720];
const METEOR_COOLDOWN_RANGE: [number, number] = [900, 1800];
const LEGENDARY_ACTIVE_RANGE: [number, number] = [360, 600];
const LEGENDARY_COOLDOWN_RANGE: [number, number] = [900, 1500];

type ShowerCycle = {
  active: boolean;
  timer: number;
  activeDuration: number;
  cooldownDuration: number;
};

const meteorShowerCycles = new WeakMap<MeteorShowerParticle[], ShowerCycle>();
const legendaryShowerCycles = new WeakMap<ShootingStar[], ShowerCycle>();

const randomInRange = (range: [number, number]) =>
  range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));

const getShowerCycle = <T extends object>(
  map: WeakMap<T, ShowerCycle>,
  key: T,
  activeRange: [number, number],
  cooldownRange: [number, number],
) => {
  const existing = map.get(key);
  if (existing) return existing;

  const startActive = Math.random() < 0.6;
  const activeDuration = randomInRange(activeRange);
  const cooldownDuration = randomInRange(cooldownRange);
  const timer = Math.floor(
    Math.random() * (startActive ? activeDuration : cooldownDuration),
  );

  const cycle: ShowerCycle = {
    active: startActive,
    timer,
    activeDuration,
    cooldownDuration,
  };
  map.set(key, cycle);
  return cycle;
};

const getMeteorAngle = () => {
  const jitter = (Math.random() - 0.5) * METEOR_ANGLE_VARIANCE;
  return METEOR_DIRECTION === "right"
    ? METEOR_BASE_ANGLE + jitter
    : Math.PI - METEOR_BASE_ANGLE + jitter;
};

const getMeteorSpawnPoint = (canvasWidth: number, canvasHeight: number) => {
  const margin = Math.max(canvasWidth, canvasHeight) * 0.14;
  const spawnFromTop = Math.random() < 0.65;

  if (METEOR_DIRECTION === "right") {
    if (spawnFromTop) {
      return {
        x: Math.random() * (canvasWidth * 0.65 + margin) - margin,
        y: -margin - Math.random() * margin,
      };
    }
    return {
      x: -margin - Math.random() * margin,
      y: Math.random() * (canvasHeight * 0.65 + margin) - margin * 0.2,
    };
  }

  if (spawnFromTop) {
    return {
      x: canvasWidth - Math.random() * (canvasWidth * 0.65 + margin) + margin,
      y: -margin - Math.random() * margin,
    };
  }
  return {
    x: canvasWidth + margin + Math.random() * margin,
    y: Math.random() * (canvasHeight * 0.65 + margin) - margin * 0.2,
  };
};

const withAlpha = (hex: string, alpha: number) => {
  const clamped = Math.min(1, Math.max(0, alpha));
  return `${hex}${Math.round(clamped * 255)
    .toString(16)
    .padStart(2, "0")}`;
};

const createMeteorShowerParticle = (
  canvasWidth: number,
  canvasHeight: number,
  forceActive = false,
): MeteorShowerParticle => {
  const kind = Math.random() < 0.22 ? "hero" : "streak";
  const palette =
    METEOR_COLOR_SCHEMES[
      Math.floor(Math.random() * METEOR_COLOR_SCHEMES.length)
    ];
  const angle = getMeteorAngle();
  const speed =
    (kind === "hero" ? 9 : 6) + Math.random() * (kind === "hero" ? 6 : 4);
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;

  const length =
    kind === "hero" ? 180 + Math.random() * 120 : 90 + Math.random() * 80;
  const width =
    kind === "hero" ? 2.4 + Math.random() * 1.4 : 1.1 + Math.random() * 0.7;
  const headSize =
    kind === "hero" ? 7 + Math.random() * 5 : 4 + Math.random() * 3;

  const spawnPoint = getMeteorSpawnPoint(canvasWidth, canvasHeight);
  const x = spawnPoint.x;
  const y = spawnPoint.y;

  const maxLife =
    kind === "hero" ? 140 + Math.random() * 70 : 95 + Math.random() * 60;
  const life = Math.random() * maxLife * 0.6;

  return {
    x,
    y,
    vx,
    vy,
    length,
    opacity: 0.5 + Math.random() * 0.3,
    coreColor: palette.core,
    midColor: palette.mid,
    tailColor: palette.tail,
    glowColor: palette.glow,
    width,
    headSize,
    life,
    maxLife,
    flickerPhase: Math.random() * Math.PI * 2,
    flickerSpeed: 0.02 + Math.random() * 0.03,
    offset: (Math.random() - 0.5) * (kind === "hero" ? 3.5 : 2),
    kind,
    active: forceActive ? true : Math.random() < 0.7,
  };
};

const drawMeteorTrail = (
  ctx: CanvasRenderingContext2D,
  meteor: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    length: number;
    width: number;
    headSize: number;
    offset: number;
    coreColor: string;
    midColor: string;
    tailColor: string;
    glowColor: string;
  },
  alpha: number,
  sparkleChance: number,
) => {
  if (alpha <= 0) return;

  const speed = Math.hypot(meteor.vx, meteor.vy);
  if (speed <= 0.001) return;

  const dx = meteor.vx / speed;
  const dy = meteor.vy / speed;
  const tailX = meteor.x - dx * meteor.length;
  const tailY = meteor.y - dy * meteor.length;
  const nx = -dy;
  const ny = dx;
  const offsetX = nx * meteor.offset;
  const offsetY = ny * meteor.offset;
  const headX = meteor.x + offsetX;
  const headY = meteor.y + offsetY;
  const tailX2 = tailX + offsetX;
  const tailY2 = tailY + offsetY;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = alpha;

  const gradient = ctx.createLinearGradient(headX, headY, tailX2, tailY2);
  gradient.addColorStop(0, withAlpha(meteor.coreColor, 0.95));
  gradient.addColorStop(0.35, withAlpha(meteor.midColor, 0.8));
  gradient.addColorStop(0.7, withAlpha(meteor.tailColor, 0.55));
  gradient.addColorStop(1, withAlpha(meteor.tailColor, 0));

  ctx.strokeStyle = gradient;
  ctx.lineWidth = meteor.width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(headX, headY);
  ctx.lineTo(tailX2, tailY2);
  ctx.stroke();

  ctx.strokeStyle = withAlpha(meteor.tailColor, 0.4);
  ctx.lineWidth = Math.max(0.45, meteor.width * 0.4);
  ctx.beginPath();
  ctx.moveTo(headX - offsetX * 0.3, headY - offsetY * 0.3);
  ctx.lineTo(tailX2 - offsetX * 0.3, tailY2 - offsetY * 0.3);
  ctx.stroke();

  ctx.strokeStyle = withAlpha("#ffffff", 0.9);
  ctx.lineWidth = Math.max(0.4, meteor.width * 0.35);
  ctx.beginPath();
  ctx.moveTo(headX, headY);
  ctx.lineTo(tailX2, tailY2);
  ctx.stroke();

  const glow = ctx.createRadialGradient(
    headX,
    headY,
    0,
    headX,
    headY,
    meteor.headSize * 2.6,
  );
  glow.addColorStop(0, withAlpha("#ffffff", 0.95));
  glow.addColorStop(0.4, withAlpha(meteor.glowColor, 0.8));
  glow.addColorStop(1, withAlpha(meteor.glowColor, 0));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(headX, headY, meteor.headSize * 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = withAlpha("#ffffff", 0.9);
  ctx.beginPath();
  ctx.arc(headX, headY, Math.max(1.2, meteor.headSize * 0.25), 0, Math.PI * 2);
  ctx.fill();

  if (Math.random() < sparkleChance) {
    const t = Math.random() * 0.6 + 0.15;
    const sparkleX = headX - dx * meteor.length * t;
    const sparkleY = headY - dy * meteor.length * t;
    const sparkleSize = meteor.width * (0.8 + Math.random() * 0.8);
    const sparkle = ctx.createRadialGradient(
      sparkleX,
      sparkleY,
      0,
      sparkleX,
      sparkleY,
      sparkleSize * 4,
    );
    sparkle.addColorStop(0, withAlpha("#ffffff", 0.8));
    sparkle.addColorStop(0.4, withAlpha(meteor.tailColor, 0.6));
    sparkle.addColorStop(1, withAlpha(meteor.tailColor, 0));
    ctx.fillStyle = sparkle;
    ctx.beginPath();
    ctx.arc(sparkleX, sparkleY, sparkleSize * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

/**
 * ========================================
 * SHATTERED MOON EFFECTS
 * ========================================
 */

/**
 * Initialize Moon Cracks for Shattered Moon
 */
/**
 * Initialize Floating Moon Fragments
 */
/**
 * Initialize Shatter Dust Particles
 */
/**
 * Draw Moon Cracks on the moon surface
 */
/**
 * Draw and update Floating Moon Fragments
 */
/**
 * Draw and update Shatter Dust
 */
// =================== ECHO MOON EFFECT ===================
// =================== LEGENDARY EFFECTS ===================

// Blood Ring Effect
// Fade Particles Effect
// Silence Waves Effect
// Dream Dust Effect
// Memory Fragments Effect
// Ancient Runes Effect
// Light Rays Effect
// Shooting Stars Effect
const createLegendaryShootingStar = (
  canvasWidth: number,
  canvasHeight: number,
): ShootingStar => {
  const kind = Math.random() < 0.35 ? "hero" : "streak";
  const palette =
    METEOR_COLOR_SCHEMES[
      Math.floor(Math.random() * METEOR_COLOR_SCHEMES.length)
    ];
  const angle = getMeteorAngle();
  const speed =
    (kind === "hero" ? 12 : 9) + Math.random() * (kind === "hero" ? 7 : 5);
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;

  const length =
    kind === "hero" ? 220 + Math.random() * 140 : 120 + Math.random() * 100;
  const width =
    kind === "hero" ? 2.8 + Math.random() * 1.6 : 1.2 + Math.random() * 0.8;
  const headSize =
    kind === "hero" ? 8 + Math.random() * 6 : 5 + Math.random() * 3;

  const spawnPoint = getMeteorSpawnPoint(canvasWidth, canvasHeight);
  const x = spawnPoint.x;
  const y = spawnPoint.y;

  const maxLife =
    kind === "hero" ? 120 + Math.random() * 80 : 90 + Math.random() * 60;

  return {
    x,
    y,
    vx,
    vy,
    length,
    opacity: 0.7 + Math.random() * 0.3,
    coreColor: palette.core,
    midColor: palette.mid,
    tailColor: palette.tail,
    glowColor: palette.glow,
    width,
    headSize,
    life: 0,
    maxLife,
    flickerPhase: Math.random() * Math.PI * 2,
    flickerSpeed: 0.018 + Math.random() * 0.03,
    offset: (Math.random() - 0.5) * (kind === "hero" ? 3.8 : 2.2),
    kind,
  };
};

// =================== CRYSTAL SHARDS EFFECT (CRYSTAL MOON) ===================

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

// =================== STARFIELD EFFECT ===================

// =================== NEBULA EFFECT ===================

type NebulaOptions = {
  palettes?: string[][];
  opacityRange?: [number, number];
  sizeRange?: [number, number];
  rotationSpeedRange?: [number, number];
  pulseSpeedRange?: [number, number];
};

const DEFAULT_NEBULA_PALETTES = [
  ["#FF6B9D", "#C44569", "#8B3A62"], // Pink/Purple
  ["#4A90E2", "#7B68EE", "#9370DB"], // Blue/Purple
  ["#00D9FF", "#0099CC", "#006699"], // Cyan
  ["#FF8C42", "#FF6B35", "#C44536"], // Orange/Red
  ["#6BCF7F", "#4ECDC4", "#44A08D"], // Green/Teal
];

const METEOR_NEBULA_PALETTES = [
  ["#7e4bff", "#b07cff", "#f2b6ff"], // Violet glow
  ["#5a2dff", "#8a4fff", "#c58bff"], // Deep indigo
  ["#a450ff", "#d284ff", "#ffb4e8"], // Magenta haze
  ["#3b2b8f", "#6a3bb0", "#b071ff"], // Night purple
];

