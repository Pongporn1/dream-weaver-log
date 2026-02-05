/**
 * Dream Dust Particle System
 *
 * Floating dream dust particles
 */

export interface DreamDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  floatPhase: number;
  floatSpeed: number;
}

export const initDreamDust = (
  canvasWidth: number,
  canvasHeight: number,
  count = 60,
): DreamDust[] => {
  // TODO: Copy implementation from particleEffects.ts (search for "initDreamDust")
  return [];
};

export const drawDreamDust = (
  ctx: CanvasRenderingContext2D,
  dust: DreamDust[],
) => {
  // TODO: Copy implementation from particleEffects.ts (search for "drawDreamDust")
};
