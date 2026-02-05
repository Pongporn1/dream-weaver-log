/**
 * Dream Dust System
 *
 * Colorful floating particles with a dreamy, ethereal quality that drift upward
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
  count = 40,
): DreamDust[] => {
  const colors = ["#C8B8D8", "#B8A8C8", "#D8C8E8"];
  return Array.from({ length: count }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: (Math.random() - 0.5) * 0.4,
    vy: -0.2 - Math.random() * 0.3,
    size: Math.random() * 3 + 1.5,
    opacity: Math.random() * 0.7 + 0.3,
    color: colors[Math.floor(Math.random() * colors.length)],
    floatPhase: Math.random() * Math.PI * 2,
    floatSpeed: 0.02 + Math.random() * 0.03,
  }));
};

export const drawDreamDust = (
  ctx: CanvasRenderingContext2D,
  particles: DreamDust[],
) => {
  particles.forEach((p) => {
    p.floatPhase += p.floatSpeed;
    p.x += p.vx + Math.sin(p.floatPhase) * 0.3;
    p.y += p.vy;

    if (p.y < -10) {
      p.y = ctx.canvas.height + 10;
      p.x = Math.random() * ctx.canvas.width;
    }
    if (p.x < -10) p.x = ctx.canvas.width + 10;
    if (p.x > ctx.canvas.width + 10) p.x = -10;

    const gradient = ctx.createRadialGradient(
      p.x,
      p.y,
      0,
      p.x,
      p.y,
      p.size * 2.5,
    );
    gradient.addColorStop(
      0,
      `${p.color}${Math.floor(p.opacity * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    gradient.addColorStop(
      0.5,
      `${p.color}${Math.floor(p.opacity * 128)
        .toString(16)
        .padStart(2, "0")}`,
    );
    gradient.addColorStop(1, `${p.color}00`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Star shape
    ctx.fillStyle = `${p.color}${Math.floor(p.opacity * 200)
      .toString(16)
      .padStart(2, "0")}`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
    ctx.fill();
  });
};
