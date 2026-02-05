/**
 * Snowflake Particle System
 *
 * Falling snowflakes with rotation
 */

export interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export const initSnowflakes = (
  canvasWidth: number,
  canvasHeight: number,
  count = 100,
): Snowflake[] => {
  return Array.from({ length: count }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * -100,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 0.5 + 0.3,
    drift: (Math.random() - 0.5) * 0.5,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    opacity: Math.random() * 0.6 + 0.4,
  }));
};

export const drawSnowflakes = (
  ctx: CanvasRenderingContext2D,
  snowflakes: Snowflake[],
  canvasWidth: number,
  canvasHeight: number,
) => {
  snowflakes.forEach((s) => {
    s.y += s.speed;
    s.x += s.drift;
    s.rotation += s.rotationSpeed;
    if (s.y > canvasHeight) {
      s.y = -10;
      s.x = Math.random() * canvasWidth;
    }
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotation);
    ctx.globalAlpha = s.opacity;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, s.size * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, s.size);
      ctx.lineTo(-s.size * 0.5, s.size * 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, s.size);
      ctx.lineTo(s.size * 0.5, s.size * 1.5);
      ctx.stroke();
    }
    ctx.restore();
  });
};
