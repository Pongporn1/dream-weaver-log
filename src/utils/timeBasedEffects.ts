/**
 * Time-based visual effects utilities
 * Provides dynamic effects based on time of day
 */

/**
 * Get glow intensity based on hour of day
 * Returns value between 0.3 (noon) and 1.0 (midnight)
 */
export const getGlowIntensity = (hour: number = new Date().getHours()): number => {
  // Normalize hour to 0-23
  const normalizedHour = hour % 24;

  // Peak glow at midnight (0), minimum at noon (12)
  // Use cosine curve for smooth transition
  const angle = ((normalizedHour - 12) / 12) * Math.PI;
  const intensity = (Math.cos(angle) + 1) / 2; // 0-1

  // Scale to 0.3-1.0 range (never completely dim)
  return 0.3 + intensity * 0.7;
};

/**
 * Get ambient darkness based on hour
 * Returns value between 0 (day) and 1 (night)
 */
export const getAmbientDarkness = (hour: number = new Date().getHours()): number => {
  const normalizedHour = hour % 24;

  // Darkest at midnight, lightest at noon
  if (normalizedHour >= 6 && normalizedHour <= 18) {
    // Daytime (6 AM - 6 PM)
    const dayProgress = (normalizedHour - 6) / 12;
    return Math.sin(dayProgress * Math.PI) * 0.3; // Max 0.3 during day
  } else {
    // Nighttime
    const nightHour = normalizedHour < 6 ? normalizedHour + 24 : normalizedHour;
    const nightProgress = (nightHour - 18) / 12;
    return 0.5 + Math.sin(nightProgress * Math.PI) * 0.5; // 0.5-1.0 at night
  }
};

/**
 * Get star twinkle speed multiplier based on time
 * Stars twinkle faster at night
 */
export const getStarTwinkleSpeed = (hour: number = new Date().getHours()): number => {
  const normalizedHour = hour % 24;

  // Faster twinkling at night (20:00-04:00)
  if (normalizedHour >= 20 || normalizedHour <= 4) {
    return 1.5; // 50% faster
  } else if (normalizedHour >= 18 || normalizedHour <= 6) {
    return 1.2; // 20% faster during twilight
  } else {
    return 1.0; // Normal speed during day
  }
};

/**
 * Get time-based color temperature adjustment
 * Returns RGB multipliers for warm/cool tones
 */
export const getColorTemperature = (
  hour: number = new Date().getHours(),
): { r: number; g: number; b: number } => {
  const normalizedHour = hour % 24;

  // Warm tones at sunrise/sunset, cool at night, neutral during day
  if (normalizedHour >= 5 && normalizedHour <= 7) {
    // Sunrise - warm orange
    return { r: 1.1, g: 0.95, b: 0.85 };
  } else if (normalizedHour >= 17 && normalizedHour <= 19) {
    // Sunset - warm red/orange
    return { r: 1.15, g: 0.9, b: 0.8 };
  } else if (normalizedHour >= 20 || normalizedHour <= 4) {
    // Night - cool blue
    return { r: 0.9, g: 0.95, b: 1.1 };
  } else {
    // Day - neutral
    return { r: 1.0, g: 1.0, b: 1.0 };
  }
};

/**
 * Apply time-based glow to canvas context
 */
export const applyTimeBasedGlow = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  baseColor: string,
  hour: number = new Date().getHours(),
) => {
  const intensity = getGlowIntensity(hour);
  const glowRadius = radius * (1 + intensity * 0.5);

  const gradient = ctx.createRadialGradient(x, y, radius, x, y, glowRadius);
  gradient.addColorStop(0, `${baseColor}00`);
  gradient.addColorStop(0.5, `${baseColor}${Math.floor(intensity * 40).toString(16).padStart(2, "0")}`);
  gradient.addColorStop(1, `${baseColor}00`);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fill();
};

/**
 * Get time period name
 */
export const getTimePeriod = (hour: number = new Date().getHours()): string => {
  const normalizedHour = hour % 24;

  if (normalizedHour >= 5 && normalizedHour < 12) return "Morning";
  if (normalizedHour >= 12 && normalizedHour < 17) return "Afternoon";
  if (normalizedHour >= 17 && normalizedHour < 20) return "Evening";
  return "Night";
};

export const getTimePeriodTh = (hour: number = new Date().getHours()): string => {
  const normalizedHour = hour % 24;

  if (normalizedHour >= 5 && normalizedHour < 12) return "เช้า";
  if (normalizedHour >= 12 && normalizedHour < 17) return "บ่าย";
  if (normalizedHour >= 17 && normalizedHour < 20) return "เย็น";
  return "กลางคืน";
};
