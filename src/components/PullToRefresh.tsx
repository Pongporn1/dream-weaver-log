import { ReactNode } from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

export function PullToRefresh({ children, onRefresh, className }: PullToRefreshProps) {
  const { containerRef, pullDistance, isRefreshing, isPulling } = usePullToRefresh({
    onRefresh,
    threshold: 80,
  });

  const progress = Math.min(pullDistance / 80, 1);
  const showIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      style={{ touchAction: isPulling ? 'none' : 'auto' }}
    >
      {/* Pull Indicator */}
      <div 
        className={cn(
          "absolute left-0 right-0 flex justify-center transition-all duration-200 z-10",
          showIndicator ? "opacity-100" : "opacity-0"
        )}
        style={{ 
          top: -40 + pullDistance,
          transform: `translateY(${Math.min(pullDistance, 60)}px)` 
        }}
      >
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full",
          "bg-primary/10 backdrop-blur-sm border border-primary/20",
          "shadow-lg"
        )}>
          {isRefreshing ? (
            <RefreshCw className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <ArrowDown 
              className={cn(
                "w-5 h-5 text-primary transition-transform duration-200",
                progress >= 1 && "rotate-180"
              )} 
              style={{ 
                transform: `rotate(${progress * 180}deg)`,
                opacity: progress 
              }}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div 
        style={{ 
          transform: `translateY(${isRefreshing ? 60 : pullDistance * 0.5}px)`,
          transition: isPulling ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}
