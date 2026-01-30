import type { RendererProps } from "./types";

export function drawSky({ ctx, width, height, phenomenon }: RendererProps): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, phenomenon.skyPalette[0]);
  gradient.addColorStop(0.5, phenomenon.skyPalette[1]);
  gradient.addColorStop(1, phenomenon.skyPalette[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}
