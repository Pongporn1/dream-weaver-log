import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function PixelPageTransition() {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pixels, setPixels] = useState<{ x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    // Check if pixel theme is active
    const theme = document.documentElement.getAttribute("data-mythic-theme");
    if (theme !== "pixelDreamMoon") return;

    // Start transition
    setIsTransitioning(true);

    // Generate random pixel grid
    const gridSize = 20; // 20x20 grid
    const newPixels: { x: number; y: number; delay: number }[] = [];
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        newPixels.push({
          x: (x / gridSize) * 100,
          y: (y / gridSize) * 100,
          delay: Math.random() * 400, // Random delay 0-400ms
        });
      }
    }
    
    setPixels(newPixels);

    // End transition after animation completes
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 800); // Total duration

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isTransitioning) return null;

  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{
        imageRendering: "pixelated",
      }}
    >
      {pixels.map((pixel, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${pixel.x}%`,
            top: `${pixel.y}%`,
            width: "5%",
            height: "5vh",
            backgroundColor: i % 3 === 0 ? "#1e1b4b" : i % 3 === 1 ? "#3b82f6" : "#06b6d4",
            animation: `pixelDissolve 0.6s steps(3) forwards`,
            animationDelay: `${pixel.delay}ms`,
            opacity: 0,
          }}
        />
      ))}
      
      <style>{`
        @keyframes pixelDissolve {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
          100% {
            opacity: 0;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
