/**
 * Moon Flash Particle System
 *
 * Flash effects that appear around the moon surface
 */

export interface MoonFlash {
  x: number;
  y: number;
  size: number;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
}

export const initMoonFlashes = (): MoonFlash[] => [];

export const spawnMoonFlash = (
  moonX: number,
  moonY: number,
  moonRadius = 40,
): MoonFlash => {
  const angle = Math.random() * Math.PI * 2,
    distance = Math.random() * moonRadius * 0.8;
  return {
    x: moonX + Math.cos(angle) * distance,
    y: moonY + Math.sin(angle) * distance,
    size: Math.random() * 8 + 4,
    opacity: 1,
    lifetime: 0,
    maxLifetime: 30 + Math.random() * 20,
  };
};

export const drawMoonFlashes = (
  ctx: CanvasRenderingContext2D,
  flashes: MoonFlash[],
): MoonFlash[] => {
  return flashes
    .map((f) => {
      f.lifetime++;
      f.opacity = 1 - f.lifetime / f.maxLifetime;
      if (f.opacity > 0) {
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size);
        g.addColorStop(0, `rgba(255,255,255,${f.opacity})`);
        g.addColorStop(0.5, `rgba(200,200,255,${f.opacity * 0.6})`);
        g.addColorStop(1, `rgba(150,150,255,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();
      }
      return f;
    })
    .filter((f) => f.lifetime < f.maxLifetime);
};
