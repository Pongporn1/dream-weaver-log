/**
 * Blood Ring Particle System
 *
 * Pulsing blood-red rings around the moon
 */

export interface BloodRing {
  radius: number;
  opacity: number;
  pulsePhase: number;
  thickness: number;
}

export const initBloodRings = (moonRadius: number): BloodRing[] => {
  return Array.from({ length: 3 }, (_, i) => ({
    radius: moonRadius * (1.15 + i * 0.2),
    opacity: 0.6 - i * 0.15,
    pulsePhase: (Math.PI * 2 * i) / 3,
    thickness: 3 - i * 0.5,
  }));
};

export const drawBloodRings = (
  ctx: CanvasRenderingContext2D,
  rings: BloodRing[],
  moonX: number,
  moonY: number,
) => {
  rings.forEach((ring) => {
    ring.pulsePhase += 0.02;
    const pulse = Math.sin(ring.pulsePhase) * 0.2 + 0.8;
    const currentOpacity = ring.opacity * pulse;

    ctx.strokeStyle = `rgba(160, 48, 48, ${currentOpacity})`;
    ctx.lineWidth = ring.thickness;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `rgba(200, 64, 64, ${currentOpacity})`;
    ctx.beginPath();
    ctx.arc(moonX, moonY, ring.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  });
};
