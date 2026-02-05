/**
 * Shatter Dust Particle System
 *
 * Dust particles from the shattered moon
 */

export interface ShatterDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export const initShatterDust = (
  moonX: number,
  moonY: number,
  count = 100,
): ShatterDust[] => {
  // TODO: Copy implementation from particleEffects.ts (search for "initShatterDust")
  return [];
};

export const drawShatterDust = (
  ctx: CanvasRenderingContext2D,
  dust: ShatterDust[],
): ShatterDust[] => {
  // TODO: Copy implementation from particleEffects.ts (search for "drawShatterDust")
  return [];
};
