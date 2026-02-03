import type { MoonRendererProps, MoonPosition } from "./types";
import { adjustBrightness } from "@/utils/colorUtils";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const pixelHash = (x: number, y: number, seed: number) => {
  const value = Math.sin(x * 12.9898 + y * 78.233 + seed * 0.17) * 43758.5453;
  return value - Math.floor(value);
};

const drawPixelDreamMoon = (
  ctx: CanvasRenderingContext2D,
  moonX: number,
  moonY: number,
  radius: number,
  phase: number,
) => {
  const grid = 3;
  const radiusSq = radius * radius;
  const baseColor = "#0b1222";
  const innerColor = "#101b30";
  const rimColor = "#5fffd2";
  const glowColor = "#86ffe6";
  const crescentEdge = 0.55;
  const pulse = 1 + Math.sin(phase * 1.4) * 0.05;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  for (let y = -radius; y <= radius; y += grid) {
    for (let x = -radius; x <= radius; x += grid) {
      const cx = x + grid * 0.5;
      const cy = y + grid * 0.5;
      const distSq = cx * cx + cy * cy;
      if (distSq > radiusSq) continue;

      const dist = Math.sqrt(distSq);
      const edge = dist / radius;
      const lightFactor = clamp((cx / radius - crescentEdge) / (1 - crescentEdge), 0, 1);
      const crescent = Math.pow(lightFactor, 1.8);
      const rimBoost = edge > 0.82 ? (edge - 0.82) / 0.18 : 0;
      const rimStrength = Math.max(crescent, rimBoost * 0.7);

      const shadowFactor = clamp(0.6 + (cx / radius) * 0.25, 0.35, 1);
      const innerMix = clamp(1 - edge, 0, 1);

      let colorBase = baseColor;
      let brightness = 0.75 * shadowFactor + innerMix * 0.25;

      if (rimStrength > 0.12) {
        colorBase = rimColor;
        brightness = 0.75 + rimStrength * 0.7;
      } else {
        colorBase = innerColor;
        brightness = 0.7 + innerMix * 0.35;
      }

      const speckle = pixelHash(Math.round(cx / grid), Math.round(cy / grid), 42);
      if (speckle > 0.982 && edge < 0.82 && cx < radius * 0.35) {
        colorBase = "#9ad0ff";
        brightness = 1.2;
      } else if (speckle > 0.988 && edge < 0.85 && cx < radius * 0.4) {
        colorBase = "#ffb0e4";
        brightness = 1.15;
      }

      ctx.fillStyle = adjustBrightness(colorBase, brightness * pulse);
      ctx.fillRect(moonX + x, moonY + y, grid, grid);
    }
  }

  // Pixel halo
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = adjustBrightness(glowColor, 1.05);
  for (let y = -radius - grid * 2; y <= radius + grid * 2; y += grid * 2) {
    for (let x = -radius - grid * 2; x <= radius + grid * 2; x += grid * 2) {
      const cx = x + grid;
      const cy = y + grid;
      const dist = Math.sqrt(cx * cx + cy * cy);
      if (dist > radius * 1.28 || dist < radius * 1.05) continue;
      ctx.fillRect(moonX + x, moonY + y, grid * 1.5, grid * 1.5);
    }
  }

  ctx.restore();
};

const drawPixelMoon = (
  ctx: CanvasRenderingContext2D,
  moonX: number,
  moonY: number,
  radius: number,
  phenomenon: MoonRendererProps["phenomenon"],
  phase: number,
) => {
  if (phenomenon.id === "pixelDreamMoon") {
    drawPixelDreamMoon(ctx, moonX, moonY, radius, phase);
    return;
  }

  const grid = 3;
  const radiusSq = radius * radius;
  const rimThreshold = radius - grid * 1.2;
  const baseColor = phenomenon.moonTint;
  const rimColor = phenomenon.uiAccent;

  let shadowBoundary = 0;
  let shadowLeft = false;
  let shadowRight = false;
  if (phase < 0.5) {
    shadowBoundary = radius * (1 - 4 * phase);
    shadowLeft = true;
  } else if (phase > 0.5) {
    shadowBoundary = -radius + (phase - 0.5) * 4 * radius;
    shadowRight = true;
  }

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  for (let y = -radius; y <= radius; y += grid) {
    for (let x = -radius; x <= radius; x += grid) {
      const cx = x + grid * 0.5;
      const cy = y + grid * 0.5;
      if (cx * cx + cy * cy > radiusSq) continue;

      const light = clamp(
        0.85 + (-cx * 0.5 - cy * 0.4) / (radius * 2),
        0.6,
        1.2,
      );

      let shadowFactor = 1;
      if (shadowLeft) {
        if (cx < shadowBoundary - grid) shadowFactor = 0.35;
        else if (cx < shadowBoundary + grid) shadowFactor = 0.6;
      } else if (shadowRight) {
        if (cx > shadowBoundary + grid) shadowFactor = 0.35;
        else if (cx > shadowBoundary - grid) shadowFactor = 0.6;
      }

      const dist = Math.sqrt(cx * cx + cy * cy);
      const rimBoost = dist > rimThreshold ? 0.12 : 0;
      const colorBase = dist > rimThreshold ? rimColor : baseColor;
      const color = adjustBrightness(
        colorBase,
        clamp(light * shadowFactor + rimBoost, 0.35, 1.35),
      );

      ctx.fillStyle = color;
      ctx.fillRect(moonX + x, moonY + y, grid, grid);
    }
  }

  // Subtle pixel halo
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = adjustBrightness(rimColor, 1.1);
  for (let y = -radius - grid * 2; y <= radius + grid * 2; y += grid * 2) {
    for (let x = -radius - grid * 2; x <= radius + grid * 2; x += grid * 2) {
      const cx = x + grid;
      const cy = y + grid;
      const dist = Math.sqrt(cx * cx + cy * cy);
      if (dist > radius * 1.25 || dist < radius * 1.05) continue;
      ctx.fillRect(moonX + x, moonY + y, grid * 1.5, grid * 1.5);
    }
  }
  ctx.restore();
};

// Helper function to draw realistic moon phase shadow with gradient
function drawMoonPhaseShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  phase: number
): void {
  if (Math.abs(phase - 0.5) < 0.01) return; // Full moon, no shadow

  ctx.save();

  // Create clipping path for the moon circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();

  const deepShadow = "rgba(5, 10, 25, 0.85)";
  const midShadow = "rgba(5, 10, 25, 0.5)";

  if (phase < 0.5) {
    // Waxing (shadow on left side)
    const illumination = phase * 2;
    const shadowWidth = radius * (1 - illumination);

    const gradient = ctx.createLinearGradient(
      x - radius,
      y,
      x - radius + shadowWidth * 2.2,
      y
    );
    gradient.addColorStop(0, deepShadow);
    gradient.addColorStop(0.4, deepShadow);
    gradient.addColorStop(0.7, midShadow);
    gradient.addColorStop(1, "rgba(5, 10, 25, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, shadowWidth * 2.2, radius * 2);
  } else if (phase > 0.5) {
    // Waning (shadow on right side)
    const illumination = 1 - (phase - 0.5) * 2;
    const shadowWidth = radius * (1 - illumination);

    const gradient = ctx.createLinearGradient(
      x + radius - shadowWidth * 2.2,
      y,
      x + radius,
      y
    );
    gradient.addColorStop(0, "rgba(5, 10, 25, 0)");
    gradient.addColorStop(0.3, midShadow);
    gradient.addColorStop(0.6, deepShadow);
    gradient.addColorStop(1, deepShadow);

    ctx.fillStyle = gradient;
    ctx.fillRect(
      x + radius - shadowWidth * 2.2,
      y - radius,
      shadowWidth * 2.2,
      radius * 2
    );
  }

  ctx.restore();
}

export function calculateMoonRadius(
  phenomenon: MoonRendererProps["phenomenon"]
): number {
  const baseMoonRadius = 40;
  const rarityMoonScale = {
    normal: 1.0,
    rare: 1.05,
    very_rare: 1.1,
    legendary: 1.15,
    mythic: 1.2,
  }[phenomenon.rarity];
  return baseMoonRadius * (phenomenon.moonSize || 1.0) * rarityMoonScale;
}

export function drawMoon({
  ctx,
  phenomenon,
  parallaxOffset,
  moonPosition,
  moonPhase,
}: MoonRendererProps): MoonPosition {
  const moon = { ...moonPosition };
  moon.phase += 0.005;
  const offsetY = Math.sin(moon.phase) * 3;

  // Parallax for moon (Mid layer)
  const pX = parallaxOffset.x * 0.8;
  const pY = parallaxOffset.y * 0.8;

  const moonX = moon.x + pX;
  const moonY = moon.y + pY;
  const moonRadius = calculateMoonRadius(phenomenon);

  if (phenomenon.specialEffect === "pixel") {
    drawPixelMoon(ctx, moonX, moonY + offsetY, moonRadius, phenomenon, moonPhase.phase);
    return moon;
  }

  // Outer glow
  const glowColor = phenomenon.moonTint;
  const outerGlow = ctx.createRadialGradient(
    moonX,
    moonY + offsetY,
    0,
    moonX,
    moonY + offsetY,
    moonRadius * 1.5
  );
  outerGlow.addColorStop(0, `${glowColor}50`);
  outerGlow.addColorStop(0.5, `${glowColor}26`);
  outerGlow.addColorStop(1, `${glowColor}00`);
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY + offsetY, moonRadius * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Main moon body
  const moonGradient = ctx.createLinearGradient(
    moonX - moonRadius,
    moonY + offsetY - moonRadius,
    moonX + moonRadius,
    moonY + offsetY + moonRadius
  );
  moonGradient.addColorStop(0, phenomenon.moonTint);
  moonGradient.addColorStop(0.3, adjustBrightness(phenomenon.moonTint, 0.9));
  moonGradient.addColorStop(0.6, adjustBrightness(phenomenon.moonTint, 0.8));
  moonGradient.addColorStop(1, adjustBrightness(phenomenon.moonTint, 0.7));
  ctx.fillStyle = moonGradient;
  ctx.beginPath();
  ctx.arc(moonX, moonY + offsetY, moonRadius, 0, Math.PI * 2);
  ctx.fill();

  // Mythic effects
  if (phenomenon.rarity === "mythic") {
    drawMythicEffects(ctx, moonX, moonY + offsetY, moonRadius, phenomenon, moon.phase);
  }

  // Lunar Transient Phenomena effects
  if (phenomenon.id === "lunarTransientPhenomena") {
    drawLunarTransientEffects(ctx, moonX, moonY + offsetY, moonRadius, phenomenon, moon.phase);
  }

  // Draw moon phase shadow
  drawMoonPhaseShadow(ctx, moonX, moonY + offsetY, moonRadius, moonPhase.phase);

  // Crystal Moon effects
  if (phenomenon.id === "crystalMoon") {
    drawCrystalMoonEffects(ctx, moonX, moonY + offsetY, moonRadius, moon.phase);
  }

  return moon;
}

function drawMythicEffects(
  ctx: CanvasRenderingContext2D,
  moonX: number,
  moonY: number,
  moonRadius: number,
  phenomenon: MoonRendererProps["phenomenon"],
  phase: number
): void {
  // Multi-layer ethereal glow
  const innerGlow = ctx.createRadialGradient(
    moonX,
    moonY,
    moonRadius * 0.7,
    moonX,
    moonY,
    moonRadius * 1.8
  );
  innerGlow.addColorStop(0, `${phenomenon.uiAccent}00`);
  innerGlow.addColorStop(0.3, `${phenomenon.uiAccent}40`);
  innerGlow.addColorStop(0.6, `${phenomenon.uiAccent}20`);
  innerGlow.addColorStop(1, `${phenomenon.uiAccent}00`);
  ctx.fillStyle = innerGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius * 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Rim light
  ctx.strokeStyle = `${phenomenon.uiAccent}60`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius - 1, 0, Math.PI * 2);
  ctx.stroke();

  // Pulsing highlight
  const pulsePhase = phase * 2;
  const pulseOpacity = (Math.sin(pulsePhase) * 0.15 + 0.25) * 255;
  const pulseHex = Math.floor(pulseOpacity).toString(16).padStart(2, "0");
  const highlight = ctx.createRadialGradient(
    moonX - moonRadius * 0.3,
    moonY - moonRadius * 0.3,
    0,
    moonX - moonRadius * 0.3,
    moonY - moonRadius * 0.3,
    moonRadius * 0.6
  );
  highlight.addColorStop(0, `#ffffff${pulseHex}`);
  highlight.addColorStop(1, `#ffffff00`);
  ctx.fillStyle = highlight;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
  ctx.fill();
}

function drawLunarTransientEffects(
  ctx: CanvasRenderingContext2D,
  moonX: number,
  moonY: number,
  moonRadius: number,
  phenomenon: MoonRendererProps["phenomenon"],
  phase: number
): void {
  const flashPhase = phase * 3;
  const flashIntensity = Math.sin(flashPhase) * 0.3 + 0.7;

  // Massive outer glow
  const massiveGlow = ctx.createRadialGradient(
    moonX,
    moonY,
    moonRadius * 0.5,
    moonX,
    moonY,
    moonRadius * 3
  );
  massiveGlow.addColorStop(
    0,
    `${phenomenon.uiAccent}${Math.floor(flashIntensity * 120).toString(16).padStart(2, "0")}`
  );
  massiveGlow.addColorStop(
    0.3,
    `${phenomenon.uiAccent}${Math.floor(flashIntensity * 80).toString(16).padStart(2, "0")}`
  );
  massiveGlow.addColorStop(
    0.6,
    `${phenomenon.uiAccent}${Math.floor(flashIntensity * 40).toString(16).padStart(2, "0")}`
  );
  massiveGlow.addColorStop(1, `${phenomenon.uiAccent}00`);
  ctx.fillStyle = massiveGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius * 3, 0, Math.PI * 2);
  ctx.fill();

  // Color shifting rim
  const colorPhase = phase * 4;
  const hue = (Math.sin(colorPhase) * 60 + 280) % 360;
  ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${flashIntensity * 0.8})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius + 2, 0, Math.PI * 2);
  ctx.stroke();

  // Inner flash
  const innerFlash = ctx.createRadialGradient(
    moonX,
    moonY,
    0,
    moonX,
    moonY,
    moonRadius * 0.8
  );
  innerFlash.addColorStop(0, `rgba(255, 255, 255, ${flashIntensity * 0.4})`);
  innerFlash.addColorStop(
    0.5,
    `${phenomenon.uiAccent}${Math.floor(flashIntensity * 100).toString(16).padStart(2, "0")}`
  );
  innerFlash.addColorStop(1, `${phenomenon.uiAccent}00`);
  ctx.fillStyle = innerFlash;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Particle ring
  const particleCount = 12;
  const ringRadius = moonRadius * 2;
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2 + phase;
    const px = moonX + Math.cos(angle) * ringRadius;
    const py = moonY + Math.sin(angle) * ringRadius;

    const particleGlow = ctx.createRadialGradient(px, py, 0, px, py, 4);
    particleGlow.addColorStop(
      0,
      `${phenomenon.uiAccent}${Math.floor(flashIntensity * 200).toString(16).padStart(2, "0")}`
    );
    particleGlow.addColorStop(1, `${phenomenon.uiAccent}00`);
    ctx.fillStyle = particleGlow;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCrystalMoonEffects(
  ctx: CanvasRenderingContext2D,
  moonX: number,
  moonY: number,
  moonRadius: number,
  phase: number
): void {
  ctx.save();

  // Crown facets
  const crownFacets = 8;
  for (let i = 0; i < crownFacets; i++) {
    const angle = (Math.PI * 2 * i) / crownFacets + phase * 0.3;
    const nextAngle = (Math.PI * 2 * (i + 1)) / crownFacets + phase * 0.3;
    const outerRadius = moonRadius * 0.95;
    const innerRadius = moonRadius * 0.6;

    const x1 = moonX + Math.cos(angle) * outerRadius;
    const y1 = moonY + Math.sin(angle) * outerRadius;
    const x2 = moonX + Math.cos(nextAngle) * outerRadius;
    const y2 = moonY + Math.sin(nextAngle) * outerRadius;
    const x3 = moonX + Math.cos(nextAngle) * innerRadius;
    const y3 = moonY + Math.sin(nextAngle) * innerRadius;
    const x4 = moonX + Math.cos(angle) * innerRadius;
    const y4 = moonY + Math.sin(angle) * innerRadius;

    const brightness = i % 2 === 0 ? 0.08 : 0.04;
    const gradient = ctx.createLinearGradient(x1, y1, moonX, moonY);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${brightness})`);
    gradient.addColorStop(0.5, `rgba(200, 230, 255, ${brightness * 0.8})`);
    gradient.addColorStop(1, `rgba(180, 220, 255, ${brightness * 0.5})`);

    ctx.fillStyle = gradient;
    ctx.strokeStyle = `rgba(220, 240, 255, ${0.15 + brightness})`;
    ctx.lineWidth = 0.5;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Sparkles
  const sparkles = 20;
  for (let i = 0; i < sparkles; i++) {
    const angle = (Math.PI * 2 * i) / sparkles + phase * (i % 3);
    const radiusVariation = 0.2 + (i % 5) * 0.15;
    const sparkleRadius = moonRadius * radiusVariation;
    const sparkleX = moonX + Math.cos(angle) * sparkleRadius;
    const sparkleY = moonY + Math.sin(angle) * sparkleRadius;
    const intensity = Math.sin(phase * 4 + i * 0.5) * 0.5 + 0.5;
    const sparkleSize = (0.8 + intensity * 1.2) * (i % 3 === 0 ? 1.2 : 0.8);

    const sparkleGlow = ctx.createRadialGradient(
      sparkleX,
      sparkleY,
      0,
      sparkleX,
      sparkleY,
      sparkleSize * 2.5
    );
    sparkleGlow.addColorStop(0, `rgba(255, 255, 255, ${0.5 * intensity})`);
    sparkleGlow.addColorStop(0.4, `rgba(220, 240, 255, ${0.3 * intensity})`);
    sparkleGlow.addColorStop(1, "rgba(200, 230, 255, 0)");

    ctx.fillStyle = sparkleGlow;
    ctx.beginPath();
    ctx.arc(sparkleX, sparkleY, sparkleSize * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
