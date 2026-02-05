/**
 * Echo Moon Particle System
 *
 * Ghostly echoes of the moon that trail behind it
 */

export interface EchoMoon {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  delay: number;
  scale: number;
  phaseOffset: number;
}

export const initEchoMoons = (
  moonX: number,
  moonY: number,
  moonRadius: number,
  count = 4,
): EchoMoon[] => {
  return Array.from({ length: count }, (_, i) => ({
    x: moonX,
    y: moonY,
    radius: moonRadius,
    opacity: 0.6 - i * 0.15,
    delay: i * 15, // Frame delay between echoes
    scale: 1 + i * 0.15,
    phaseOffset: 0,
  }));
};

export const drawEchoMoons = (
  ctx: CanvasRenderingContext2D,
  echoes: EchoMoon[],
  currentMoonX: number,
  currentMoonY: number,
  currentPhase: number,
  moonTint: string,
) => {
  echoes.forEach((echo, index) => {
    // Update echo position with delay (trail behind current moon)
    echo.phaseOffset += 0.001;

    // Smoothly follow the current moon position with delay
    const targetX = currentMoonX;
    const targetY =
      currentMoonY + Math.sin(currentPhase - echo.phaseOffset * 50) * 3;

    echo.x += (targetX - echo.x) * (0.05 / (index + 1));
    echo.y += (targetY - echo.y) * (0.05 / (index + 1));

    // Draw echo moon with fade effect
    const echoRadius = echo.radius * echo.scale;

    // Outer glow
    const outerGlow = ctx.createRadialGradient(
      echo.x,
      echo.y,
      echoRadius * 0.3,
      echo.x,
      echo.y,
      echoRadius * 2,
    );
    outerGlow.addColorStop(
      0,
      `${moonTint}${Math.floor(echo.opacity * 0.4 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    outerGlow.addColorStop(
      0.5,
      `${moonTint}${Math.floor(echo.opacity * 0.2 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    outerGlow.addColorStop(1, `${moonTint}00`);

    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(echo.x, echo.y, echoRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Echo moon body
    const gradient = ctx.createRadialGradient(
      echo.x - echoRadius * 0.25,
      echo.y - echoRadius * 0.25,
      0,
      echo.x,
      echo.y,
      echoRadius,
    );
    gradient.addColorStop(
      0,
      `${moonTint}${Math.floor(echo.opacity * 0.8 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    gradient.addColorStop(
      0.7,
      `${moonTint}${Math.floor(echo.opacity * 0.5 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    gradient.addColorStop(
      1,
      `${moonTint}${Math.floor(echo.opacity * 0.2 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(echo.x, echo.y, echoRadius, 0, Math.PI * 2);
    ctx.fill();

    // Rim light for depth
    ctx.strokeStyle = `rgba(255, 255, 255, ${echo.opacity * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(
      echo.x - echoRadius * 0.3,
      echo.y - echoRadius * 0.3,
      echoRadius * 0.6,
      Math.PI,
      Math.PI * 2,
    );
    ctx.stroke();

    // Sound wave rings
    const wavePhase = (Date.now() / 1000 + index * 0.5) % 2;
    for (let i = 0; i < 3; i++) {
      const waveRadius = echoRadius * (1.2 + wavePhase * 0.5 + i * 0.3);
      const waveOpacity = echo.opacity * (1 - wavePhase / 2) * 0.4;

      if (waveOpacity > 0.05) {
        ctx.strokeStyle = `rgba(208, 208, 232, ${waveOpacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(echo.x, echo.y, waveRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  });
};
