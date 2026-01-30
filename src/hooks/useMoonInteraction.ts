import { useRef, useCallback, useEffect, useState } from "react";
import { getMoonPhase, MoonPhaseInfo } from "@/utils/moonPhases";
import { calculateMoonRadius } from "@/components/canvas";
import { initSparkles, spawnMoonFlash, MoonFlash, Sparkle } from "@/utils/particleEffects";
import type { MoonPhenomenon } from "@/data/moonPhenomena";
import type { MoonPosition } from "@/components/canvas";

interface UseMoonInteractionProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  phenomenon: MoonPhenomenon | null;
  moonPositionRef: React.RefObject<MoonPosition>;
  parallaxOffsetRef: React.RefObject<{ x: number; y: number }>;
  moonFlashesRef: React.MutableRefObject<MoonFlash[]>;
  sparklesRef: React.MutableRefObject<Sparkle[]>;
}

export function useMoonInteraction({
  canvasRef,
  phenomenon,
  moonPositionRef,
  parallaxOffsetRef,
  moonFlashesRef,
  sparklesRef,
}: UseMoonInteractionProps) {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const isTouchMoveRef = useRef<boolean>(false);

  const [overlayType, setOverlayType] = useState<"phase" | "phenomenon" | null>(null);
  const [currentMoonPhase, setCurrentMoonPhase] = useState<MoonPhaseInfo>(getMoonPhase());

  // Check if touch/click is on the moon
  const isMoonHit = useCallback((clientX: number, clientY: number): boolean => {
    if (!canvasRef.current || !phenomenon || !moonPositionRef.current) {
      console.log('🎯 isMoonHit: No canvas or phenomenon');
      return false;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const moon = moonPositionRef.current;
    const pX = parallaxOffsetRef.current?.x ?? 0;
    const pY = parallaxOffsetRef.current?.y ?? 0;
    const currentMoonX = moon.x + pX * 0.8;
    const currentMoonY = moon.y + Math.sin(moon.phase) * 3 + pY * 0.8;
    const moonRadius = calculateMoonRadius(phenomenon);

    const dist = Math.sqrt(
      Math.pow(clickX - currentMoonX, 2) + Math.pow(clickY - currentMoonY, 2)
    );

    const hit = dist < moonRadius * 1.5;
    console.log('🎯 Moon Hit Check:', { 
      clickX: clickX.toFixed(0), 
      clickY: clickY.toFixed(0), 
      moonX: currentMoonX.toFixed(0), 
      moonY: currentMoonY.toFixed(0), 
      dist: dist.toFixed(0), 
      moonRadius: moonRadius.toFixed(0), 
      threshold: (moonRadius * 1.5).toFixed(0),
      hit 
    });

    return hit;
  }, [canvasRef, phenomenon, moonPositionRef, parallaxOffsetRef]);

  // Trigger visual feedback on moon tap
  const triggerMoonEffect = useCallback(() => {
    if (!canvasRef.current || !phenomenon || !moonPositionRef.current) return;

    const moon = moonPositionRef.current;
    const pX = parallaxOffsetRef.current?.x ?? 0;
    const pY = parallaxOffsetRef.current?.y ?? 0;
    const currentMoonX = moon.x + pX * 0.8;
    const currentMoonY = moon.y + Math.sin(moon.phase) * 3 + pY * 0.8;

    if (navigator.vibrate) navigator.vibrate(20);
    moonFlashesRef.current.push(spawnMoonFlash(currentMoonX, currentMoonY));
    const newSparkles = initSparkles(currentMoonX, currentMoonY, 15);
    sparklesRef.current = [...sparklesRef.current, ...newSparkles];
  }, [canvasRef, phenomenon, moonPositionRef, parallaxOffsetRef, moonFlashesRef, sparklesRef]);

  // Handle tap (short press) - show Moon Phase Info
  const handleTap = useCallback(() => {
    setCurrentMoonPhase(getMoonPhase());
    setOverlayType("phase");
    triggerMoonEffect();
  }, [triggerMoonEffect]);

  // Handle long press - show Phenomenon Details
  const handleLongPress = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    setOverlayType("phenomenon");
  }, []);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    console.log('👆 Touch Start triggered');
    const touch = e.touches[0];
    
    const hitMoon = isMoonHit(touch.clientX, touch.clientY);
    if (!hitMoon) return;
    
    e.preventDefault();
    isTouchMoveRef.current = false;
    touchStartTimeRef.current = Date.now();
    
    longPressTimerRef.current = setTimeout(() => {
      if (!isTouchMoveRef.current) {
        handleLongPress();
      }
    }, 500);
  }, [isMoonHit, handleLongPress]);

  const handleTouchMove = useCallback(() => {
    isTouchMoveRef.current = true;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const touchDuration = Date.now() - touchStartTimeRef.current;
    if (touchDuration < 500 && !isTouchMoveRef.current) {
      const touch = e.changedTouches[0];
      if (isMoonHit(touch.clientX, touch.clientY)) {
        handleTap();
      }
    }
  }, [isMoonHit, handleTap]);

  // Mouse click handler (for desktop)
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMoonHit(e.clientX, e.clientY)) return;
    handleTap();
  }, [isMoonHit, handleTap]);

  // Close overlay
  const handleCloseOverlay = useCallback(() => {
    setOverlayType(null);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return {
    overlayType,
    currentMoonPhase,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleCanvasClick,
    handleCloseOverlay,
  };
}
