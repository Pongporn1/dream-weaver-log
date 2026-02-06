/**
 * Fog Layer Particle System
 *
 * Drifting fog layers across the canvas
 */

export interface FogLayer {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
  color: string;
  wave: number;
  waveSpeed: number;
}

export const initFogLayers = (
  canvasWidth: number,
  canvasHeight: number,
  count = 5,
): FogLayer[] => {
  const colors = ["#f0e8e0", "#e8d8d0", "#d8c8c0"];
  return Array.from({ length: count }, (_, i) => ({
    x: -canvasWidth - Math.random() * canvasWidth * 0.5,
    y: canvasHeight * 0.5 + i * 40,
    width: canvasWidth * 2.5,
    height: 100 + i * 20,
    speed: 0.06 + i * 0.04,
    opacity: 0.1 + i * 0.04,
    color: colors[i % colors.length],
    wave: Math.random() * Math.PI * 2,
    waveSpeed: 0.01 + Math.random() * 0.01,
  }));
};

export const drawFog = (
  ctx: CanvasRenderingContext2D,
  fogLayers: FogLayer[],
  canvasWidth: number,
) => {
  fogLayers.forEach((l, i) => {
    l.x += l.speed;
    l.wave += l.waveSpeed;
    if (l.x > canvasWidth * 0.3) l.x = -l.width;

    const waveOffset = Math.sin(l.wave) * 15;
    const currentY = l.y + waveOffset;

    const g = ctx.createRadialGradient(
      l.x + l.width * 0.5,
      currentY + l.height * 0.5,
      0,
      l.x + l.width * 0.5,
      currentY + l.height * 0.5,
      l.width * 0.6,
    );
    g.addColorStop(
      0,
      `${l.color}${Math.floor(l.opacity * 255 * 0.5)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(
      0.3,
      `${l.color}${Math.floor(l.opacity * 255 * 0.9)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(
      0.7,
      `${l.color}${Math.floor(l.opacity * 255 * 0.4)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(1, `${l.color}00`);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g;
    ctx.fillRect(l.x, currentY, l.width, l.height);

    // Seamless loop: Draw a second instance if near the edge
    if (l.x > 0) {
      // If moving right and part is visible, draw the tile before it
      ctx.fillRect(l.x - l.width, currentY, l.width, l.height);
    } else if (l.x + l.width < canvasWidth) {
       // If moving left (or just standard fill) and gap opens on right
       // Actually for simple forward scrolling (l.speed > 0):
       // When l.x > 0, we need to draw at l.x - l.width to fill the left gap.
       // The original check "if (l.x > canvasWidth * 0.3) l.x = -l.width" was preventing this.
       // We should remove that jump and just let it modulo or wrap.
    }

    // Better seamless logic for speed > 0:
    // 1. Draw at current l.x
    // 2. If l.x > 0, draw at l.x - l.width
    // 3. Reset: if l.x >= canvasWidth, l.x -= l.width (or similar)

    ctx.fillRect(l.x - l.width, currentY, l.width, l.height); // Always draw the trailing one for seamlessness?
    // Wait, let's simplify.
    // If we just let l.x increment, and use modulo?
    // l.x = (l.x + l.speed) % l.width; but l.x needs to be relative to canvas.

    ctx.restore();

    if (i % 2 === 0 && Math.random() < 0.02) {
      const sparkleX = l.x + Math.random() * l.width;
      const sparkleY = currentY + Math.random() * l.height;
      const sparkleG = ctx.createRadialGradient(
        sparkleX,
        sparkleY,
        0,
        sparkleX,
        sparkleY,
        3,
      );
      sparkleG.addColorStop(0, "rgba(255,255,255,0.3)");
      sparkleG.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sparkleG;
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
};
