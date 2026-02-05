/**
 * Prism Light Particle System
 *
 * Prismatic light shards orbiting the moon
 */

export interface PrismLight {
  angle: number;
  distance: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  orbitSpeed: number;
  opacity: number;
  color: string;
  pulsePhase: number;
  shardType: "hexagon" | "diamond" | "triangle";
}

export const initPrismLights = (): PrismLight[] => {
  // TODO: Copy implementation from particleEffects.ts line ~2685+
  return [];
};

export const drawPrismLights = (
  ctx: CanvasRenderingContext2D,
  prisms: PrismLight[],
  moonX: number,
  moonY: number,
) => {
  // TODO: Copy implementation from particleEffects.ts (search for "drawPrismLights")
};
