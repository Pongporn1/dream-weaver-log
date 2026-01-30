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
  rotation: number;
  rotationSpeed: number;
  frozenIntensity: number;
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

export interface EchoMoon {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  delay: number;
  scale: number;
  phaseOffset: number;
}

// =================== LEGENDARY EFFECTS INTERFACES ===================
export interface BloodRing {
  radius: number;
  opacity: number;
  pulsePhase: number;
  thickness: number;
}

export interface FadeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  fadeSpeed: number;
  lifetime: number;
  maxLifetime: number;
}

export interface SilenceWave {
  radius: number;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
}

export interface DreamDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  floatPhase: number;
  floatSpeed: number;
}

export interface MemoryFragment {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  lifetime: number;
  maxLifetime: number;
  fragmentType: number;
}

export interface AncientRune {
  x: number;
  y: number;
  symbol: string;
  size: number;
  opacity: number;
  rotation: number;
  pulsePhase: number;
  orbitAngle: number;
  orbitSpeed: number;
  orbitRadius: number;
}

export interface LightRay {
  angle: number;
  length: number;
  opacity: number;
  width: number;
  pulsePhase: number;
  speed: number;
}

export interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  trailLength: number;
  color: string;
}

// =================== NEW VISUAL EFFECTS INTERFACES ===================

export interface StarfieldParticle {
  x: number; // -1 to 1 (normalized)
  y: number; // -1 to 1 (normalized)
  z: number; // depth: 0 (far) to 1 (near)
  speed: number;
  size: number;
  brightness: number;
}

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
      const rainbowGradient = ctx.createRadialGradient(
        0,
        0,
        0,
        0,
        0,
        sparkle.size * 6,
      );
      const hue = (sparkle.twinklePhase * 50) % 360;
      rainbowGradient.addColorStop(
        0,
        `hsla(${hue}, 70%, 85%, ${currentOpacity * 0.4})`,
      );
      rainbowGradient.addColorStop(
        0.3,
        `hsla(${hue + 60}, 60%, 80%, ${currentOpacity * 0.3})`,
      );
      rainbowGradient.addColorStop(
        0.6,
        `hsla(${hue + 120}, 50%, 75%, ${currentOpacity * 0.2})`,
      );
      rainbowGradient.addColorStop(1, `rgba(176, 192, 224, 0)`);

      ctx.fillStyle = rainbowGradient;
      ctx.beginPath();
      ctx.arc(0, 0, sparkle.size * 6, 0, Math.PI * 2);
      ctx.fill();

      // Main crystal glow (blue-white)
      const gradient = ctx.createRadialGradient(
        0,
        0,
        0,
        0,
        0,
        sparkle.size * 4,
      );
      gradient.addColorStop(0, `rgba(240, 248, 255, ${currentOpacity})`);
      gradient.addColorStop(
        0.4,
        `rgba(200, 220, 255, ${currentOpacity * 0.7})`,
      );
      gradient.addColorStop(
        0.7,
        `rgba(176, 192, 224, ${currentOpacity * 0.4})`,
      );
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

    // Seamless loop: Draw a second instance if near the edge
    if (l.x > 0) {
      // If moving right and part is visible, draw the tile before it
      ctx.fillRect(l.x - l.width, currentY, l.width, l.height);
    } else if (l.x + l.width < canvasWidth) {
       // If moving left (or just standard fill) and gap opens on right
       // Actually for simple forward scrolling (l.speed > 0):
       // When l.x > 0, we need to draw at l.x - l.width to fill the left gap.
       // The original check "if (l.x > canvasWidth * 0.3) l.x = -l.width" was preventing this.
       // We should remove that jump and just let it modulo or wrap.
    }
    
    // Better seamless logic for speed > 0:
    // 1. Draw at current l.x
    // 2. If l.x > 0, draw at l.x - l.width
    // 3. Reset: if l.x >= canvasWidth, l.x -= l.width (or similar)
    
    ctx.fillRect(l.x - l.width, currentY, l.width, l.height); // Always draw the trailing one for seamlessness?
    // Wait, let's simplify.
    // If we just let l.x increment, and use modulo?
    // l.x = (l.x + l.speed) % l.width; but l.x needs to be relative to canvas.
    
    ctx.restore();

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
    size: Math.random() * 5 + 2,
    opacity: 0,
    lifetime: 0,
    maxLifetime: 240 + Math.random() * 180,
    freezePoint: 40 + Math.random() * 30,
    isFrozen: false,
    trailLength: Math.random() * 30 + 15,
    color: Math.random() > 0.5 ? "#B0C4DE" : "#7090b0",
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    frozenIntensity: Math.random() * 0.5 + 0.5,
  }));
};

export const drawFrozenTime = (
  ctx: CanvasRenderingContext2D,
  particles: FrozenTimeParticle[],
) => {
  particles.forEach((p) => {
    p.lifetime++;

    // Fade in phase
    if (p.lifetime < 20) {
      p.opacity = p.lifetime / 20;
      p.y -= 0.5; // Moving down slowly
    }
    // Freeze phase - completely stopped in mid-air
    else if (p.lifetime >= p.freezePoint && p.lifetime < p.freezePoint + 150) {
      if (!p.isFrozen) {
        p.isFrozen = true;
        p.rotationSpeed = 0; // Stop rotation
      }
      p.opacity = 0.9 * p.frozenIntensity;
      // Particle is completely still
    }
    // Fade out phase
    else if (p.lifetime >= p.freezePoint + 150) {
      p.opacity = Math.max(0, 1 - (p.lifetime - p.freezePoint - 150) / 90);
    }
    // Moving phase before freeze
    else {
      p.opacity = 0.7;
      p.y -= 0.4; // Moving upward
      p.rotation += p.rotationSpeed;
    }

    // Reset particle
    if (p.lifetime >= p.maxLifetime) {
      p.lifetime = 0;
      p.y = Math.random() * ctx.canvas.height;
      p.x = Math.random() * ctx.canvas.width;
      p.freezePoint = 40 + Math.random() * 30;
      p.isFrozen = false;
      p.rotation = Math.random() * Math.PI * 2;
      p.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }

    if (p.opacity > 0) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      // Draw trail when moving (before frozen)
      if (!p.isFrozen && p.lifetime >= 20 && p.lifetime < p.freezePoint) {
        const trailGrad = ctx.createLinearGradient(0, 0, 0, p.trailLength);
        trailGrad.addColorStop(
          0,
          `${p.color}${Math.floor(p.opacity * 200)
            .toString(16)
            .padStart(2, "0")}`,
        );
        trailGrad.addColorStop(
          0.5,
          `${p.color}${Math.floor(p.opacity * 100)
            .toString(16)
            .padStart(2, "0")}`,
        );
        trailGrad.addColorStop(1, `${p.color}00`);
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, p.trailLength);
        ctx.stroke();
      }

      // Outer glow
      const glowSize = p.isFrozen ? p.size * 4 : p.size * 3;
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
      glow.addColorStop(
        0,
        `${p.color}${Math.floor(p.opacity * 255)
          .toString(16)
          .padStart(2, "0")}`,
      );
      glow.addColorStop(
        0.3,
        `${p.color}${Math.floor(p.opacity * 180)
          .toString(16)
          .padStart(2, "0")}`,
      );
      glow.addColorStop(1, `${p.color}00`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Main particle body - hexagonal crystal
      ctx.fillStyle = `${p.color}${Math.floor(p.opacity * 230)
        .toString(16)
        .padStart(2, "0")}`;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = Math.cos(angle) * p.size;
        const y = Math.sin(angle) * p.size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Bright core
      ctx.fillStyle = `#ffffff${Math.floor(p.opacity * 255)
        .toString(16)
        .padStart(2, "0")}`;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Frozen state - ice crystal rays and time-stop effect
      if (p.isFrozen) {
        // Ice crystal rays
        ctx.strokeStyle = `rgba(176, 196, 222, ${p.opacity * 0.8})`;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const length = p.size * 3.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
          ctx.stroke();

          // Crystal ends
          ctx.fillStyle = `rgba(220, 235, 255, ${p.opacity * 0.9})`;
          ctx.beginPath();
          ctx.arc(
            Math.cos(angle) * length,
            Math.sin(angle) * length,
            2,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }

        // Time-stop circle effect
        const pulseSize =
          p.size * 2.5 + Math.sin(p.lifetime * 0.05) * p.size * 0.3;
        ctx.strokeStyle = `rgba(176, 196, 222, ${p.opacity * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
        ctx.stroke();

        // Inner ring
        ctx.strokeStyle = `rgba(220, 235, 255, ${p.opacity * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        // Frozen sparkles around the particle
        for (let i = 0; i < 4; i++) {
          const sparkleAngle = (Math.PI / 2) * i + p.lifetime * 0.01;
          const sparkleDistance = pulseSize * 1.2;
          const sx = Math.cos(sparkleAngle) * sparkleDistance;
          const sy = Math.sin(sparkleAngle) * sparkleDistance;

          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.7})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
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

// =================== ECHO MOON EFFECT ===================
export const initEchoMoons = (
  moonX: number,
  moonY: number,
  moonRadius: number,
  count = 4,
): EchoMoon[] => {
  return Array.from({ length: count }, (_, i) => ({
    x: moonX,
    y: moonY,
    radius: moonRadius,
    opacity: 0.6 - i * 0.15,
    delay: i * 15, // Frame delay between echoes
    scale: 1 + i * 0.15,
    phaseOffset: 0,
  }));
};

export const drawEchoMoons = (
  ctx: CanvasRenderingContext2D,
  echoes: EchoMoon[],
  currentMoonX: number,
  currentMoonY: number,
  currentPhase: number,
  moonTint: string,
) => {
  echoes.forEach((echo, index) => {
    // Update echo position with delay (trail behind current moon)
    echo.phaseOffset += 0.001;

    // Smoothly follow the current moon position with delay
    const targetX = currentMoonX;
    const targetY =
      currentMoonY + Math.sin(currentPhase - echo.phaseOffset * 50) * 3;

    echo.x += (targetX - echo.x) * (0.05 / (index + 1));
    echo.y += (targetY - echo.y) * (0.05 / (index + 1));

    // Draw echo moon with fade effect
    const echoRadius = echo.radius * echo.scale;

    // Outer glow
    const outerGlow = ctx.createRadialGradient(
      echo.x,
      echo.y,
      echoRadius * 0.3,
      echo.x,
      echo.y,
      echoRadius * 2,
    );
    outerGlow.addColorStop(
      0,
      `${moonTint}${Math.floor(echo.opacity * 0.4 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    outerGlow.addColorStop(
      0.5,
      `${moonTint}${Math.floor(echo.opacity * 0.2 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    outerGlow.addColorStop(1, `${moonTint}00`);

    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(echo.x, echo.y, echoRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Echo moon body
    const gradient = ctx.createRadialGradient(
      echo.x - echoRadius * 0.25,
      echo.y - echoRadius * 0.25,
      0,
      echo.x,
      echo.y,
      echoRadius,
    );
    gradient.addColorStop(
      0,
      `${moonTint}${Math.floor(echo.opacity * 0.8 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    gradient.addColorStop(
      0.7,
      `${moonTint}${Math.floor(echo.opacity * 0.5 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    gradient.addColorStop(
      1,
      `${moonTint}${Math.floor(echo.opacity * 0.2 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(echo.x, echo.y, echoRadius, 0, Math.PI * 2);
    ctx.fill();

    // Rim light for depth
    ctx.strokeStyle = `rgba(255, 255, 255, ${echo.opacity * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(
      echo.x - echoRadius * 0.3,
      echo.y - echoRadius * 0.3,
      echoRadius * 0.6,
      Math.PI,
      Math.PI * 2,
    );
    ctx.stroke();

    // Sound wave rings
    const wavePhase = (Date.now() / 1000 + index * 0.5) % 2;
    for (let i = 0; i < 3; i++) {
      const waveRadius = echoRadius * (1.2 + wavePhase * 0.5 + i * 0.3);
      const waveOpacity = echo.opacity * (1 - wavePhase / 2) * 0.4;

      if (waveOpacity > 0.05) {
        ctx.strokeStyle = `rgba(208, 208, 232, ${waveOpacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(echo.x, echo.y, waveRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  });
};

// =================== LEGENDARY EFFECTS ===================

// Blood Ring Effect
export const initBloodRings = (moonRadius: number): BloodRing[] => {
  return Array.from({ length: 3 }, (_, i) => ({
    radius: moonRadius * (1.15 + i * 0.2),
    opacity: 0.6 - i * 0.15,
    pulsePhase: (Math.PI * 2 * i) / 3,
    thickness: 3 - i * 0.5,
  }));
};

export const drawBloodRings = (
  ctx: CanvasRenderingContext2D,
  rings: BloodRing[],
  moonX: number,
  moonY: number,
) => {
  rings.forEach((ring) => {
    ring.pulsePhase += 0.02;
    const pulse = Math.sin(ring.pulsePhase) * 0.2 + 0.8;
    const currentOpacity = ring.opacity * pulse;

    ctx.strokeStyle = `rgba(160, 48, 48, ${currentOpacity})`;
    ctx.lineWidth = ring.thickness;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `rgba(200, 64, 64, ${currentOpacity})`;
    ctx.beginPath();
    ctx.arc(moonX, moonY, ring.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  });
};

// Fade Particles Effect
export const initFadeParticles = (
  canvasWidth: number,
  canvasHeight: number,
  count = 30,
): FadeParticle[] => {
  return Array.from({ length: count }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    size: Math.random() * 4 + 2,
    opacity: Math.random() * 0.8 + 0.2,
    fadeSpeed: 0.002 + Math.random() * 0.003,
    lifetime: 0,
    maxLifetime: 200 + Math.random() * 200,
  }));
};

export const drawFadeParticles = (
  ctx: CanvasRenderingContext2D,
  particles: FadeParticle[],
) => {
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.lifetime++;
    p.opacity -= p.fadeSpeed;

    if (p.lifetime >= p.maxLifetime || p.opacity <= 0) {
      p.x = Math.random() * ctx.canvas.width;
      p.y = Math.random() * ctx.canvas.height;
      p.opacity = Math.random() * 0.8 + 0.2;
      p.lifetime = 0;
    }

    if (p.opacity > 0) {
      const gradient = ctx.createRadialGradient(
        p.x,
        p.y,
        0,
        p.x,
        p.y,
        p.size * 3,
      );
      gradient.addColorStop(0, `rgba(160, 160, 176, ${p.opacity})`);
      gradient.addColorStop(0.5, `rgba(160, 160, 176, ${p.opacity * 0.5})`);
      gradient.addColorStop(1, `rgba(160, 160, 176, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });
};

// Silence Waves Effect
export const initSilenceWaves = (): SilenceWave[] => {
  return [];
};

export const drawSilenceWaves = (
  ctx: CanvasRenderingContext2D,
  waves: SilenceWave[],
  moonX: number,
  moonY: number,
  moonRadius: number,
): SilenceWave[] => {
  // Spawn new wave occasionally
  if (Math.random() < 0.015) {
    waves.push({
      radius: moonRadius,
      opacity: 0.6,
      lifetime: 0,
      maxLifetime: 120,
    });
  }

  return waves
    .map((wave) => {
      wave.lifetime++;
      wave.radius += 1.0;
      wave.opacity = (1 - wave.lifetime / wave.maxLifetime) * 0.6;

      if (wave.lifetime < wave.maxLifetime && wave.opacity > 0.05) {
        ctx.strokeStyle = `rgba(168, 168, 200, ${wave.opacity})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(moonX, moonY, wave.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      return wave;
    })
    .filter((wave) => wave.lifetime < wave.maxLifetime);
};

// Dream Dust Effect
export const initDreamDust = (
  canvasWidth: number,
  canvasHeight: number,
  count = 40,
): DreamDust[] => {
  const colors = ["#C8B8D8", "#B8A8C8", "#D8C8E8"];
  return Array.from({ length: count }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: (Math.random() - 0.5) * 0.4,
    vy: -0.2 - Math.random() * 0.3,
    size: Math.random() * 3 + 1.5,
    opacity: Math.random() * 0.7 + 0.3,
    color: colors[Math.floor(Math.random() * colors.length)],
    floatPhase: Math.random() * Math.PI * 2,
    floatSpeed: 0.02 + Math.random() * 0.03,
  }));
};

export const drawDreamDust = (
  ctx: CanvasRenderingContext2D,
  particles: DreamDust[],
) => {
  particles.forEach((p) => {
    p.floatPhase += p.floatSpeed;
    p.x += p.vx + Math.sin(p.floatPhase) * 0.3;
    p.y += p.vy;

    if (p.y < -10) {
      p.y = ctx.canvas.height + 10;
      p.x = Math.random() * ctx.canvas.width;
    }
    if (p.x < -10) p.x = ctx.canvas.width + 10;
    if (p.x > ctx.canvas.width + 10) p.x = -10;

    const gradient = ctx.createRadialGradient(
      p.x,
      p.y,
      0,
      p.x,
      p.y,
      p.size * 2.5,
    );
    gradient.addColorStop(
      0,
      `${p.color}${Math.floor(p.opacity * 255)
        .toString(16)
        .padStart(2, "0")}`,
    );
    gradient.addColorStop(
      0.5,
      `${p.color}${Math.floor(p.opacity * 128)
        .toString(16)
        .padStart(2, "0")}`,
    );
    gradient.addColorStop(1, `${p.color}00`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Star shape
    ctx.fillStyle = `${p.color}${Math.floor(p.opacity * 200)
      .toString(16)
      .padStart(2, "0")}`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
    ctx.fill();
  });
};

// Memory Fragments Effect
export const initMemoryFragments = (
  canvasWidth: number,
  canvasHeight: number,
  count = 25,
): MemoryFragment[] => {
  return Array.from({ length: count }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    size: Math.random() * 6 + 3,
    opacity: Math.random() * 0.4 + 0.2,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.03,
    lifetime: 0,
    maxLifetime: 300 + Math.random() * 300,
    fragmentType: Math.floor(Math.random() * 3),
  }));
};

export const drawMemoryFragments = (
  ctx: CanvasRenderingContext2D,
  fragments: MemoryFragment[],
) => {
  fragments.forEach((f) => {
    f.x += f.vx;
    f.y += f.vy;
    f.rotation += f.rotationSpeed;
    f.lifetime++;

    if (f.x < 0) f.x = ctx.canvas.width;
    if (f.x > ctx.canvas.width) f.x = 0;
    if (f.y < 0) f.y = ctx.canvas.height;
    if (f.y > ctx.canvas.height) f.y = 0;

    if (f.lifetime >= f.maxLifetime) {
      f.lifetime = 0;
      f.opacity = Math.random() * 0.4 + 0.2;
    }

    const fadeOpacity =
      f.lifetime < 60 ? f.lifetime / 60 : (f.maxLifetime - f.lifetime) / 60;
    const currentOpacity = Math.min(f.opacity, fadeOpacity);

    if (currentOpacity > 0.05) {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rotation);
      ctx.globalAlpha = currentOpacity;

      // Different fragment shapes
      ctx.strokeStyle = "#888898";
      ctx.fillStyle = "rgba(136, 136, 152, 0.3)";
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      if (f.fragmentType === 0) {
        // Triangle
        ctx.moveTo(0, -f.size);
        ctx.lineTo(f.size, f.size);
        ctx.lineTo(-f.size, f.size);
      } else if (f.fragmentType === 1) {
        // Square
        ctx.rect(-f.size / 2, -f.size / 2, f.size, f.size);
      } else {
        // Pentagon
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const x = Math.cos(angle) * f.size;
          const y = Math.sin(angle) * f.size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  });
};

// Ancient Runes Effect
export const initAncientRunes = (
  moonX: number,
  moonY: number,
  moonRadius: number,
): AncientRune[] => {
  const symbols = ["◯", "△", "☐", "◇", "⬡", "✦"];
  return Array.from({ length: 6 }, (_, i) => ({
    x: moonX,
    y: moonY,
    symbol: symbols[i],
    size: 12 + Math.random() * 8,
    opacity: 0.6 + Math.random() * 0.3,
    rotation: 0,
    pulsePhase: (Math.PI * 2 * i) / 6,
    orbitAngle: (Math.PI * 2 * i) / 6,
    orbitSpeed: 0.005 + Math.random() * 0.003,
    orbitRadius: moonRadius * (1.4 + Math.random() * 0.3),
  }));
};

export const drawAncientRunes = (
  ctx: CanvasRenderingContext2D,
  runes: AncientRune[],
  moonX: number,
  moonY: number,
) => {
  runes.forEach((rune) => {
    rune.orbitAngle += rune.orbitSpeed;
    rune.pulsePhase += 0.02;
    rune.rotation += 0.01;

    const x = moonX + Math.cos(rune.orbitAngle) * rune.orbitRadius;
    const y = moonY + Math.sin(rune.orbitAngle) * rune.orbitRadius;
    const pulse = Math.sin(rune.pulsePhase) * 0.3 + 0.7;
    const currentOpacity = rune.opacity * pulse;

    // Glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, rune.size * 2);
    gradient.addColorStop(0, `rgba(184, 168, 136, ${currentOpacity * 0.5})`);
    gradient.addColorStop(1, "rgba(184, 168, 136, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, rune.size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Symbol
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rune.rotation);
    ctx.fillStyle = `rgba(184, 168, 136, ${currentOpacity})`;
    ctx.font = `${rune.size}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(rune.symbol, 0, 0);
    ctx.restore();
  });
};

// Light Rays Effect
export const initLightRays = (count = 12): LightRay[] => {
  return Array.from({ length: count }, (_, i) => ({
    angle: (Math.PI * 2 * i) / count,
    length: 50 + Math.random() * 30,
    opacity: 0.3 + Math.random() * 0.4,
    width: 2 + Math.random() * 3,
    pulsePhase: Math.random() * Math.PI * 2,
    speed: 0.02 + Math.random() * 0.02,
  }));
};

export const drawLightRays = (
  ctx: CanvasRenderingContext2D,
  rays: LightRay[],
  moonX: number,
  moonY: number,
  moonRadius: number,
) => {
  // Validate inputs to prevent NaN errors
  if (!isFinite(moonX) || !isFinite(moonY) || !isFinite(moonRadius)) {
    console.warn("Invalid moon parameters in drawLightRays:", {
      moonX,
      moonY,
      moonRadius,
    });
    return;
  }

  rays.forEach((ray) => {
    ray.pulsePhase += ray.speed;
    ray.angle += 0.003;
    const pulse = Math.sin(ray.pulsePhase) * 0.4 + 0.6;
    const currentOpacity = ray.opacity * pulse;

    const startX = moonX + Math.cos(ray.angle) * moonRadius;
    const startY = moonY + Math.sin(ray.angle) * moonRadius;
    const endX = moonX + Math.cos(ray.angle) * (moonRadius + ray.length);
    const endY = moonY + Math.sin(ray.angle) * (moonRadius + ray.length);

    // Additional validation before creating gradient
    if (
      !isFinite(startX) ||
      !isFinite(startY) ||
      !isFinite(endX) ||
      !isFinite(endY)
    ) {
      return;
    }

    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, `rgba(248, 248, 255, ${currentOpacity})`);
    gradient.addColorStop(0.5, `rgba(248, 248, 255, ${currentOpacity * 0.6})`);
    gradient.addColorStop(1, "rgba(248, 248, 255, 0)");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = ray.width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  });
};

// Shooting Stars Effect
export const initShootingStars = (): ShootingStar[] => {
  return [];
};

export const drawShootingStars = (
  ctx: CanvasRenderingContext2D,
  stars: ShootingStar[],
  canvasWidth: number,
  canvasHeight: number,
): ShootingStar[] => {
  // Spawn new shooting stars
  // INCREASED INTENSITY: Spawn more frequently for "Shower" effect
  if (Math.random() < 0.3) {
    const angle = Math.PI / 4 + Math.random() * (Math.PI / 6); // 45-75 degrees
    const speed = 15 + Math.random() * 10; // Fast!
    stars.push({
      x: Math.random() * canvasWidth, // Start anywhere across the width
      y: -50 - Math.random() * 100, // Start from above the screen
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: 50 + Math.random() * 50, // Longer
      opacity: Math.random() * 0.4 + 0.6,
      trailLength: 100 + Math.random() * 80,
      color: "#FFFFFF",
    });
  }

  return stars
    .map((star) => {
      star.x += star.vx;
      star.y += star.vy;
      star.opacity -= 0.008;

      if (star.opacity > 0.05) {
        // Trail
        const gradient = ctx.createLinearGradient(
          star.x,
          star.y,
          star.x - star.vx * 3,
          star.y - star.vy * 3,
        );
        gradient.addColorStop(
          0,
          `${star.color}${Math.floor(star.opacity * 255)
            .toString(16)
            .padStart(2, "0")}`,
        );
        gradient.addColorStop(
          0.5,
          `${star.color}${Math.floor(star.opacity * 128)
            .toString(16)
            .padStart(2, "0")}`,
        );
        gradient.addColorStop(1, `${star.color}00`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x - star.vx * 3, star.y - star.vy * 3);
        ctx.stroke();

        // Head
        ctx.fillStyle = `${star.color}${Math.floor(star.opacity * 255)
          .toString(16)
          .padStart(2, "0")}`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      return star;
    })
    .filter(
      (star) =>
        star.opacity > 0.05 &&
        star.x < canvasWidth + 50 &&
        star.y < canvasHeight + 50,
    );
};

// =================== CRYSTAL SHARDS EFFECT (CRYSTAL MOON) ===================

export interface PrismLight {
  angle: number;
  distance: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  orbitSpeed: number;
  opacity: number;
  color: string;
  pulsePhase: number;
  shardType: "hexagon" | "diamond" | "triangle";
}

export const initPrismLights = (): PrismLight[] => {
  const colors = [
    "rgba(220, 240, 255, 0.9)", // Ice blue
    "rgba(255, 255, 255, 0.95)", // Pure white
    "rgba(200, 230, 255, 0.85)", // Light cyan
    "rgba(240, 250, 255, 0.9)", // Very light blue
  ];

  const shardTypes: ("hexagon" | "diamond" | "triangle")[] = [
    "hexagon",
    "diamond",
    "triangle",
  ];

  return Array.from({ length: 12 }, (_, i) => ({
    angle: (Math.PI * 2 * i) / 12,
    distance: 80 + (i % 3) * 20,
    size: 8 + Math.random() * 8,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: 0.02 + Math.random() * 0.03,
    orbitSpeed: 0.008 + Math.random() * 0.004,
    opacity: 0.6 + Math.random() * 0.3,
    color: colors[i % colors.length],
    pulsePhase: Math.random() * Math.PI * 2,
    shardType: shardTypes[i % 3],
  }));
};

export const drawPrismLights = (
  ctx: CanvasRenderingContext2D,
  lights: PrismLight[],
  moonX: number,
  moonY: number,
  moonRadius: number,
) => {
  ctx.save();

  // Draw orbiting crystal shards
  lights.forEach((shard) => {
    // Update animation
    shard.angle += shard.orbitSpeed;
    shard.rotation += shard.rotationSpeed;
    shard.pulsePhase += 0.03;

    // Calculate position
    const x = moonX + Math.cos(shard.angle) * (moonRadius + shard.distance);
    const y = moonY + Math.sin(shard.angle) * (moonRadius + shard.distance);

    // Pulsing opacity
    const pulseOpacity =
      shard.opacity * (0.8 + 0.2 * Math.sin(shard.pulsePhase));

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(shard.rotation);

    // Draw shard with glow
    ctx.globalCompositeOperation = "screen";

    // Outer glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = shard.color;

    ctx.fillStyle = shard.color.replace(/[\d.]+\)$/g, `${pulseOpacity})`);
    ctx.strokeStyle = `rgba(255, 255, 255, ${pulseOpacity * 0.8})`;
    ctx.lineWidth = 1.5;

    ctx.beginPath();

    if (shard.shardType === "hexagon") {
      // Hexagonal crystal
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = Math.cos(angle) * shard.size;
        const py = Math.sin(angle) * shard.size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else if (shard.shardType === "diamond") {
      // Diamond shape
      ctx.moveTo(0, -shard.size);
      ctx.lineTo(shard.size * 0.6, 0);
      ctx.lineTo(0, shard.size);
      ctx.lineTo(-shard.size * 0.6, 0);
      ctx.closePath();
    } else {
      // Triangle
      ctx.moveTo(0, -shard.size);
      ctx.lineTo(shard.size * 0.866, shard.size * 0.5);
      ctx.lineTo(-shard.size * 0.866, shard.size * 0.5);
      ctx.closePath();
    }

    ctx.fill();
    ctx.stroke();

    // Inner bright core
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = `rgba(255, 255, 255, ${pulseOpacity * 0.6})`;
    ctx.beginPath();
    ctx.arc(0, 0, shard.size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  // Add crystalline aura around moon
  const gradient = ctx.createRadialGradient(
    moonX,
    moonY,
    moonRadius * 0.8,
    moonX,
    moonY,
    moonRadius * 1.5,
  );
  gradient.addColorStop(0, "rgba(220, 240, 255, 0.15)");
  gradient.addColorStop(0.6, "rgba(200, 230, 255, 0.08)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius * 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// =================== STARFIELD EFFECT ===================

export const initStarfield = (count = 120): StarfieldParticle[] => {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 2, // -1 to 1
    y: (Math.random() - 0.5) * 2, // -1 to 1
    z: Math.random(), // 0 to 1 (depth)
    speed: 0.001 + Math.random() * 0.002,
    size: 1 + Math.random() * 2,
    brightness: 0.3 + Math.random() * 0.7,
  }));
};

export const drawStarfield = (
  ctx: CanvasRenderingContext2D,
  particles: StarfieldParticle[],
  canvasWidth: number,
  canvasHeight: number,
): StarfieldParticle[] => {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  return particles.map((particle) => {
    // Move particle toward viewer (increase z)
    particle.z += particle.speed;

    // Reset particle when it gets too close
    if (particle.z >= 1) {
      particle.x = (Math.random() - 0.5) * 2;
      particle.y = (Math.random() - 0.5) * 2;
      particle.z = 0;
    }

    // Calculate screen position with perspective
    const scale = particle.z * 2; // Perspective scaling
    const screenX = centerX + particle.x * centerX * scale;
    const screenY = centerY + particle.y * centerY * scale;

    // Calculate size and opacity based on depth
    const size = particle.size * (0.5 + particle.z * 1.5);
    const opacity = particle.brightness * particle.z;

    // Draw star trail (motion blur)
    const prevZ = particle.z - particle.speed;
    const prevScale = prevZ * 2;
    const prevX = centerX + particle.x * centerX * prevScale;
    const prevY = centerY + particle.y * centerY * prevScale;

    if (prevZ > 0) {
      const gradient = ctx.createLinearGradient(prevX, prevY, screenX, screenY);
      gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
      gradient.addColorStop(1, `rgba(255, 255, 255, ${opacity * 0.6})`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = size * 0.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(screenX, screenY);
      ctx.stroke();
    }

    // Draw star core
    const coreGradient = ctx.createRadialGradient(
      screenX,
      screenY,
      0,
      screenX,
      screenY,
      size * 2,
    );
    coreGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
    coreGradient.addColorStop(0.5, `rgba(200, 220, 255, ${opacity * 0.5})`);
    coreGradient.addColorStop(1, `rgba(200, 220, 255, 0)`);

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(screenX, screenY, size * 2, 0, Math.PI * 2);
    ctx.fill();

    return particle;
  });
};

// =================== NEBULA EFFECT ===================

export const initNebula = (
  canvasWidth: number,
  canvasHeight: number,
  count = 4,
): NebulaCloud[] => {
  const colorPalettes = [
    ["#FF6B9D", "#C44569", "#8B3A62"], // Pink/Purple
    ["#4A90E2", "#7B68EE", "#9370DB"], // Blue/Purple
    ["#00D9FF", "#0099CC", "#006699"], // Cyan
    ["#FF8C42", "#FF6B35", "#C44536"], // Orange/Red
    ["#6BCF7F", "#4ECDC4", "#44A08D"], // Green/Teal
  ];

  return Array.from({ length: count }, () => {
    const palette =
      colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
    return {
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      size: 150 + Math.random() * 250,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.0005,
      colors: palette,
      opacity: 0.15 + Math.random() * 0.15,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.01,
    };
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
