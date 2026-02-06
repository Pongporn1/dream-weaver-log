import type { ShootingStarRendererProps, ShootingStar } from "./types";

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

// Retro pixel colors for Pixel Dream Moon
const PIXEL_SHOOTING_COLORS = [
  "#FF6B9D", // Hot pink
  "#C44CFF", // Electric purple
  "#00D4FF", // Cyan
  "#FFE66D", // Yellow
  "#4DFFB8", // Mint green
  "#00FF88", // Spring green
];

const SHOOTING_STAR_DIRECTION: "right" | "left" = "right";
const SHOOTING_STAR_BASE_ANGLE = Math.PI / 4.6;
const SHOOTING_STAR_ANGLE_VARIANCE = 0.16;

export function initShootingStars(width: number): ShootingStar[] {
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

// Draw pixelated shooting star for Pixel Dream Moon
function drawPixelShootingStar(
  ctx: CanvasRenderingContext2D,
  star: ShootingStar,
  time: number
) {
  const pixelSize = 3;
  const trailSegments = Math.floor(star.trailLength / pixelSize);
  
  // Beat-synced color cycling
  const beatPhase = Math.floor(time / 300) % PIXEL_SHOOTING_COLORS.length;
  const beatProgress = (time % 300) / 300;
  const beatPulse = Math.sin(beatProgress * Math.PI);
  
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  
  // Draw pixelated trail
  for (let i = 0; i < trailSegments; i++) {
    const progress = i / trailSegments;
    const segmentX = star.x - Math.cos(star.angle) * (i * pixelSize);
    const segmentY = star.y - Math.sin(star.angle) * (i * pixelSize);
    
    // Fade out along trail
    const alpha = (1 - progress) * star.opacity * (0.8 + beatPulse * 0.2);
    
    // Color shifts along trail
    const colorIndex = (beatPhase + Math.floor(i / 3)) % PIXEL_SHOOTING_COLORS.length;
    const segmentColor = i < 3 ? "#FFFFFF" : PIXEL_SHOOTING_COLORS[colorIndex];
    
    ctx.globalAlpha = alpha;
    ctx.fillStyle = segmentColor;
    
    // Varying size for pixel effect
    const size = i < 2 ? pixelSize + 1 : pixelSize - Math.floor(progress * 2);
    if (size > 0) {
      ctx.fillRect(
        Math.floor(segmentX / pixelSize) * pixelSize,
        Math.floor(segmentY / pixelSize) * pixelSize,
        size,
        size
      );
    }
  }
  
  // Draw bright pixel head
  ctx.globalAlpha = star.opacity;
  ctx.fillStyle = "#FFFFFF";
  const headX = Math.floor(star.x / pixelSize) * pixelSize;
  const headY = Math.floor(star.y / pixelSize) * pixelSize;
  ctx.fillRect(headX, headY, pixelSize + 1, pixelSize + 1);
  
  // Pixel glow effect
  ctx.globalAlpha = 0.4 + beatPulse * 0.3;
  ctx.fillStyle = PIXEL_SHOOTING_COLORS[beatPhase];
  ctx.fillRect(headX - pixelSize, headY - pixelSize, pixelSize * 3 + 1, pixelSize * 3 + 1);
  
  ctx.restore();
}

// Draw normal smooth shooting star
function drawNormalShootingStar(
  ctx: CanvasRenderingContext2D,
  star: ShootingStar
) {
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
}

export function drawShootingStars(
  props: ShootingStarRendererProps
): { shootingStars: ShootingStar[]; timer: number } {
  const { ctx, width, height, phenomenon, shootingStars } = props;
  let timer = props.timer;
  const time = Date.now();
  const isPixelMoon = phenomenon.id === "pixelDreamMoon";

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

    // Draw based on phenomenon type
    if (isPixelMoon) {
      drawPixelShootingStar(ctx, star, time);
    } else {
      drawNormalShootingStar(ctx, star);
    }
  });

  // Spawn new shooting stars (more frequent for Pixel Dream Moon)
  const spawnInterval = isPixelMoon ? 2400 : 3600;
  const spawnVariance = isPixelMoon ? 2400 : 3600;
  
  timer++;
  if (timer > spawnInterval + Math.random() * spawnVariance) {
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
        
        // Use pixel colors for Pixel Dream Moon
        if (isPixelMoon) {
          star.color = PIXEL_SHOOTING_COLORS[Math.floor(Math.random() * PIXEL_SHOOTING_COLORS.length)];
        }
      }
    }
  }

  return { shootingStars, timer };
}
