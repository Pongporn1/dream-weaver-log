export interface MoonFlash {
  x: number;
  y: number;
  size: number;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
}
export interface OrbitingParticle {
  angle: number;
  distance: number;
  size: number;
  speed: number;
  color: string;
  opacity: number;
}
export interface Sparkle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinklePhase: number;
  twinkleSpeed: number;
}
export interface AuroraWave {
  y: number;
  amplitude: number;
  frequency: number;
  phase: number;
  speed: number;
  color: string;
  opacity: number;
}
export interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  blinkPhase: number;
  blinkSpeed: number;
  targetX: number;
  targetY: number;
}
export interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}
export interface FogLayer {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
  color: string;
}

export const initMoonFlashes = () => [];

export const spawnMoonFlash = (
  moonX: number,
  moonY: number,
  moonRadius = 40,
): MoonFlash => {
  const angle = Math.random() * Math.PI * 2,
    distance = Math.random() * moonRadius * 0.8;
  return {
    x: moonX + Math.cos(angle) * distance,
    y: moonY + Math.sin(angle) * distance,
    size: Math.random() * 8 + 4,
    opacity: 1,
    lifetime: 0,
    maxLifetime: 30 + Math.random() * 20,
  };
};

export const drawMoonFlashes = (
  ctx: CanvasRenderingContext2D,
  flashes: MoonFlash[],
): MoonFlash[] => {
  return flashes
    .map((f) => {
      f.lifetime++;
      f.opacity = 1 - f.lifetime / f.maxLifetime;
      if (f.opacity > 0) {
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size);
        g.addColorStop(0, `rgba(255,255,255,${f.opacity})`);
        g.addColorStop(0.5, `rgba(200,200,255,${f.opacity * 0.6})`);
        g.addColorStop(1, `rgba(150,150,255,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();
      }
      return f;
    })
    .filter((f) => f.lifetime < f.maxLifetime);
};

export const initOrbitingParticles = (count = 20): OrbitingParticle[] => {
  return Array.from({ length: count }, (_, i) => ({
    angle: (Math.PI * 2 * i) / count,
    distance: 50 + Math.random() * 30,
    size: Math.random() * 3 + 1,
    speed: 0.01 + Math.random() * 0.02,
    color: i % 2 === 0 ? "#B84060" : "#d85080",
    opacity: Math.random() * 0.5 + 0.3,
  }));
};

export const drawOrbitingParticles = (
  ctx: CanvasRenderingContext2D,
  particles: OrbitingParticle[],
  moonX: number,
  moonY: number,
) => {
  particles.forEach((p) => {
    p.angle += p.speed;
    const x = moonX + Math.cos(p.angle) * p.distance,
      y = moonY + Math.sin(p.angle) * p.distance;
    const g = ctx.createRadialGradient(x, y, 0, x, y, p.size * 2);
    g.addColorStop(
      0,
      `${p.color}${Math.floor(p.opacity * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(1, `${p.color}00`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, p.size * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.opacity;
    ctx.beginPath();
    ctx.arc(x, y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
};

export const initSparkles = (
  moonX: number,
  moonY: number,
  moonRadius = 40,
): Sparkle[] => {
  return Array.from({ length: 30 }, () => {
    const angle = Math.random() * Math.PI * 2,
      distance = Math.random() * moonRadius;
    return {
      x: moonX + Math.cos(angle) * distance,
      y: moonY + Math.sin(angle) * distance,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.05 + Math.random() * 0.1,
    };
  });
};

export const drawSparkles = (
  ctx: CanvasRenderingContext2D,
  sparkles: Sparkle[],
) => {
  sparkles.forEach((s) => {
    s.twinklePhase += s.twinkleSpeed;
    const o = s.opacity * (Math.sin(s.twinklePhase) * 0.5 + 0.5);
    ctx.strokeStyle = `rgba(255,255,255,${o})`;
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(s.x, s.y - s.size);
    ctx.lineTo(s.x, s.y + s.size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s.x - s.size, s.y);
    ctx.lineTo(s.x + s.size, s.y);
    ctx.stroke();
    const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 2);
    g.addColorStop(0, `rgba(200,230,255,${o})`);
    g.addColorStop(1, "rgba(200,230,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * 2, 0, Math.PI * 2);
    ctx.fill();
  });
};

export const initAuroraWaves = (canvasHeight: number): AuroraWave[] => {
  const colors = ["#4d9988", "#5588aa", "#7766aa", "#996688"];
  return Array.from({ length: 3 }, (_, i) => ({
    y: canvasHeight * 0.2 + i * 50,
    amplitude: 30 + Math.random() * 40,
    frequency: 0.008 + Math.random() * 0.012,
    phase: Math.random() * Math.PI * 2,
    speed: 0.015 + Math.random() * 0.02,
    color: colors[i],
    opacity: 0.08 + Math.random() * 0.08,
  }));
};

export const drawAurora = (
  ctx: CanvasRenderingContext2D,
  waves: AuroraWave[],
  canvasWidth: number,
) => {
  waves.forEach((w) => {
    w.phase += w.speed;
    ctx.beginPath();
    ctx.moveTo(0, w.y);
    for (let x = 0; x <= canvasWidth; x += 5)
      ctx.lineTo(x, w.y + Math.sin(x * w.frequency + w.phase) * w.amplitude);
    const g = ctx.createLinearGradient(
      0,
      w.y - w.amplitude,
      0,
      w.y + w.amplitude,
    );
    g.addColorStop(0, `${w.color}00`);
    g.addColorStop(
      0.5,
      `${w.color}${Math.floor(w.opacity * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(1, `${w.color}00`);
    ctx.strokeStyle = g;
    ctx.lineWidth = 60;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.shadowBlur = 20;
    ctx.shadowColor = w.color;
    ctx.stroke();
    ctx.shadowBlur = 0;
  });
};

export const initFireflies = (
  canvasWidth: number,
  canvasHeight: number,
  count = 20,
): Firefly[] => {
  return Array.from({ length: count }, () => {
    const x = Math.random() * canvasWidth,
      y = canvasHeight * 0.5 + Math.random() * canvasHeight * 0.4;
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: 2 + Math.random() * 2,
      opacity: 0,
      blinkPhase: Math.random() * Math.PI * 2,
      blinkSpeed: 0.05 + Math.random() * 0.05,
      targetX: x,
      targetY: y,
    };
  });
};

export const drawFireflies = (
  ctx: CanvasRenderingContext2D,
  fireflies: Firefly[],
  canvasWidth: number,
  canvasHeight: number,
) => {
  fireflies.forEach((f) => {
    f.blinkPhase += f.blinkSpeed;
    f.opacity = Math.max(0, Math.sin(f.blinkPhase)) * 0.8;
    if (Math.random() < 0.02) {
      f.targetX = Math.random() * canvasWidth;
      f.targetY = canvasHeight * 0.5 + Math.random() * canvasHeight * 0.4;
    }
    f.vx += (f.targetX - f.x) * 0.001;
    f.vy += (f.targetY - f.y) * 0.001;
    f.vx *= 0.95;
    f.vy *= 0.95;
    f.x += f.vx;
    f.y += f.vy;
    if (f.opacity > 0) {
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 3);
      g.addColorStop(0, `rgba(255,255,150,${f.opacity})`);
      g.addColorStop(0.5, `rgba(255,200,100,${f.opacity * 0.5})`);
      g.addColorStop(1, "rgba(255,200,100,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,200,${f.opacity})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
    }
  });
};

export const initSnowflakes = (
  canvasWidth: number,
  count = 50,
): Snowflake[] => {
  return Array.from({ length: count }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * -100,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 0.5 + 0.3,
    drift: (Math.random() - 0.5) * 0.5,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    opacity: Math.random() * 0.6 + 0.4,
  }));
};

export const drawSnowflakes = (
  ctx: CanvasRenderingContext2D,
  snowflakes: Snowflake[],
  canvasWidth: number,
  canvasHeight: number,
) => {
  snowflakes.forEach((s) => {
    s.y += s.speed;
    s.x += s.drift;
    s.rotation += s.rotationSpeed;
    if (s.y > canvasHeight) {
      s.y = -10;
      s.x = Math.random() * canvasWidth;
    }
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotation);
    ctx.globalAlpha = s.opacity;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, s.size * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, s.size);
      ctx.lineTo(-s.size * 0.5, s.size * 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, s.size);
      ctx.lineTo(s.size * 0.5, s.size * 1.5);
      ctx.stroke();
    }
    ctx.restore();
  });
};

export const initFogLayers = (
  canvasWidth: number,
  canvasHeight: number,
): FogLayer[] => {
  return Array.from({ length: 3 }, (_, i) => ({
    x: -canvasWidth * 0.5,
    y: canvasHeight * 0.6 + i * 80,
    width: canvasWidth * 2,
    height: 120,
    speed: 0.1 + i * 0.05,
    opacity: 0.1 + i * 0.05,
    color: "#cccccc",
  }));
};

export const drawFog = (
  ctx: CanvasRenderingContext2D,
  layers: FogLayer[],
  canvasWidth: number,
) => {
  layers.forEach((l) => {
    l.x += l.speed;
    if (l.x > canvasWidth) l.x = -l.width + canvasWidth;
    const g = ctx.createLinearGradient(l.x, l.y, l.x + l.width, l.y);
    g.addColorStop(0, `${l.color}00`);
    g.addColorStop(
      0.3,
      `${l.color}${Math.floor(l.opacity * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(
      0.7,
      `${l.color}${Math.floor(l.opacity * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(1, `${l.color}00`);
    ctx.fillStyle = g;
    ctx.fillRect(l.x, l.y, l.width, l.height);
  });
};
