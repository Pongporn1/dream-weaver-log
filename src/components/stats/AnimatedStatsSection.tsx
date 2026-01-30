import { ReactNode, useEffect, useState } from "react";

interface AnimatedStatsSectionProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function AnimatedStatsSection({ 
  children, 
  delay = 0, 
  duration = 400,
  className = ""
}: AnimatedStatsSectionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <div
      className={`transition-all ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.98)",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {children}
    </div>
  );
}

interface StaggeredStatsGridProps {
  children: ReactNode[];
  baseDelay?: number;
  staggerDelay?: number;
  duration?: number;
  className?: string;
}

export function StaggeredStatsGrid({
  children,
  baseDelay = 0,
  staggerDelay = 80,
  duration = 400,
  className = ""
}: StaggeredStatsGridProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimatedStatsSection 
          key={index} 
          delay={baseDelay + index * staggerDelay}
          duration={duration}
        >
          {child}
        </AnimatedStatsSection>
      ))}
    </div>
  );
}
