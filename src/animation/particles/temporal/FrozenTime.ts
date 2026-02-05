/**
 * Frozen Time Particle System
 *
 * Particles that freeze in mid-air with ice crystal effects
 */

export interface FrozenTimeParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
  freezePoint: number;
  isFrozen: boolean;
  trailLength: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  frozenIntensity: number;
}

export const initFrozenTime = (
  canvasWidth: number,
  canvasHeight: number,
  count = 40,
): FrozenTimeParticle[] => {
  return Array.from({ length: count }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    size: Math.random() * 5 + 2,
    opacity: 0,
    lifetime: 0,
    maxLifetime: 240 + Math.random() * 180,
    freezePoint: 40 + Math.random() * 30,
    isFrozen: false,
    trailLength: Math.random() * 30 + 15,
    color: Math.random() > 0.5 ? "#B0C4DE" : "#7090b0",
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    frozenIntensity: Math.random() * 0.5 + 0.5,
  }));
};

export const drawFrozenTime = (
  ctx: CanvasRenderingContext2D,
  particles: FrozenTimeParticle[],
) => {
  particles.forEach((p) => {
    p.lifetime++;

    // Fade in phase
    if (p.lifetime < 20) {
      p.opacity = p.lifetime / 20;
      p.y -= 0.5; // Moving down slowly
    }
    // Freeze phase - completely stopped in mid-air
    else if (p.lifetime >= p.freezePoint && p.lifetime < p.freezePoint + 150) {
      if (!p.isFrozen) {
        p.isFrozen = true;
        p.rotationSpeed = 0; // Stop rotation
      }
      p.opacity = 0.9 * p.frozenIntensity;
      // Particle is completely still
    }
    // Fade out phase
    else if (p.lifetime >= p.freezePoint + 150) {
      p.opacity = Math.max(0, 1 - (p.lifetime - p.freezePoint - 150) / 90);
    }
    // Moving phase before freeze
    else {
      p.opacity = 0.7;
      p.y -= 0.4; // Moving upward
      p.rotation += p.rotationSpeed;
    }

    // Reset particle
    if (p.lifetime >= p.maxLifetime) {
      p.lifetime = 0;
      p.y = Math.random() * ctx.canvas.height;
      p.x = Math.random() * ctx.canvas.width;
      p.freezePoint = 40 + Math.random() * 30;
      p.isFrozen = false;
      p.rotation = Math.random() * Math.PI * 2;
      p.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }

    if (p.opacity > 0) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      // Draw trail when moving (before frozen)
      if (!p.isFrozen && p.lifetime >= 20 && p.lifetime < p.freezePoint) {
        const trailGrad = ctx.createLinearGradient(0, 0, 0, p.trailLength);
        trailGrad.addColorStop(
          0,
          `${p.color}${Math.floor(p.opacity * 200)
            .toString(16)
            .padStart(2, "0")}`,
        );
        trailGrad.addColorStop(
          0.5,
          `${p.color}${Math.floor(p.opacity * 100)
            .toString(16)
            .padStart(2, "0")}`,
        );
        trailGrad.addColorStop(1, `${p.color}00`);
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, p.trailLength);
        ctx.stroke();
      }

      // Outer glow
      const glowSize = p.isFrozen ? p.size * 4 : p.size * 3;
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
      glow.addColorStop(
        0,
        `${p.color}${Math.floor(p.opacity * 255)
          .toString(16)
          .padStart(2, "0")}`,
      );
      glow.addColorStop(
        0.3,
        `${p.color}${Math.floor(p.opacity * 180)
          .toString(16)
          .padStart(2, "0")}`,
      );
      glow.addColorStop(1, `${p.color}00`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Main particle body - hexagonal crystal
      ctx.fillStyle = `${p.color}${Math.floor(p.opacity * 230)
        .toString(16)
        .padStart(2, "0")}`;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = Math.cos(angle) * p.size;
        const y = Math.sin(angle) * p.size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Bright core
      ctx.fillStyle = `#ffffff${Math.floor(p.opacity * 255)
        .toString(16)
        .padStart(2, "0")}`;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Frozen state - ice crystal rays and time-stop effect
      if (p.isFrozen) {
        // Ice crystal rays
        ctx.strokeStyle = `rgba(176, 196, 222, ${p.opacity * 0.8})`;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const length = p.size * 3.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
          ctx.stroke();

          // Crystal ends
          ctx.fillStyle = `rgba(220, 235, 255, ${p.opacity * 0.9})`;
          ctx.beginPath();
          ctx.arc(
            Math.cos(angle) * length,
            Math.sin(angle) * length,
            2,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }

        // Time-stop circle effect
        const pulseSize =
          p.size * 2.5 + Math.sin(p.lifetime * 0.05) * p.size * 0.3;
        ctx.strokeStyle = `rgba(176, 196, 222, ${p.opacity * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
        ctx.stroke();

        // Inner ring
        ctx.strokeStyle = `rgba(220, 235, 255, ${p.opacity * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        // Frozen sparkles around the particle
        for (let i = 0; i < 4; i++) {
          const sparkleAngle = (Math.PI / 2) * i + p.lifetime * 0.01;
          const sparkleDistance = pulseSize * 1.2;
          const sx = Math.cos(sparkleAngle) * sparkleDistance;
          const sy = Math.sin(sparkleAngle) * sparkleDistance;

          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.7})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
  });
};
