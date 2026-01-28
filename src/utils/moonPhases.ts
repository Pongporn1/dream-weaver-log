/**
 * Moon Phase Calculation Utilities
 * Calculates real moon phases based on date/time
 */

export type MoonPhaseName =
  | "New Moon"
  | "Waxing Crescent"
  | "First Quarter"
  | "Waxing Gibbous"
  | "Full Moon"
  | "Waning Gibbous"
  | "Last Quarter"
  | "Waning Crescent";

export interface MoonPhaseInfo {
  phase: number; // 0-1 (0 = new moon, 0.5 = full moon, 1 = new moon)
  phaseName: MoonPhaseName;
  phaseNameTh: string;
  illumination: number; // 0-1 (percentage of moon illuminated)
  age: number; // days since new moon (0-29.53)
}

/**
 * Calculate moon phase for a given date
 * Based on simplified astronomical calculations
 */
export const getMoonPhase = (date: Date = new Date()): MoonPhaseInfo => {
  // Known new moon: January 6, 2000, 18:14 UTC
  const knownNewMoon = new Date("2000-01-06T18:14:00Z");
  const synodicMonth = 29.530588853; // Average length of lunar month in days

  // Calculate days since known new moon
  const daysSinceKnownNewMoon =
    (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);

  // Calculate current age of moon in days
  const age = daysSinceKnownNewMoon % synodicMonth;

  // Calculate phase (0-1)
  const phase = age / synodicMonth;

  // Calculate illumination (0-1)
  const illumination = (1 - Math.cos(phase * Math.PI * 2)) / 2;

  // Determine phase name
  let phaseName: MoonPhaseName;
  let phaseNameTh: string;

  if (phase < 0.033 || phase > 0.967) {
    phaseName = "New Moon";
    phaseNameTh = "ดวงจันทร์ใหม่";
  } else if (phase < 0.216) {
    phaseName = "Waxing Crescent";
    phaseNameTh = "ข้างขึ้นเสี้ยว";
  } else if (phase < 0.283) {
    phaseName = "First Quarter";
    phaseNameTh = "ข้างขึ้นครึ่งดวง";
  } else if (phase < 0.467) {
    phaseName = "Waxing Gibbous";
    phaseNameTh = "ข้างขึ้นค่อนดวง";
  } else if (phase < 0.533) {
    phaseName = "Full Moon";
    phaseNameTh = "พระจันทร์เต็มดวง";
  } else if (phase < 0.717) {
    phaseName = "Waning Gibbous";
    phaseNameTh = "ข้างแรมค่อนดวง";
  } else if (phase < 0.783) {
    phaseName = "Last Quarter";
    phaseNameTh = "ข้างแรมครึ่งดวง";
  } else {
    phaseName = "Waning Crescent";
    phaseNameTh = "ข้างแรมเสี้ยว";
  }

  return {
    phase,
    phaseName,
    phaseNameTh,
    illumination,
    age,
  };
};

/**
 * Draw moon with phase shadow
 */
export const drawMoonWithPhase = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  phaseInfo: MoonPhaseInfo,
  moonColor: string = "#F8F8F8",
) => {
  ctx.save();

  // Draw full moon
  const gradient = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius);
  gradient.addColorStop(0, moonColor);
  gradient.addColorStop(1, adjustBrightness(moonColor, -30));

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Draw phase shadow
  const phase = phaseInfo.phase;

  if (phase !== 0.5) {
    // Not full moon
    ctx.globalCompositeOperation = "destination-out";

    // Calculate shadow position and shape
    if (phase < 0.5) {
      // Waxing (shadow on left)
      const shadowWidth = radius * 2 * (1 - phase * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.beginPath();
      ctx.ellipse(
        x - radius + shadowWidth / 2,
        y,
        shadowWidth / 2,
        radius,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    } else {
      // Waning (shadow on right)
      const shadowWidth = radius * 2 * ((phase - 0.5) * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.beginPath();
      ctx.ellipse(
        x + radius - shadowWidth / 2,
        y,
        shadowWidth / 2,
        radius,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
  }

  ctx.restore();
};

/**
 * Helper function to adjust color brightness
 */
const adjustBrightness = (color: string, amount: number): string => {
  const hex = color.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};
