/**
 * Fade Particle System
 *
 * Subtle particles that slowly fade in and out, creating an ethereal atmosphere
 */

export interface FadeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  fadeSpeed: number;
  lifetime: number;
  maxLifetime: number;
}

export const initFadeParticles = (
  canvasWidth: number,
  canvasHeight: number,
  count = 30,
): FadeParticle[] => {
  return Array.from({ length: count }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    size: Math.random() * 4 + 2,
    opacity: Math.random() * 0.8 + 0.2,
    fadeSpeed: 0.002 + Math.random() * 0.003,
    lifetime: 0,
    maxLifetime: 200 + Math.random() * 200,
  }));
};

export const drawFadeParticles = (
  ctx: CanvasRenderingContext2D,
  particles: FadeParticle[],
) => {
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.lifetime++;
    p.opacity -= p.fadeSpeed;

    if (p.lifetime >= p.maxLifetime || p.opacity <= 0) {
      p.x = Math.random() * ctx.canvas.width;
      p.y = Math.random() * ctx.canvas.height;
      p.opacity = Math.random() * 0.8 + 0.2;
      p.lifetime = 0;
    }

    if (p.opacity > 0) {
      const gradient = ctx.createRadialGradient(
        p.x,
        p.y,
        0,
        p.x,
        p.y,
        p.size * 3,
      );
      gradient.addColorStop(0, `rgba(160, 160, 176, ${p.opacity})`);
      gradient.addColorStop(0.5, `rgba(160, 160, 176, ${p.opacity * 0.5})`);
      gradient.addColorStop(1, `rgba(160, 160, 176, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });
};
