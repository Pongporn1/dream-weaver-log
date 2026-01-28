import { useState, useEffect, useRef, useCallback } from "react";

interface GyroData {
  beta: number; // Front-to-back tilt (-180 to 180)
  gamma: number; // Left-to-right tilt (-90 to 90)
  isSupported: boolean;
  isPermissionGranted: boolean | null; // null = not asked yet, true = granted, false = denied
  isMobile: boolean;
  needsPermission: boolean; // iOS 13+ requires explicit permission
  error: string | null;
}

/**
 * Minimal gyroscope hook for background parallax only
 * - Mobile detection
 * - Auto-start listening (works on Android and older iOS)
 * - Manual permission for iOS 13+
 * - Smoothed tilt values
 */
export const useGyroscope = () => {
  const [gyroData, setGyroData] = useState<GyroData>({
    beta: 0,
    gamma: 0,
    isSupported: false,
    isPermissionGranted: null,
    isMobile: false,
    needsPermission: false,
    error: null,
  });

  // Smoothing values
  const smoothedBeta = useRef(0);
  const smoothedGamma = useRef(0);
  const smoothingFactor = 0.1; // Lower = smoother

  // Function to request permission - must be called from user interaction
  const requestPermission = useCallback(async () => {
    try {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof (DeviceOrientationEvent as any).requestPermission === "function"
      ) {
        // iOS 13+ - requires explicit permission from user interaction
        const permission = await (
          DeviceOrientationEvent as any
        ).requestPermission();
        const granted = permission === "granted";

        setGyroData((prev) => ({
          ...prev,
          isPermissionGranted: granted,
          error: granted ? null : "Permission denied by user",
        }));

        return granted;
      } else {
        // Android or older iOS - no permission needed
        setGyroData((prev) => ({
          ...prev,
          isPermissionGranted: true,
          error: null,
        }));
        return true;
      }
    } catch (error) {
      console.error("Gyroscope permission error:", error);
      setGyroData((prev) => ({
        ...prev,
        isPermissionGranted: false,
        error: "Failed to request gyroscope permission",
      }));
      return false;
    }
  }, []);

  useEffect(() => {
    // Check if mobile device
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    // Check if DeviceOrientationEvent is supported
    const isSupported = "DeviceOrientationEvent" in window;

    // Check if permission request is needed (iOS 13+)
    const needsPermission =
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function";

    setGyroData((prev) => ({
      ...prev,
      isMobile,
      isSupported,
      needsPermission,
      // Auto-grant for Android/older iOS (no permission needed)
      // iOS 13+ remains null - requires user to click button
      isPermissionGranted:
        !needsPermission && isMobile && isSupported ? true : null,
    }));
  }, []);

  useEffect(() => {
    if (
      !gyroData.isMobile ||
      !gyroData.isSupported ||
      gyroData.isPermissionGranted !== true
    ) {
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta || 0;
      const gamma = event.gamma || 0;

      // Apply low-pass smoothing
      smoothedBeta.current =
        smoothedBeta.current + (beta - smoothedBeta.current) * smoothingFactor;
      smoothedGamma.current =
        smoothedGamma.current +
        (gamma - smoothedGamma.current) * smoothingFactor;

      setGyroData((prev) => ({
        ...prev,
        beta: smoothedBeta.current,
        gamma: smoothedGamma.current,
      }));
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [gyroData.isMobile, gyroData.isSupported, gyroData.isPermissionGranted]);

  return {
    ...gyroData,
    requestPermission, // Export function for manual permission request
  };
};
