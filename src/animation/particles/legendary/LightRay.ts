/**
 * Light Ray Particle System
 *
 * Radial light rays emanating from the moon
 */

export interface LightRay {
  angle: number;
  length: number;
  opacity: number;
  width: number;
  pulsePhase: number;
  speed: number;
}

export const initLightRays = (count = 12): LightRay[] => {
  // TODO: Copy implementation from particleEffects.ts (search for "initLightRays")
  return [];
};

export const drawLightRays = (
  ctx: CanvasRenderingContext2D,
  rays: LightRay[],
  moonX: number,
  moonY: number,
) => {
  // TODO: Copy implementation from particleEffects.ts (search for "drawLightRays")
};
