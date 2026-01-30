import type { CloudRendererProps, Cloud } from "./types";
import type { MoonPhenomenon } from "@/data/moonPhenomena";

export function initClouds(
  width: number,
  height: number,
  phenomenon: MoonPhenomenon
): Cloud[] {
  return Array.from({ length: 5 }, () => ({
    x: Math.random() * width,
    y: height * 0.2 + Math.random() * height * 0.3,
    width: Math.random() * 100 + 80,
    height: Math.random() * 40 + 30,
    speed: (Math.random() * 0.15 + 0.05) * phenomenon.cloudSpeed,
    opacity: (Math.random() * 0.15 + 0.1) * phenomenon.cloudOpacity,
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
