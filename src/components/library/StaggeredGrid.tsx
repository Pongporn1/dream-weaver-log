import { ReactNode, useEffect, useState } from "react";

interface StaggeredGridProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  animationDuration?: number;
}

export function StaggeredGrid({ 
  children, 
  className = "",
  staggerDelay = 80,
  animationDuration = 400
}: StaggeredGridProps) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) {
      // If already animated, show all immediately
      setVisibleItems(new Set(children.map((_, i) => i)));
      return;
    }

    // Reset visibility when children change
    setVisibleItems(new Set());

    // Stagger the appearance of each item
    const timeouts: NodeJS.Timeout[] = [];
    
    children.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, index]));
        
        // Mark as animated after last item
        if (index === children.length - 1) {
          setTimeout(() => setHasAnimated(true), animationDuration);
        }
      }, index * staggerDelay);
      
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [children, staggerDelay, animationDuration, hasAnimated]);

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 ${className}`}>
      {children.map((child, index) => (
        <div
          key={index}
          className="transition-all"
          style={{
            opacity: visibleItems.has(index) ? 1 : 0,
            marginTop: visibleItems.has(index) ? "0px" : "12px",
            transitionProperty: "opacity, margin-top",
            transitionDuration: `${animationDuration}ms`,
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
