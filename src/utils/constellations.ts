// Constellation patterns for the animated header
export interface ConstellationStar {
  x: number; // 0-1 normalized position
  y: number; // 0-1 normalized position
  brightness: number; // 0-1
}

export interface ConstellationLine {
  from: number; // star index
  to: number; // star index
}

export interface Constellation {
  id: string;
  name: string;
  nameTh: string;
  stars: ConstellationStar[];
  lines: ConstellationLine[];
  color: string;
}

// Thai Zodiac Constellations (simplified versions)
export const CONSTELLATIONS: Constellation[] = [
  {
    id: "aries",
    name: "Aries",
    nameTh: "ราศีเมษ",
    color: "#FFD700",
    stars: [
      { x: 0.2, y: 0.3, brightness: 1.0 },
      { x: 0.25, y: 0.25, brightness: 0.8 },
      { x: 0.3, y: 0.35, brightness: 0.9 },
      { x: 0.35, y: 0.3, brightness: 0.7 },
    ],
    lines: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
    ],
  },
  {
    id: "orion",
    name: "Orion",
    nameTh: "กลุ่มดาวนายพราน",
    color: "#87CEEB",
    stars: [
      { x: 0.5, y: 0.2, brightness: 0.9 },
      { x: 0.45, y: 0.3, brightness: 1.0 },
      { x: 0.55, y: 0.3, brightness: 1.0 },
      { x: 0.48, y: 0.35, brightness: 0.8 },
      { x: 0.5, y: 0.35, brightness: 0.8 },
      { x: 0.52, y: 0.35, brightness: 0.8 },
      { x: 0.45, y: 0.45, brightness: 0.9 },
      { x: 0.55, y: 0.45, brightness: 0.9 },
    ],
    lines: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 5 },
      { from: 3, to: 4 },
      { from: 4, to: 5 },
      { from: 1, to: 6 },
      { from: 2, to: 7 },
    ],
  },
  {
    id: "cassiopeia",
    name: "Cassiopeia",
    nameTh: "กลุ่มดาวคาสสิโอเปีย",
    color: "#DDA0DD",
    stars: [
      { x: 0.7, y: 0.25, brightness: 0.9 },
      { x: 0.75, y: 0.3, brightness: 1.0 },
      { x: 0.8, y: 0.25, brightness: 0.8 },
      { x: 0.85, y: 0.3, brightness: 0.9 },
      { x: 0.9, y: 0.25, brightness: 0.7 },
    ],
    lines: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
    ],
  },
  {
    id: "ursa_minor",
    name: "Ursa Minor",
    nameTh: "กลุ่มดาวหมีน้อย",
    color: "#F0E68C",
    stars: [
      { x: 0.15, y: 0.15, brightness: 1.0 }, // Polaris
      { x: 0.18, y: 0.2, brightness: 0.7 },
      { x: 0.2, y: 0.18, brightness: 0.6 },
      { x: 0.22, y: 0.22, brightness: 0.7 },
      { x: 0.25, y: 0.2, brightness: 0.6 },
      { x: 0.23, y: 0.15, brightness: 0.6 },
      { x: 0.2, y: 0.13, brightness: 0.7 },
    ],
    lines: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 4, to: 5 },
      { from: 5, to: 6 },
      { from: 6, to: 0 },
    ],
  },
];

/**
 * Draw constellation on canvas
 */
export const drawConstellation = (
  ctx: CanvasRenderingContext2D,
  constellation: Constellation,
  canvasWidth: number,
  canvasHeight: number,
  opacity: number = 0.6,
  offsetX: number = 0,
  offsetY: number = 0,
) => {
  ctx.save();

  // Draw connecting lines
  ctx.strokeStyle = `${constellation.color}${Math.floor(opacity * 0.4 * 255)
    .toString(16)
    .padStart(2, "0")}`;
  ctx.lineWidth = 1;
  ctx.lineCap = "round";

  constellation.lines.forEach((line) => {
    const starFrom = constellation.stars[line.from];
    const starTo = constellation.stars[line.to];

    const x1 = starFrom.x * canvasWidth + offsetX;
    const y1 = starFrom.y * canvasHeight + offsetY;
    const x2 = starTo.x * canvasWidth + offsetX;
    const y2 = starTo.y * canvasHeight + offsetY;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  // Draw stars
  constellation.stars.forEach((star) => {
    const x = star.x * canvasWidth + offsetX;
    const y = star.y * canvasHeight + offsetY;
    const size = 2 + star.brightness * 2;
    const starOpacity = opacity * star.brightness;

    // Outer glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
    gradient.addColorStop(
      0,
      `${constellation.color}${Math.floor(starOpacity * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    gradient.addColorStop(
      0.5,
      `${constellation.color}${Math.floor(starOpacity * 0.5 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    gradient.addColorStop(1, `${constellation.color}00`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Star core
    ctx.fillStyle = `rgba(255, 255, 255, ${starOpacity})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
};

/**
 * Get random constellation
 */
export const getRandomConstellation = (): Constellation => {
  return CONSTELLATIONS[Math.floor(Math.random() * CONSTELLATIONS.length)];
};

/**
 * Get constellation by rarity (more rare = more complex constellations)
 */
export const getConstellationByRarity = (
  rarity: "normal" | "rare" | "very_rare" | "legendary" | "mythic",
): Constellation => {
  const rarityMap = {
    normal: ["ursa_minor"],
    rare: ["aries", "ursa_minor"],
    very_rare: ["aries", "cassiopeia"],
    legendary: ["orion", "cassiopeia"],
    mythic: ["orion"],
  };

  const availableIds = rarityMap[rarity];
  const randomId = availableIds[Math.floor(Math.random() * availableIds.length)];
  return CONSTELLATIONS.find((c) => c.id === randomId) || CONSTELLATIONS[0];
};
