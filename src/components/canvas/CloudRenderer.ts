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
  const grid = 6;
  const columns = Math.max(6, Math.round(cloud.width / grid));
  const rows = Math.max(4, Math.round(cloud.height / grid));
  const startX = cloud.x - (columns * grid) / 2;
  const startY = cloud.y - (rows * grid) / 2;
  const rx = columns / 2;
  const ry = rows / 2;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = cloud.opacity;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const nx = (col - rx + 0.5) / rx;
      const ny = (row - ry + 0.5) / ry;
      const wobble = (pixelNoise(col, row, cloud.seed) - 0.5) * 0.22;
      const shape = nx * nx + (ny * 1.15) * (ny * 1.15) + wobble;
      if (shape > 1) continue;
      if (ny > 0.65 && shape > 0.9) continue;

      const vertical = (ny + 1) * 0.5;
      let color = PIXEL_CLOUD_PALETTE.base;

      if (vertical < 0.25) color = PIXEL_CLOUD_PALETTE.highlight;
      else if (vertical < 0.52) color = PIXEL_CLOUD_PALETTE.mid;
      else color = PIXEL_CLOUD_PALETTE.shadow;

      if (shape > 0.82 && vertical < 0.55) {
        color = PIXEL_CLOUD_PALETTE.rim;
      }

      if (
        vertical < 0.35 &&
        pixelNoise(col + 11, row + 7, cloud.seed) > 0.965
      ) {
        color = PIXEL_CLOUD_PALETTE.glow;
      }

      ctx.fillStyle = color;
      ctx.fillRect(startX + col * grid, startY + row * grid, grid, grid);
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
    const lowerCount = 4;
    const midCount = 3;
    const total = lowerCount + midCount;

    for (let i = 0; i < total; i += 1) {
      const isLower = i < lowerCount;
      const bandY = isLower ? height * 0.62 : height * 0.38;
      const bandRange = isLower ? height * 0.28 : height * 0.2;
      const baseWidth = isLower ? 220 : 150;
      const widthRange = isLower ? 160 : 110;
      const cloudWidth = Math.random() * widthRange + baseWidth;
      const cloudHeight =
        cloudWidth * (isLower ? 0.32 + Math.random() * 0.12 : 0.24 + Math.random() * 0.08);

      clouds.push({
        x: Math.random() * width,
        y: bandY + Math.random() * bandRange,
        width: cloudWidth,
        height: cloudHeight,
        speed: (Math.random() * 0.08 + 0.03) * phenomenon.cloudSpeed,
        opacity: (Math.random() * 0.25 + 0.45) * phenomenon.cloudOpacity,
        seed: Math.floor(Math.random() * 10000),
      });
    }

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
