import { useEffect, useState } from "react";

export function CRTScanlines() {
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

  if (!isPixelTheme) return null;

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-[100]"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.03) 0px,
            rgba(0, 0, 0, 0.03) 1px,
            transparent 1px,
            transparent 3px
          )`,
          animation: "scanlineScroll 12s linear infinite",
          imageRendering: "pixelated",
          opacity: 0.3,
        }}
      />
      
      {/* Very subtle flicker overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[99]"
        style={{
          background: "rgba(255, 255, 255, 0.005)",
          animation: "crtFlicker 0.2s steps(2) infinite",
          mixBlendMode: "overlay",
        }}
      />

      <style>{`
        @keyframes scanlineScroll {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 150px;
          }
        }
        
        @keyframes crtFlicker {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.98;
          }
        }
      `}</style>
    </>
  );
}
