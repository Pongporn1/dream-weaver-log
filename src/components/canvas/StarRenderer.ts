import type { StarRendererProps, Star, Constellation } from "./types";
import type { MoonPhenomenon } from "@/data/moonPhenomena";

const PIXEL_STAR_PALETTE = [
  "#ffd7a6",
  "#ff9ad5",
  "#b882ff",
  "#6fffd0",
  "#9ad0ff",
  "#ffffff",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function initStars(
  width: number,
  height: number,
  phenomenon: MoonPhenomenon,
  dreamCount = 0
): Star[] {
  const isPixelTheme = phenomenon.specialEffect === "pixel";
  const grid = isPixelTheme ? 3 : 1;
  const snap = (value: number) => Math.round(value / grid) * grid;
  const densityBoost = Math.min(0.6, dreamCount / 200);
  const baseCount = Math.floor(120 * phenomenon.starDensity * (1 + densityBoost));
  const extraCount = Math.min(80, Math.floor(dreamCount * 0.6));
  const totalCount = Math.max(60, baseCount + extraCount);
  return Array.from(
    { length: totalCount },
    () => ({
      x: isPixelTheme ? snap(Math.random() * width) : Math.random() * width,
      y: isPixelTheme
        ? snap(Math.random() * height * 0.6)
        : Math.random() * height * 0.6,
      size: isPixelTheme ? Math.random() * 2 + 1 : Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleSpeed: isPixelTheme
        ? Math.random() * 0.015 + 0.004
        : Math.random() * 0.02 + 0.01,
      twinklePhase: Math.random() * Math.PI * 2,
      color: isPixelTheme
        ? PIXEL_STAR_PALETTE[
            Math.floor(Math.random() * PIXEL_STAR_PALETTE.length)
          ]
        : undefined,
    })
  );
}

export function initConstellations(
  stars: Star[],
  seedSource: string,
  density: number
): Constellation[] {
  if (stars.length === 0) return [];

  const seed = hashString(seedSource);
  const rng = mulberry32(seed);

  // Single constellation only, size scales gently with data density.
  const size = Math.min(12, Math.max(4, Math.round(4 + density * 6)));
  const maxIndex = stars.length - 1;
  const selected: Star[] = [];
  const selectedIndices: number[] = [];

  // Pick a random starting star, then chain nearest neighbors to avoid messy crossings.
  const startIndex = Math.floor(rng() * maxIndex);
  selected.push(stars[startIndex]);
  selectedIndices.push(startIndex);

  while (selectedIndices.length < size) {
    const last = selected[selected.length - 1];
    let bestIndex = -1;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < stars.length; i += 1) {
      if (selectedIndices.includes(i)) continue;
      const dx = stars[i].x - last.x;
      const dy = stars[i].y - last.y;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    }

    if (bestIndex === -1) break;
    selectedIndices.push(bestIndex);
    selected.push(stars[bestIndex]);
  }

  return [
    {
      starIndices: selectedIndices,
      intensity: 0.22 + rng() * 0.18,
    },
  ];
}

export function drawStars({
  ctx,
  phenomenon,
  parallaxOffset,
  stars,
  constellations,
  timeMs,
  constellationScale,
  constellationIntensity,
  constellationReveal,
}: StarRendererProps): void {
  if (phenomenon.starDensity === 0) return;

  const isPixelTheme = phenomenon.specialEffect === "pixel";
  const pixelGrid = isPixelTheme ? 3 : 1;
  const snap = (value: number) => Math.round(value / pixelGrid) * pixelGrid;

  // Parallax for stars (Furthest layer - moves slowly)
  const pX = parallaxOffset.x * 0.5;
  const pY = parallaxOffset.y * 0.5;
  const time = (timeMs ?? 0) * 0.001;
  const pulse = 0.6 + Math.sin(time * 0.8) * 0.4;

  // Allow constellations in Pixel Theme too
  if (constellations && constellations.length > 0) {
    ctx.save();
    const scale = Math.min(1.8, Math.max(0.8, constellationScale ?? 1));
    const intensityBoost = Math.min(
      1.8,
      Math.max(0.6, constellationIntensity ?? 1)
    );
    
    // ... existing vars ...
    const reveal = Math.min(1, Math.max(0.15, constellationReveal ?? 1));
    ctx.lineWidth = 0.9 * scale;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(255,255,255,0.25)";

    constellations.forEach((group) => {
      const points = group.starIndices
        .map((index) => stars[index])
        .filter(Boolean);

      if (points.length < 2) return;
      const revealCount = Math.max(2, Math.ceil(points.length * reveal));
      const visiblePoints = points.slice(0, revealCount);
      if (visiblePoints.length < 2) return;


      // Base faint constellation line
      ctx.globalAlpha = Math.min(1, group.intensity * 0.35 * intensityBoost);
      
      if (isPixelTheme) {
          // PIXEL MODE: Draw jagged lines
          visiblePoints.forEach((star, index) => {
            if (index === 0) return;
            const prev = visiblePoints[index - 1];
            
            // Snap coords for better look
            const x0 = snap(prev.x + pX);
            const y0 = snap(prev.y + pY);
            const x1 = snap(star.x + pX);
            const y1 = snap(star.y + pY);
            
            drawPixelLine(ctx, x0, y0, x1, y1, "rgba(255,255,255,1)", 0.25);
          });
      } else {
          // NORMAL MODE: Smooth lines
          ctx.beginPath();
          visiblePoints.forEach((star, index) => {
            const starX = star.x + pX;
            const starY = star.y + pY;
            if (index === 0) {
              ctx.moveTo(starX, starY);
            } else {
              ctx.lineTo(starX, starY);
            }
          });
          ctx.stroke();
      }

      // Animated traveling line along the constellation path
      const travelSpeed = 0.15; // cycles per second
      const progress = (time * travelSpeed) % 1;
      const segmentLength = 0.18; // visible segment length along path
      const startT = progress;
      const endT = (progress + segmentLength) % 1;

      const totalSegments = visiblePoints.length - 1;
      if (totalSegments > 0) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = 1.3 * scale;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowBlur = 10 + scale * 4;
        ctx.shadowColor = "rgba(255,255,255,0.6)";
        ctx.globalAlpha = Math.min(1, group.intensity * 0.9 * intensityBoost);

        const drawPartial = (fromT: number, toT: number) => {
          const start = fromT * totalSegments;
          const end = toT * totalSegments;
          const startIndex = Math.floor(start);
          const endIndex = Math.min(totalSegments - 1, Math.floor(end));

          const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
          const pointAt = (index: number, t: number) => {
            const a = visiblePoints[index];
            const b = visiblePoints[index + 1];
            return {
              x: lerp(a.x, b.x, t) + pX,
              y: lerp(a.y, b.y, t) + pY,
            };
          };

          const startTLocal = start - startIndex;
          const startPoint = pointAt(startIndex, startTLocal);
          ctx.beginPath();
          ctx.moveTo(startPoint.x, startPoint.y);

          for (let i = startIndex; i <= endIndex; i += 1) {
            const tEnd = i === endIndex ? end - i : 1;
            const segmentEnd = pointAt(i, tEnd);
            ctx.lineTo(segmentEnd.x, segmentEnd.y);
          }
          ctx.stroke();

          return pointAt(endIndex, end - endIndex);
        };

        let headPoint: { x: number; y: number } | null = null;
        if (endT > startT) {
          headPoint = drawPartial(startT, endT);
        } else {
          drawPartial(startT, 1);
          headPoint = drawPartial(0, endT);
        }

        if (headPoint) {
          ctx.beginPath();
          ctx.arc(
            headPoint.x,
            headPoint.y,
            2.2 * scale + pulse * 0.4 * scale,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = "rgba(255,255,255,0.95)";
          ctx.shadowBlur = 12 + scale * 4;
          ctx.shadowColor = "rgba(255,255,255,0.8)";
          ctx.fill();
        }
        ctx.restore();
      }

      // Draw constellation nodes with soft glow
      visiblePoints.forEach((star) => {
        const starX = star.x + pX;
        const starY = star.y + pY;
        ctx.beginPath();
        ctx.arc(
          starX,
          starY,
          Math.max(1.6, star.size * (1 + 0.25 * scale) + pulse * 0.6 * scale),
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255,255,255,${Math.min(
          1,
          0.45 * intensityBoost + pulse * 0.35
        )})`;
        ctx.shadowBlur = 6 * scale + pulse * 6;
        ctx.shadowColor = "rgba(255,255,255,0.45)";
        ctx.fill();
      });
    });
    ctx.restore();
  }

  stars.forEach((star) => {
    star.twinklePhase += star.twinkleSpeed;
    const opacity = star.opacity * (Math.sin(star.twinklePhase) * 0.5 + 0.5);

    if (isPixelTheme) {
      const starX = snap(star.x + pX);
      const starY = snap(star.y + pY);
      const size = Math.max(1, Math.round(star.size));
      const color = star.color ?? "#ffffff";

      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.fillRect(starX, starY, size, size);

      if (star.size > 1.6) {
        ctx.fillRect(starX - size, starY, size * 3, size);
        ctx.fillRect(starX, starY - size, size, size * 3);
      }
      ctx.restore();
      return;
    }

    const starX = star.x + pX;
    const starY = star.y + pY;

    ctx.beginPath();
    ctx.arc(starX, starY, star.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${opacity})`;
    ctx.fill();

    // Add glow for larger stars
    if (star.size > 1.5) {
      ctx.beginPath();
      ctx.arc(starX, starY, star.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${opacity * 0.2})`;
      ctx.fill();
    }
  });
  
  // Draw Shooting Stars for Pixel Theme (Meteor Shower Effect)
  if (isPixelTheme) {
      const timeSec = (timeMs ?? Date.now()) / 1000;
      const width = ctx.canvas.width / (window.devicePixelRatio || 1); 
      const height = ctx.canvas.height / (window.devicePixelRatio || 1);
      
      // Meteor Shower Settings
      const cycleDuration = 3.0; // More frequent (was 4.0)
      const activeWindow = 3; // Check more windows for density
      const currentCycle = Math.floor(timeSec / cycleDuration);
      
      for (let i = 0; i < activeWindow; i++) {
          const cycle = currentCycle - i;
          const r1 = pixelHash(cycle, 1, 111); // Chance
          const r2 = pixelHash(cycle, 2, 222); // X Position
          const r3 = pixelHash(cycle, 3, 333); // Speed/Properties
          
          // 60% chance to spawn a star this cycle (was 40%)
          if (r1 > 0.6) continue;
          
          // Determine properties
          const speed = 200 + r3 * 300; // Faster: 200-500 px/s
          const angle = Math.PI / 4 + (r1 - 0.5) * 0.4; // Varied diagonal 
          
          // Start Position: Anywhere along top or left edge
          let startX, startY;
          if (r2 > 0.4) {
              // Top edge
              startX = width * (r2 - 0.2) * 1.5; // Spread wider
              startY = -50;
          } else {
              // Left edge
              startX = -50;
              startY = height * r2 * 2;
          }
          
          // Calculate active time
          const cycleStartTime = cycle * cycleDuration;
          const timeSinceStart = timeSec - cycleStartTime;
          
          // Add a random delay within the cycle
          const delay = r1 * 2.5; 
          const activeTime = timeSinceStart - delay;
          
          const maxDuration = 2.5; // Short life
          if (activeTime < 0 || activeTime > maxDuration) continue; 
          
          // Draw Position
          const dist = speed * activeTime;
          const currentX = startX + Math.cos(angle) * dist;
          const currentY = startY + Math.sin(angle) * dist;
          
          // Determine Size/Tail based on 'r3'
          const scale = 0.8 + r3 * 0.6; // 0.8x to 1.4x scale
          
          // Colors
          const palette = ["#5fffd2", "#ff8fd6", "#ffffff", "#fcd34d"];
          const colorIdx = Math.floor(r2 * palette.length);
          const color = palette[colorIdx];
          
          drawPixelShootingStar(ctx, currentX, currentY, 25, scale, color, activeTime * 1000); 
      }

      // --- UFO EASTER EGG ---
      // Spawns rarely (every ~45 seconds)
      const ufoInterval = 45; 
      const ufoCycle = Math.floor(timeSec / ufoInterval);
      const ufoRandom = pixelHash(ufoCycle, 66, 77); // Deterministic spawn
      
      if (ufoRandom > 0.6) { // 40% chance per interval
          const ufoTime = timeSec % ufoInterval;
          const duration = 12; // Takes 12s to cross
          
          if (ufoTime < duration) {
               const progress = ufoTime / duration;
               const startY = height * (0.2 + ufoRandom * 0.4); // Random height 20-60%
               const ufoX = width * 1.1 - (width * 1.4 * progress); // Move Right to Left
               
               // Warp/Wobble
               const wobbleY = Math.sin(timeSec * 3) * 10;
               const ufoY = startY + wobbleY;
               
               drawPixelUFO(ctx, ufoX, ufoY, timeSec);
          }
      }
  }
}

const pixelHash = (x: number, y: number, seed: number) => {
  const value = Math.sin(x * 12.9898 + y * 78.233 + seed * 0.17) * 43758.5453;
  return value - Math.floor(value);
};

const drawPixelShootingStar = (
  ctx: CanvasRenderingContext2D,
  currentX: number,
  currentY: number,
  length: number,
  speed: number,
  color: string,
  localTimeMs: number
) => {
  const grid = 3;
  
  // Draw Head
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(currentX, currentY, grid * 2, grid * 2);
  
  // Draw Dithered Trail
  const trailSegs = 20; 
  for (let i = 0; i < trailSegs; i++) {
     const tx = currentX - (i * grid * 1.5);
     const ty = currentY - (i * grid * 1.2);
     
     // Flickering trail
     if (i % 2 === 0 || pixelHash(i, Math.floor(localTimeMs/50), 10) > 0.3) {
         ctx.fillStyle = color; 
         ctx.globalAlpha = 1 - (i / trailSegs);
         ctx.fillRect(tx, ty, grid, grid);
     }
  }
  ctx.globalAlpha = 1.0;
};

// Helper to draw pixelated lines (Bresenham-style)
const drawPixelLine = (
    ctx: CanvasRenderingContext2D, 
    x0: number, 
    y0: number, 
    x1: number, 
    y1: number, 
    color: string,
    alpha: number
) => {
    const grid = 3;
    let x = Math.floor(x0 / grid);
    let y = Math.floor(y0 / grid);
    const endX = Math.floor(x1 / grid);
    const endY = Math.floor(y1 / grid);
    
    const dx = Math.abs(endX - x);
    const dy = Math.abs(endY - y);
    const sx = (x < endX) ? 1 : -1;
    const sy = (y < endY) ? 1 : -1;
    let err = dx - dy;
    
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    
    while(true) {
        ctx.fillRect(x * grid, y * grid, grid, grid);
        if ((x === endX) && (y === endY)) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x += sx; }
        if (e2 < dx) { err += dx; y += sy; }
    }
};

const drawPixelUFO = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number
) => {
    const grid = 3;
    
    ctx.save();
    ctx.translate(x, y);
    
    // Dome
    ctx.fillStyle = "#a5f3fc"; // Cyan Glass
    ctx.globalAlpha = 0.9;
    ctx.fillRect(4*grid, 0, 3*grid, 2*grid);
    
    // Body
    ctx.fillStyle = "#5d5d5d"; // Metal Gray
    ctx.globalAlpha = 1.0;
    ctx.fillRect(2*grid, 2*grid, 7*grid, 1*grid);
    ctx.fillRect(1*grid, 3*grid, 9*grid, 1*grid);
    ctx.fillRect(2*grid, 4*grid, 7*grid, 1*grid);
    
    // Lights (RGB Shift)
    const lightFrame = Math.floor(time * 8) % 3;
    const lights = ["#ff0000", "#00ff00", "#0000ff"];
    
    ctx.fillStyle = lights[lightFrame];
    ctx.fillRect(2*grid, 3*grid, 1*grid, 1*grid);
    
    ctx.fillStyle = lights[(lightFrame + 1) % 3];
    ctx.fillRect(5*grid, 3*grid, 1*grid, 1*grid);
    
    ctx.fillStyle = lights[(lightFrame + 2) % 3];
    ctx.fillRect(8*grid, 3*grid, 1*grid, 1*grid);
    
    ctx.restore();
};
