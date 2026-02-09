import { ReactNode } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  indicatorClassName?: string;
}

export function PullToRefresh({ 
  children, 
  onRefresh, 
  className,
  indicatorClassName 
}: PullToRefreshProps) {
  const { 
    containerRef, 
    pullDistance, 
    isRefreshing, 
    isPulling,
    progress,
    isReady 
  } = usePullToRefresh({
    onRefresh,
    threshold: 80,
    maxPull: 150,
  });

  const showIndicator = pullDistance > 10 || isRefreshing;
  
  // Calculate indicator position with smooth curve
  const indicatorOffset = Math.min(pullDistance, 100);
  
  // Rotation based on progress (full rotation when ready)
  const rotation = isReady ? 180 : progress * 180;

  return (
    <div 
      ref={containerRef}
      className={cn("relative touch-pan-y", className)}
      style={{ 
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain'
      }}
    >
      {/* Pull Indicator */}
      <div 
        className={cn(
          "absolute left-0 right-0 flex justify-center pointer-events-none z-20",
          "transition-opacity duration-200",
          showIndicator ? "opacity-100" : "opacity-0",
          indicatorClassName
        )}
        style={{ 
          top: 0,
          transform: `translateY(${indicatorOffset - 48}px)`,
        }}
      >
        <div 
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full",
            "bg-background/90 backdrop-blur-md",
            "border-2 transition-all duration-200",
            isReady || isRefreshing 
              ? "border-primary shadow-lg shadow-primary/20" 
              : "border-muted-foreground/30",
          )}
          style={{
            transform: `scale(${0.8 + progress * 0.2})`,
          }}
        >
          {isRefreshing ? (
            <RefreshCw 
              className="w-5 h-5 text-primary animate-spin" 
            />
          ) : (
            <ChevronDown 
              className={cn(
                "w-5 h-5 transition-all duration-200",
                isReady ? "text-primary" : "text-muted-foreground"
              )}
              style={{ 
                transform: `rotate(${rotation}deg)`,
                opacity: 0.6 + progress * 0.4
              }}
            />
          )}
        </div>
        
        {/* Progress ring */}
        {!isRefreshing && progress > 0 && (
          <svg 
            className="absolute inset-0 w-12 h-12 -rotate-90"
            viewBox="0 0 48 48"
          >
            <circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary/30"
            />
            <circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-primary"
              strokeDasharray={`${progress * 138} 138`}
            />
          </svg>
        )}
      </div>

      {/* Content with pull effect */}
      <div 
        style={{ 
          transform: `translateY(${isRefreshing ? 60 : pullDistance * 0.5}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {children}
      </div>
    </div>
  );
}
