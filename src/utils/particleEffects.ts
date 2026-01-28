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

// Shattered Moon effect interfaces
export interface MoonCrack {
  startAngle: number;
  length: number;
  width: number;
  branches: { angle: number; length: number }[];
  opacity: number;
}

export interface MoonFragment {
  x: number;
  y: number;
  size: number;
  angle: number;
  distance: number;
  orbitSpeed: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export interface ShatterDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
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
  return Array.from({ length: 50 }, () => {
    const angle = Math.random() * Math.PI * 2,
      distance = Math.random() * moonRadius * 1.8;
    return {
      x: moonX + Math.cos(angle) * distance,
      y: moonY + Math.sin(angle) * distance,
      size: Math.random() * 4 + 1.5,
      opacity: Math.random() * 0.9 + 0.3,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.03 + Math.random() * 0.05,
    };
  });
};

export const drawSparkles = (
  ctx: CanvasRenderingContext2D,
  sparkles: Sparkle[],
) => {
  sparkles.forEach((sparkle) => {
    // Update twinkle animation
    sparkle.twinklePhase += sparkle.twinkleSpeed;
    const twinkle = (Math.sin(sparkle.twinklePhase) + 1) / 2; // 0-1
    const currentOpacity = sparkle.opacity * twinkle;

    if (currentOpacity > 0.1) {
      ctx.save();
      ctx.translate(sparkle.x, sparkle.y);
      ctx.rotate(sparkle.twinklePhase * 0.2);

      // Outer rainbow refraction glow
      const rainbowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, sparkle.size * 6);
      const hue = (sparkle.twinklePhase * 50) % 360;
      rainbowGradient.addColorStop(0, `hsla(${hue}, 70%, 85%, ${currentOpacity * 0.4})`);
      rainbowGradient.addColorStop(0.3, `hsla(${hue + 60}, 60%, 80%, ${currentOpacity * 0.3})`);
      rainbowGradient.addColorStop(0.6, `hsla(${hue + 120}, 50%, 75%, ${currentOpacity * 0.2})`);
      rainbowGradient.addColorStop(1, `rgba(176, 192, 224, 0)`);
      
      ctx.fillStyle = rainbowGradient;
      ctx.beginPath();
      ctx.arc(0, 0, sparkle.size * 6, 0, Math.PI * 2);
      ctx.fill();

      // Main crystal glow (blue-white)
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, sparkle.size * 4);
      gradient.addColorStop(0, `rgba(240, 248, 255, ${currentOpacity})`);
      gradient.addColorStop(0.4, `rgba(200, 220, 255, ${currentOpacity * 0.7})`);
      gradient.addColorStop(0.7, `rgba(176, 192, 224, ${currentOpacity * 0.4})`);
      gradient.addColorStop(1, `rgba(176, 192, 224, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, sparkle.size * 4, 0, Math.PI * 2);
      ctx.fill();

      // Hexagonal crystal shape
      ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.8})`;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * sparkle.size * 1.2;
        const y = Math.sin(angle) * sparkle.size * 1.2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Inner hexagon (darker)
      ctx.fillStyle = `rgba(200, 220, 255, ${currentOpacity * 0.6})`;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * sparkle.size * 0.6;
        const y = Math.sin(angle) * sparkle.size * 0.6;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Bright center point
      ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
      ctx.beginPath();
      ctx.arc(0, 0, sparkle.size * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Crystal rays (6-pointed star for hexagonal crystal)
      ctx.strokeStyle = `rgba(240, 248, 255, ${currentOpacity * 0.9})`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const length = sparkle.size * 6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
        ctx.stroke();
      }

      // Secondary thinner rays (12-pointed)
      ctx.strokeStyle = `rgba(200, 220, 255, ${currentOpacity * 0.5})`;
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6 + Math.PI / 12;
        const length = sparkle.size * 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
        ctx.stroke();
      }

      ctx.restore();
    }
  });
};

export const initAuroraWaves = (canvasHeight: number): AuroraWave[] => {
  // Authentic aurora colors - only green/teal tones
  const colors = ["#00ff88", "#00ddaa", "#00ccbb"];
  return Array.from({ length: 3 }, (_, i) => ({
    y: canvasHeight * 0.3 + i * 80, // Spread vertically across middle-top area
    amplitude: 25 + Math.random() * 20,
    frequency: 0.003 + Math.random() * 0.004,
    phase: Math.random() * Math.PI * 2, // Random starting phase for variety
    speed: 0.004 + Math.random() * 0.005, // Slower
    color: colors[i],
    opacity: 0.08 + Math.random() * 0.06, // Much more subtle
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

    // Horizontal gradient spanning full width for even distribution
    const g = ctx.createLinearGradient(0, w.y, canvasWidth, w.y);

    // Smooth fade across entire width
    g.addColorStop(
      0,
      `${w.color}${Math.floor(pulseOpacity * 0.4 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(
      0.25,
      `${w.color}${Math.floor(pulseOpacity * 0.7 * 255)
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
      0.75,
      `${w.color}${Math.floor(pulseOpacity * 0.7 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    g.addColorStop(
      1,
      `${w.color}${Math.floor(pulseOpacity * 0.4 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );

    // Draw main curtain with soft glow
    ctx.strokeStyle = g;
    ctx.lineWidth = 70;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 40;
    ctx.shadowColor = w.color;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Add vertical gradient overlay for curtain effect
    const verticalGradient = ctx.createLinearGradient(
      0,
      w.y - w.amplitude * 2,
      0,
      w.y + w.amplitude * 3,
    );
    verticalGradient.addColorStop(0, `${w.color}00`); // Transparent top
    verticalGradient.addColorStop(
      0.2,
      `${w.color}${Math.floor(pulseOpacity * 0.5 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    verticalGradient.addColorStop(
      0.5,
      `${w.color}${Math.floor(pulseOpacity * 0.8 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    verticalGradient.addColorStop(
      0.8,
      `${w.color}${Math.floor(pulseOpacity * 0.4 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    verticalGradient.addColorStop(1, `${w.color}00`); // Transparent bottom

    // Second layer with vertical gradient
    ctx.strokeStyle = verticalGradient;
    ctx.lineWidth = 50;
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Add subtle shimmer particles along the wave
    if (Math.random() < 0.3) {
      for (let i = 0; i < 3; i++) {
        const shimmerX = Math.random() * canvasWidth;
        const shimmerY =
          w.y + Math.sin(shimmerX * w.frequency + w.phase) * w.amplitude;
        const shimmerSize = 2 + Math.random() * 3;

        const shimmerGrad = ctx.createRadialGradient(
          shimmerX,
          shimmerY,
          0,
          shimmerX,
          shimmerY,
          shimmerSize * 3,
        );
        shimmerGrad.addColorStop(
          0,
          `rgba(255, 255, 255, ${pulseOpacity * 0.6})`,
        );
        shimmerGrad.addColorStop(
          0.5,
          `${w.color}${Math.floor(pulseOpacity * 0.4 * 255)
            .toString(16)
            .padStart(2, "0")}`,
        );
        shimmerGrad.addColorStop(1, `${w.color}00`);

        ctx.fillStyle = shimmerGrad;
        ctx.beginPath();
        ctx.arc(shimmerX, shimmerY, shimmerSize * 3, 0, Math.PI * 2);
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

/**
 * ========================================
 * SHATTERED MOON EFFECTS
 * ========================================
 */

/**
 * Initialize Moon Cracks for Shattered Moon
 */
export const initMoonCracks = (count = 5): MoonCrack[] => {
  const cracks: MoonCrack[] = [];

  for (let i = 0; i < count; i++) {
    const startAngle =
      ((Math.PI * 2) / count) * i + (Math.random() - 0.5) * 0.4;
    // สร้างรอยแตกที่มีความยาวแตกต่างกัน - ดูเป็นธรรมชาติ
    const crackType = Math.random();
    let length, width;

    if (crackType < 0.3) {
      // รอยแตกยาวมาก (30%)
      length = 50 + Math.random() * 40;
      width = 2 + Math.random() * 1.5;
    } else if (crackType < 0.7) {
      // รอยแตกปานกลาง (40%)
      length = 35 + Math.random() * 25;
      width = 1.8 + Math.random() * 1.2;
    } else {
      // รอยแตกสั้น (30%)
      length = 20 + Math.random() * 20;
      width = 1.5 + Math.random() * 1;
    }

    const crack: MoonCrack = {
      startAngle,
      length,
      width,
      branches: [],
      opacity: 0.7 + Math.random() * 0.3,
    };

    // กิ่งแตกที่หลากหลาย - รอยยาวมีกิ่งเยอะ รอยสั้นมีกิ่งน้อย
    const branchCount =
      crackType < 0.3
        ? 2 + Math.floor(Math.random() * 3)
        : crackType < 0.7
          ? 1 + Math.floor(Math.random() * 2)
          : Math.floor(Math.random() * 2);

    for (let j = 0; j < branchCount; j++) {
      crack.branches.push({
        angle: (Math.random() - 0.5) * 0.7,
        length: 10 + Math.random() * (length * 0.4),
      });
    }

    cracks.push(crack);
  }

  return cracks;
};

/**
 * Initialize Floating Moon Fragments
 */
export const initMoonFragments = (
  moonX: number,
  moonY: number,
  count = 12,
): MoonFragment[] => {
  const fragments: MoonFragment[] = [];

  for (let i = 0; i < count; i++) {
    const angle = ((Math.PI * 2) / count) * i + (Math.random() - 0.5) * 0.4;
    const distance = 60 + Math.random() * 45; // ลอยออกไปไกลขึ้น

    fragments.push({
      x: moonX + Math.cos(angle) * distance,
      y: moonY + Math.sin(angle) * distance,
      size: 5 + Math.random() * 8, // ใหญ่ขึ้น
      angle,
      distance,
      orbitSpeed: 0.0008 + Math.random() * 0.0015, // ช้าลงนิดหน่อย
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.025,
      opacity: 0.7 + Math.random() * 0.3, // โปร่งใสน้อยลง
    });
  }

  return fragments;
};

/**
 * Initialize Shatter Dust Particles
 */
export const initShatterDust = (
  moonX: number,
  moonY: number,
  count = 25,
): ShatterDust[] => {
  const dust: ShatterDust[] = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.15 + Math.random() * 0.3; // Slower movement

    dust.push({
      x: moonX + (Math.random() - 0.5) * 90,
      y: moonY + (Math.random() - 0.5) * 90,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 0.8 + Math.random() * 1.5, // Smaller particles
      opacity: 0.2 + Math.random() * 0.3, // More subtle
      life: 0,
      maxLife: 120 + Math.random() * 120, // Longer life
    });
  }

  return dust;
};

/**
 * Draw Moon Cracks on the moon surface
 */
export const drawMoonCracks = (
  ctx: CanvasRenderingContext2D,
  cracks: MoonCrack[],
  moonX: number,
  moonY: number,
  moonRadius: number,
  moonColor: string,
) => {
  ctx.save();

  cracks.forEach((crack) => {
    // เริ่มรอยแตกจากใกล้ขอบดวงจันทร์
    const startRadius = moonRadius * (0.3 + Math.random() * 0.4);
    const startX = moonX + Math.cos(crack.startAngle) * startRadius;
    const startY = moonY + Math.sin(crack.startAngle) * startRadius;
    const endX =
      moonX + Math.cos(crack.startAngle) * (startRadius + crack.length);
    const endY =
      moonY + Math.sin(crack.startAngle) * (startRadius + crack.length);

    // Layer 1: เงาลึกของรอยแตก (ดูเหมือนรอยแตกจริงๆ)
    ctx.strokeStyle = `rgba(10, 10, 20, ${crack.opacity * 0.95})`;
    ctx.lineWidth = crack.width + 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 12;
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Layer 2: รอยแตกหลัก
    ctx.strokeStyle = `rgba(25, 25, 40, ${crack.opacity})`;
    ctx.lineWidth = crack.width;
    ctx.shadowBlur = 0;
    ctx.stroke();

    // Layer 3: แสงส่องผ่านรอยแตก (inner glow) - สีน้ำเงินอมม่วงนุ่มนวล
    const innerGlow = ctx.createLinearGradient(startX, startY, endX, endY);
    innerGlow.addColorStop(0, `rgba(200, 220, 255, ${crack.opacity * 0.25})`);
    innerGlow.addColorStop(0.5, `rgba(180, 200, 255, ${crack.opacity * 0.4})`);
    innerGlow.addColorStop(1, `rgba(160, 180, 255, ${crack.opacity * 0.2})`);
    ctx.strokeStyle = innerGlow;
    ctx.lineWidth = crack.width * 0.6;
    ctx.shadowBlur = 8;
    ctx.shadowColor = `rgba(180, 200, 255, ${crack.opacity * 0.6})`;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Layer 4: ขอบรอยแตกเรืองแสงเล็กน้อย
    ctx.strokeStyle = `rgba(220, 230, 255, ${crack.opacity * 0.15})`;
    ctx.lineWidth = crack.width + 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `rgba(200, 220, 255, ${crack.opacity * 0.3})`;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // เพิ่ม sparkle particles ตามรอยแตก
    const sparkleCount = Math.floor(crack.length / 15);
    for (let i = 0; i < sparkleCount; i++) {
      const ratio = (i + 0.5) / sparkleCount;
      const sparkleX = startX + (endX - startX) * ratio;
      const sparkleY = startY + (endY - startY) * ratio;

      if (Math.random() < 0.4) {
        const sparkleGrad = ctx.createRadialGradient(
          sparkleX,
          sparkleY,
          0,
          sparkleX,
          sparkleY,
          2.5,
        );
        sparkleGrad.addColorStop(
          0,
          `rgba(255, 255, 255, ${crack.opacity * 0.5})`,
        );
        sparkleGrad.addColorStop(
          0.5,
          `rgba(200, 220, 255, ${crack.opacity * 0.3})`,
        );
        sparkleGrad.addColorStop(1, "rgba(200, 220, 255, 0)");
        ctx.fillStyle = sparkleGrad;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // วาดกิ่งแยก
    crack.branches.forEach((branch) => {
      const branchStartRatio = 0.25 + Math.random() * 0.5;
      const branchStartX = startX + (endX - startX) * branchStartRatio;
      const branchStartY = startY + (endY - startY) * branchStartRatio;

      const branchAngle = crack.startAngle + branch.angle;
      const branchEndX = branchStartX + Math.cos(branchAngle) * branch.length;
      const branchEndY = branchStartY + Math.sin(branchAngle) * branch.length;

      // เงากิ่ง
      ctx.strokeStyle = `rgba(10, 10, 20, ${crack.opacity * 0.8})`;
      ctx.lineWidth = crack.width * 0.8 + 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.beginPath();
      ctx.moveTo(branchStartX, branchStartY);
      ctx.lineTo(branchEndX, branchEndY);
      ctx.stroke();

      // กิ่งหลัก
      ctx.strokeStyle = `rgba(25, 25, 40, ${crack.opacity * 0.85})`;
      ctx.lineWidth = crack.width * 0.7;
      ctx.shadowBlur = 0;
      ctx.stroke();

      // แสงในกิ่ง
      ctx.strokeStyle = `rgba(180, 200, 255, ${crack.opacity * 0.3})`;
      ctx.lineWidth = crack.width * 0.5;
      ctx.shadowBlur = 6;
      ctx.shadowColor = `rgba(180, 200, 255, ${crack.opacity * 0.4})`;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ขอบเรืองแสงกิ่ง
      ctx.strokeStyle = `rgba(220, 230, 255, ${crack.opacity * 0.12})`;
      ctx.lineWidth = crack.width * 0.8 + 1.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgba(200, 220, 255, ${crack.opacity * 0.25})`;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
  });

  ctx.restore();
};

/**
 * Draw and update Floating Moon Fragments
 */
export const drawMoonFragments = (
  ctx: CanvasRenderingContext2D,
  fragments: MoonFragment[],
  moonX: number,
  moonY: number,
  moonColor: string,
) => {
  fragments.forEach((frag) => {
    // Update orbit
    frag.angle += frag.orbitSpeed;
    frag.rotation += frag.rotationSpeed;

    // Calculate position
    frag.x = moonX + Math.cos(frag.angle) * frag.distance;
    frag.y = moonY + Math.sin(frag.angle) * frag.distance;

    ctx.save();
    ctx.translate(frag.x, frag.y);
    ctx.rotate(frag.rotation);

    // วาดเงาของเศษดวงจันทร์
    ctx.fillStyle = `rgba(0, 0, 0, ${frag.opacity * 0.4})`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.beginPath();
    const sides = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < sides; i++) {
      const angle = ((Math.PI * 2) / sides) * i;
      const radius = frag.size * (0.8 + Math.random() * 0.5);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // วาดเศษดวงจันทร์หลัก
    ctx.fillStyle = `${moonColor}${Math.floor(frag.opacity * 255)
      .toString(16)
      .padStart(2, "0")}`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = moonColor;
    ctx.fill();

    // เพิ่มขอบเรืองแสง
    ctx.strokeStyle = `rgba(255, 255, 255, ${frag.opacity * 0.6})`;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 5;
    ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
    ctx.stroke();

    // วาดไฮไลท์ตรงกลาง
    const highlightGrad = ctx.createRadialGradient(
      0,
      0,
      0,
      0,
      0,
      frag.size * 0.6,
    );
    highlightGrad.addColorStop(0, `rgba(255, 255, 255, ${frag.opacity * 0.4})`);
    highlightGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = highlightGrad;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(0, 0, frag.size * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
};

/**
 * Draw and update Shatter Dust
 */
export const drawShatterDust = (
  ctx: CanvasRenderingContext2D,
  dust: ShatterDust[],
  moonColor: string,
  moonX?: number,
  moonY?: number,
) => {
  dust.forEach((particle) => {
    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life++;

    // Fade out over time
    const lifeFactor = 1 - particle.life / particle.maxLife;
    const currentOpacity = particle.opacity * lifeFactor;

    if (particle.life < particle.maxLife && currentOpacity > 0.01) {
      // วาดเรืองแสงรอบๆ ละออง
      const glowGrad = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size * 4,
      );
      glowGrad.addColorStop(
        0,
        `${moonColor}${Math.floor(currentOpacity * 0.8 * 255)
          .toString(16)
          .padStart(2, "0")}`,
      );
      glowGrad.addColorStop(
        0.5,
        `${moonColor}${Math.floor(currentOpacity * 0.3 * 255)
          .toString(16)
          .padStart(2, "0")}`,
      );
      glowGrad.addColorStop(1, `${moonColor}00`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
      ctx.fill();

      // วาดละอองหลัก
      ctx.fillStyle = `${moonColor}${Math.floor(currentOpacity * 255)
        .toString(16)
        .padStart(2, "0")}`;
      ctx.shadowBlur = 5;
      ctx.shadowColor = moonColor;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // เพิ่มประกายเล็กๆ
      if (Math.random() < 0.15) {
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Reset particle when it dies - สร้างตำแหน่งใหม่รอบๆ ดวงจันทร์
    if (particle.life >= particle.maxLife) {
      if (moonX !== undefined && moonY !== undefined) {
        const resetAngle = Math.random() * Math.PI * 2;
        const resetDistance = 70 + Math.random() * 30;
        particle.x = moonX + Math.cos(resetAngle) * resetDistance;
        particle.y = moonY + Math.sin(resetAngle) * resetDistance;

        const speed = 0.15 + Math.random() * 0.35;
        const moveAngle = Math.random() * Math.PI * 2;
        particle.vx = Math.cos(moveAngle) * speed;
        particle.vy = Math.sin(moveAngle) * speed;
      }
      particle.life = 0;
      particle.opacity = 0.35 + Math.random() * 0.45;
    }
  });
};
