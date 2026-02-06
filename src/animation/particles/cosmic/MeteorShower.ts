/**
 * Meteor Shower System
 *
 * Dynamic meteor shower with cycles of activity and cooldown periods
 */

import {
  DEFAULT_ANGLE_VARIANCE,
  DEFAULT_BASE_ANGLE,
  DEFAULT_DIRECTION,
  METEOR_COLOR_SCHEMES,
  type ShowerCycle,
  drawMeteorTrail,
  getMeteorAngle,
  getMeteorSpawnPoint,
  getShowerCycle,
  randomInRange,
} from "./meteorShared";

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

const METEOR_DIRECTION = DEFAULT_DIRECTION;
const METEOR_BASE_ANGLE = DEFAULT_BASE_ANGLE;
const METEOR_ANGLE_VARIANCE = DEFAULT_ANGLE_VARIANCE;
const METEOR_ACTIVE_RANGE: [number, number] = [420, 720];
const METEOR_COOLDOWN_RANGE: [number, number] = [900, 1800];

const meteorShowerCycles = new WeakMap<MeteorShowerParticle[], ShowerCycle>();

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
  const angle = getMeteorAngle(
    METEOR_DIRECTION,
    METEOR_BASE_ANGLE,
    METEOR_ANGLE_VARIANCE,
  );
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

  const spawnPoint = getMeteorSpawnPoint(
    METEOR_DIRECTION,
    canvasWidth,
    canvasHeight,
  );
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

export const initMeteorShower = (
  canvasWidth: number,
  canvasHeight: number,
  count = 15,
): MeteorShowerParticle[] => {
  const density = Math.max(10, Math.round(count * 1.05));
  return Array.from({ length: density }, () =>
    createMeteorShowerParticle(canvasWidth, canvasHeight),
  );
};

export const drawMeteorShower = (
  ctx: CanvasRenderingContext2D,
  meteors: MeteorShowerParticle[],
  canvasWidth: number,
  canvasHeight: number,
) => {
  const cycle = getShowerCycle(
    meteorShowerCycles,
    meteors,
    METEOR_ACTIVE_RANGE,
    METEOR_COOLDOWN_RANGE,
  );
  cycle.timer += 1;
  if (cycle.active && cycle.timer >= cycle.activeDuration) {
    cycle.active = false;
    cycle.timer = 0;
    cycle.cooldownDuration = randomInRange(METEOR_COOLDOWN_RANGE);
  } else if (!cycle.active && cycle.timer >= cycle.cooldownDuration) {
    cycle.active = true;
    cycle.timer = 0;
    cycle.activeDuration = randomInRange(METEOR_ACTIVE_RANGE);
  }

  const allowSpawn = cycle.active;
  const boundMargin = Math.max(canvasWidth, canvasHeight) * 0.25;

  for (let i = 0; i < meteors.length; i += 1) {
    const m = meteors[i];
    if (!m.active) {
      if (allowSpawn && Math.random() < 0.03) {
        meteors[i] = createMeteorShowerParticle(
          canvasWidth,
          canvasHeight,
          true,
        );
      }
      continue;
    }

    m.x += m.vx;
    m.y += m.vy;
    m.life += 1;
    m.flickerPhase += m.flickerSpeed;

    const lifeT = m.life / m.maxLife;
    const fadeIn = lifeT < 0.12 ? lifeT / 0.12 : 1;
    const fadeOut = lifeT > 0.85 ? (1 - lifeT) / 0.15 : 1;
    const fade = Math.max(0, Math.min(1, Math.min(fadeIn, fadeOut)));
    const flicker = 0.85 + Math.sin(m.flickerPhase) * 0.15;
    const alpha = m.opacity * fade * flicker;

    if (alpha > 0.02) {
      drawMeteorTrail(ctx, m, alpha * 0.7, m.kind === "hero" ? 0.14 : 0.08);
    }

    if (
      m.x > canvasWidth + boundMargin ||
      m.y > canvasHeight + boundMargin ||
      m.life >= m.maxLife
    ) {
      if (allowSpawn) {
        meteors[i] = createMeteorShowerParticle(
          canvasWidth,
          canvasHeight,
          true,
        );
      } else {
        m.active = false;
      }
    }
  }
};

// Note: initMeteorNebula is defined in NebulaCloud.ts
