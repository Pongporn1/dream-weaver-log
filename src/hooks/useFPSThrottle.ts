import { useRef, useCallback, useEffect, useState } from "react";

interface BatteryManager {
  level: number;
  charging: boolean;
  addEventListener: (
    type: "levelchange" | "chargingchange",
    listener: () => void,
  ) => void;
  removeEventListener: (
    type: "levelchange" | "chargingchange",
    listener: () => void,
  ) => void;
}

declare global {
  interface Navigator {
    getBattery?: () => Promise<BatteryManager>;
  }
}

interface FPSThrottleOptions {
  targetFPS?: number;
  enableAdaptive?: boolean;
  minFPS?: number;
  maxFPS?: number;
}

interface FPSMetrics {
  currentFPS: number;
  averageFPS: number;
  isThrottled: boolean;
}

/**
 * Hook to throttle animation frame rate for performance optimization
 * - Supports fixed FPS targeting
 * - Adaptive FPS based on device performance
 * - Battery-aware throttling
 */
export function useFPSThrottle(options: FPSThrottleOptions = {}) {
  const {
    targetFPS = 60,
    enableAdaptive = true,
    minFPS = 20,
    maxFPS = 60,
  } = options;

  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsHistoryRef = useRef<number[]>([]);
  const adaptiveFPSRef = useRef<number>(targetFPS);
  const lastFPSUpdateRef = useRef<number>(0);

  const [metrics, setMetrics] = useState<FPSMetrics>({
    currentFPS: targetFPS,
    averageFPS: targetFPS,
    isThrottled: false,
  });

  // Detect low-power mode or battery saver
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);

  useEffect(() => {
    const getBattery = navigator.getBattery?.bind(navigator);
    if (!getBattery) return;

    let isActive = true;
    let cleanup: (() => void) | undefined;

    getBattery()
      .then((battery) => {
        if (!isActive) return;
        const updateBatteryStatus = () => {
          // Throttle when battery is low and not charging
          setIsLowPowerMode(battery.level < 0.2 && !battery.charging);
        };

        updateBatteryStatus();
        battery.addEventListener("levelchange", updateBatteryStatus);
        battery.addEventListener("chargingchange", updateBatteryStatus);

        cleanup = () => {
          battery.removeEventListener("levelchange", updateBatteryStatus);
          battery.removeEventListener("chargingchange", updateBatteryStatus);
        };
      })
      .catch((error) => {
        console.warn("Battery API unavailable:", error);
      });

    return () => {
      isActive = false;
      cleanup?.();
    };
  }, []);

  // Calculate frame interval based on current target FPS
  const getFrameInterval = useCallback(() => {
    let currentTargetFPS = adaptiveFPSRef.current;

    // Reduce FPS in low power mode
    if (isLowPowerMode) {
      currentTargetFPS = Math.min(currentTargetFPS, 30);
    }

    return 1000 / currentTargetFPS;
  }, [isLowPowerMode]);

  // Check if enough time has passed for next frame
  const shouldRenderFrame = useCallback(
    (currentTime: number): boolean => {
      const frameInterval = getFrameInterval();
      const elapsed = currentTime - lastFrameTimeRef.current;

      if (elapsed >= frameInterval) {
        // Update FPS tracking
        frameCountRef.current++;

        // Calculate actual FPS every second
        if (currentTime - lastFPSUpdateRef.current >= 1000) {
          const actualFPS = frameCountRef.current;
          fpsHistoryRef.current.push(actualFPS);

          // Keep only last 5 seconds of history
          if (fpsHistoryRef.current.length > 5) {
            fpsHistoryRef.current.shift();
          }

          // Calculate average FPS
          const avgFPS =
            fpsHistoryRef.current.reduce((a, b) => a + b, 0) /
            fpsHistoryRef.current.length;

          // Adaptive FPS adjustment
          if (enableAdaptive) {
            if (actualFPS < adaptiveFPSRef.current * 0.8) {
              // Performance is suffering, reduce target FPS
              adaptiveFPSRef.current = Math.max(
                minFPS,
                adaptiveFPSRef.current - 5
              );
            } else if (
              actualFPS >= adaptiveFPSRef.current * 0.95 &&
              adaptiveFPSRef.current < maxFPS
            ) {
              // Performance is good, try to increase FPS
              adaptiveFPSRef.current = Math.min(
                maxFPS,
                adaptiveFPSRef.current + 2
              );
            }
          }

          setMetrics({
            currentFPS: actualFPS,
            averageFPS: Math.round(avgFPS),
            isThrottled: adaptiveFPSRef.current < targetFPS,
          });

          frameCountRef.current = 0;
          lastFPSUpdateRef.current = currentTime;
        }

        lastFrameTimeRef.current = currentTime;
        return true;
      }

      return false;
    },
    [getFrameInterval, enableAdaptive, minFPS, maxFPS, targetFPS]
  );

  // Reset throttling (useful when component becomes visible again)
  const resetThrottle = useCallback(() => {
    lastFrameTimeRef.current = 0;
    frameCountRef.current = 0;
    fpsHistoryRef.current = [];
    adaptiveFPSRef.current = targetFPS;
    lastFPSUpdateRef.current = 0;
  }, [targetFPS]);

  return {
    shouldRenderFrame,
    resetThrottle,
    metrics,
    isLowPowerMode,
    currentTargetFPS: adaptiveFPSRef.current,
  };
}
