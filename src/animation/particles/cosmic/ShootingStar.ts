/**
 * Shooting Star System
 *
 * Legendary shooting stars with enhanced visuals and burst spawning
 */

import {
  DEFAULT_ANGLE_VARIANCE,
  DEFAULT_BASE_ANGLE,
  DEFAULT_DIRECTION,
  METEOR_COLOR_SCHEMES,
  drawMeteorTrail,
  getMeteorAngle,
  getMeteorSpawnPoint,
  getShowerCycle,
  randomInRange,
  type ShowerCycle,
} from "./meteorShared";

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

const METEOR_DIRECTION = DEFAULT_DIRECTION;
const METEOR_BASE_ANGLE = DEFAULT_BASE_ANGLE;
const METEOR_ANGLE_VARIANCE = DEFAULT_ANGLE_VARIANCE;
const LEGENDARY_ACTIVE_RANGE: [number, number] = [360, 600];
const LEGENDARY_COOLDOWN_RANGE: [number, number] = [900, 1500];

const legendaryShowerCycles = new WeakMap<ShootingStar[], ShowerCycle>();

const createLegendaryShootingStar = (
  canvasWidth: number,
  canvasHeight: number,
): ShootingStar => {
  const kind = Math.random() < 0.35 ? "hero" : "streak";
  const palette =
    METEOR_COLOR_SCHEMES[
      Math.floor(Math.random() * METEOR_COLOR_SCHEMES.length)
    ];
  const angle = getMeteorAngle(
    METEOR_DIRECTION,
    METEOR_BASE_ANGLE,
    METEOR_ANGLE_VARIANCE,
  );
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

  const spawnPoint = getMeteorSpawnPoint(
    METEOR_DIRECTION,
    canvasWidth,
    canvasHeight,
  );
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

export const initShootingStars = (): ShootingStar[] => {
  return [];
};

export const drawShootingStars = (
  ctx: CanvasRenderingContext2D,
  stars: ShootingStar[],
  canvasWidth: number,
  canvasHeight: number,
): ShootingStar[] => {
  const cycle = getShowerCycle(
    legendaryShowerCycles,
    stars,
    LEGENDARY_ACTIVE_RANGE,
    LEGENDARY_COOLDOWN_RANGE,
  );
  cycle.timer += 1;
  if (cycle.active && cycle.timer >= cycle.activeDuration) {
    cycle.active = false;
    cycle.timer = 0;
    cycle.cooldownDuration = randomInRange(LEGENDARY_COOLDOWN_RANGE);
  } else if (!cycle.active && cycle.timer >= cycle.cooldownDuration) {
    cycle.active = true;
    cycle.timer = 0;
    cycle.activeDuration = randomInRange(LEGENDARY_ACTIVE_RANGE);
  }

  if (cycle.active) {
    const spawnChance = 0.18;
    if (Math.random() < spawnChance) {
      const burst = Math.random() < 0.4 ? 2 : 1;
      for (let i = 0; i < burst; i += 1) {
        stars.push(createLegendaryShootingStar(canvasWidth, canvasHeight));
      }
    }
  }

  const boundMargin = Math.max(canvasWidth, canvasHeight) * 0.25;

  return stars
    .map((star) => {
      star.x += star.vx;
      star.y += star.vy;
      star.life += 1;
      star.flickerPhase += star.flickerSpeed;

      const lifeT = star.life / star.maxLife;
      const fadeIn = lifeT < 0.12 ? lifeT / 0.12 : 1;
      const fadeOut = lifeT > 0.82 ? (1 - lifeT) / 0.18 : 1;
      const fade = Math.max(0, Math.min(1, Math.min(fadeIn, fadeOut)));
      const flicker = 0.85 + Math.sin(star.flickerPhase) * 0.15;
      const alpha = star.opacity * fade * flicker;

      if (alpha > 0.02) {
        drawMeteorTrail(ctx, star, alpha, star.kind === "hero" ? 0.2 : 0.1);
      }

      return star;
    })
    .filter(
      (star) =>
        star.life < star.maxLife &&
        star.x < canvasWidth + boundMargin &&
        star.y < canvasHeight + boundMargin,
    );
};
