/**
 * Starfield System
 *
 * 3D starfield effect with depth and motion blur, stars moving toward viewer
 */

export interface StarfieldParticle {
  x: number; // -1 to 1 (normalized)
  y: number; // -1 to 1 (normalized)
  z: number; // depth: 0 (far) to 1 (near)
  speed: number;
  size: number;
  brightness: number;
}

export const initStarfield = (count = 120): StarfieldParticle[] => {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 2, // -1 to 1
    y: (Math.random() - 0.5) * 2, // -1 to 1
    z: Math.random(), // 0 to 1 (depth)
    speed: 0.001 + Math.random() * 0.002,
    size: 1 + Math.random() * 2,
    brightness: 0.3 + Math.random() * 0.7,
  }));
};

export const drawStarfield = (
  ctx: CanvasRenderingContext2D,
  particles: StarfieldParticle[],
  canvasWidth: number,
  canvasHeight: number,
): StarfieldParticle[] => {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  return particles.map((particle) => {
    // Move particle toward viewer (increase z)
    particle.z += particle.speed;

    // Reset particle when it gets too close
    if (particle.z >= 1) {
      particle.x = (Math.random() - 0.5) * 2;
      particle.y = (Math.random() - 0.5) * 2;
      particle.z = 0;
    }

    // Calculate screen position with perspective
    const scale = particle.z * 2; // Perspective scaling
    const screenX = centerX + particle.x * centerX * scale;
    const screenY = centerY + particle.y * centerY * scale;

    // Calculate size and opacity based on depth
    const size = particle.size * (0.5 + particle.z * 1.5);
    const opacity = particle.brightness * particle.z;

    // Draw star trail (motion blur)
    const prevZ = particle.z - particle.speed;
    const prevScale = prevZ * 2;
    const prevX = centerX + particle.x * centerX * prevScale;
    const prevY = centerY + particle.y * centerY * prevScale;

    if (prevZ > 0) {
      const gradient = ctx.createLinearGradient(prevX, prevY, screenX, screenY);
      gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
      gradient.addColorStop(1, `rgba(255, 255, 255, ${opacity * 0.6})`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = size * 0.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(screenX, screenY);
      ctx.stroke();
    }

    // Draw star core
    const coreGradient = ctx.createRadialGradient(
      screenX,
      screenY,
      0,
      screenX,
      screenY,
      size * 2,
    );
    coreGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
    coreGradient.addColorStop(0.5, `rgba(200, 220, 255, ${opacity * 0.5})`);
    coreGradient.addColorStop(1, `rgba(200, 220, 255, 0)`);

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(screenX, screenY, size * 2, 0, Math.PI * 2);
    ctx.fill();

    return particle;
  });
};
