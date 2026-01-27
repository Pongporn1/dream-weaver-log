/**
 * Particle Effects for Mythic Moon Phenomena
 */

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

// === ADVANCED PARTICLE EFFECTS ===

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

/**
 * Initialize moon flashes for Lunar Transient Phenomena
 */
export const initMoonFlashes = (moonX: number, moonY: number): MoonFlash[] => {
  return []; // Start empty, will spawn randomly
};

/**
 * Spawn a random moon flash
 */
export const spawnMoonFlash = (
  moonX: number,
  moonY: number,
  moonRadius: number = 40
): MoonFlash => {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * moonRadius * 0.8;

  return {
    x: moonX + Math.cos(angle) * distance,
    y: moonY + Math.sin(angle) * distance,
    size: Math.random() * 8 + 4,
    opacity: 1,
    lifetime: 0,
    maxLifetime: 30 + Math.random() * 20, // 30-50 frames
  };
};

/**
 * Update and draw moon flashes
 */
export const drawMoonFlashes = (
  ctx: CanvasRenderingContext2D,
  flashes: MoonFlash[]
): MoonFlash[] => {
  return flashes
    .map((flash) => {
      flash.lifetime++;
      flash.opacity = 1 - flash.lifetime / flash.maxLifetime;

      if (flash.opacity > 0) {
        // Draw flash glow
        const gradient = ctx.createRadialGradient(
          flash.x,
          flash.y,
          0,
          flash.x,
          flash.y,
          flash.size
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${flash.opacity})`);
        gradient.addColorStop(0.5, `rgba(200, 200, 255, ${flash.opacity * 0.6})`);
        gradient.addColorStop(1, `rgba(150, 150, 255, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(flash.x, flash.y, flash.size, 0, Math.PI * 2);
        ctx.fill();
      }

      return flash;
    })
    .filter((flash) => flash.lifetime < flash.maxLifetime);
};

/**
 * Initialize orbiting particles for Super Blue Blood Moon
 */
export const initOrbitingParticles = (count: number = 20): OrbitingParticle[] => {
  const particles: OrbitingParticle[] = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      angle: (Math.PI * 2 * i) / count,
      distance: 50 + Math.random() * 30,
      size: Math.random() * 3 + 1,
      speed: 0.01 + Math.random() * 0.02,
      color: i % 2 === 0 ? "#B84060" : "#d85080",
      opacity: Math.random() * 0.5 + 0.3,
    });
  }

  return particles;
};

/**
 * Update and draw orbiting particles
 */
export const drawOrbitingParticles = (
  ctx: CanvasRenderingContext2D,
  particles: OrbitingParticle[],
  moonX: number,
  moonY: number
) => {
  particles.forEach((particle) => {
    particle.angle += particle.speed;

    const x = moonX + Math.cos(particle.angle) * particle.distance;
    const y = moonY + Math.sin(particle.angle) * particle.distance;

    // Draw particle with glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size * 2);
    gradient.addColorStop(0, `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, "0")}`);
    gradient.addColorStop(1, `${particle.color}00`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, particle.size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw core
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = particle.opacity;
    ctx.beginPath();
    ctx.arc(x, y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
};

/**
 * Initialize sparkles for Crystal Moon
 */
export const initSparkles = (moonX: number, moonY: number, moonRadius: number = 40): Sparkle[] => {
  const sparkles: Sparkle[] = [];

  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * moonRadius;

    sparkles.push({
      x: moonX + Math.cos(angle) * distance,
      y: moonY + Math.sin(angle) * distance,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.05 + Math.random() * 0.1,
    });
  }

  return sparkles;
};

/**
 * Update and draw sparkles
 */
export const drawSparkles = (
  ctx: CanvasRenderingContext2D,
  sparkles: Sparkle[]
) => {
  sparkles.forEach((sparkle) => {
    sparkle.twinklePhase += sparkle.twinkleSpeed;
    const twinkle = Math.sin(sparkle.twinklePhase) * 0.5 + 0.5;
    const currentOpacity = sparkle.opacity * twinkle;

    // Draw sparkle with cross shape
    ctx.strokeStyle = `rgba(255, 255, 255, ${currentOpacity})`;
    ctx.lineWidth = 1;
    ctx.lineCap = "round";

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(sparkle.x, sparkle.y - sparkle.size);
    ctx.lineTo(sparkle.x, sparkle.y + sparkle.size);
    ctx.stroke();

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(sparkle.x - sparkle.size, sparkle.y);
    ctx.lineTo(sparkle.x + sparkle.size, sparkle.y);
    ctx.stroke();

    // Center glow
    const gradient = ctx.createRadialGradient(
      sparkle.x,
      sparkle.y,
      0,
      sparkle.x,
      sparkle.y,
      sparkle.size * 2
    );
    gradient.addColorStop(0, `rgba(200, 230, 255, ${currentOpacity})`);
    gradient.addColorStop(1, "rgba(200, 230, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sparkle.x, sparkle.y, sparkle.size * 2, 0, Math.PI * 2);
    ctx.fill();
  });
};

// === ADVANCED PARTICLE EFFECTS ===

/**
 * Initialize Aurora Borealis waves
 */
export const initAuroraWaves = (canvasHeight: number): AuroraWave[] => {
  const waves: AuroraWave[] = [];
  const colors = ["#00ff88", "#00ccff", "#8800ff", "#ff00ff"];

  for (let i = 0; i < 4; i++) {
    waves.push({
      y: canvasHeight * 0.3 + i * 30,
      amplitude: 20 + Math.random() * 30,
      frequency: 0.01 + Math.random() * 0.02,
      phase: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.03,
      color: colors[i],
      opacity: 0.15 + Math.random() * 0.15,
    });
  }

  return waves;
};

/**
 * Draw Aurora Borealis
 */
export const drawAurora = (
  ctx: CanvasRenderingContext2D,
  waves: AuroraWave[],
  canvasWidth: number
) => {
  waves.forEach((wave) => {
    wave.phase += wave.speed;

    ctx.beginPath();
    ctx.moveTo(0, wave.y);

    // Draw wavy line
    for (let x = 0; x <= canvasWidth; x += 5) {
      const y = wave.y + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;
      ctx.lineTo(x, y);
    }

    // Create gradient fill
    const gradient = ctx.createLinearGradient(0, wave.y - wave.amplitude, 0, wave.y + wave.amplitude);
    gradient.addColorStop(0, `${wave.color}00`);
    gradient.addColorStop(0.5, `${wave.color}${Math.floor(wave.opacity * 255).toString(16).padStart(2, "0")}`);
    gradient.addColorStop(1, `${wave.color}00`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 40;
    ctx.lineCap = "round";
    ctx.stroke();

    // Add glow effect
    ctx.shadowBlur = 30;
    ctx.shadowColor = wave.color;
    ctx.stroke();
    ctx.shadowBlur = 0;
  });
};

/**
 * Initialize fireflies
 */
export const initFireflies = (canvasWidth: number, canvasHeight: number, count: number = 20): Firefly[] => {
  const fireflies: Firefly[] = [];

  for (let i = 0; i < count; i++) {
    const x = Math.random() * canvasWidth;
    const y = canvasHeight * 0.5 + Math.random() * canvasHeight * 0.4;

    fireflies.push({
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
    });
  }

  return fireflies;
};

/**
 * Draw fireflies
 */
export const drawFireflies = (
  ctx: CanvasRenderingContext2D,
  fireflies: Firefly[],
  canvasWidth: number,
  canvasHeight: number
) => {
  fireflies.forEach((firefly) => {
    // Update blink
    firefly.blinkPhase += firefly.blinkSpeed;
    firefly.opacity = Math.max(0, Math.sin(firefly.blinkPhase)) * 0.8;

    // Random movement
    if (Math.random() < 0.02) {
      firefly.targetX = Math.random() * canvasWidth;
      firefly.targetY = canvasHeight * 0.5 + Math.random() * canvasHeight * 0.4;
    }

    // Move towards target
    firefly.vx += (firefly.targetX - firefly.x) * 0.001;
    firefly.vy += (firefly.targetY - firefly.y) * 0.001;

    // Apply friction
    firefly.vx *= 0.95;
    firefly.vy *= 0.95;

    // Update position
    firefly.x += firefly.vx;
    firefly.y += firefly.vy;

    // Draw firefly
    if (firefly.opacity > 0) {
      const gradient = ctx.createRadialGradient(
        firefly.x,
        firefly.y,
        0,
        firefly.x,
        firefly.y,
        firefly.size * 3
      );
      gradient.addColorStop(0, `rgba(255, 255, 150, ${firefly.opacity})`);
      gradient.addColorStop(0.5, `rgba(255, 200, 100, ${firefly.opacity * 0.5})`);
      gradient.addColorStop(1, "rgba(255, 200, 100, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(firefly.x, firefly.y, firefly.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = `rgba(255, 255, 200, ${firefly.opacity})`;
      ctx.beginPath();
      ctx.arc(firefly.x, firefly.y, firefly.size, 0, Math.PI * 2);
      ctx.fill();
    }
  });
};

/**
 * Initialize snowflakes
 */
export const initSnowflakes = (canvasWidth: number, count: number = 50): Snowflake[] => {
  const snowflakes: Snowflake[] = [];

  for (let i = 0; i < count; i++) {
    snowflakes.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * -100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.3,
      drift: (Math.random() - 0.5) * 0.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      opacity: Math.random() * 0.6 + 0.4,
    });
  }

  return snowflakes;
};

/**
 * Draw snowflakes
 */
export const drawSnowflakes = (
  ctx: CanvasRenderingContext2D,
  snowflakes: Snowflake[],
  canvasWidth: number,
  canvasHeight: number
) => {
  snowflakes.forEach((snowflake) => {
    // Update position
    snowflake.y += snowflake.speed;
    snowflake.x += snowflake.drift;
    snowflake.rotation += snowflake.rotationSpeed;

    // Reset if off screen
    if (snowflake.y > canvasHeight) {
      snowflake.y = -10;
      snowflake.x = Math.random() * canvasWidth;
    }

    // Draw snowflake
    ctx.save();
    ctx.translate(snowflake.x, snowflake.y);
    ctx.rotate(snowflake.rotation);
    ctx.globalAlpha = snowflake.opacity;

    // Draw 6-pointed snowflake
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.lineCap = "round";

    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, snowflake.size * 2);
      ctx.stroke();

      // Small branches
      ctx.beginPath();
      ctx.moveTo(0, snowflake.size);
      ctx.lineTo(-snowflake.size * 0.5, snowflake.size * 1.5);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, snowflake.size);
      ctx.lineTo(snowflake.size * 0.5, snowflake.size * 1.5);
      ctx.stroke();
    }

    ctx.restore();
  });
};

/**
 * Initialize fog layers
 */
export const initFogLayers = (canvasWidth: number, canvasHeight: number): FogLayer[] => {
  const layers: FogLayer[] = [];

  for (let i = 0; i < 3; i++) {
    layers.push({
      x: -canvasWidth * 0.5,
      y: canvasHeight * 0.6 + i * 80,
      width: canvasWidth * 2,
      height: 120,
      speed: 0.1 + i * 0.05,
      opacity: 0.1 + i * 0.05,
      color: "#cccccc",
    });
  }

  return layers;
};

/**
 * Draw fog layers
 */
export const drawFog = (
  ctx: CanvasRenderingContext2D,
  layers: FogLayer[],
  canvasWidth: number
) => {
  layers.forEach((layer) => {
    layer.x += layer.speed;

    // Reset position
    if (layer.x > canvasWidth) {
      layer.x = -layer.width + canvasWidth;
    }

    // Draw fog with gradient
    const gradient = ctx.createLinearGradient(layer.x, layer.y, layer.x + layer.width, layer.y);
    gradient.addColorStop(0, `${layer.color}00`);
    gradient.addColorStop(0.3, `${layer.color}${Math.floor(layer.opacity * 255).toString(16).padStart(2, "0")}`);
    gradient.addColorStop(0.7, `${layer.color}${Math.floor(layer.opacity * 255).toString(16).padStart(2, "0")}`);
    gradient.addColorStop(1, `${layer.color}00`);

    ctx.fillStyle = gradient;
    ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
  });
};
