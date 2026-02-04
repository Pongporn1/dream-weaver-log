import { useEffect, useState } from "react";

export function usePixelRipple() {
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number; time: number }>
  >([]);
  const [isPixelTheme, setIsPixelTheme] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-mythic-theme");
      setIsPixelTheme(theme === "pixelDreamMoon");
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-mythic-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const createRipple = (e: React.MouseEvent<HTMLElement>) => {
    if (!isPixelTheme) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      time: 0,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  useEffect(() => {
    if (ripples.length === 0) return;

    const interval = setInterval(() => {
      setRipples((prev) =>
        prev.map((r) => ({
          ...r,
          time: r.time + 1,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, [ripples.length]);

  const RippleEffect = () => {
    if (!isPixelTheme || ripples.length === 0) return null;

    return (
      <>
        {ripples.map((ripple) => {
          const size = ripple.time * 15;
          const opacity = Math.max(0, 1 - ripple.time / 12);

          return (
            <div
              key={ripple.id}
              className="absolute pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
                transform: "translate(-50%, -50%)",
                imageRendering: "pixelated",
              }}
            >
              {/* Outer ring */}
              <div
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  border: "3px solid #818cf8",
                  borderRadius: "0",
                  opacity: opacity * 0.8,
                  boxShadow: `0 0 ${Math.floor(size / 4)}px #818cf8`,
                  transition: "none",
                }}
              />
              {/* Inner ring */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: `${size * 0.6}px`,
                  height: `${size * 0.6}px`,
                  border: "2px solid #06b6d4",
                  borderRadius: "0",
                  opacity: opacity,
                  boxShadow: `0 0 ${Math.floor(size / 6)}px #06b6d4`,
                }}
              />
              {/* Corner pixels */}
              {ripple.time < 8 &&
                [
                  { x: -size / 2, y: -size / 2 },
                  { x: size / 2, y: -size / 2 },
                  { x: -size / 2, y: size / 2 },
                  { x: size / 2, y: size / 2 },
                ].map((pos, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                      width: "4px",
                      height: "4px",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 0 4px #ffffff",
                      opacity: opacity,
                    }}
                  />
                ))}
            </div>
          );
        })}
      </>
    );
  };

  return { createRipple, RippleEffect, isPixelTheme };
}
