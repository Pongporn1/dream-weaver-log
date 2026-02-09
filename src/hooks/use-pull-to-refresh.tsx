import { useState, useCallback, useRef, useEffect } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
  maxPull?: number;
}

interface UsePullToRefreshReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  pullDistance: number;
  isRefreshing: boolean;
  isPulling: boolean;
  progress: number;
  isReady: boolean;
}

// Haptic feedback helper
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30, 10, 30]
    };
    navigator.vibrate(patterns[type]);
  }
};

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  maxPull = 150,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  
  const startY = useRef(0);
  const startScrollTop = useRef(0);
  const velocity = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const hasTriggeredHaptic = useRef(false);
  const rafId = useRef<number | null>(null);

  // Calculate progress (0-1) for animations
  const progress = Math.min(pullDistance / threshold, 1);
  const isReady = progress >= 1;

  // Elastic resistance - gets harder to pull as distance increases
  const getElasticDistance = useCallback((rawDistance: number) => {
    const baseDistance = rawDistance / resistance;
    // Apply exponential decay for elastic feel
    const elasticFactor = 1 - Math.pow(baseDistance / maxPull, 2);
    return Math.min(baseDistance * Math.max(elasticFactor, 0.3), maxPull);
  }, [resistance, maxPull]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isRefreshing) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Record start position and scroll state
    startY.current = e.touches[0].clientY;
    startScrollTop.current = container.scrollTop;
    lastY.current = e.touches[0].clientY;
    lastTime.current = Date.now();
    velocity.current = 0;
    hasTriggeredHaptic.current = false;
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isRefreshing) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const currentY = e.touches[0].clientY;
    const currentTime = Date.now();
    const deltaY = currentY - startY.current;
    
    // Calculate velocity for momentum
    const timeDelta = currentTime - lastTime.current;
    if (timeDelta > 0) {
      velocity.current = (currentY - lastY.current) / timeDelta;
    }
    lastY.current = currentY;
    lastTime.current = currentTime;
    
    // Check if we should activate pull-to-refresh
    // Must be at top AND pulling down AND started from near top
    const isAtTop = container.scrollTop <= 0;
    const startedNearTop = startScrollTop.current <= 5;
    const isPullingDown = deltaY > 0;
    
    if (isAtTop && startedNearTop && isPullingDown) {
      const distance = getElasticDistance(deltaY);
      
      if (distance > 5) {
        // Prevent default scrolling behavior
        e.preventDefault();
        
        if (!isPulling) {
          setIsPulling(true);
          triggerHaptic('light');
        }
        
        // Use RAF for smoother updates
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
        }
        
        rafId.current = requestAnimationFrame(() => {
          setPullDistance(distance);
          
          // Trigger haptic when crossing threshold
          if (distance >= threshold && !hasTriggeredHaptic.current) {
            hasTriggeredHaptic.current = true;
            triggerHaptic('medium');
          } else if (distance < threshold && hasTriggeredHaptic.current) {
            hasTriggeredHaptic.current = false;
          }
        });
      }
    } else {
      // Reset if scrolling normally
      if (isPulling && !isPullingDown) {
        setIsPulling(false);
        setPullDistance(0);
      }
    }
  }, [isRefreshing, isPulling, threshold, getElasticDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    
    if (!isPulling || isRefreshing) return;
    
    setIsPulling(false);
    
    if (pullDistance >= threshold) {
      // Trigger refresh
      setIsRefreshing(true);
      setPullDistance(threshold * 0.75); // Shrink to loading state
      triggerHaptic('heavy');
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        // Smooth exit animation
        setPullDistance(0);
        // Small delay before hiding refreshing state
        await new Promise(resolve => setTimeout(resolve, 200));
        setIsRefreshing(false);
      }
    } else {
      // Snap back with momentum consideration
      setPullDistance(0);
    }
    
    // Reset refs
    startY.current = 0;
    startScrollTop.current = 0;
    velocity.current = 0;
    hasTriggeredHaptic.current = false;
  }, [isPulling, isRefreshing, pullDistance, threshold, onRefresh]);

  // Handle touch cancel (e.g., notification interrupts gesture)
  const handleTouchCancel = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    setIsPulling(false);
    setPullDistance(0);
    startY.current = 0;
    hasTriggeredHaptic.current = false;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use passive: false for touchmove to allow preventDefault
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchCancel);
      
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel]);

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    isPulling,
    progress,
    isReady,
  };
}
