/**
 * Nebula Cloud System
 *
 * Layered colorful clouds with rotation and pulsing effects
 */

export interface NebulaCloud {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  colors: string[]; // array of colors to blend
  opacity: number;
  pulsePhase: number;
  pulseSpeed: number;
}

type NebulaOptions = {
  palettes?: string[][];
  opacityRange?: [number, number];
  sizeRange?: [number, number];
  rotationSpeedRange?: [number, number];
  pulseSpeedRange?: [number, number];
};

const DEFAULT_NEBULA_PALETTES = [
  ["#FF6B9D", "#C44569", "#8B3A62"], // Pink/Purple
  ["#4A90E2", "#7B68EE", "#9370DB"], // Blue/Purple
  ["#00D9FF", "#0099CC", "#006699"], // Cyan
  ["#FF8C42", "#FF6B35", "#C44536"], // Orange/Red
  ["#6BCF7F", "#4ECDC4", "#44A08D"], // Green/Teal
];

const METEOR_NEBULA_PALETTES = [
  ["#7e4bff", "#b07cff", "#f2b6ff"], // Violet glow
  ["#5a2dff", "#8a4fff", "#c58bff"], // Deep indigo
  ["#a450ff", "#d284ff", "#ffb4e8"], // Magenta haze
  ["#3b2b8f", "#6a3bb0", "#b071ff"], // Night purple
];

export const initNebula = (
  canvasWidth: number,
  canvasHeight: number,
  count = 4,
  options: NebulaOptions = {},
): NebulaCloud[] => {
  const colorPalettes = options.palettes ?? DEFAULT_NEBULA_PALETTES;
  const [minOpacity, maxOpacity] = options.opacityRange ?? [0.15, 0.3];
  const [minSize, maxSize] = options.sizeRange ?? [150, 400];
  const [minRot, maxRot] = options.rotationSpeedRange ?? [0.0002, 0.0005];
  const [minPulse, maxPulse] = options.pulseSpeedRange ?? [0.01, 0.02];

  return Array.from({ length: count }, () => {
    const palette =
      colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
    return {
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      size: minSize + Math.random() * (maxSize - minSize),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed:
        (Math.random() * (maxRot - minRot) + minRot) *
        (Math.random() < 0.5 ? -1 : 1),
      colors: palette,
      opacity: minOpacity + Math.random() * (maxOpacity - minOpacity),
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: minPulse + Math.random() * (maxPulse - minPulse),
    };
  });
};

export const initMeteorNebula = (
  canvasWidth: number,
  canvasHeight: number,
  count = 6,
): NebulaCloud[] => {
  return initNebula(canvasWidth, canvasHeight, count, {
    palettes: METEOR_NEBULA_PALETTES,
    opacityRange: [0.18, 0.34],
    sizeRange: [220, 460],
  });
};

export const drawNebula = (
  ctx: CanvasRenderingContext2D,
  clouds: NebulaCloud[],
  canvasWidth: number,
  canvasHeight: number,
  parallaxOffsetX: number = 0,
  parallaxOffsetY: number = 0,
): NebulaCloud[] => {
  return clouds.map((cloud) => {
    // Update rotation and pulse
    cloud.rotation += cloud.rotationSpeed;
    cloud.pulsePhase += cloud.pulseSpeed;

    const pulse = Math.sin(cloud.pulsePhase) * 0.2 + 0.8;
    const currentSize = cloud.size * pulse;
    const currentOpacity = cloud.opacity * pulse;

    // Apply parallax offset (nebula moves slower than foreground)
    const x = cloud.x + parallaxOffsetX * 0.1;
    const y = cloud.y + parallaxOffsetY * 0.1;

    // Wrap around screen edges
    const wrappedX = ((x % canvasWidth) + canvasWidth) % canvasWidth;
    const wrappedY = ((y % canvasHeight) + canvasHeight) % canvasHeight;

    ctx.save();
    ctx.translate(wrappedX, wrappedY);
    ctx.rotate(cloud.rotation);

    // Draw multiple layers for depth
    cloud.colors.forEach((color, index) => {
      const layerSize = currentSize * (1 - index * 0.2);
      const layerOpacity = currentOpacity * (1 - index * 0.3);

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, layerSize);
      gradient.addColorStop(
        0,
        `${color}${Math.floor(layerOpacity * 255)
          .toString(16)
          .padStart(2, "0")}`,
      );
      gradient.addColorStop(
        0.4,
        `${color}${Math.floor(layerOpacity * 0.6 * 255)
          .toString(16)
          .padStart(2, "0")}`,
      );
      gradient.addColorStop(
        0.7,
        `${color}${Math.floor(layerOpacity * 0.3 * 255)
          .toString(16)
          .padStart(2, "0")}`,
      );
      gradient.addColorStop(1, `${color}00`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-layerSize, -layerSize, layerSize * 2, layerSize * 2);
    });

    ctx.restore();

    return cloud;
  });
};
