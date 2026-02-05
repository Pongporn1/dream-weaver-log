/**
 * Shatter Dust System
 *
 * Small dust particles that emanate from the shattered moon
 */

export interface ShatterDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

/**
 * Initialize Shatter Dust Particles
 */
export const initShatterDust = (
  moonX: number,
  moonY: number,
  count = 25,
): ShatterDust[] => {
  const dust: ShatterDust[] = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.15 + Math.random() * 0.3; // Slower movement

    dust.push({
      x: moonX + (Math.random() - 0.5) * 90,
      y: moonY + (Math.random() - 0.5) * 90,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 0.8 + Math.random() * 1.5, // Smaller particles
      opacity: 0.2 + Math.random() * 0.3, // More subtle
      life: 0,
      maxLife: 120 + Math.random() * 120, // Longer life
    });
  }

  return dust;
};

/**
 * Draw and update Shatter Dust
 */
export const drawShatterDust = (
  ctx: CanvasRenderingContext2D,
  dust: ShatterDust[],
  moonColor: string,
  moonX?: number,
  moonY?: number,
) => {
  dust.forEach((particle) => {
    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life++;

    // Fade out over time
    const lifeFactor = 1 - particle.life / particle.maxLife;
    const currentOpacity = particle.opacity * lifeFactor;

    if (particle.life < particle.maxLife && currentOpacity > 0.01) {
      // วาดเรืองแสงรอบๆ ละออง
      const glowGrad = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size * 4,
      );
      glowGrad.addColorStop(
        0,
        `${moonColor}${Math.floor(currentOpacity * 0.8 * 255)
          .toString(16)
          .padStart(2, "0")}`,
      );
      glowGrad.addColorStop(
        0.5,
        `${moonColor}${Math.floor(currentOpacity * 0.3 * 255)
          .toString(16)
          .padStart(2, "0")}`,
      );
      glowGrad.addColorStop(1, `${moonColor}00`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
      ctx.fill();

      // วาดละอองหลัก
      ctx.fillStyle = `${moonColor}${Math.floor(currentOpacity * 255)
        .toString(16)
        .padStart(2, "0")}`;
      ctx.shadowBlur = 5;
      ctx.shadowColor = moonColor;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // เพิ่มประกายเล็กๆ
      if (Math.random() < 0.15) {
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Reset particle when it dies - สร้างตำแหน่งใหม่รอบๆ ดวงจันทร์
    if (particle.life >= particle.maxLife) {
      if (moonX !== undefined && moonY !== undefined) {
        const resetAngle = Math.random() * Math.PI * 2;
        const resetDistance = 70 + Math.random() * 30;
        particle.x = moonX + Math.cos(resetAngle) * resetDistance;
        particle.y = moonY + Math.sin(resetAngle) * resetDistance;

        const speed = 0.15 + Math.random() * 0.35;
        const moveAngle = Math.random() * Math.PI * 2;
        particle.vx = Math.cos(moveAngle) * speed;
        particle.vy = Math.sin(moveAngle) * speed;
      }
      particle.life = 0;
      particle.opacity = 0.35 + Math.random() * 0.45;
    }
  });
};
