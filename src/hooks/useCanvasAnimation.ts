import { useEffect, useRef, useCallback } from "react";

interface UseCanvasAnimationOptions {
  onDraw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  enabled?: boolean;
}

export function useCanvasAnimation({
  onDraw,
  enabled = true,
}: UseCanvasAnimationOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const dimensionsRef = useRef({ width: 0, height: 0 });

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    dimensionsRef.current = { width: rect.width, height: rect.height };

    return { ctx, width: rect.width, height: rect.height };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const result = resizeCanvas();
    if (!result) return;

    const { ctx, width, height } = result;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      onDraw(ctx, width, height);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [enabled, onDraw, resizeCanvas]);

  return {
    canvasRef,
    dimensions: dimensionsRef.current,
  };
}
