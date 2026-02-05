/**
 * Moon Crack Particle System
 *
 * Cracks spreading across the moon surface
 */

export interface MoonCrack {
  startAngle: number;
  length: number;
  width: number;
  branches: { angle: number; length: number }[];
  opacity: number;
}

export const initMoonCracks = (): MoonCrack[] => {
  // TODO: Copy implementation from particleEffects.ts (search for "initMoonCracks")
  return [];
};

export const drawMoonCracks = (
  ctx: CanvasRenderingContext2D,
  cracks: MoonCrack[],
  moonX: number,
  moonY: number,
  moonRadius: number,
) => {
  // TODO: Copy implementation from particleEffects.ts (search for "drawMoonCracks")
};
