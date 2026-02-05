/**
 * Moon Fragment Particle System
 *
 * Fragments of the shattered moon orbiting in space
 */

export interface MoonFragment {
  x: number;
  y: number;
  size: number;
  angle: number;
  distance: number;
  orbitSpeed: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export const initMoonFragments = (): MoonFragment[] => {
  // TODO: Copy implementation from particleEffects.ts (search for "initMoonFragments")
  return [];
};

export const drawMoonFragments = (
  ctx: CanvasRenderingContext2D,
  fragments: MoonFragment[],
  moonX: number,
  moonY: number,
) => {
  // TODO: Copy implementation from particleEffects.ts (search for "drawMoonFragments")
};
