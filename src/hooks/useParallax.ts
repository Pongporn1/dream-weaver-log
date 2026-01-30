import { useEffect, useRef } from "react";
import type { ParallaxOffset } from "@/components/canvas/types";

export function useParallax() {
  const parallaxOffsetRef = useRef<ParallaxOffset>({ x: 0, y: 0 });

  useEffect(() => {
    const handleParallax = (e: MouseEvent | DeviceOrientationEvent) => {
      let x = 0;
      let y = 0;

      if (e instanceof MouseEvent) {
        // Desktop mouse movement
        x = (e.clientX / window.innerWidth - 0.5) * 20;
        y = (e.clientY / window.innerHeight - 0.5) * 20;
      } else if (
        window.DeviceOrientationEvent &&
        e instanceof DeviceOrientationEvent
      ) {
        // Mobile gyro
        if (e.gamma !== null) x = Math.max(-20, Math.min(20, e.gamma / 2));
        if (e.beta !== null) y = Math.max(-20, Math.min(20, (e.beta - 45) / 2));
      }

      parallaxOffsetRef.current = { x, y };
    };

    window.addEventListener("mousemove", handleParallax);
    window.addEventListener("deviceorientation", handleParallax);

    return () => {
      window.removeEventListener("mousemove", handleParallax);
      window.removeEventListener("deviceorientation", handleParallax);
    };
  }, []);

  return parallaxOffsetRef;
}
