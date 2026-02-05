/**
 * Orbiting Particle System
 *
 * Particles that orbit around the moon
 */

export interface OrbitingParticle {
  angle: number;
  distance: number;
  size: number;
  speed: number;
  color: string;
  opacity: number;
}

export const initOrbitingParticles = (
  count = 20,
  color1 = "#B84060",
  color2 = "#d85080",
  minSpeed = 0.01,
  maxSpeed = 0.02,
): OrbitingParticle[] => {
  return Array.from({ length: count }, (_, i) => ({
    angle: (Math.PI * 2 * i) / count,
    distance: 50 + Math.random() * 30,
    size: Math.random() * 3 + 1,
    speed: minSpeed + Math.random() * (maxSpeed - minSpeed),
    color: i % 2 === 0 ? color1 : color2,
    opacity: Math.random() * 0.5 + 0.3,
  }));
};

export const drawOrbitingParticles = (
  ctx: CanvasRenderingContext2D,
  particles: OrbitingParticle[],
  moonX: number,
  moonY: number,
) => {
  particles.forEach((p) => {
    p.angle += p.speed;
    const x = moonX + Math.cos(p.angle) * p.distance,
      y = moonY + Math.sin(p.angle) * p.distance;
    const g = ctx.createRadialGradient(x, y, 0, x, y, p.size * 2);
    g.addColorStop(
      0,
      `${p.color}${Math.floor(p.opacity * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(1, `${p.color}00`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, p.size * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.opacity;
    ctx.beginPath();
    ctx.arc(x, y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
};
