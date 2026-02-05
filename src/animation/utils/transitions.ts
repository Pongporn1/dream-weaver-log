import type { MoonPhenomenon } from "@/data/moonPhenomena";

/**
 * Interpolate between two hex colors
 */
export const interpolateColor = (
  color1: string,
  color2: string,
  factor: number,
): string => {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  if (!c1 || !c2) return color1;

  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);

  return rgbToHex(r, g, b);
};

/**
 * Interpolate between two sky palettes
 */
export const interpolateSkyPalette = (
  palette1: [string, string, string],
  palette2: [string, string, string],
  factor: number,
): [string, string, string] => {
  return [
    interpolateColor(palette1[0], palette2[0], factor),
    interpolateColor(palette1[1], palette2[1], factor),
    interpolateColor(palette1[2], palette2[2], factor),
  ];
};

/**
 * Smooth transition manager for phenomenon changes
 */
export class PhenomenonTransition {
  private startTime: number = 0;
  private duration: number = 0;
  private fromPhenomenon: MoonPhenomenon | null = null;
  private toPhenomenon: MoonPhenomenon | null = null;
  private isTransitioning: boolean = false;

  start(from: MoonPhenomenon, to: MoonPhenomenon) {
    this.fromPhenomenon = from;
    this.toPhenomenon = to;
    this.duration = to.transitionSpeed * 1000; // Convert to milliseconds
    this.startTime = Date.now();
    this.isTransitioning = true;
  }

  getProgress(): number {
    if (!this.isTransitioning) return 1;

    const elapsed = Date.now() - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);

    if (progress >= 1) {
      this.isTransitioning = false;
    }

    // Ease-in-out cubic
    return progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
  }

  getCurrentSkyPalette(): [string, string, string] | null {
    if (!this.fromPhenomenon || !this.toPhenomenon) return null;

    const progress = this.getProgress();
    return interpolateSkyPalette(
      this.fromPhenomenon.skyPalette,
      this.toPhenomenon.skyPalette,
      progress,
    );
  }

  getCurrentMoonTint(): string | null {
    if (!this.fromPhenomenon || !this.toPhenomenon) return null;

    const progress = this.getProgress();
    return interpolateColor(
      this.fromPhenomenon.moonTint,
      this.toPhenomenon.moonTint,
      progress,
    );
  }

  isActive(): boolean {
    return this.isTransitioning;
  }
}

// Helper functions
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};
