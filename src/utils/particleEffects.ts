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
  wave: number;
  waveSpeed: number;
}
export interface MeteorShowerParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  color: string;
  active: boolean;
}
export interface FrozenTimeParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
  freezePoint: number;
  isFrozen: boolean;
  trailLength: number;
  color: string;
}
export interface VoidRipple {
  radius: number;
  maxRadius: number;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
  centerX: number;
  centerY: number;
  speed: number;
  thickness: number;
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

export const initOrbitingParticles = (
  count = 20,
  color1 = "#B84060",
  color2 = "#d85080",
  minSpeed = 0.01,
  maxSpeed = 0.02,
): OrbitingParticle[] => {
  return Array.from({ length: count }, (_, i) => ({
    angle: (Math.PI * 2 * i) / count,
    distance: 50 + Math.random() * 30,
    size: Math.random() * 3 + 1,
    speed: minSpeed + Math.random() * (maxSpeed - minSpeed),
    color: i % 2 === 0 ? color1 : color2,
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
  const colors = ["#40E0D0", "#00CED1", "#48D1CC", "#20B2AA", "#5F9EA0"];
  return Array.from({ length: 5 }, (_, i) => ({
    y: canvasHeight * 0.15 + i * 35,
    amplitude: 40 + Math.random() * 60,
    frequency: 0.006 + Math.random() * 0.008,
    phase: Math.random() * Math.PI * 2,
    speed: 0.012 + Math.random() * 0.015,
    color: colors[i],
    opacity: 0.12 + Math.random() * 0.12,
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

    // Multi-layer gradient for depth
    const g = ctx.createLinearGradient(
      0,
      w.y - w.amplitude * 1.8,
      0,
      w.y + w.amplitude * 1.8,
    );
    g.addColorStop(0, `${w.color}00`);
    g.addColorStop(
      0.15,
      `${w.color}${Math.floor(pulseOpacity * 0.2 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(
      0.35,
      `${w.color}${Math.floor(pulseOpacity * 0.6 * 255)
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
      0.65,
      `${w.color}${Math.floor(pulseOpacity * 0.6 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(
      0.85,
      `${w.color}${Math.floor(pulseOpacity * 0.2 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(1, `${w.color}00`);

    // Draw main curtain with glow
    ctx.strokeStyle = g;
    ctx.lineWidth = 90;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 50;
    ctx.shadowColor = w.color;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Add inner detail layer with different opacity
    ctx.lineWidth = 50;
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Dancing light particles along the aurora
    for (let particleIdx = 0; particleIdx < 8; particleIdx++) {
      if (Math.random() < 0.4) {
        const particleX =
          (canvasWidth / 8) * particleIdx +
          Math.sin(w.phase * 2 + particleIdx) * 30;
        const particleY =
          w.y + Math.sin(particleX * w.frequency + w.phase) * w.amplitude;
        const particleSize = 8 + Math.random() * 12;

        const particleGrad = ctx.createRadialGradient(
          particleX,
          particleY,
          0,
          particleX,
          particleY,
          particleSize,
        );
        const particleOpacity = pulseOpacity * (0.8 + Math.random() * 0.4);
        particleGrad.addColorStop(0, `rgba(255, 255, 255, ${particleOpacity})`);
        particleGrad.addColorStop(
          0.3,
          `${w.color}${Math.floor(particleOpacity * 200)
            .toString(16)
            .padStart(2, "0")}`,
        );
        particleGrad.addColorStop(1, `${w.color}00`);

        ctx.fillStyle = particleGrad;
        ctx.beginPath();
        ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Vertical light rays (aurora pillars)
    if (Math.random() < 0.15) {
      const rayCount = 2 + Math.floor(Math.random() * 3);
      for (let r = 0; r < rayCount; r++) {
        const rayX = Math.random() * canvasWidth;
        const rayBaseY =
          w.y + Math.sin(rayX * w.frequency + w.phase) * w.amplitude;
        const rayHeight = 150 + Math.random() * 200;
        const rayWidth = 12 + Math.random() * 18;

        const rayGrad = ctx.createLinearGradient(
          rayX,
          rayBaseY - rayHeight * 0.7,
          rayX,
          rayBaseY + rayHeight * 0.3,
        );
        rayGrad.addColorStop(0, `${w.color}00`);
        rayGrad.addColorStop(
          0.3,
          `${w.color}${Math.floor(pulseOpacity * 0.4 * 255)
            .toString(16)
            .padStart(2, "0")}`,
        );
        rayGrad.addColorStop(
          0.6,
          `${w.color}${Math.floor(pulseOpacity * 0.6 * 255)
            .toString(16)
            .padStart(2, "0")}`,
        );
        rayGrad.addColorStop(1, `${w.color}00`);

        ctx.fillStyle = rayGrad;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(
          rayX - rayWidth / 2,
          rayBaseY - rayHeight * 0.7,
          rayWidth,
          rayHeight,
        );
        ctx.globalAlpha = 1;
      }
    }

    // Shimmering edge highlights
    if (index === 0 || index === waves.length - 1) {
      for (let shimmer = 0; shimmer < 5; shimmer++) {
        const shimmerPhase = w.phase + shimmer * 0.5;
        const shimmerX =
          (canvasWidth / 5) * shimmer + Math.sin(shimmerPhase) * 40;
        const shimmerY =
          w.y + Math.sin(shimmerX * w.frequency + w.phase) * w.amplitude;

        ctx.fillStyle = `rgba(255, 255, 255, ${pulseOpacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(shimmerX, shimmerY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
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
  const colors = ["#f0e8e0", "#e8d8d0", "#d8c8c0"];
  return Array.from({ length: 5 }, (_, i) => ({
    x: -canvasWidth - Math.random() * canvasWidth * 0.5,
    y: canvasHeight * 0.5 + i * 40,
    width: canvasWidth * 2.5,
    height: 100 + i * 20,
    speed: 0.06 + i * 0.04,
    opacity: 0.1 + i * 0.04,
    color: colors[i % colors.length],
    wave: Math.random() * Math.PI * 2,
    waveSpeed: 0.01 + Math.random() * 0.01,
  }));
};

export const drawFog = (
  ctx: CanvasRenderingContext2D,
  layers: FogLayer[],
  canvasWidth: number,
) => {
  layers.forEach((l, i) => {
    l.x += l.speed;
    l.wave += l.waveSpeed;
    if (l.x > canvasWidth * 0.3) l.x = -l.width;

    const waveOffset = Math.sin(l.wave) * 15;
    const currentY = l.y + waveOffset;

    const g = ctx.createRadialGradient(
      l.x + l.width * 0.5,
      currentY + l.height * 0.5,
      0,
      l.x + l.width * 0.5,
      currentY + l.height * 0.5,
      l.width * 0.6,
    );
    g.addColorStop(
      0,
      `${l.color}${Math.floor(l.opacity * 255 * 0.5)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(
      0.3,
      `${l.color}${Math.floor(l.opacity * 255 * 0.9)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(
      0.7,
      `${l.color}${Math.floor(l.opacity * 255 * 0.4)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(1, `${l.color}00`);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g;
    ctx.fillRect(l.x, currentY, l.width, l.height);

    if (i % 2 === 0 && Math.random() < 0.02) {
      const sparkleX = l.x + Math.random() * l.width;
      const sparkleY = currentY + Math.random() * l.height;
      const sparkleG = ctx.createRadialGradient(
        sparkleX,
        sparkleY,
        0,
        sparkleX,
        sparkleY,
        3,
      );
      sparkleG.addColorStop(0, "rgba(255,255,255,0.3)");
      sparkleG.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sparkleG;
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
};

export const initMeteorShower = (
  canvasWidth: number,
  canvasHeight: number,
  count = 15,
): MeteorShowerParticle[] => {
  const colors = ["#ff9966", "#ffcc66", "#ff6666", "#ffaa88", "#ff8844"];
  return Array.from({ length: count }, (_, i) => ({
    x: canvasWidth * 0.5 + Math.random() * canvasWidth * 0.5,
    y: -Math.random() * 300 - i * 20,
    vx: -4 - Math.random() * 3,
    vy: 6 + Math.random() * 3,
    length: 50 + Math.random() * 80,
    opacity: 0.8 + Math.random() * 0.2,
    color: colors[Math.floor(Math.random() * colors.length)],
    active: i < count * 0.6,
  }));
};

export const drawMeteorShower = (
  ctx: CanvasRenderingContext2D,
  meteors: MeteorShowerParticle[],
  canvasWidth: number,
  canvasHeight: number,
) => {
  meteors.forEach((m) => {
    if (!m.active) {
      if (Math.random() < 0.02) m.active = true;
      return;
    }
    m.x += m.vx;
    m.y += m.vy;
    if (m.x < -m.length || m.y > canvasHeight + 50) {
      m.x = canvasWidth * 0.7 + Math.random() * canvasWidth * 0.3;
      m.y = -Math.random() * 200;
      m.active = true;
    }
    ctx.save();
    ctx.globalAlpha = m.opacity;
    const g = ctx.createLinearGradient(
      m.x,
      m.y,
      m.x - m.vx * 10,
      m.y - m.vy * 10,
    );
    g.addColorStop(0, m.color);
    g.addColorStop(0.5, `${m.color}aa`);
    g.addColorStop(1, `${m.color}00`);
    ctx.strokeStyle = g;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x - m.vx * 10, m.y - m.vy * 10);
    ctx.stroke();
    const gg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 6);
    gg.addColorStop(0, "#fff");
    gg.addColorStop(0.3, m.color);
    gg.addColorStop(1, `${m.color}00`);
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.arc(m.x, m.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
};

export const initFrozenTime = (
  canvasWidth: number,
  canvasHeight: number,
  count = 40,
): FrozenTimeParticle[] => {
  return Array.from({ length: count }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    size: Math.random() * 4 + 2,
    opacity: 0,
    lifetime: 0,
    maxLifetime: 180 + Math.random() * 120,
    freezePoint: 60 + Math.random() * 40,
    isFrozen: false,
    trailLength: Math.random() * 20 + 10,
    color: Math.random() > 0.5 ? "#B0C4DE" : "#7090b0",
  }));
};

export const drawFrozenTime = (
  ctx: CanvasRenderingContext2D,
  particles: FrozenTimeParticle[],
) => {
  particles.forEach((p) => {
    p.lifetime++;

    // Fade in phase
    if (p.lifetime < 30) {
      p.opacity = p.lifetime / 30;
    }
    // Freeze phase - stop and stay visible
    else if (p.lifetime >= p.freezePoint && p.lifetime < p.freezePoint + 90) {
      if (!p.isFrozen) p.isFrozen = true;
      p.opacity = 0.8;
    }
    // Fade out phase
    else if (p.lifetime >= p.freezePoint + 90) {
      p.opacity = Math.max(0, 1 - (p.lifetime - p.freezePoint - 90) / 60);
    }
    // Moving phase
    else {
      p.opacity = 0.6;
      p.y -= 0.3;
    }

    // Reset particle
    if (p.lifetime >= p.maxLifetime) {
      p.lifetime = 0;
      p.y = Math.random() * ctx.canvas.height;
      p.x = Math.random() * ctx.canvas.width;
      p.freezePoint = 60 + Math.random() * 40;
      p.isFrozen = false;
    }

    if (p.opacity > 0) {
      // Draw trail when moving
      if (!p.isFrozen && p.lifetime >= 30 && p.lifetime < p.freezePoint) {
        const trailGrad = ctx.createLinearGradient(
          p.x,
          p.y,
          p.x,
          p.y + p.trailLength,
        );
        trailGrad.addColorStop(
          0,
          `${p.color}${Math.floor(p.opacity * 180)
            .toString(16)
            .padStart(2, "0")}`,
        );
        trailGrad.addColorStop(1, `${p.color}00`);
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y + p.trailLength);
        ctx.stroke();
      }

      // Draw main particle
      const opacityHex = Math.floor(p.opacity * 255)
        .toString(16)
        .padStart(2, "0");
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      glow.addColorStop(0, `${p.color}${opacityHex}`);
      glow.addColorStop(
        0.4,
        `${p.color}${Math.floor(p.opacity * 150)
          .toString(16)
          .padStart(2, "0")}`,
      );
      glow.addColorStop(1, `${p.color}00`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Bright core
      ctx.fillStyle = `#ffffff${Math.floor(p.opacity * 200)
        .toString(16)
        .padStart(2, "0")}`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Frozen state - add crystalline effect
      if (p.isFrozen) {
        ctx.strokeStyle = `${p.color}${Math.floor(p.opacity * 120)
          .toString(16)
          .padStart(2, "0")}`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(
            p.x + Math.cos(angle) * p.size * 2.5,
            p.y + Math.sin(angle) * p.size * 2.5,
          );
          ctx.stroke();
        }
      }
    }
  });
};

export const initVoidRipples = (): VoidRipple[] => [];

export const spawnVoidRipple = (
  centerX: number,
  centerY: number,
  moonRadius: number,
): VoidRipple => ({
  radius: moonRadius * 0.5,
  maxRadius: moonRadius * 5 + Math.random() * moonRadius * 3,
  opacity: 1,
  lifetime: 0,
  maxLifetime: 120 + Math.random() * 80,
  centerX,
  centerY,
  speed: 0.8 + Math.random() * 0.6,
  thickness: 2 + Math.random() * 2,
});

export const drawVoidRipples = (
  ctx: CanvasRenderingContext2D,
  ripples: VoidRipple[],
  moonX: number,
  moonY: number,
): VoidRipple[] => {
  return ripples
    .map((r) => {
      r.lifetime++;
      r.radius += r.speed;

      // Fade calculation
      const fadeInDuration = 20;
      const fadeOutStart = r.maxLifetime - 40;

      if (r.lifetime < fadeInDuration) {
        r.opacity = r.lifetime / fadeInDuration;
      } else if (r.lifetime > fadeOutStart) {
        r.opacity = Math.max(0, 1 - (r.lifetime - fadeOutStart) / 40);
      } else {
        r.opacity = 0.6 + Math.sin(r.lifetime * 0.1) * 0.2;
      }

      if (r.opacity > 0) {
        // Main ripple circle
        ctx.strokeStyle = `rgba(80, 80, 112, ${r.opacity * 0.4})`;
        ctx.lineWidth = r.thickness;
        ctx.beginPath();
        ctx.arc(r.centerX, r.centerY, r.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow
        ctx.strokeStyle = `rgba(64, 64, 80, ${r.opacity * 0.6})`;
        ctx.lineWidth = r.thickness * 0.5;
        ctx.beginPath();
        ctx.arc(r.centerX, r.centerY, r.radius - r.thickness, 0, Math.PI * 2);
        ctx.stroke();

        // Distortion effect - darker area inside ripple
        const distortionGrad = ctx.createRadialGradient(
          r.centerX,
          r.centerY,
          r.radius - r.thickness * 3,
          r.centerX,
          r.centerY,
          r.radius + r.thickness * 2,
        );
        distortionGrad.addColorStop(0, `rgba(0, 0, 0, 0)`);
        distortionGrad.addColorStop(0.4, `rgba(0, 0, 0, ${r.opacity * 0.15})`);
        distortionGrad.addColorStop(0.6, `rgba(0, 0, 0, ${r.opacity * 0.15})`);
        distortionGrad.addColorStop(1, `rgba(0, 0, 0, 0)`);
        ctx.fillStyle = distortionGrad;
        ctx.beginPath();
        ctx.arc(r.centerX, r.centerY, r.radius, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle particles on the ripple edge
        if (r.lifetime % 8 === 0 && r.opacity > 0.3) {
          const sparkleCount = 3;
          for (let i = 0; i < sparkleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const sx = r.centerX + Math.cos(angle) * r.radius;
            const sy = r.centerY + Math.sin(angle) * r.radius;
            const sparkleGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 3);
            sparkleGrad.addColorStop(
              0,
              `rgba(112, 144, 176, ${r.opacity * 0.8})`,
            );
            sparkleGrad.addColorStop(1, `rgba(112, 144, 176, 0)`);
            ctx.fillStyle = sparkleGrad;
            ctx.beginPath();
            ctx.arc(sx, sy, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      return r;
    })
    .filter((r) => r.lifetime < r.maxLifetime);
};
