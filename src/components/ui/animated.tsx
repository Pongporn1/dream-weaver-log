import { ReactNode, useEffect, useState, createContext } from "react";

// Animation context to track if initial animations have played
const AnimationContext = createContext<{ hasAnimated: boolean; setHasAnimated: (v: boolean) => void }>({
  hasAnimated: false,
  setHasAnimated: () => {},
});

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [hasAnimated, setHasAnimated] = useState(false);
  return (
    <AnimationContext.Provider value={{ hasAnimated, setHasAnimated }}>
      {children}
    </AnimationContext.Provider>
  );
}

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  /** Animation type: fade-up (default), fade, scale, slide-left, slide-right */
  animation?: "fade-up" | "fade" | "scale" | "slide-left" | "slide-right";
}

export function AnimatedSection({ 
  children, 
  delay = 0, 
  duration = 400,
  className = "",
  animation = "fade-up"
}: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  const getTransform = () => {
    if (isVisible) return "translateY(0) translateX(0) scale(1)";
    
    switch (animation) {
      case "fade":
        return "translateY(0) scale(1)";
      case "scale":
        return "scale(0.95)";
      case "slide-left":
        return "translateX(-20px)";
      case "slide-right":
        return "translateX(20px)";
      case "fade-up":
      default:
        return "translateY(16px)";
    }
  };

  return (
    <div
      className={`transition-all ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {children}
    </div>
  );
}

interface StaggeredListProps {
  children: ReactNode[];
  baseDelay?: number;
  staggerDelay?: number;
  duration?: number;
  className?: string;
  animation?: AnimatedSectionProps["animation"];
}

export function StaggeredList({
  children,
  baseDelay = 0,
  staggerDelay = 60,
  duration = 400,
  className = "",
  animation = "fade-up"
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimatedSection 
          key={index} 
          delay={baseDelay + index * staggerDelay}
          duration={duration}
          animation={animation}
        >
          {child}
        </AnimatedSection>
      ))}
    </div>
  );
}

interface StaggeredGridProps {
  children: ReactNode[];
  baseDelay?: number;
  staggerDelay?: number;
  duration?: number;
  className?: string;
  gridClassName?: string;
}

export function StaggeredGrid({
  children,
  baseDelay = 0,
  staggerDelay = 60,
  duration = 400,
  className = "",
  gridClassName = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
}: StaggeredGridProps) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    setVisibleItems(new Set());
    
    const timeouts: NodeJS.Timeout[] = [];
    children.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, index]));
      }, baseDelay + index * staggerDelay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [children, baseDelay, staggerDelay]);

  return (
    <div className={`${gridClassName} ${className}`}>
      {children.map((child, index) => (
        <div
          key={index}
          className="transition-all"
          style={{
            opacity: visibleItems.has(index) ? 1 : 0,
            transform: visibleItems.has(index) 
              ? "translateY(0) scale(1)" 
              : "translateY(20px) scale(0.95)",
            transitionDuration: `${duration}ms`,
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// Page transition wrapper
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`transition-all duration-300 ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(8px)",
      }}
    >
      {children}
    </div>
  );
}
