/**
 * Shared helpers for cosmic meteor-style particles
 */

export type Direction = "right" | "left";

export interface ShowerCycle {
  active: boolean;
  timer: number;
  activeDuration: number;
  cooldownDuration: number;
}

export interface BaseMeteorShape {
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
}

export const METEOR_COLOR_SCHEMES = [
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
] as const;

export const DEFAULT_DIRECTION: Direction = "right";
export const DEFAULT_BASE_ANGLE = Math.PI / 4.6;
export const DEFAULT_ANGLE_VARIANCE = 0.16;

export const withAlpha = (hex: string, alpha: number) => {
  const clamped = Math.min(1, Math.max(0, alpha));
  return `${hex}${Math.round(clamped * 255)
    .toString(16)
    .padStart(2, "0")}`;
};

export const randomInRange = (range: [number, number]) =>
  range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));

export const getShowerCycle = <T>(
  map: WeakMap<T[], ShowerCycle>,
  key: T[],
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

export const getMeteorAngle = (
  direction: Direction,
  baseAngle: number,
  variance: number,
) => {
  const jitter = (Math.random() - 0.5) * variance;
  return direction === "right"
    ? baseAngle + jitter
    : Math.PI - baseAngle + jitter;
};

export const getMeteorSpawnPoint = (
  direction: Direction,
  canvasWidth: number,
  canvasHeight: number,
) => {
  const margin = Math.max(canvasWidth, canvasHeight) * 0.14;
  const spawnFromTop = Math.random() < 0.65;

  if (direction === "right") {
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

export const drawMeteorTrail = (
  ctx: CanvasRenderingContext2D,
  meteor: BaseMeteorShape,
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
