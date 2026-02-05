/**
 * Fade Particle System
 *
 * Fading particles drifting away
 */

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

export const initFadeParticles = (
  moonX: number,
  moonY: number,
  moonRadius: number,
): FadeParticle[] => {
  // TODO: Copy implementation from particleEffects.ts (search for "initFadeParticles")
  return [];
};

export const drawFadeParticles = (
  ctx: CanvasRenderingContext2D,
  particles: FadeParticle[],
  canvasWidth: number,
  canvasHeight: number,
) => {
  // TODO: Copy implementation from particleEffects.ts (search for "drawFadeParticles")
};
