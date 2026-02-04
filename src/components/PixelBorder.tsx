import { useEffect, useState, ReactNode } from "react";

interface PixelBorderProps {
  children: ReactNode;
  animated?: boolean;
  className?: string;
}

export function PixelBorder({ children, animated = true, className = "" }: PixelBorderProps) {
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

  if (!isPixelTheme) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`relative ${className}`}
      style={{
        imageRendering: "pixelated",
      }}
    >
      {/* Main border - brighter and more visible */}
      <div
        style={{
          position: "absolute",
          inset: "-3px",
          border: "3px solid #06b6d4",
          pointerEvents: "none",
          boxShadow: "0 0 15px rgba(6, 182, 212, 0.8), inset 0 0 10px rgba(6, 182, 212, 0.3)",
        }}
      />

      {/* Corner pixels - bright cyan */}
      {[
        { top: "-6px", left: "-6px" },
        { top: "-6px", right: "-6px" },
        { bottom: "-6px", left: "-6px" },
        { bottom: "-6px", right: "-6px" },
      ].map((pos, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            width: "8px",
            height: "8px",
            backgroundColor: "#ffffff",
            boxShadow: "0 0 10px #06b6d4, 0 0 20px rgba(6, 182, 212, 0.5)",
            pointerEvents: "none",
            animation: animated ? `pixelCornerPulse ${1 + idx * 0.2}s steps(2) infinite` : "none",
            ...pos,
          }}
        />
      ))}

      {/* Marching ants effect (top and bottom) - brighter */}
      {animated && (
        <>
          <div
            style={{
              position: "absolute",
              top: "-3px",
              left: "0",
              right: "0",
              height: "3px",
              background: "repeating-linear-gradient(90deg, #ffffff 0px, #ffffff 6px, transparent 6px, transparent 12px)",
              backgroundSize: "24px 100%",
              animation: "marchingAnts 1s steps(4) infinite",
              pointerEvents: "none",
              opacity: 0.8,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-3px",
              left: "0",
              right: "0",
              height: "3px",
              background: "repeating-linear-gradient(90deg, #ffffff 0px, #ffffff 6px, transparent 6px, transparent 12px)",
              backgroundSize: "24px 100%",
              animation: "marchingAnts 1s steps(4) infinite reverse",
              pointerEvents: "none",
              opacity: 0.8,
            }}
          />
        </>
      )}

      {/* Content */}
      {children}

      <style>{`
        @keyframes pixelCornerPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.8); }
        }
        
        @keyframes marchingAnts {
          0% { background-position: 0 0; }
          100% { background-position: 24px 0; }
        }
      `}</style>
    </div>
  );
}
