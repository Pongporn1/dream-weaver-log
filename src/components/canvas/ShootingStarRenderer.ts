import type { ShootingStarRendererProps, ShootingStar } from "./types";
import type { MoonPhenomenon } from "@/data/moonPhenomena";

const SHOOTING_STAR_COLORS = [
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

const SHOOTING_STAR_DIRECTION: "right" | "left" = "right";
const SHOOTING_STAR_BASE_ANGLE = Math.PI / 4.6;
const SHOOTING_STAR_ANGLE_VARIANCE = 0.16;

export function initShootingStars(
  width: number,
  height: number
): ShootingStar[] {
  const startX =
    SHOOTING_STAR_DIRECTION === "right" ? -100 : width + 100;
  return Array.from({ length: 10 }, (_, i) => ({
    x: startX + Math.random() * 120,
    y: -80 - Math.random() * 140,
    length: Math.random() * 60 + 40,
    speed: Math.random() * 1.5 + 1,
    angle:
      SHOOTING_STAR_BASE_ANGLE +
      (Math.random() - 0.5) * SHOOTING_STAR_ANGLE_VARIANCE,
    color: SHOOTING_STAR_COLORS[i],
    opacity: Math.random() * 0.3 + 0.7,
    isActive: false,
    trailLength: Math.random() * 80 + 60,
  }));
}

export function drawShootingStars(
  props: ShootingStarRendererProps
): { shootingStars: ShootingStar[]; timer: number } {
  const { ctx, width, height, phenomenon, shootingStars } = props;
  let timer = props.timer;

  if (phenomenon.shootingStarChance === 0) {
    return { shootingStars, timer };
  }

  shootingStars.forEach((star) => {
    if (!star.isActive) return;

    // Move shooting star
    star.x +=
      (SHOOTING_STAR_DIRECTION === "right" ? 1 : -1) *
      Math.cos(star.angle) *
      star.speed;
    star.y += Math.sin(star.angle) * star.speed;

    // Check if out of bounds
    if (
      (SHOOTING_STAR_DIRECTION === "right" &&
        star.x > width + star.trailLength) ||
      (SHOOTING_STAR_DIRECTION === "left" &&
        star.x < -star.trailLength) ||
      star.y > height + star.trailLength
    ) {
      star.isActive = false;
      return;
    }

    ctx.save();

    // Draw trail gradient
    const gradient = ctx.createLinearGradient(
      star.x,
      star.y,
      star.x - Math.cos(star.angle) * star.trailLength,
      star.y - Math.sin(star.angle) * star.trailLength
    );
    gradient.addColorStop(0, star.color);
    gradient.addColorStop(0.5, `${star.color}88`);
    gradient.addColorStop(1, `${star.color}00`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.globalAlpha = star.opacity;

    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo(
      star.x - Math.cos(star.angle) * star.trailLength,
      star.y - Math.sin(star.angle) * star.trailLength
    );
    ctx.stroke();

    // Draw head glow
    const headGlow = ctx.createRadialGradient(
      star.x,
      star.y,
      0,
      star.x,
      star.y,
      8
    );
    headGlow.addColorStop(0, "#FFFFFF");
    headGlow.addColorStop(0.3, star.color);
    headGlow.addColorStop(1, `${star.color}00`);

    ctx.fillStyle = headGlow;
    ctx.beginPath();
    ctx.arc(star.x, star.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw bright core
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  // Spawn new shooting stars
  timer++;
  if (timer > 3600 + Math.random() * 3600) {
    timer = 0;
    const inactive = shootingStars
      .map((s, i) => (!s.isActive ? i : -1))
      .filter((i) => i !== -1);

    if (inactive.length > 0) {
      const isShower =
        Math.random() < phenomenon.shootingStarChance && inactive.length >= 3;
      const count = isShower
        ? Math.min(Math.floor(Math.random() * 3) + 3, inactive.length)
        : 1;

      for (let i = 0; i < count; i++) {
        const idx = inactive.splice(
          Math.floor(Math.random() * inactive.length),
          1
        )[0];
        const star = shootingStars[idx];
        star.isActive = true;
        star.x =
          SHOOTING_STAR_DIRECTION === "right"
            ? -120 - Math.random() * 120
            : width + 120 + Math.random() * 120;
        star.y = -80 - Math.random() * 140;
      }
    }
  }

  return { shootingStars, timer };
}
