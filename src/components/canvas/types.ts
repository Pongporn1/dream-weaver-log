import type { MoonPhenomenon } from "@/data/moonPhenomena";

// Basic particle types
export interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
}

export interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  color: string;
  opacity: number;
  isActive: boolean;
  trailLength: number;
}

// Canvas context with dimensions
export interface CanvasContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
}

// Moon state
export interface MoonPosition {
  x: number;
  y: number;
  phase: number;
}

// Parallax offset
export interface ParallaxOffset {
  x: number;
  y: number;
}

// Renderer props
export interface RendererProps {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  phenomenon: MoonPhenomenon;
  parallaxOffset: ParallaxOffset;
}

export interface MoonRendererProps extends RendererProps {
  moonPosition: MoonPosition;
  moonPhase: {
    phase: number;
    phaseNameTh: string;
    illumination: number;
  };
}

export interface StarRendererProps extends RendererProps {
  stars: Star[];
}

export interface CloudRendererProps extends RendererProps {
  clouds: Cloud[];
}

export interface ShootingStarRendererProps extends RendererProps {
  shootingStars: ShootingStar[];
  timer: number;
}
