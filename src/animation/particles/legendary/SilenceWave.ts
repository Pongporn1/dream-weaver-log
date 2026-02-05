/**
 * Silence Wave Particle System
 *
 * Expanding waves of silence
 */

export interface SilenceWave {
  radius: number;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
}

export const initSilenceWaves = (): SilenceWave[] => {
  // TODO: Copy implementation from particleEffects.ts (search for "initSilenceWaves")
  return [];
};

export const drawSilenceWaves = (
  ctx: CanvasRenderingContext2D,
  waves: SilenceWave[],
  moonX: number,
  moonY: number,
) => {
  // TODO: Copy implementation from particleEffects.ts (search for "drawSilenceWaves")
};
