import { RendererProps } from "./types";

// Helper for deterministic randomness
const pixelHash = (x: number, y: number, seed: number) => {
  const value = Math.sin(x * 12.9898 + y * 78.233 + seed * 0.17) * 43758.5453;
  return value - Math.floor(value);
};

export function drawSky(props: RendererProps & { time?: number }): void {
  const { ctx, width, height, phenomenon, time = 0 } = props;

  // 1. Draw Base Gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  
  if (phenomenon.id === "pixelDreamMoon") {
     // Custom Palette for Pixel Dream
     gradient.addColorStop(0, "#120826"); // Deep void purple
     gradient.addColorStop(0.5, "#241042"); 
     gradient.addColorStop(1, "#3b1e69");
  } else {
     gradient.addColorStop(0, phenomenon.skyPalette[0]);
     gradient.addColorStop(0.5, phenomenon.skyPalette[1]);
     gradient.addColorStop(1, phenomenon.skyPalette[2]);
  }
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Add Pixel Sky Details (if Mythic Pixel Theme)
  if (phenomenon.id === "pixelDreamMoon") {
      drawPixelSkyDetails(ctx, width, height, time);
  }
}

function drawPixelSkyDetails(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const grid = 3;
  
  // --- A. Pixel Nebulas (Subtle & Glowing) ---
  const nebulaCount = 3; // Reduced count
  ctx.save();
  for (let n = 0; n < nebulaCount; n++) {
      const seed = n * 123;
      const nx = (pixelHash(n, 1, 123) * width);
      const ny = (pixelHash(n, 2, 456) * height * 0.9);
      const nSize = 80 + pixelHash(n, 3, 789) * 120; // Slightly smaller
      
      // Draw nebula cloud with dithering
      for (let y = -nSize; y <= nSize; y += grid) {
          for (let x = -nSize; x <= nSize; x += grid) {
              const dist = Math.sqrt(x*x + y*y);
              if (dist > nSize) continue;
              
              const noise = pixelHash(Math.floor((nx+x)/grid), Math.floor((ny+y)/grid), seed);
              const fade = 1 - (dist / nSize);
              
              if (noise > (0.92 - fade * 0.4)) { // Less dense
                  // Harmonious colors: Deep Purple / Midnight Blue blends
                  ctx.fillStyle = n % 2 === 0 ? "#5b21b6" : "#4338ca"; 
                  ctx.globalAlpha = 0.15 * fade; // Very subtle
                  ctx.fillRect(nx + x, ny + y, grid, grid);
              }
          }
      }
  }
  ctx.restore();

  // --- B. Distant Pixel Planets (Glowing & Blended) ---
  // Reduced to 2 planets, softer colors
  const planets = [
      { x: width * 0.15, y: height * 0.25, r: 6, color: "#fcd34d", ring: false, glow: "#fbbf24" }, // Small golden moon
      { x: width * 0.88, y: height * 0.65, r: 9, color: "#67e8f9", ring: true, glow: "#22d3ee" },   // Cyan planet
  ];

  ctx.save();
  planets.forEach((p, i) => {
      // Glow Effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = p.glow;
      
      // Draw Planet Body
      for (let y = -p.r; y <= p.r; y += grid) {
          for (let x = -p.r; x <= p.r; x += grid) {
              if (x*x + y*y <= p.r*p.r) {
                  ctx.fillStyle = p.color;
                  ctx.globalAlpha = 0.9;
                  ctx.fillRect(p.x + x, p.y + y, grid, grid);
              }
          }
      }
      
      // Draw Ring (if has ring)
      if (p.ring) {
          ctx.fillStyle = "#e0f2fe"; // Softer white/blue
          ctx.globalAlpha = 0.7;
          const ringRadius = p.r * 1.8;
          for (let rx = -ringRadius; rx <= ringRadius; rx += grid) {
              const ry = rx * 0.3;
              if (Math.abs(Math.sqrt(rx*rx + ry*ry*10) - ringRadius) < grid * 1.5) {
                   if (ry > 0 || Math.abs(rx) > p.r) {
                       ctx.fillRect(p.x + rx, p.y + ry, grid, grid);
                   }
              }
          }
      }
  });
  ctx.restore();

  // --- C. Large Decorative Stars (Glowing Crosses) ---
  const specialStars = [
      { x: width * 0.08, y: height * 0.1, type: "cross", color: "#fef3c7" }, // Pale Gold
      { x: width * 0.92, y: height * 0.2, type: "sparkle", color: "#a5f3fc" }, // Pale Cyan
      { x: width * 0.8, y: height * 0.85, type: "cross", color: "#fbcfe8" }, // Pale Pink
  ];

  ctx.save();
  specialStars.forEach((s, i) => {
      const flicker = Math.sin(time / 300 + i * 2) * 0.3 + 0.7;
      const size = grid;
      const cx = s.x;
      const cy = s.y;
      
      // Intense Glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = s.color;
      ctx.fillStyle = "#ffffff"; // White core
      ctx.globalAlpha = flicker;
      
      if (s.type === "cross") {
          ctx.fillRect(cx, cy - size*2, size, size*5);
          ctx.fillRect(cx - size*2, cy, size*5, size);
      } else if (s.type === "sparkle") {
           ctx.fillRect(cx, cy, size, size); // Center
           ctx.globalAlpha = flicker * 0.7; // Outer points softer
           ctx.fillStyle = s.color;
           ctx.fillRect(cx - size, cy, size, size);
           ctx.fillRect(cx + size, cy, size, size);
           ctx.fillRect(cx, cy - size, size, size);
           ctx.fillRect(cx, cy + size, size, size);
      }
  });
  ctx.restore();
}
