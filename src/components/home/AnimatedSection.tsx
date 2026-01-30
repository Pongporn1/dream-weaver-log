import { ReactNode, useEffect, useState } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function AnimatedSection({ 
  children, 
  delay = 0, 
  duration = 400,
  className = ""
}: AnimatedSectionProps) {
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
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {children}
    </div>
  );
}

interface StaggerContainerProps {
  children: ReactNode[];
  baseDelay?: number;
  staggerDelay?: number;
  duration?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  baseDelay = 0,
  staggerDelay = 100,
  duration = 400,
  className = ""
}: StaggerContainerProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimatedSection 
          key={index} 
          delay={baseDelay + index * staggerDelay}
          duration={duration}
        >
          {child}
        </AnimatedSection>
      ))}
    </div>
  );
}
