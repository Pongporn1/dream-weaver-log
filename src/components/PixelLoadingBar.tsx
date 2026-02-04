import { useEffect, useState } from "react";

interface PixelLoadingBarProps {
  progress?: number; // 0-100, if undefined shows indeterminate animation
  text?: string;
}

export function PixelLoadingBar({ progress, text = "LOADING..." }: PixelLoadingBarProps) {
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

  const segments = 20;
  const filledSegments = progress !== undefined 
    ? Math.floor((progress / 100) * segments)
    : 0;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Loading Bar */}
      <div
        className="relative flex gap-[2px] p-2"
        style={{
          background: "#0f172a",
          border: "4px solid #06b6d4",
          boxShadow: "0 0 20px rgba(6, 182, 212, 0.8), inset 0 0 15px rgba(6, 182, 212, 0.2)",
          imageRendering: "pixelated",
        }}
      >
        {[...Array(segments)].map((_, i) => {
          let bgColor = "#1e293b"; // Empty - slightly lighter dark
          let glowColor = "none";
          
          if (progress !== undefined) {
            // Determinate mode
            if (i < filledSegments) {
              if (i < filledSegments * 0.5) {
                bgColor = "#3b82f6"; // Blue
                glowColor = "0 0 8px #3b82f6";
              } else if (i < filledSegments * 0.8) {
                bgColor = "#06b6d4"; // Cyan
                glowColor = "0 0 10px #06b6d4";
              } else {
                bgColor = "#ffffff"; // White
                glowColor = "0 0 12px #ffffff, 0 0 20px rgba(255, 255, 255, 0.5)";
              }
            }
          } else {
            // Indeterminate mode - animated wave
            const phase = (Date.now() / 100 + i) % segments;
            if (phase < 5) {
              if (phase < 2) {
                bgColor = "#3b82f6";
                glowColor = "0 0 8px #3b82f6";
              } else if (phase < 4) {
                bgColor = "#06b6d4";
                glowColor = "0 0 10px #06b6d4";
              } else {
                bgColor = "#ffffff";
                glowColor = "0 0 12px #ffffff";
              }
            }
          }

          return (
            <div
              key={i}
              style={{
                width: "14px",
                height: "24px",
                backgroundColor: bgColor,
                boxShadow: glowColor,
                transition: isPixelTheme ? "none" : "background-color 0.1s steps(2)",
                border: bgColor !== "#1e293b" ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
              }}
            />
          );
        })}
      </div>

      {/* Loading Text */}
      {text && (
        <div
          className="text-[#06b6d4] font-['Press_Start_2P'] text-[12px] tracking-wider"
          style={{
            textShadow: "0 0 10px rgba(6, 182, 212, 1), 0 0 20px rgba(6, 182, 212, 0.5)",
            animation: "pixelBlink 1s steps(2) infinite",
          }}
        >
          {text}
        </div>
      )}

      <style>{`
        @keyframes pixelBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
