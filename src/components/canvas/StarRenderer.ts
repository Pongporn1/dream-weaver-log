import type { StarRendererProps, Star } from "./types";
import type { MoonPhenomenon } from "@/data/moonPhenomena";

export function initStars(
  width: number,
  height: number,
  phenomenon: MoonPhenomenon
): Star[] {
  return Array.from(
    { length: Math.floor(120 * phenomenon.starDensity) },
    () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.6,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      twinklePhase: Math.random() * Math.PI * 2,
    })
  );
}

export function drawStars({
  ctx,
  phenomenon,
  parallaxOffset,
  stars,
}: StarRendererProps): void {
  if (phenomenon.starDensity === 0) return;

  // Parallax for stars (Furthest layer - moves slowly)
  const pX = parallaxOffset.x * 0.5;
  const pY = parallaxOffset.y * 0.5;

  stars.forEach((star) => {
    star.twinklePhase += star.twinkleSpeed;
    const opacity = star.opacity * (Math.sin(star.twinklePhase) * 0.5 + 0.5);

    const starX = star.x + pX;
    const starY = star.y + pY;

    ctx.beginPath();
    ctx.arc(starX, starY, star.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${opacity})`;
    ctx.fill();

    // Add glow for larger stars
    if (star.size > 1.5) {
      ctx.beginPath();
      ctx.arc(starX, starY, star.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${opacity * 0.2})`;
      ctx.fill();
    }
  });
}
