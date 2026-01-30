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
      "linear-gradient(to top, rgba(40, 0, 0, 0.99), rgba(60, 8, 8, 0.97), rgba(80, 15, 15, 0.94))",
    borderTop: "3px solid rgba(220, 20, 60, 0.7)",
    boxShadow:
      "0 -4px 35px rgba(220, 20, 60, 0.7), 0 -8px 70px rgba(180, 0, 40, 0.5), 0 -12px 100px rgba(140, 0, 30, 0.3), inset 0 2px 20px rgba(255, 50, 80, 0.2), inset 0 -2px 15px rgba(80, 0, 0, 0.4)",
    animation: "bloodPulse 3s ease-in-out infinite",
    backdropFilter: "blur(18px) saturate(140%) brightness(0.9)",
  },
  superBlueBloodMoon: {
    background:
      "linear-gradient(135deg, rgba(30, 10, 45, 0.99), rgba(50, 20, 70, 0.97), rgba(70, 30, 95, 0.94))",
    borderTop: "3px solid rgba(180, 60, 140, 0.8)",
    borderImage:
      "linear-gradient(90deg, rgba(140, 40, 100, 0.6), rgba(200, 80, 160, 0.9), rgba(160, 60, 120, 0.7), rgba(200, 80, 160, 0.9), rgba(140, 40, 100, 0.6)) 1",
    boxShadow:
      "0 -4px 30px rgba(180, 40, 120, 0.7), 0 -8px 60px rgba(220, 80, 160, 0.5), 0 -12px 90px rgba(160, 20, 100, 0.3), inset 0 4px 20px rgba(220, 100, 180, 0.2), inset 0 -2px 15px rgba(100, 30, 80, 0.3)",
    animation: "royalShimmer 3s ease-in-out infinite",
    backdropFilter: "blur(20px) saturate(200%) brightness(1.05)",
  },
  lunarTransientPhenomena: {
    background:
      "linear-gradient(135deg, rgba(10, 8, 35, 0.99), rgba(18, 15, 50, 0.97), rgba(25, 20, 65, 0.94))",
    borderTop: "2px solid rgba(200, 168, 248, 0.8)",
    boxShadow:
      "0 -3px 20px rgba(200, 168, 248, 0.7), 0 -6px 40px rgba(220, 190, 255, 0.5), 0 -1px 8px rgba(255, 255, 255, 0.9), 0 -10px 60px rgba(150, 120, 255, 0.3), inset 0 2px 15px rgba(180, 150, 230, 0.15)",
    animation: "electricGlitch 5s steps(10) infinite",
    backdropFilter: "blur(16px) saturate(160%) brightness(1.1)",
  },
  hybridEclipse: {
    background:
      "linear-gradient(135deg, rgba(50, 30, 10, 0.99), rgba(70, 45, 20, 0.97), rgba(90, 60, 30, 0.94))",
    borderTop: "3px double rgba(255, 200, 100, 0.8)",
    borderImage:
      "linear-gradient(90deg, rgba(255, 150, 0, 0.5), rgba(255, 220, 100, 0.9), rgba(255, 180, 50, 0.7), rgba(255, 220, 100, 0.9), rgba(255, 150, 0, 0.5)) 1",
    boxShadow:
      "0 -4px 35px rgba(255, 180, 0, 0.7), 0 -8px 70px rgba(255, 150, 0, 0.5), 0 -12px 105px rgba(255, 120, 0, 0.3), inset 0 4px 25px rgba(255, 200, 50, 0.2), inset 0 -2px 15px rgba(120, 70, 20, 0.4)",
    backdropFilter: "blur(18px) saturate(180%) brightness(1.05)",
  },
  stillMoon: {
    background:
      "linear-gradient(135deg, rgba(15, 31, 47, 0.98), rgba(25, 45, 65, 0.96), rgba(35, 55, 80, 0.93))",
    borderTop: "2px solid rgba(176, 196, 222, 0.6)",
    boxShadow:
      "0 -4px 30px rgba(176, 196, 222, 0.5), 0 -8px 60px rgba(200, 220, 255, 0.3), 0 -12px 90px rgba(150, 180, 220, 0.2), inset 0 0 40px rgba(200, 220, 255, 0.05), inset 0 2px 20px rgba(180, 200, 230, 0.1)",
    backdropFilter: "blur(20px) saturate(110%) brightness(0.95)",
    animation: "stillFreeze 8s ease-in-out infinite",
  },
  echoMoon: {
    background:
      "linear-gradient(135deg, rgba(20, 12, 40, 0.99), rgba(35, 20, 60, 0.97), rgba(50, 28, 80, 0.94))",
    borderTop: "3px double rgba(144, 144, 184, 0.7)",
    boxShadow:
      "0 -4px 32px rgba(147, 51, 234, 0.6), 0 -8px 64px rgba(168, 85, 247, 0.4), 0 -12px 96px rgba(126, 34, 206, 0.25), inset 0 4px 22px rgba(167, 139, 250, 0.15), inset 0 -2px 15px rgba(80, 40, 120, 0.3)",
    backdropFilter: "blur(18px) saturate(170%) brightness(1.05)",
    animation: "echoRipple 4s ease-in-out infinite",
  },
  brokenMoon: {
    background:
      "linear-gradient(135deg, rgba(25, 25, 30, 0.99), rgba(40, 40, 48, 0.97), rgba(55, 55, 65, 0.94))",
    borderTop: "2px dashed rgba(200, 200, 210, 0.7)",
    boxShadow:
      "0 -4px 28px rgba(160, 160, 180, 0.6), 0 -8px 56px rgba(180, 180, 200, 0.4), 0 -12px 84px rgba(140, 140, 160, 0.25), inset 0 4px 20px rgba(220, 220, 230, 0.12), inset 0 -2px 15px rgba(60, 60, 75, 0.4)",
    backdropFilter: "blur(16px) saturate(110%) brightness(0.95)",
    backgroundImage:
      "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(152, 152, 184, 0.08) 10px, rgba(152, 152, 184, 0.08) 11px), repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(170, 170, 190, 0.06) 12px, rgba(170, 170, 190, 0.06) 13px)",
    animation: "shatterPulse 5s ease-in-out infinite",
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
      "linear-gradient(135deg, rgba(240, 248, 255, 0.15) 0%, rgba(224, 240, 255, 0.12) 25%, rgba(200, 230, 255, 0.18) 50%, rgba(220, 240, 255, 0.1) 75%, rgba(240, 248, 255, 0.15) 100%)",
    borderTop: "2px solid rgba(255, 255, 255, 0.5)",
    borderImage:
      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), rgba(220, 240, 255, 0.6), rgba(255, 255, 255, 0.8), transparent) 1",
    boxShadow:
      "0 -4px 30px rgba(220, 240, 255, 0.6), 0 -8px 60px rgba(200, 230, 255, 0.4), 0 -12px 90px rgba(180, 220, 255, 0.3), inset 0 2px 20px rgba(255, 255, 255, 0.2), inset 0 -1px 10px rgba(200, 230, 255, 0.15)",
    backdropFilter: "blur(25px) saturate(120%) brightness(1.1) contrast(1.05)",
    animation: "crystalFacet 6s ease-in-out infinite",
  },
  arcticMoon: {
    background:
      "linear-gradient(135deg, rgba(18, 30, 48, 0.99), rgba(30, 48, 70, 0.97), rgba(42, 65, 95, 0.94))",
    borderTop: "3px solid rgba(144, 220, 255, 0.7)",
    borderImage:
      "linear-gradient(90deg, rgba(100, 180, 220, 0.5), rgba(160, 230, 255, 0.9), rgba(120, 200, 240, 0.6), rgba(160, 230, 255, 0.9), rgba(100, 180, 220, 0.5)) 1",
    boxShadow:
      "0 -4px 35px rgba(80, 180, 230, 0.6), 0 -8px 70px rgba(120, 200, 250, 0.45), 0 -12px 105px rgba(60, 160, 210, 0.3), inset 0 4px 22px rgba(150, 220, 255, 0.15), inset 0 -2px 15px rgba(30, 60, 90, 0.4)",
    backdropFilter: "blur(20px) saturate(190%) brightness(1.05)",
  },
  shatteredMoon: {
    background:
      "linear-gradient(135deg, rgba(28, 28, 38, 0.99), rgba(45, 45, 58, 0.97), rgba(62, 62, 78, 0.94))",
    borderTop: "2px solid rgba(192, 192, 192, 0.6)",
    borderImage:
      "repeating-linear-gradient(90deg, rgba(180, 180, 180, 0.4) 0px, rgba(220, 220, 220, 0.7) 5px, rgba(180, 180, 180, 0.4) 10px) 1",
    boxShadow:
      "0 -4px 32px rgba(169, 169, 169, 0.6), 0 -8px 64px rgba(200, 200, 200, 0.45), 0 -12px 96px rgba(150, 150, 150, 0.3), inset 0 4px 22px rgba(220, 220, 220, 0.15), inset 0 -2px 15px rgba(60, 60, 70, 0.4)",
    backdropFilter: "blur(18px) saturate(130%) brightness(1.05)",
    backgroundImage:
      "repeating-linear-gradient(30deg, transparent, transparent 8px, rgba(200, 200, 210, 0.06) 8px, rgba(200, 200, 210, 0.06) 9px), repeating-linear-gradient(-60deg, transparent, transparent 10px, rgba(180, 180, 190, 0.08) 10px, rgba(180, 180, 190, 0.08) 11px)",
    animation: "fragmentShimmer 4s ease-in-out infinite",
  },
  cosmicVoyageMoon: {
    background:
      "linear-gradient(135deg, rgba(12, 12, 35, 0.99), rgba(25, 18, 60, 0.97), rgba(38, 25, 85, 0.94))",
    borderTop: "3px solid rgba(138, 43, 226, 0.7)",
    borderImage:
      "linear-gradient(90deg, rgba(100, 30, 180, 0.5), rgba(160, 80, 255, 0.9), rgba(120, 50, 210, 0.6), rgba(160, 80, 255, 0.9), rgba(100, 30, 180, 0.5)) 1",
    boxShadow:
      "0 -4px 35px rgba(138, 43, 226, 0.7), 0 -8px 70px rgba(168, 73, 255, 0.5), 0 -12px 105px rgba(108, 23, 196, 0.35), inset 0 4px 22px rgba(178, 103, 255, 0.15), inset 0 -2px 15px rgba(50, 20, 80, 0.4)",
    backdropFilter: "blur(20px) saturate(190%) brightness(1.05)",
  },
  nebulaDreamMoon: {
    background:
      "linear-gradient(135deg, rgba(30, 18, 48, 0.99), rgba(48, 30, 72, 0.97), rgba(66, 42, 96, 0.94))",
    borderTop: "3px solid rgba(200, 150, 240, 0.7)",
    borderImage:
      "linear-gradient(90deg, rgba(160, 120, 200, 0.5), rgba(220, 170, 255, 0.9), rgba(180, 140, 220, 0.6), rgba(220, 170, 255, 0.9), rgba(160, 120, 200, 0.5)) 1",
    boxShadow:
      "0 -4px 35px rgba(184, 136, 216, 0.7), 0 -8px 70px rgba(200, 150, 240, 0.5), 0 -12px 105px rgba(168, 120, 200, 0.35), inset 0 4px 22px rgba(220, 180, 255, 0.15), inset 0 -2px 15px rgba(60, 40, 90, 0.4)",
    animation: "nebulaSwirl 5s ease-in-out infinite",
    backdropFilter: "blur(20px) saturate(200%) brightness(1.05)",
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
                <>
                  <div
                    className="absolute inset-0 rounded-lg -z-10"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(220, 240, 255, 0.12), rgba(200, 230, 255, 0.15), rgba(240, 250, 255, 0.1))",
                      boxShadow:
                        "inset 0 0 15px rgba(255, 255, 255, 0.3), 0 0 20px rgba(220, 240, 255, 0.4)",
                      animation: "crystalSparkle 3s ease-in-out infinite",
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-lg -z-10"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(200, 230, 255, 0.15) 0%, transparent 50%)",
                      animation:
                        "crystalSparkle 3s ease-in-out infinite reverse",
                    }}
                  />
                </>
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
