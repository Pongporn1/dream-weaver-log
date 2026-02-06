/**
 * Void Ripple System
 *
 * Dark expanding ripples with distortion effects that emanate from the moon
 */

export interface VoidRipple {
  radius: number;
  maxRadius: number;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
  centerX: number;
  centerY: number;
  speed: number;
  thickness: number;
}

export const initVoidRipples = (): VoidRipple[] => [];

export const spawnVoidRipple = (
  centerX: number,
  centerY: number,
  moonRadius: number,
): VoidRipple => ({
  radius: moonRadius * 0.5,
  maxRadius: moonRadius * 5 + Math.random() * moonRadius * 3,
  opacity: 1,
  lifetime: 0,
  maxLifetime: 120 + Math.random() * 80,
  centerX,
  centerY,
  speed: 0.8 + Math.random() * 0.6,
  thickness: 2 + Math.random() * 2,
});

export const drawVoidRipples = (
  ctx: CanvasRenderingContext2D,
  ripples: VoidRipple[],
): VoidRipple[] => {
  return ripples
    .map((r) => {
      r.lifetime++;
      r.radius += r.speed;

      // Fade calculation
      const fadeInDuration = 20;
      const fadeOutStart = r.maxLifetime - 40;

      if (r.lifetime < fadeInDuration) {
        r.opacity = r.lifetime / fadeInDuration;
      } else if (r.lifetime > fadeOutStart) {
        r.opacity = Math.max(0, 1 - (r.lifetime - fadeOutStart) / 40);
      } else {
        r.opacity = 0.6 + Math.sin(r.lifetime * 0.1) * 0.2;
      }

      if (r.opacity > 0) {
        // Main ripple circle
        ctx.strokeStyle = `rgba(80, 80, 112, ${r.opacity * 0.4})`;
        ctx.lineWidth = r.thickness;
        ctx.beginPath();
        ctx.arc(r.centerX, r.centerY, r.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow
        ctx.strokeStyle = `rgba(64, 64, 80, ${r.opacity * 0.6})`;
        ctx.lineWidth = r.thickness * 0.5;
        ctx.beginPath();
        ctx.arc(r.centerX, r.centerY, r.radius - r.thickness, 0, Math.PI * 2);
        ctx.stroke();

        // Distortion effect - darker area inside ripple
        const distortionGrad = ctx.createRadialGradient(
          r.centerX,
          r.centerY,
          r.radius - r.thickness * 3,
          r.centerX,
          r.centerY,
          r.radius + r.thickness * 2,
        );
        distortionGrad.addColorStop(0, `rgba(0, 0, 0, 0)`);
        distortionGrad.addColorStop(0.4, `rgba(0, 0, 0, ${r.opacity * 0.15})`);
        distortionGrad.addColorStop(0.6, `rgba(0, 0, 0, ${r.opacity * 0.15})`);
        distortionGrad.addColorStop(1, `rgba(0, 0, 0, 0)`);
        ctx.fillStyle = distortionGrad;
        ctx.beginPath();
        ctx.arc(r.centerX, r.centerY, r.radius, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle particles on the ripple edge
        if (r.lifetime % 8 === 0 && r.opacity > 0.3) {
          const sparkleCount = 3;
          for (let i = 0; i < sparkleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const sx = r.centerX + Math.cos(angle) * r.radius;
            const sy = r.centerY + Math.sin(angle) * r.radius;
            const sparkleGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 3);
            sparkleGrad.addColorStop(
              0,
              `rgba(112, 144, 176, ${r.opacity * 0.8})`,
            );
            sparkleGrad.addColorStop(1, `rgba(112, 144, 176, 0)`);
            ctx.fillStyle = sparkleGrad;
            ctx.beginPath();
            ctx.arc(sx, sy, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      return r;
    })
    .filter((r) => r.lifetime < r.maxLifetime);
};
