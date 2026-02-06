import type { CloudRendererProps, Cloud } from "./types";
import type { MoonPhenomenon } from "@/data/moonPhenomena";

const PIXEL_CLOUD_PALETTE = {
  shadow: "#1b0b2f",
  base: "#2c1248",
  mid: "#3b1f5e",
  highlight: "#a967ff",
  rim: "#ff9ad5",
  glow: "#ffd3f0",
};

const pixelNoise = (x: number, y: number, seed: number) => {
  const value = Math.sin(x * 12.9898 + y * 78.233 + seed * 0.13) * 43758.5453;
  return value - Math.floor(value);
};

const drawPixelCloud = (ctx: CanvasRenderingContext2D, cloud: Cloud) => {
  const grid = 4;
  const w = cloud.width / grid;
  const h = cloud.height / grid;
  const startX = cloud.x;
  const startY = cloud.y;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = cloud.opacity;

  // Add subtle internal motion
  const time = Date.now() / 2000;
  const floatY = Math.sin(time + cloud.seed) * 3;

  for (let dy = -h / 2; dy <= h / 2; dy++) {
    for (let dx = -w / 2; dx <= w / 2; dx++) {
      // Wide & Flat Shape Logic
      const nx = dx / (w / 2); // -1 to 1
      const ny = dy / (h / 2); // -1 to 1
      
      const noise = pixelNoise(dx, dy, cloud.seed);
      
      // Elliptical base with noise carving
      // Top rounder, bottom flatter
      const distSq = nx * nx + (ny * (ny > 0 ? 0.5 : 1)) * (ny * (ny > 0 ? 0.5 : 1));
      
      // Carve out edges
      if (distSq > 0.8 - noise * 0.3) continue;
      if (ny > 0.3 && Math.abs(nx) > 0.8) continue; // Taper bottom corners

      const px = startX + dx * grid;
      const py = startY + dy * grid + floatY; // Apply float

      // Volumetric Shading
      let color = PIXEL_CLOUD_PALETTE.base;

      if (ny < -0.4) {
          color = PIXEL_CLOUD_PALETTE.highlight; // Top highlight
          if (ny < -0.6 && noise > 0.6) color = PIXEL_CLOUD_PALETTE.glow; // Rim glow
      } else if (ny > 0.1) {
          color = PIXEL_CLOUD_PALETTE.mid;
          
          if (ny > 0.4) {
              color = PIXEL_CLOUD_PALETTE.shadow; // Deep shadow bottom
              // Partial dither at bottom
              if (ny > 0.7 && (Math.floor(px)+Math.floor(py)) % 2 !== 0) continue;
          }
      }

      ctx.fillStyle = color;
      ctx.fillRect(px, py, grid, grid);
    }
  }

  ctx.restore();
};

export function initClouds(
  width: number,
  height: number,
  phenomenon: MoonPhenomenon
): Cloud[] {
  if (phenomenon.specialEffect === "pixel") {
    const clouds: Cloud[] = [];
    // Create stratified layers for depth
    const layers = [
      { count: 3, y: 0.75, size: 1.0, speed: 0.2, opacity: 0.6 }, // Back/Low
      { count: 4, y: 0.82, size: 1.2, speed: 0.4, opacity: 0.8 }, // Mid
      { count: 2, y: 0.90, size: 1.4, speed: 0.6, opacity: 1.0 }, // Front/High
    ];

    layers.forEach(layer => {
        for(let i=0; i<layer.count; i++) {
            const baseWidth = 180 * layer.size;
            const variance = Math.random() * 60;
            clouds.push({
                x: Math.random() * width,
                y: height * layer.y + (Math.random() * height * 0.05),
                width: baseWidth + variance,
                height: (baseWidth + variance) * 0.25, // Aspect ratio 4:1
                speed: (0.1 + Math.random() * 0.1) * layer.speed * phenomenon.cloudSpeed, // Slow drift
                opacity: layer.opacity * phenomenon.cloudOpacity,
                seed: Math.random() * 1000,
            });
        }
    });

    return clouds;
  }

  return Array.from({ length: 5 }, () => ({
    x: Math.random() * width,
    y: height * 0.2 + Math.random() * height * 0.3,
    width: Math.random() * 100 + 80,
    height: Math.random() * 40 + 30,
    speed: (Math.random() * 0.15 + 0.05) * phenomenon.cloudSpeed,
    opacity: (Math.random() * 0.15 + 0.1) * phenomenon.cloudOpacity,
    seed: Math.floor(Math.random() * 10000),
  }));
}

export function drawClouds({
  ctx,
  width,
  phenomenon,
  clouds,
}: CloudRendererProps): void {
  if (phenomenon.cloudOpacity === 0) return;

  clouds.forEach((cloud) => {
    // Move clouds
    if (phenomenon.cloudSpeed > 0.2) {
      cloud.x += cloud.speed;
      if (cloud.x > width + cloud.width) cloud.x = -cloud.width;
    }

    if (phenomenon.specialEffect === "pixel") {
      drawPixelCloud(ctx, cloud);
      return;
    }

    // Cloud shadow
    ctx.fillStyle = `rgba(150,150,180,${cloud.opacity * 0.6})`;
    ctx.beginPath();
    ctx.ellipse(
      cloud.x + 5,
      cloud.y + 5,
      cloud.width / 2,
      cloud.height / 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Main cloud body
    const gradient = ctx.createRadialGradient(
      cloud.x,
      cloud.y - cloud.height * 0.3,
      0,
      cloud.x,
      cloud.y,
      cloud.width / 2
    );
    gradient.addColorStop(0, `rgba(230,230,250,${cloud.opacity})`);
    gradient.addColorStop(0.6, `rgba(200,200,230,${cloud.opacity * 0.8})`);
    gradient.addColorStop(1, `rgba(180,180,210,${cloud.opacity * 0.5})`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(
      cloud.x,
      cloud.y,
      cloud.width / 2,
      cloud.height / 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Cloud puffs
    const puffs = [
      { x: -0.4, y: -0.3, w: 0.35, h: 0.5 },
      { x: -0.2, y: -0.4, w: 0.3, h: 0.45 },
      { x: 0.1, y: -0.35, w: 0.35, h: 0.5 },
      { x: 0.35, y: -0.25, w: 0.3, h: 0.45 },
    ];

    puffs.forEach((puff) => {
      const puffGradient = ctx.createRadialGradient(
        cloud.x + cloud.width * puff.x,
        cloud.y + cloud.height * puff.y,
        0,
        cloud.x + cloud.width * puff.x,
        cloud.y + cloud.height * puff.y,
        cloud.width * puff.w
      );
      puffGradient.addColorStop(0, `rgba(240,240,255,${cloud.opacity})`);
      puffGradient.addColorStop(0.7, `rgba(210,210,240,${cloud.opacity * 0.7})`);
      puffGradient.addColorStop(1, `rgba(190,190,220,${cloud.opacity * 0.3})`);
      ctx.fillStyle = puffGradient;
      ctx.beginPath();
      ctx.ellipse(
        cloud.x + cloud.width * puff.x,
        cloud.y + cloud.height * puff.y,
        cloud.width * puff.w,
        cloud.height * puff.h,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
  });
}
