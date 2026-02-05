/**
 * Firefly Particle System
 *
 * Glowing fireflies that float around with blinking animation
 */

export interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  blinkPhase: number;
  blinkSpeed: number;
  targetX: number;
  targetY: number;
}

export const initFireflies = (
  canvasWidth: number,
  canvasHeight: number,
  count = 20,
): Firefly[] => {
  return Array.from({ length: count }, () => {
    const x = Math.random() * canvasWidth,
      y = canvasHeight * 0.5 + Math.random() * canvasHeight * 0.4;
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: 2 + Math.random() * 2,
      opacity: 0,
      blinkPhase: Math.random() * Math.PI * 2,
      blinkSpeed: 0.05 + Math.random() * 0.05,
      targetX: x,
      targetY: y,
    };
  });
};

export const drawFireflies = (
  ctx: CanvasRenderingContext2D,
  fireflies: Firefly[],
  canvasWidth: number,
  canvasHeight: number,
) => {
  fireflies.forEach((f) => {
    f.blinkPhase += f.blinkSpeed;
    f.opacity = Math.max(0, Math.sin(f.blinkPhase)) * 0.8;
    if (Math.random() < 0.02) {
      f.targetX = Math.random() * canvasWidth;
      f.targetY = canvasHeight * 0.5 + Math.random() * canvasHeight * 0.4;
    }
    f.vx += (f.targetX - f.x) * 0.001;
    f.vy += (f.targetY - f.y) * 0.001;
    f.vx *= 0.95;
    f.vy *= 0.95;
    f.x += f.vx;
    f.y += f.vy;
    if (f.opacity > 0) {
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 3);
      g.addColorStop(0, `rgba(255,255,150,${f.opacity})`);
      g.addColorStop(0.5, `rgba(255,200,100,${f.opacity * 0.5})`);
      g.addColorStop(1, "rgba(255,200,100,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,200,${f.opacity})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
    }
  });
};
