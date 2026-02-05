/**
 * Memory Fragment System
 *
 * Geometric shapes (triangles, squares, pentagons) that drift and rotate,
 * representing fragments of memories
 */

export interface MemoryFragment {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  lifetime: number;
  maxLifetime: number;
  fragmentType: number;
}

export const initMemoryFragments = (
  canvasWidth: number,
  canvasHeight: number,
  count = 25,
): MemoryFragment[] => {
  return Array.from({ length: count }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    size: Math.random() * 6 + 3,
    opacity: Math.random() * 0.4 + 0.2,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.03,
    lifetime: 0,
    maxLifetime: 300 + Math.random() * 300,
    fragmentType: Math.floor(Math.random() * 3),
  }));
};

export const drawMemoryFragments = (
  ctx: CanvasRenderingContext2D,
  fragments: MemoryFragment[],
) => {
  fragments.forEach((f) => {
    f.x += f.vx;
    f.y += f.vy;
    f.rotation += f.rotationSpeed;
    f.lifetime++;

    if (f.x < 0) f.x = ctx.canvas.width;
    if (f.x > ctx.canvas.width) f.x = 0;
    if (f.y < 0) f.y = ctx.canvas.height;
    if (f.y > ctx.canvas.height) f.y = 0;

    if (f.lifetime >= f.maxLifetime) {
      f.lifetime = 0;
      f.opacity = Math.random() * 0.4 + 0.2;
    }

    const fadeOpacity =
      f.lifetime < 60 ? f.lifetime / 60 : (f.maxLifetime - f.lifetime) / 60;
    const currentOpacity = Math.min(f.opacity, fadeOpacity);

    if (currentOpacity > 0.05) {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rotation);
      ctx.globalAlpha = currentOpacity;

      // Different fragment shapes
      ctx.strokeStyle = "#888898";
      ctx.fillStyle = "rgba(136, 136, 152, 0.3)";
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      if (f.fragmentType === 0) {
        // Triangle
        ctx.moveTo(0, -f.size);
        ctx.lineTo(f.size, f.size);
        ctx.lineTo(-f.size, f.size);
      } else if (f.fragmentType === 1) {
        // Square
        ctx.rect(-f.size / 2, -f.size / 2, f.size, f.size);
      } else {
        // Pentagon
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const x = Math.cos(angle) * f.size;
          const y = Math.sin(angle) * f.size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  });
};
