/**
 * Memory Fragment Particle System
 *
 * Fragments of memories drifting in the sky
 */

export interface MemoryFragment {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  lifetime: number;
  maxLifetime: number;
  fragmentType: number;
}

export const initMemoryFragments = (
  canvasWidth: number,
  canvasHeight: number,
  count = 20,
): MemoryFragment[] => {
  // TODO: Copy implementation from particleEffects.ts (search for "initMemoryFragments")
  return [];
};

export const drawMemoryFragments = (
  ctx: CanvasRenderingContext2D,
  fragments: MemoryFragment[],
) => {
  // TODO: Copy implementation from particleEffects.ts (search for "drawMemoryFragments")
};
