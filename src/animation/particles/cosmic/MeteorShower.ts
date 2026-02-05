/**
 * Meteor Shower System
 *
 * Dynamic meteor shower with cycles of activity and cooldown periods
 */

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

type ShowerCycle = {
  active: boolean;
  timer: number;
  activeDuration: number;
  cooldownDuration: number;
};

const meteorShowerCycles = new WeakMap<MeteorShowerParticle[], ShowerCycle>();

const randomInRange = (range: [number, number]) =>
  range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));

const getShowerCycle = (
  map: WeakMap<MeteorShowerParticle[], ShowerCycle>,
  key: MeteorShowerParticle[],
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

export const initMeteorNebula = (
  canvasWidth: number,
  canvasHeight: number,
  count = 6,
) => {
  // This is defined in NebulaCloud.ts as initMeteorNebula
  // Re-export if needed or import from NebulaCloud
  return [];
};
