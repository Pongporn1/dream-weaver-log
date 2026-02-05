/**
 * Aurora Wave Particle System
 *
 * Northern lights effect with flowing waves
 */

export interface AuroraWave {
  y: number;
  amplitude: number;
  frequency: number;
  phase: number;
  speed: number;
  color: string;
  opacity: number;
}

export const initAuroraWaves = (canvasHeight: number): AuroraWave[] => {
  // Authentic aurora colors - only green/teal tones
  const colors = ["#00ff88", "#00ddaa", "#00ccbb"];
  return Array.from({ length: 3 }, (_, i) => ({
    y: canvasHeight * 0.3 + i * 80, // Spread vertically across middle-top area
    amplitude: 25 + Math.random() * 20,
    frequency: 0.003 + Math.random() * 0.004,
    phase: Math.random() * Math.PI * 2, // Random starting phase for variety
    speed: 0.004 + Math.random() * 0.005, // Slower
    color: colors[i],
    opacity: 0.08 + Math.random() * 0.06, // Much more subtle
  }));
};

export const drawAurora = (
  ctx: CanvasRenderingContext2D,
  waves: AuroraWave[],
  canvasWidth: number,
) => {
  waves.forEach((w, index) => {
    w.phase += w.speed;

    // Pulsing opacity for breathing effect
    const pulseOpacity = w.opacity * (1 + Math.sin(w.phase * 0.5) * 0.3);

    // Main aurora curtain with vertical ripples
    ctx.beginPath();
    ctx.moveTo(0, w.y);
    for (let x = 0; x <= canvasWidth; x += 2) {
      const baseY = w.y + Math.sin(x * w.frequency + w.phase) * w.amplitude;
      const secondaryWave =
        Math.sin(x * w.frequency * 2 + w.phase * 1.5) * (w.amplitude * 0.3);
      const tertiary =
        Math.sin(x * w.frequency * 4 + w.phase * 2) * (w.amplitude * 0.15);
      const flutter = Math.sin(x * 0.05 + w.phase * 3) * 5; // Quick flutter effect
      ctx.lineTo(x, baseY + secondaryWave + tertiary + flutter);
    }

    // Horizontal gradient spanning full width for even distribution
    const g = ctx.createLinearGradient(0, w.y, canvasWidth, w.y);

    // Smooth fade across entire width
    g.addColorStop(
      0,
      `${w.color}${Math.floor(pulseOpacity * 0.4 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(
      0.25,
      `${w.color}${Math.floor(pulseOpacity * 0.7 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(
      0.5,
      `${w.color}${Math.floor(pulseOpacity * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(
      0.75,
      `${w.color}${Math.floor(pulseOpacity * 0.7 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(
      1,
      `${w.color}${Math.floor(pulseOpacity * 0.4 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );

    // Draw main curtain with soft glow
    ctx.strokeStyle = g;
    ctx.lineWidth = 70;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 40;
    ctx.shadowColor = w.color;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Add vertical gradient overlay for curtain effect
    const verticalGradient = ctx.createLinearGradient(
      0,
      w.y - w.amplitude * 2,
      0,
      w.y + w.amplitude * 3,
    );
    verticalGradient.addColorStop(0, `${w.color}00`); // Transparent top
    verticalGradient.addColorStop(
      0.2,
      `${w.color}${Math.floor(pulseOpacity * 0.5 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    verticalGradient.addColorStop(
      0.5,
      `${w.color}${Math.floor(pulseOpacity * 0.8 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    verticalGradient.addColorStop(
      0.8,
      `${w.color}${Math.floor(pulseOpacity * 0.4 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    verticalGradient.addColorStop(1, `${w.color}00`); // Transparent bottom

    // Second layer with vertical gradient
    ctx.strokeStyle = verticalGradient;
    ctx.lineWidth = 50;
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Add subtle shimmer particles along the wave
    if (Math.random() < 0.3) {
      for (let i = 0; i < 3; i++) {
        const shimmerX = Math.random() * canvasWidth;
        const shimmerY =
          w.y + Math.sin(shimmerX * w.frequency + w.phase) * w.amplitude;
        const shimmerSize = 2 + Math.random() * 3;

        const shimmerGrad = ctx.createRadialGradient(
          shimmerX,
          shimmerY,
          0,
          shimmerX,
          shimmerY,
          shimmerSize * 3,
        );
        shimmerGrad.addColorStop(
          0,
          `rgba(255, 255, 255, ${pulseOpacity * 0.6})`,
        );
        shimmerGrad.addColorStop(
          0.5,
          `${w.color}${Math.floor(pulseOpacity * 0.4 * 255)
            .toString(16)
            .padStart(2, "0")}`,
        );
        shimmerGrad.addColorStop(1, `${w.color}00`);

        ctx.fillStyle = shimmerGrad;
        ctx.beginPath();
        ctx.arc(shimmerX, shimmerY, shimmerSize * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
};
