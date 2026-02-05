/**
 * Silence Wave System
 *
 * Expanding circular waves with dashed lines that emanate from the moon
 */

export interface SilenceWave {
  radius: number;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
}

export const initSilenceWaves = (): SilenceWave[] => {
  return [];
};

export const drawSilenceWaves = (
  ctx: CanvasRenderingContext2D,
  waves: SilenceWave[],
  moonX: number,
  moonY: number,
  moonRadius: number,
): SilenceWave[] => {
  // Spawn new wave occasionally
  if (Math.random() < 0.015) {
    waves.push({
      radius: moonRadius,
      opacity: 0.6,
      lifetime: 0,
      maxLifetime: 120,
    });
  }

  return waves
    .map((wave) => {
      wave.lifetime++;
      wave.radius += 1.0;
      wave.opacity = (1 - wave.lifetime / wave.maxLifetime) * 0.6;

      if (wave.lifetime < wave.maxLifetime && wave.opacity > 0.05) {
        ctx.strokeStyle = `rgba(168, 168, 200, ${wave.opacity})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(moonX, moonY, wave.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      return wave;
    })
    .filter((wave) => wave.lifetime < wave.maxLifetime);
};
