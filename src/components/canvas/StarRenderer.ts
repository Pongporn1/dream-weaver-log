import type { StarRendererProps, Star, Constellation } from "./types";
import type { MoonPhenomenon } from "@/data/moonPhenomena";

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
  const densityBoost = Math.min(0.6, dreamCount / 200);
  const baseCount = Math.floor(120 * phenomenon.starDensity * (1 + densityBoost));
  const extraCount = Math.min(80, Math.floor(dreamCount * 0.6));
  const totalCount = Math.max(60, baseCount + extraCount);
  return Array.from(
    { length: totalCount },
    () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.6,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      twinklePhase: Math.random() * Math.PI * 2,
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

  // Parallax for stars (Furthest layer - moves slowly)
  const pX = parallaxOffset.x * 0.5;
  const pY = parallaxOffset.y * 0.5;
  const time = (timeMs ?? 0) * 0.001;
  const pulse = 0.6 + Math.sin(time * 0.8) * 0.4;

  if (constellations && constellations.length > 0) {
    ctx.save();
    const scale = Math.min(1.8, Math.max(0.8, constellationScale ?? 1));
    const intensityBoost = Math.min(
      1.8,
      Math.max(0.6, constellationIntensity ?? 1)
    );
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
}
