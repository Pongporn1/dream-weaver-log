/**
 * Frozen Time Particle System
 *
 * Frozen time particles that freeze mid-motion
 */

export interface FrozenTimeParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
  freezePoint: number;
  isFrozen: boolean;
  trailLength: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  frozenIntensity: number;
}

export const initFrozenTime = (
  canvasWidth: number,
  canvasHeight: number,
  count = 50,
): FrozenTimeParticle[] => {
  // TODO: Copy implementation from particleEffects.ts (search for "initFrozenTime")
  return [];
};

export const drawFrozenTime = (
  ctx: CanvasRenderingContext2D,
  particles: FrozenTimeParticle[],
) => {
  // TODO: Copy implementation from particleEffects.ts (search for "drawFrozenTime")
};
