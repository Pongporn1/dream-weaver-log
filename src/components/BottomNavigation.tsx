import { Link, useLocation } from "react-router-dom";
import { Home, Book, Library, BookOpen, BarChart3, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/logs", icon: Book, label: "Logs" },
  { path: "/library", icon: Library, label: "Library" },
  { path: "/story", icon: BookOpen, label: "Story" },
  { path: "/statistics", icon: BarChart3, label: "Stats" },
  { path: "/about", icon: Info, label: "About" },
];

// Mythic theme styles for bottom navigation
const mythicNavStyles: Record<string, React.CSSProperties> = {
  superBloodMoon: {
    background:
      "linear-gradient(to top, rgba(32, 5, 5, 0.98), rgba(48, 8, 8, 0.95), rgba(16, 0, 0, 0.9))",
    borderTop: "2px solid rgba(220, 20, 60, 0.6)",
    boxShadow:
      "0 -4px 30px rgba(220, 20, 60, 0.5), 0 -8px 60px rgba(160, 10, 40, 0.3), inset 0 1px 0 rgba(255, 50, 80, 0.15)",
    animation: "bloodPulse 3s ease-in-out infinite",
  },
  superBlueBloodMoon: {
    background:
      "linear-gradient(135deg, rgba(25, 8, 35, 0.98), rgba(45, 15, 60, 0.95), rgba(65, 25, 85, 0.92))",
    borderTop: "2px solid rgba(180, 60, 140, 0.7)",
    boxShadow:
      "0 -4px 25px rgba(180, 40, 120, 0.6), 0 -8px 50px rgba(220, 80, 160, 0.4), 0 -12px 80px rgba(160, 20, 100, 0.2), inset 0 4px 15px rgba(220, 100, 180, 0.15)",
    animation: "royalShimmer 3s ease-in-out infinite",
    backdropFilter: "blur(15px) saturate(180%)",
  },
  lunarTransientPhenomena: {
    background: "rgba(14, 10, 30, 0.98)",
    borderTop: "2px solid rgba(200, 168, 248, 0.7)",
    boxShadow:
      "0 -3px 15px rgba(200, 168, 248, 0.5), 0 -1px 5px rgba(255, 255, 255, 0.8), 0 -10px 40px rgba(150, 120, 255, 0.2)",
    animation: "electricGlitch 5s steps(10) infinite",
  },
  hybridEclipse: {
    background:
      "linear-gradient(135deg, rgba(40, 25, 10, 0.98), rgba(60, 40, 20, 0.95), rgba(80, 50, 25, 0.92))",
    borderTop: "3px double rgba(255, 200, 100, 0.6)",
    boxShadow:
      "0 -4px 30px rgba(255, 180, 0, 0.5), 0 -8px 60px rgba(255, 150, 0, 0.3), 0 -12px 90px rgba(255, 120, 0, 0.2), inset 0 4px 20px rgba(255, 200, 50, 0.1)",
    backdropFilter: "blur(14px) saturate(160%)",
  },
  stillMoon: {
    background: "rgba(15, 31, 47, 0.95)",
    borderTop: "2px solid rgba(176, 196, 222, 0.5)",
    boxShadow:
      "0 -4px 25px rgba(176, 196, 222, 0.4), 0 -8px 50px rgba(200, 220, 255, 0.2), inset 0 0 30px rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(15px) saturate(120%)",
  },
  echoMoon: {
    background:
      "linear-gradient(135deg, rgba(18, 10, 35, 0.98), rgba(28, 15, 50, 0.95), rgba(38, 20, 65, 0.92))",
    borderTop: "3px double rgba(144, 144, 184, 0.6)",
    boxShadow:
      "0 -4px 28px rgba(147, 51, 234, 0.5), 0 -8px 55px rgba(168, 85, 247, 0.35), 0 -12px 85px rgba(126, 34, 206, 0.2), inset 0 4px 18px rgba(167, 139, 250, 0.12)",
    backdropFilter: "blur(13px) saturate(150%)",
  },
  brokenMoon: {
    background:
      "linear-gradient(135deg, rgba(20, 20, 25, 0.98), rgba(35, 35, 40, 0.95), rgba(50, 50, 55, 0.92))",
    borderTop: "2px dashed rgba(200, 200, 210, 0.6)",
    boxShadow:
      "0 -4px 22px rgba(160, 160, 180, 0.5), 0 -8px 45px rgba(180, 180, 200, 0.3), 0 -12px 70px rgba(140, 140, 160, 0.2), inset 0 4px 16px rgba(220, 220, 230, 0.08)",
    backdropFilter: "blur(12px) saturate(120%)",
    backgroundImage:
      "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(152, 152, 184, 0.05) 10px, rgba(152, 152, 184, 0.05) 11px)",
  },
  emptySky: {
    background:
      "linear-gradient(135deg, rgba(2, 2, 8, 0.99), rgba(8, 8, 15, 0.98), rgba(15, 15, 22, 0.97))",
    borderTop: "1px solid rgba(80, 80, 100, 0.3)",
    boxShadow:
      "0 -4px 40px rgba(20, 20, 40, 0.9), 0 -8px 80px rgba(10, 10, 30, 0.7), 0 -12px 120px rgba(5, 5, 20, 0.5), inset 0 4px 25px rgba(40, 40, 60, 0.15)",
    backdropFilter: "blur(20px) saturate(85%) brightness(0.6)",
    animation: "voidPulse 6s ease-in-out infinite",
  },
  crystalMoon: {
    background:
      "linear-gradient(135deg, rgba(10, 14, 48, 0.95), rgba(15, 20, 60, 0.92), rgba(20, 30, 70, 0.88))",
    borderTop: "2px solid rgba(255, 255, 255, 0.4)",
    boxShadow:
      "0 -4px 25px rgba(224, 240, 255, 0.5), 0 -8px 50px rgba(180, 200, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
    animation: "prismShift 8s ease-in-out infinite",
  },
  arcticMoon: {
    background:
      "linear-gradient(135deg, rgba(15, 25, 40, 0.98), rgba(25, 40, 60, 0.95), rgba(35, 55, 80, 0.92))",
    borderTop: "2px solid rgba(144, 220, 255, 0.6)",
    boxShadow:
      "0 -4px 28px rgba(80, 180, 230, 0.5), 0 -8px 56px rgba(120, 200, 250, 0.35), 0 -12px 84px rgba(60, 160, 210, 0.25), inset 0 4px 18px rgba(150, 220, 255, 0.12)",
    backdropFilter: "blur(16px) saturate(170%)",
    position: "relative",
    overflow: "hidden",
  },
  shatteredMoon: {
    background:
      "linear-gradient(135deg, rgba(22, 22, 30, 0.98), rgba(38, 38, 48, 0.95), rgba(54, 54, 66, 0.92))",
    borderTop: "2px solid rgba(192, 192, 192, 0.5)",
    boxShadow:
      "0 -4px 26px rgba(169, 169, 169, 0.5), 0 -8px 52px rgba(200, 200, 200, 0.35), 0 -12px 78px rgba(150, 150, 150, 0.2), inset 0 4px 17px rgba(220, 220, 220, 0.1)",
    backdropFilter: "blur(14px) saturate(140%)",
  },
  cosmicVoyageMoon: {
    background:
      "linear-gradient(135deg, rgba(10, 10, 30, 0.98), rgba(20, 15, 50, 0.95), rgba(30, 20, 70, 0.92))",
    borderTop: "2px solid rgba(138, 43, 226, 0.6)",
    boxShadow:
      "0 -4px 28px rgba(138, 43, 226, 0.5), 0 -8px 56px rgba(168, 73, 255, 0.35), 0 -12px 84px rgba(108, 23, 196, 0.25), inset 0 4px 18px rgba(178, 103, 255, 0.12)",
    backdropFilter: "blur(16px) saturate(170%)",
  },
  nebulaDreamMoon: {
    background:
      "linear-gradient(135deg, rgba(25, 15, 40, 0.98), rgba(40, 25, 60, 0.95), rgba(55, 35, 80, 0.92))",
    borderTop: "2px solid rgba(200, 150, 240, 0.6)",
    boxShadow:
      "0 -4px 28px rgba(184, 136, 216, 0.5), 0 -8px 56px rgba(200, 150, 240, 0.4), 0 -12px 84px rgba(168, 120, 200, 0.25), inset 0 4px 18px rgba(220, 180, 255, 0.12)",
    animation: "nebulaSwirl 5s ease-in-out infinite",
    backdropFilter: "blur(16px) saturate(180%)",
  },
};

export function BottomNavigation() {
  const location = useLocation();
  const [mythicTheme, setMythicTheme] = useState<string | null>(null);

  useEffect(() => {
    // Check for mythic theme attribute
    const theme = document.documentElement.getAttribute("data-mythic-theme");
    setMythicTheme(theme);

    // Watch for changes
    const observer = new MutationObserver(() => {
      const newTheme =
        document.documentElement.getAttribute("data-mythic-theme");
      setMythicTheme(newTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-mythic-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const navStyle =
    mythicTheme && mythicNavStyles[mythicTheme]
      ? mythicNavStyles[mythicTheme]
      : undefined;

  return (
    <nav
      className={cn(
        "mythic-bottom-nav fixed bottom-0 left-0 right-0 border-t z-20",
        !mythicTheme && "bg-background",
      )}
      style={navStyle}
    >
      {/* Special effects overlays for certain themes */}
      {mythicTheme === "hybridEclipse" && (
        <div
          className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255, 220, 120, 0.8) 50%, transparent)",
            animation: "goldenWave 3s ease-in-out infinite",
          }}
        />
      )}
      {mythicTheme === "arcticMoon" && (
        <div
          className="absolute top-0 left-0 w-[200%] h-full pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(100, 200, 255, 0.1) 25%, rgba(144, 220, 255, 0.2) 50%, rgba(100, 200, 255, 0.1) 75%, transparent)",
            animation: "auroraFlow 6s ease-in-out infinite",
            left: "-100%",
          }}
        />
      )}

      <div className="flex justify-around items-center h-16 max-w-md mx-auto relative z-10">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive =
            location.pathname === path ||
            (path !== "/" && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "mythic-nav-item flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors min-w-[60px] relative",
                isActive
                  ? "text-primary bg-primary/10 rounded-lg mythic-nav-active"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg",
              )}
              style={
                mythicTheme === "cosmicVoyageMoon" && isActive
                  ? {
                      background: "transparent",
                    }
                  : undefined
              }
            >
              {mythicTheme === "cosmicVoyageMoon" && isActive && (
                <div
                  className="absolute inset-0 rounded-lg -z-10"
                  style={{
                    background:
                      "linear-gradient(45deg, transparent, rgba(128, 144, 192, 0.3), transparent)",
                    animation: "cosmicOrbit 3s linear infinite",
                  }}
                />
              )}
              {/* Super Blood Moon - Pulsing particles */}
              {mythicTheme === "superBloodMoon" && isActive && (
                <>
                  <div
                    className="absolute inset-0 rounded-lg -z-10"
                    style={{
                      boxShadow:
                        "0 0 20px rgba(220, 20, 60, 0.5), inset 0 0 10px rgba(255, 50, 80, 0.2)",
                      animation: "bloodGlow 2s ease-in-out infinite",
                    }}
                  />
                </>
              )}
              {/* Lunar Transient Phenomena - Electric sparks */}
              {mythicTheme === "lunarTransientPhenomena" && isActive && (
                <div
                  className="absolute inset-0 rounded-lg -z-10"
                  style={{
                    boxShadow:
                      "0 0 15px rgba(200, 168, 248, 0.6), 0 0 5px rgba(255, 255, 255, 0.8)",
                    animation: "electricSpark 0.5s steps(5) infinite",
                  }}
                />
              )}
              {/* Crystal Moon - Rainbow shimmer */}
              {mythicTheme === "crystalMoon" && isActive && (
                <div
                  className="absolute inset-0 rounded-lg -z-10"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255, 50, 50, 0.1), rgba(50, 255, 50, 0.1), rgba(50, 50, 255, 0.1))",
                    animation: "prismShift 3s ease-in-out infinite",
                  }}
                />
              )}
              {/* Nebula Dream - Swirling clouds */}
              {mythicTheme === "nebulaDreamMoon" && isActive && (
                <div className="absolute inset-0 rounded-lg -z-10 overflow-hidden">
                  <div
                    style={{
                      position: "absolute",
                      inset: "-20%",
                      background:
                        "radial-gradient(circle, rgba(184, 136, 216, 0.3) 0%, transparent 70%)",
                      animation: "nebulaRotate 8s linear infinite",
                    }}
                  />
                </div>
              )}
              {/* Empty Sky - Void drifting */}
              {mythicTheme === "emptySky" && isActive && (
                <div
                  className="absolute inset-0 rounded-lg -z-10"
                  style={{
                    background:
                      "radial-gradient(circle at center, rgba(40, 40, 60, 0.3) 0%, rgba(20, 20, 40, 0.2) 50%, transparent 100%)",
                    boxShadow:
                      "inset 0 0 15px rgba(10, 10, 25, 0.5), 0 0 10px rgba(30, 30, 50, 0.4)",
                    animation: "voidDrift 4s ease-in-out infinite",
                  }}
                />
              )}
              <Icon
                className={cn(
                  "w-5 h-5 transition-all duration-300",
                  mythicTheme && isActive && "drop-shadow-lg",
                )}
                style={
                  mythicTheme && isActive
                    ? {
                        filter:
                          mythicTheme === "superBloodMoon"
                            ? "drop-shadow(0 0 6px rgba(220, 20, 60, 0.8))"
                            : mythicTheme === "emptySky"
                              ? "drop-shadow(0 0 5px rgba(60, 60, 80, 0.7))"
                              : mythicTheme === "lunarTransientPhenomena"
                                ? "drop-shadow(0 0 6px rgba(200, 168, 248, 0.8))"
                                : mythicTheme === "crystalMoon"
                                  ? "drop-shadow(0 0 6px rgba(224, 240, 255, 0.8))"
                                  : mythicTheme === "arcticMoon"
                                    ? "drop-shadow(0 0 6px rgba(144, 220, 255, 0.8))"
                                    : mythicTheme === "nebulaDreamMoon"
                                      ? "drop-shadow(0 0 6px rgba(184, 136, 216, 0.8))"
                                      : undefined,
                        animation:
                          mythicTheme === "lunarTransientPhenomena"
                            ? "iconFlicker 0.3s steps(3) infinite"
                            : undefined,
                      }
                    : undefined
                }
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
