/**
 * Ancient Rune System
 *
 * Mystical symbols that orbit the moon with pulsing glows
 */

export interface AncientRune {
  x: number;
  y: number;
  symbol: string;
  size: number;
  opacity: number;
  rotation: number;
  pulsePhase: number;
  orbitAngle: number;
  orbitSpeed: number;
  orbitRadius: number;
}

export const initAncientRunes = (
  moonX: number,
  moonY: number,
  moonRadius: number,
): AncientRune[] => {
  const symbols = ["◯", "△", "☐", "◇", "⬡", "✦"];
  return Array.from({ length: 6 }, (_, i) => ({
    x: moonX,
    y: moonY,
    symbol: symbols[i],
    size: 12 + Math.random() * 8,
    opacity: 0.6 + Math.random() * 0.3,
    rotation: 0,
    pulsePhase: (Math.PI * 2 * i) / 6,
    orbitAngle: (Math.PI * 2 * i) / 6,
    orbitSpeed: 0.005 + Math.random() * 0.003,
    orbitRadius: moonRadius * (1.4 + Math.random() * 0.3),
  }));
};

export const drawAncientRunes = (
  ctx: CanvasRenderingContext2D,
  runes: AncientRune[],
  moonX: number,
  moonY: number,
) => {
  runes.forEach((rune) => {
    rune.orbitAngle += rune.orbitSpeed;
    rune.pulsePhase += 0.02;
    rune.rotation += 0.01;

    const x = moonX + Math.cos(rune.orbitAngle) * rune.orbitRadius;
    const y = moonY + Math.sin(rune.orbitAngle) * rune.orbitRadius;
    const pulse = Math.sin(rune.pulsePhase) * 0.3 + 0.7;
    const currentOpacity = rune.opacity * pulse;

    // Glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, rune.size * 2);
    gradient.addColorStop(0, `rgba(184, 168, 136, ${currentOpacity * 0.5})`);
    gradient.addColorStop(1, "rgba(184, 168, 136, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, rune.size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Symbol
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rune.rotation);
    ctx.fillStyle = `rgba(184, 168, 136, ${currentOpacity})`;
    ctx.font = `${rune.size}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(rune.symbol, 0, 0);
    ctx.restore();
  });
};
