import type { MoonRendererProps, MoonPosition } from "./types";
import { adjustBrightness } from "@/utils/colorUtils";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const pixelHash = (x: number, y: number, seed: number) => {
  const value = Math.sin(x * 12.9898 + y * 78.233 + seed * 0.17) * 43758.5453;
  return value - Math.floor(value);
};





// Pixel Dream Moon color palette derived from phenomenon config
interface PixelMoonPalette {
  bg: string;
  shadow: string;
  mid: string;
  base: string;
  highlight: string;
  rim: string;
  crater: string;
  glow: string;
}

const getPixelMoonPalette = (
  moonTint: string,
  uiAccent: string
): PixelMoonPalette => ({
  bg: "#120826",
  shadow: "#241042",
  mid: "#3b1e69",
  base: moonTint, // Use phenomenon moonTint
  highlight: adjustBrightness(moonTint, 1.25),
  rim: uiAccent, // Use phenomenon uiAccent
  crater: adjustBrightness(moonTint, 0.6),
  glow: uiAccent,
});

// Retro color palette for beat effect
const RETRO_COLORS = [
  "#FF6B9D", // Hot pink
  "#C44CFF", // Electric purple
  "#00D4FF", // Cyan
  "#FFE66D", // Yellow
  "#4DFFB8", // Mint green
  "#FF8A5B", // Coral
  "#7B68EE", // Medium slate blue
  "#00FF88", // Spring green
];

// Draw star trail particles orbiting the moon with retro beat colors
const drawPixelStarTrail = (
  ctx: CanvasRenderingContext2D,
  moonX: number,
  moonY: number,
  radius: number,
  time: number,
  accentColor: string
) => {
  const particleCount = 20;
  const orbitRadius = radius * 1.8;
  
  // Beat timing - changes color every 400ms for retro rhythm feel
  const beatPhase = Math.floor(time / 400) % RETRO_COLORS.length;
  const beatProgress = (time % 400) / 400;
  const beatPulse = Math.sin(beatProgress * Math.PI); // 0 -> 1 -> 0
  
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  
  for (let i = 0; i < particleCount; i++) {
    const baseAngle = (i / particleCount) * Math.PI * 2;
    // Extremely slow orbit - 2 minutes per revolution
    const orbitSpeed = time / 120000;
    const angle = baseAngle + orbitSpeed + Math.sin(time / 8000 + i) * 0.15;
    
    // Varying orbit distances
    const orbitVariation = 0.85 + Math.sin(i * 1.5) * 0.25;
    const px = moonX + Math.cos(angle) * orbitRadius * orbitVariation;
    const py = moonY + Math.sin(angle) * orbitRadius * orbitVariation * 0.35;
    
    // Twinkling effect synced with beat
    const twinkle = Math.sin(time / 600 + i * 2.3) * 0.5 + 0.5;
    const size = 2 + twinkle * 2 + beatPulse * 1.5;
    
    // Color cycling per particle with offset
    const colorIndex = (beatPhase + i) % RETRO_COLORS.length;
    const particleColor = RETRO_COLORS[colorIndex];
    
    // Draw pixel star with beat-synced glow
    ctx.globalAlpha = 0.5 + twinkle * 0.4 + beatPulse * 0.1;
    ctx.fillStyle = particleColor;
    ctx.fillRect(Math.floor(px), Math.floor(py), size, size);
    
    // Enhanced glow on beat
    if (twinkle > 0.5 || beatPulse > 0.7) {
      ctx.globalAlpha = 0.25 + beatPulse * 0.15;
      ctx.fillRect(Math.floor(px) - 1, Math.floor(py) - 1, size + 2, size + 2);
      
      // Extra sparkle layer on strong beat
      if (beatPulse > 0.8 && i % 3 === 0) {
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(Math.floor(px) - 2, Math.floor(py) - 2, size + 4, size + 4);
      }
    }
  }
  
  ctx.restore();
};

const drawPixelDreamMoon = (
  ctx: CanvasRenderingContext2D,
  moonX: number,
  moonY: number,
  radius: number,
  phase: number,
  moonTint: string,
  uiAccent: string
) => {
  const grid = 3;
  const radiusSq = radius * radius;
  const colors = getPixelMoonPalette(moonTint, uiAccent);
  const time = Date.now();

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // --- Helper: Draw Rings ---
  const drawRings = (drawReference: "back" | "front") => {
    const ringGrid = 2;
    const perspectiveScale = 0.3;

    // Ring Definitions - Use theme colors
    const ringBands = [
      { inner: 1.4, outer: 1.6, color: colors.shadow, baseAlpha: 0.5, noise: 0.5 },
      { inner: 1.65, outer: 1.75, color: colors.base, baseAlpha: 0.7, noise: 0.3 },
      { inner: 1.8, outer: 2.1, color: colors.rim, baseAlpha: 0.35, noise: 0.7 },
    ];

    ctx.save();
    ctx.translate(moonX, moonY);
    ctx.rotate(-Math.PI / 12);

    ringBands.forEach((band, i) => {
      const step = ringGrid;

      for (let r = band.inner * radius; r <= band.outer * radius; r += step) {
        const circumference = 2 * Math.PI * r;
        const segments = Math.floor(circumference / step);

        for (let s = 0; s < segments; s++) {
          const angle = (s / segments) * Math.PI * 2;
          const isBack = Math.sin(angle) < 0;

          if (drawReference === "back" && !isBack) continue;
          if (drawReference === "front" && isBack) continue;

          // EXTREMELY slow rotation - 10-15 minutes per revolution
          const rotOffset = (time / (600000 + i * 300000)) * (i % 2 === 0 ? 1 : -1);
          const finalAngle = angle + rotOffset;

          const px = Math.cos(finalAngle) * r;
          const py = Math.sin(finalAngle) * r * perspectiveScale;

          const n = pixelHash(Math.floor(px), Math.floor(py), time * 0.00001);

          if (n > band.noise) {
            ctx.fillStyle = band.color;
            const distRel = (r - band.inner * radius) / ((band.outer - band.inner) * radius);
            const fade = Math.sin(distRel * Math.PI);

            ctx.globalAlpha = band.baseAlpha * fade * (isBack ? 0.5 : 1.0);
            ctx.fillRect(px, py, ringGrid, ringGrid);
          }
        }
      }
    });

    // Sparkles on front rings
    if (drawReference === "front") {
      const sparkleCount = 12;
      for (let k = 0; k < sparkleCount; k++) {
        if (pixelHash(k, time / 2000, 42) > 0.75) {
          const angle = (time / 45000 + k * 0.5) % (Math.PI * 2);
          if (Math.sin(angle) > 0.1) {
            const r = radius * (1.5 + Math.sin(k) * 0.3);
            const sx = Math.cos(angle) * r;
            const sy = Math.sin(angle) * r * perspectiveScale;
            
            ctx.globalAlpha = 0.6 + Math.sin(time / 500 + k) * 0.4;
            ctx.fillStyle = k % 2 === 0 ? "#ffffff" : colors.rim;
            ctx.fillRect(sx, sy, 2, 2);
          }
        }
      }
    }

    ctx.restore();
  };

  // Draw star trail behind everything
  drawPixelStarTrail(ctx, moonX, moonY, radius, time, colors.rim);

  // 1. Draw Back Rings
  drawRings("back");

  // 2. Pixel Moon (The Planet)
  for (let y = -radius; y <= radius; y += grid) {
    for (let x = -radius; x <= radius; x += grid) {
      const cx = x + grid * 0.5;
      const cy = y + grid * 0.5;
      const distSq = cx * cx + cy * cy;

      if (distSq > radiusSq) continue;

      const nx = cx / radius;
      const ny = cy / radius;
      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      const lightX = -Math.cos(phase * Math.PI * 2);
      const dot = nx * lightX + nz * Math.sqrt(Math.max(0, 1 - lightX * lightX));

      const noiseVal = pixelHash(Math.round(cx / grid), Math.round(cy / grid), 123);
      const isCrater = noiseVal > 0.94;
      const isBigCrater = noiseVal > 0.985;

      let brightness = (dot + 1) / 2;
      const isEven = (Math.round((cx + radius) / grid) + Math.round((cy + radius) / grid)) % 2 === 0;

      let finalColor = colors.bg;

      if (brightness > 0.9) {
        finalColor = colors.highlight;
      } else if (brightness > 0.7) {
        finalColor = brightness < 0.8 && isEven ? colors.base : colors.highlight;
      } else if (brightness > 0.5) {
        finalColor = colors.base;
        if (brightness < 0.6 && isEven) finalColor = colors.mid;
      } else if (brightness > 0.3) {
        finalColor = colors.mid;
        if (brightness < 0.4 && isEven) finalColor = colors.shadow;
      } else if (brightness > 0.1) {
        finalColor = colors.shadow;
        if (brightness < 0.2 && isEven) finalColor = colors.bg;
      } else {
        finalColor = colors.bg;
      }

      if (brightness > 0.3) {
        if (isBigCrater) {
          finalColor = colors.crater;
          if (nx < 0 && pixelHash(x, y, 1) > 0.5) finalColor = colors.highlight;
        } else if (isCrater && brightness > 0.6) {
          finalColor = colors.crater;
        }
      }

      const edgeDist = Math.sqrt(distSq) / radius;
      if (edgeDist > 0.85) {
        const rimDot = nx * -lightX;
        if (rimDot > 0.2 || edgeDist > 0.92) {
          if (edgeDist > 0.95 || (edgeDist > 0.88 && isEven)) {
            finalColor = colors.rim;
          }
        }
      }

      if (dot < -0.1) {
        finalColor = colors.shadow;
        if (dot < -0.3) finalColor = colors.bg;
        if (dot > -0.3 && isEven) finalColor = colors.mid;
      }

      ctx.fillStyle = finalColor;
      ctx.fillRect(moonX + x, moonY + y, grid, grid);
    }
  }

  // 3. Draw Front Rings
  drawRings("front");

  // 4. Add subtle outer glow
  ctx.globalAlpha = 0.15;
  const glowGradient = ctx.createRadialGradient(
    moonX, moonY, radius * 0.8,
    moonX, moonY, radius * 2.5
  );
  glowGradient.addColorStop(0, colors.glow);
  glowGradient.addColorStop(1, "transparent");
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(moonX, moonY, radius * 2.5, 0, Math.PI * 2);
  ctx.fill();

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
    drawPixelDreamMoon(ctx, moonX, moonY, radius, phase, phenomenon.moonTint, phenomenon.uiAccent);
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
