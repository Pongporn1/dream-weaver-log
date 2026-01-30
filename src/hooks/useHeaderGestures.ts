import { useState, useCallback, useRef, useEffect } from "react";

interface HeaderGestureOptions {
  onRefresh?: () => Promise<void>;
  onExpand?: () => void;
  onCollapse?: () => void;
  pullThreshold?: number;
  expandThreshold?: number;
}

interface HeaderGestureState {
  pullDistance: number;
  isRefreshing: boolean;
  isPulling: boolean;
  isExpanded: boolean;
  gestureDirection: "none" | "down" | "up";
}

export function useHeaderGestures({
  onRefresh,
  onExpand,
  onCollapse,
  pullThreshold = 100,
  expandThreshold = 50,
}: HeaderGestureOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<HeaderGestureState>({
    pullDistance: 0,
    isRefreshing: false,
    isPulling: false,
    isExpanded: false,
    gestureDirection: "none",
  });

  const startY = useRef(0);
  const startX = useRef(0);
  const isGesturing = useRef(false);
  const gestureAxis = useRef<"horizontal" | "vertical" | null>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (state.isRefreshing) return;

      const touch = e.touches[0];
      startY.current = touch.clientY;
      startX.current = touch.clientX;
      isGesturing.current = true;
      gestureAxis.current = null;

      setState((prev) => ({ ...prev, isPulling: true, gestureDirection: "none" }));
    },
    [state.isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isGesturing.current || state.isRefreshing) return;

      const touch = e.touches[0];
      const deltaY = touch.clientY - startY.current;
      const deltaX = touch.clientX - startX.current;

      // Determine gesture axis on first significant movement
      if (!gestureAxis.current) {
        if (Math.abs(deltaY) > 10 || Math.abs(deltaX) > 10) {
          gestureAxis.current = Math.abs(deltaY) > Math.abs(deltaX) ? "vertical" : "horizontal";
        }
      }

      // Only handle vertical gestures
      if (gestureAxis.current !== "vertical") return;

      // Apply resistance for pull-down
      const resistance = deltaY > 0 ? 2.5 : 4;
      const distance = deltaY / resistance;

      setState((prev) => ({
        ...prev,
        pullDistance: Math.max(-50, Math.min(150, distance)),
        gestureDirection: deltaY > 0 ? "down" : "up",
      }));

      // Prevent scroll when pulling
      if (deltaY > 0) {
        e.preventDefault();
      }
    },
    [state.isRefreshing]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isGesturing.current) return;

    isGesturing.current = false;
    gestureAxis.current = null;

    const { pullDistance, gestureDirection } = state;

    // Pull-to-refresh
    if (gestureDirection === "down" && pullDistance >= pullThreshold && onRefresh) {
      setState((prev) => ({
        ...prev,
        isRefreshing: true,
        pullDistance: pullThreshold,
        isPulling: false,
      }));

      try {
        await onRefresh();
      } finally {
        setState((prev) => ({
          ...prev,
          isRefreshing: false,
          pullDistance: 0,
        }));
      }
      return;
    }

    // Expand/Collapse gestures
    if (gestureDirection === "down" && pullDistance >= expandThreshold && onExpand) {
      onExpand();
      setState((prev) => ({ ...prev, isExpanded: true }));
    } else if (gestureDirection === "up" && pullDistance <= -expandThreshold && onCollapse) {
      onCollapse();
      setState((prev) => ({ ...prev, isExpanded: false }));
    }

    // Reset
    setState((prev) => ({
      ...prev,
      pullDistance: 0,
      isPulling: false,
      gestureDirection: "none",
    }));
  }, [state, pullThreshold, expandThreshold, onRefresh, onExpand, onCollapse]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Calculate visual properties
  const progress = Math.min(Math.abs(state.pullDistance) / pullThreshold, 1);
  const isReady = state.pullDistance >= pullThreshold;

  return {
    containerRef,
    ...state,
    progress,
    isReady,
  };
}
