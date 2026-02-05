/**
 * Sparkle Particle System
 *
 * Crystal sparkles that twinkle around the moon with rainbow refraction
 */

export interface Sparkle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

export const initSparkles = (
  moonX: number,
  moonY: number,
  moonRadius = 40,
): Sparkle[] => {
  // TODO: Copy implementation from particleEffects.ts line 367-384
  return Array.from({ length: 50 }, () => {
    const angle = Math.random() * Math.PI * 2,
      distance = Math.random() * moonRadius * 1.8;
    return {
      x: moonX + Math.cos(angle) * distance,
      y: moonY + Math.sin(angle) * distance,
      size: Math.random() * 4 + 1.5,
      opacity: Math.random() * 0.9 + 0.3,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.03 + Math.random() * 0.05,
    };
  });
};

export const drawSparkles = (
  ctx: CanvasRenderingContext2D,
  sparkles: Sparkle[],
) => {
  // TODO: Copy implementation from particleEffects.ts line 386-515
  // Complex drawing with rainbow gradients, hexagonal crystals, and rays
  sparkles.forEach((sparkle) => {
    sparkle.twinklePhase += sparkle.twinkleSpeed;
    const twinkle = (Math.sin(sparkle.twinklePhase) + 1) / 2;
    const currentOpacity = sparkle.opacity * twinkle;

    if (currentOpacity > 0.1) {
      ctx.save();
      ctx.translate(sparkle.x, sparkle.y);
      ctx.rotate(sparkle.twinklePhase * 0.2);

      // Outer rainbow refraction glow
      const rainbowGradient = ctx.createRadialGradient(
        0,
        0,
        0,
        0,
        0,
        sparkle.size * 6,
      );
      const hue = (sparkle.twinklePhase * 50) % 360;
      rainbowGradient.addColorStop(
        0,
        `hsla(${hue}, 70%, 85%, ${currentOpacity * 0.4})`,
      );
      rainbowGradient.addColorStop(
        0.3,
        `hsla(${hue + 60}, 60%, 80%, ${currentOpacity * 0.3})`,
      );
      rainbowGradient.addColorStop(
        0.6,
        `hsla(${hue + 120}, 50%, 75%, ${currentOpacity * 0.2})`,
      );
      rainbowGradient.addColorStop(1, `rgba(176, 192, 224, 0)`);

      ctx.fillStyle = rainbowGradient;
      ctx.beginPath();
      ctx.arc(0, 0, sparkle.size * 6, 0, Math.PI * 2);
      ctx.fill();

      // Main crystal glow
      const gradient = ctx.createRadialGradient(
        0,
        0,
        0,
        0,
        0,
        sparkle.size * 4,
      );
      gradient.addColorStop(0, `rgba(240, 248, 255, ${currentOpacity})`);
      gradient.addColorStop(
        0.4,
        `rgba(200, 220, 255, ${currentOpacity * 0.7})`,
      );
      gradient.addColorStop(
        0.7,
        `rgba(176, 192, 224, ${currentOpacity * 0.4})`,
      );
      gradient.addColorStop(1, `rgba(176, 192, 224, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, sparkle.size * 4, 0, Math.PI * 2);
      ctx.fill();

      // Hexagonal crystal shape
      ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.8})`;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * sparkle.size * 1.2;
        const y = Math.sin(angle) * sparkle.size * 1.2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Inner hexagon
      ctx.fillStyle = `rgba(200, 220, 255, ${currentOpacity * 0.6})`;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * sparkle.size * 0.6;
        const y = Math.sin(angle) * sparkle.size * 0.6;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Bright center
      ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
      ctx.beginPath();
      ctx.arc(0, 0, sparkle.size * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Crystal rays (6-pointed)
      ctx.strokeStyle = `rgba(240, 248, 255, ${currentOpacity * 0.9})`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const length = sparkle.size * 6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
        ctx.stroke();
      }

      // Secondary rays (12-pointed)
      ctx.strokeStyle = `rgba(200, 220, 255, ${currentOpacity * 0.5})`;
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6 + Math.PI / 12;
        const length = sparkle.size * 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
        ctx.stroke();
      }

      ctx.restore();
    }
  });
};
