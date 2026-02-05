/**
 * Shooting Star Particle System
 *
 * Individual shooting stars (legendary variant)
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

export const initShootingStars = (): ShootingStar[] => {
  // TODO: Copy implementation from particleEffects.ts (search for "initShootingStars")
  // Note: May be imported as "initShootingStarsLegendary" in useParticleSystem
  return [];
};

export const drawShootingStars = (
  ctx: CanvasRenderingContext2D,
  stars: ShootingStar[],
  canvasWidth: number,
  canvasHeight: number,
) => {
  // TODO: Copy implementation from particleEffects.ts (search for "drawShootingStars")
  // Note: May be imported as "drawShootingStarsLegendary" in useParticleSystem
};
