import type { MoonPhenomenon } from "@/data/moonPhenomena";

/**
 * Apply moon phenomenon theme to the document
 * Updates CSS variables that control UI colors
 */
export const applyMoonTheme = (phenomenon: MoonPhenomenon): void => {
  const root = document.documentElement;

  // Apply dynamic transition speeds based on phenomenon
  // Sky changes fastest, Moon medium, UI slowest (as per PHASE 7)
  const baseSpeed = phenomenon.transitionSpeed; // 30-60 seconds
  root.style.setProperty("--sky-transition-duration", `${baseSpeed * 0.8}s`); // 24-48s
  root.style.setProperty("--moon-transition-duration", `${baseSpeed}s`); // 30-60s
  root.style.setProperty("--ui-transition-duration", `${baseSpeed * 1.5}s`); // 45-90s

  // Apply UI accent color
  root.style.setProperty("--moon-accent", phenomenon.uiAccent);

  // Derive related colors from accent
  const accentRgb = hexToRgb(phenomenon.uiAccent);

  if (accentRgb) {
    // Text color (slightly lighter than accent)
    const textColor = adjustColor(phenomenon.uiAccent, 1.2);
    root.style.setProperty("--moon-text", textColor);

    // Placeholder color (more muted)
    const placeholderColor = adjustColor(phenomenon.uiAccent, 0.6);
    root.style.setProperty("--moon-placeholder", placeholderColor);

    // Divider color (very subtle)
    const dividerColor = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.2)`;
    root.style.setProperty("--moon-divider", dividerColor);

    // Caret color (same as accent)
    root.style.setProperty("--moon-caret", phenomenon.uiAccent);

    // Selection color (accent with opacity)
    const selectionColor = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.3)`;
    root.style.setProperty("--moon-selection", selectionColor);

    // Button hover (slightly lighter)
    const buttonHover = adjustColor(phenomenon.uiAccent, 1.1);
    root.style.setProperty("--moon-button-hover", buttonHover);
  }

  console.log("🎨 Applied moon theme:", phenomenon.name);
};

/**
 * Convert hex color to RGB
 */
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

/**
 * Adjust color brightness
 */
const adjustColor = (hex: string, factor: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.min(255, Math.floor(rgb.r * factor));
  const g = Math.min(255, Math.floor(rgb.g * factor));
  const b = Math.min(255, Math.floor(rgb.b * factor));

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

/**
 * Reset theme to default
 */
export const resetMoonTheme = (): void => {
  const root = document.documentElement;
  root.style.removeProperty("--moon-accent");
  root.style.removeProperty("--moon-text");
  root.style.removeProperty("--moon-placeholder");
  root.style.removeProperty("--moon-divider");
  root.style.removeProperty("--moon-caret");
  root.style.removeProperty("--moon-selection");
  root.style.removeProperty("--moon-button-hover");
};
