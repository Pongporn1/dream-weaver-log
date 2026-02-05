/**
 * Shooting Star System
 *
 * Legendary shooting stars with enhanced visuals and burst spawning
 */

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
const LEGENDARY_ACTIVE_RANGE: [number, number] = [360, 600];
const LEGENDARY_COOLDOWN_RANGE: [number, number] = [900, 1500];

type ShowerCycle = {
  active: boolean;
  timer: number;
  activeDuration: number;
  cooldownDuration: number;
};

const legendaryShowerCycles = new WeakMap<ShootingStar[], ShowerCycle>();

const randomInRange = (range: [number, number]) =>
  range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));

const getShowerCycle = (
  map: WeakMap<ShootingStar[], ShowerCycle>,
  key: ShootingStar[],
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
