/**
 * Void Ripple Particle System
 *
 * Expanding ripples in the void
 */

export interface VoidRipple {
  radius: number;
  maxRadius: number;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
  centerX: number;
  centerY: number;
  speed: number;
  thickness: number;
}

export const initVoidRipples = (): VoidRipple[] => {
  // TODO: Copy implementation from particleEffects.ts (search for "initVoidRipples")
  return [];
};

export const spawnVoidRipple = (
  x: number,
  y: number,
  maxRadius = 300,
): VoidRipple => {
  // TODO: Copy implementation from particleEffects.ts (search for "spawnVoidRipple")
  return {
    radius: 0,
    maxRadius,
    opacity: 1,
    lifetime: 0,
    maxLifetime: 120,
    centerX: x,
    centerY: y,
    speed: 3,
    thickness: 2,
  };
};

export const drawVoidRipples = (
  ctx: CanvasRenderingContext2D,
  ripples: VoidRipple[],
): VoidRipple[] => {
  // TODO: Copy implementation from particleEffects.ts (search for "drawVoidRipples")
  return [];
};
