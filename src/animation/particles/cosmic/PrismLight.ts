/**
 * Prism Light System
 *
 * Crystalline light shards that orbit the moon with various geometric shapes
 */

export interface PrismLight {
  angle: number;
  distance: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  orbitSpeed: number;
  opacity: number;
  color: string;
  pulsePhase: number;
  shardType: "hexagon" | "diamond" | "triangle";
}

export const initPrismLights = (): PrismLight[] => {
  const colors = [
    "rgba(220, 240, 255, 0.9)", // Ice blue
    "rgba(255, 255, 255, 0.95)", // Pure white
    "rgba(200, 230, 255, 0.85)", // Light cyan
    "rgba(240, 250, 255, 0.9)", // Very light blue
  ];

  const shardTypes: ("hexagon" | "diamond" | "triangle")[] = [
    "hexagon",
    "diamond",
    "triangle",
  ];

  return Array.from({ length: 12 }, (_, i) => ({
    angle: (Math.PI * 2 * i) / 12,
    distance: 80 + (i % 3) * 20,
    size: 8 + Math.random() * 8,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: 0.02 + Math.random() * 0.03,
    orbitSpeed: 0.008 + Math.random() * 0.004,
    opacity: 0.6 + Math.random() * 0.3,
    color: colors[i % colors.length],
    pulsePhase: Math.random() * Math.PI * 2,
    shardType: shardTypes[i % 3],
  }));
};

export const drawPrismLights = (
  ctx: CanvasRenderingContext2D,
  lights: PrismLight[],
  moonX: number,
  moonY: number,
  moonRadius: number,
) => {
  ctx.save();

  // Draw orbiting crystal shards
  lights.forEach((shard) => {
    // Update animation
    shard.angle += shard.orbitSpeed;
    shard.rotation += shard.rotationSpeed;
    shard.pulsePhase += 0.03;

    // Calculate position
    const x = moonX + Math.cos(shard.angle) * (moonRadius + shard.distance);
    const y = moonY + Math.sin(shard.angle) * (moonRadius + shard.distance);

    // Pulsing opacity
    const pulseOpacity =
      shard.opacity * (0.8 + 0.2 * Math.sin(shard.pulsePhase));

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(shard.rotation);

    // Draw shard with glow
    ctx.globalCompositeOperation = "screen";

    // Outer glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = shard.color;

    ctx.fillStyle = shard.color.replace(/[\d.]+\)$/g, `${pulseOpacity})`);
    ctx.strokeStyle = `rgba(255, 255, 255, ${pulseOpacity * 0.8})`;
    ctx.lineWidth = 1.5;

    ctx.beginPath();

    if (shard.shardType === "hexagon") {
      // Hexagonal crystal
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = Math.cos(angle) * shard.size;
        const py = Math.sin(angle) * shard.size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else if (shard.shardType === "diamond") {
      // Diamond shape
      ctx.moveTo(0, -shard.size);
      ctx.lineTo(shard.size * 0.6, 0);
      ctx.lineTo(0, shard.size);
      ctx.lineTo(-shard.size * 0.6, 0);
      ctx.closePath();
    } else {
      // Triangle
      ctx.moveTo(0, -shard.size);
      ctx.lineTo(shard.size * 0.866, shard.size * 0.5);
      ctx.lineTo(-shard.size * 0.866, shard.size * 0.5);
      ctx.closePath();
    }

    ctx.fill();
    ctx.stroke();

    // Inner bright core
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = `rgba(255, 255, 255, ${pulseOpacity * 0.6})`;
    ctx.beginPath();
    ctx.arc(0, 0, shard.size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  // Add crystalline aura around moon
  const gradient = ctx.createRadialGradient(
    moonX,
    moonY,
    moonRadius * 0.8,
    moonX,
    moonY,
    moonRadius * 1.5,
  );
  gradient.addColorStop(0, "rgba(220, 240, 255, 0.15)");
  gradient.addColorStop(0.6, "rgba(200, 230, 255, 0.08)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius * 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};
