/**
 * Light Ray System
 *
 * Radiant beams of light that emanate from the moon, pulsing and rotating
 */

export interface LightRay {
  angle: number;
  length: number;
  opacity: number;
  width: number;
  pulsePhase: number;
  speed: number;
}

export const initLightRays = (count = 12): LightRay[] => {
  return Array.from({ length: count }, (_, i) => ({
    angle: (Math.PI * 2 * i) / count,
    length: 50 + Math.random() * 30,
    opacity: 0.3 + Math.random() * 0.4,
    width: 2 + Math.random() * 3,
    pulsePhase: Math.random() * Math.PI * 2,
    speed: 0.02 + Math.random() * 0.02,
  }));
};

export const drawLightRays = (
  ctx: CanvasRenderingContext2D,
  rays: LightRay[],
  moonX: number,
  moonY: number,
  moonRadius: number,
) => {
  // Validate inputs to prevent NaN errors
  if (!isFinite(moonX) || !isFinite(moonY) || !isFinite(moonRadius)) {
    console.warn("Invalid moon parameters in drawLightRays:", {
      moonX,
      moonY,
      moonRadius,
    });
    return;
  }

  rays.forEach((ray) => {
    ray.pulsePhase += ray.speed;
    ray.angle += 0.003;
    const pulse = Math.sin(ray.pulsePhase) * 0.4 + 0.6;
    const currentOpacity = ray.opacity * pulse;

    const startX = moonX + Math.cos(ray.angle) * moonRadius;
    const startY = moonY + Math.sin(ray.angle) * moonRadius;
    const endX = moonX + Math.cos(ray.angle) * (moonRadius + ray.length);
    const endY = moonY + Math.sin(ray.angle) * (moonRadius + ray.length);

    // Additional validation before creating gradient
    if (
      !isFinite(startX) ||
      !isFinite(startY) ||
      !isFinite(endX) ||
      !isFinite(endY)
    ) {
      return;
    }

    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, `rgba(248, 248, 255, ${currentOpacity})`);
    gradient.addColorStop(0.5, `rgba(248, 248, 255, ${currentOpacity * 0.6})`);
    gradient.addColorStop(1, "rgba(248, 248, 255, 0)");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = ray.width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  });
};
