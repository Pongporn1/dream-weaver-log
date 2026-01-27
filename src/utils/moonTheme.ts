import type { MoonPhenomenon } from "@/data/moonPhenomena";

/**
 * Apply moon phenomenon theme to the document
 * Updates CSS variables that control UI colors
 */
export const applyMoonTheme = (phenomenon: MoonPhenomenon): void => {
  const root = document.documentElement;

  // Apply dynamic transition speeds based on phenomenon
  const baseSpeed = phenomenon.transitionSpeed; // 30-60 seconds
  root.style.setProperty("--sky-transition-duration", `${baseSpeed * 0.8}s`); // 24-48s
  root.style.setProperty("--moon-transition-duration", `${baseSpeed}s`); // 30-60s
  root.style.setProperty("--ui-transition-duration", `${baseSpeed * 1.5}s`); // 45-90s

  // Apply UI accent color
  root.style.setProperty("--moon-accent", phenomenon.uiAccent);

  // Derive related colors from accent
  const accentRgb = hexToRgb(phenomenon.uiAccent);

  if (accentRgb) {
    // Convert accent to HSL for Tailwind
    const accentHsl = rgbToHsl(accentRgb.r, accentRgb.g, accentRgb.b);
    
    // === UPDATE ALL TAILWIND CSS VARIABLES FOR COMPLETE SYSTEM-WIDE THEMING ===
    
    // Primary colors (buttons, links, active states)
    root.style.setProperty("--primary", `${accentHsl.h} ${accentHsl.s}% ${accentHsl.l}%`);
    root.style.setProperty("--primary-foreground", `0 0% 100%`);
    
    // Accent colors
    root.style.setProperty("--accent", `${accentHsl.h} ${accentHsl.s}% ${Math.min(accentHsl.l + 10, 95)}%`);
    root.style.setProperty("--accent-foreground", `${accentHsl.h} ${accentHsl.s}% ${Math.max(accentHsl.l - 40, 10)}%`);
    
    // Ring/Focus colors
    root.style.setProperty("--ring", `${accentHsl.h} ${accentHsl.s}% ${accentHsl.l}%`);
    
    // Border colors (subtle version of accent)
    root.style.setProperty("--border", `${accentHsl.h} ${Math.max(accentHsl.s - 30, 10)}% ${Math.min(accentHsl.l + 30, 90)}%`);
    root.style.setProperty("--input", `${accentHsl.h} ${Math.max(accentHsl.s - 30, 10)}% ${Math.min(accentHsl.l + 30, 90)}%`);
    
    // Card colors (more visible tint)
    root.style.setProperty("--card", `${accentHsl.h} ${Math.max(accentHsl.s - 50, 15)}% 95%`);
    root.style.setProperty("--card-foreground", `${accentHsl.h} ${Math.max(accentHsl.s - 60, 10)}% 10%`);
    
    // Popover colors
    root.style.setProperty("--popover", `${accentHsl.h} ${Math.max(accentHsl.s - 50, 15)}% 96%`);
    root.style.setProperty("--popover-foreground", `${accentHsl.h} ${Math.max(accentHsl.s - 60, 10)}% 10%`);
    
    // Secondary colors
    root.style.setProperty("--secondary", `${accentHsl.h} ${Math.max(accentHsl.s - 40, 20)}% 90%`);
    root.style.setProperty("--secondary-foreground", `${accentHsl.h} ${accentHsl.s}% ${Math.max(accentHsl.l - 30, 10)}%`);
    
    // Muted colors
    root.style.setProperty("--muted", `${accentHsl.h} ${Math.max(accentHsl.s - 40, 20)}% 88%`);
    root.style.setProperty("--muted-foreground", `${accentHsl.h} ${Math.max(accentHsl.s - 40, 15)}% 45%`);
    
    // Background colors (MORE VISIBLE tint based on moon phenomenon)
    root.style.setProperty("--background", `${accentHsl.h} ${Math.max(accentHsl.s - 50, 20)}% 92%`);
    root.style.setProperty("--foreground", `${accentHsl.h} ${Math.max(accentHsl.s - 60, 10)}% 5%`);
    
    // Sidebar colors
    root.style.setProperty("--sidebar-background", `${accentHsl.h} ${Math.max(accentHsl.s - 50, 20)}% 93%`);
    root.style.setProperty("--sidebar-foreground", `${accentHsl.h} ${Math.max(accentHsl.s - 60, 10)}% 5%`);
    root.style.setProperty("--sidebar-primary", `${accentHsl.h} ${accentHsl.s}% ${accentHsl.l}%`);
    root.style.setProperty("--sidebar-primary-foreground", `0 0% 100%`);
    root.style.setProperty("--sidebar-accent", `${accentHsl.h} ${Math.max(accentHsl.s - 40, 20)}% 88%`);
    root.style.setProperty("--sidebar-accent-foreground", `${accentHsl.h} ${Math.max(accentHsl.s - 50, 15)}% 10%`);
    root.style.setProperty("--sidebar-border", `${accentHsl.h} ${Math.max(accentHsl.s - 30, 10)}% 85%`);
    root.style.setProperty("--sidebar-ring", `${accentHsl.h} ${accentHsl.s}% ${accentHsl.l}%`);

    // === LEGACY MOON THEME VARIABLES (for custom components) ===
    
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

  console.log("🎨 Applied complete system-wide moon theme:", phenomenon.name);
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
 * Convert RGB to HSL
 */
const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
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
