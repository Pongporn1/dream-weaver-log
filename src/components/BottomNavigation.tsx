import { Link, useLocation } from "react-router-dom";
import { Home, Book, Library, BookOpen, BarChart3, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { usePixelRipple } from "@/hooks/usePixelRipple";
import {
  PixelDreamNavEffects,
  SuperBlueBloodMoonNavEffects,
  SuperBloodMoonNavEffects,
  NebulaDreamMoonNavEffects,
  CosmicVoyageMoonNavEffects,
} from "@/components/mythic/BottomNavEffects";


const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/logs", icon: Book, label: "Logs" },
  { path: "/library", icon: Library, label: "Library" },
  { path: "/story", icon: BookOpen, label: "Story" },
  { path: "/statistics", icon: BarChart3, label: "Stats" },
  { path: "/about", icon: Info, label: "About" },
];

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

// Mythic theme styles for bottom navigation
const mythicNavStyles: Record<string, React.CSSProperties> = {
  superBloodMoon: {
    background:
      "linear-gradient(to top, rgba(50, 0, 0, 0.95), rgba(80, 10, 10, 0.9), rgba(100, 20, 20, 0.8))",
    borderTop: "1px solid rgba(255, 50, 50, 0.6)",
    boxShadow:
      "0 -10px 40px rgba(220, 20, 60, 0.6), 0 -2px 10px rgba(255, 0, 0, 0.4), inset 0 2px 20px rgba(255, 50, 50, 0.2)",
    animation: "bloodPulse 3s ease-in-out infinite",
    backdropFilter: "blur(20px) saturate(150%)",
  },
  superBlueBloodMoon: {
    background:
      "linear-gradient(135deg, rgba(20, 0, 40, 0.95), rgba(60, 20, 80, 0.9), rgba(100, 40, 120, 0.8))",
    borderTop: "1px solid rgba(200, 100, 255, 0.6)",
    borderImage:
      "linear-gradient(90deg, transparent, rgba(200, 100, 255, 1), rgba(100, 200, 255, 1), transparent) 1",
    boxShadow:
      "0 -10px 40px rgba(120, 20, 220, 0.6), 0 -2px 10px rgba(200, 100, 255, 0.4), inset 0 2px 20px rgba(200, 100, 255, 0.2)",
    animation: "royalShimmer 4s ease-in-out infinite",
    backdropFilter: "blur(20px) saturate(180%)",
  },
  lunarTransientPhenomena: {
    background:
      "linear-gradient(to top, rgba(10, 10, 20, 0.95), rgba(30, 30, 60, 0.9))",
    borderTop: "1px solid rgba(150, 255, 255, 0.8)",
    boxShadow:
      "0 -5px 30px rgba(100, 255, 255, 0.5), 0 0 15px rgba(100, 255, 255, 0.3), inset 0 0 20px rgba(100, 255, 255, 0.1)",
    animation: "electricGlitch 3s steps(5) infinite",
    backdropFilter: "blur(15px) brightness(1.2)",
  },
  hybridEclipse: {
    background:
      "linear-gradient(to top, rgba(20, 10, 0, 0.95), rgba(60, 40, 10, 0.9))",
    borderTop: "1px solid rgba(255, 200, 100, 0.8)",
    boxShadow:
      "0 -5px 35px rgba(255, 160, 50, 0.6), 0 0 15px rgba(255, 200, 100, 0.4), inset 0 2px 10px rgba(255, 200, 100, 0.2)",
    animation: "eclipsePulse 4s ease-in-out infinite",
    backdropFilter: "blur(18px) contrast(1.1)",
  },
  stillMoon: {
    background:
      "linear-gradient(to top, rgba(200, 220, 255, 0.15), rgba(255, 255, 255, 0.05))",
    borderTop: "1px solid rgba(255, 255, 255, 0.6)",
    boxShadow:
      "0 -5px 30px rgba(200, 230, 255, 0.4), inset 0 0 30px rgba(200, 230, 255, 0.2)",
    backdropFilter: "blur(30px) brightness(1.1)",
    animation: "stillFreeze 10s linear infinite",
  },
  echoMoon: {
    background:
      "linear-gradient(to top, rgba(30, 15, 60, 0.98), rgba(15, 5, 30, 0.98))",
    backgroundSize: "200% 100%",
    borderTop: "2px solid rgba(180, 130, 255, 0.8)",
    // Brighter sound wave effect
    borderImage: "repeating-linear-gradient(90deg, rgba(160, 100, 255, 0.5) 0, rgba(200, 150, 255, 1) 20px, rgba(160, 100, 255, 0.5) 40px) 1",
    // Stronger reverberating shadows
    boxShadow: `
      0 -5px 25px rgba(140, 70, 255, 0.6),
      0 -10px 50px rgba(124, 58, 237, 0.3),
      inset 0 4px 20px rgba(200, 160, 255, 0.2)
    `,
    animation: "echoRipple 3s infinite linear",
    backdropFilter: "blur(25px)",
  },
  brokenMoon: {
    background:
      "linear-gradient(to top, rgba(10, 10, 12, 0.95), rgba(30, 30, 35, 0.9))",
    borderTop: "2px dashed rgba(255, 255, 255, 0.4)",
    boxShadow:
      "0 -5px 25px rgba(255, 255, 255, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.1)",
    backgroundImage:
      "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 11px)",
    backdropFilter: "blur(15px) grayscale(0.8)",
  },
  emptySky: {
    background: "#050505",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow:
      "0 -10px 50px rgba(0, 0, 0, 1), 0 0 20px rgba(255, 255, 255, 0.1) inset",
    backdropFilter: "blur(50px) brightness(0.5)",
  },
  crystalMoon: {
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(200, 240, 255, 0.2))",
    borderTop: "1px solid rgba(255, 255, 255, 0.8)",
    boxShadow:
      "0 -5px 35px rgba(200, 240, 255, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.4)",
    backdropFilter: "blur(25px) contrast(1.2)",
    animation: "crystalFacet 5s ease-in-out infinite",
  },
  arcticMoon: {
    background:
      "linear-gradient(to top, rgba(20, 40, 60, 0.9), rgba(50, 100, 150, 0.8))",
    borderTop: "1px solid rgba(150, 230, 255, 0.8)",
    boxShadow:
      "0 -8px 30px rgba(100, 200, 255, 0.5), inset 0 0 20px rgba(150, 230, 255, 0.3)",
    backdropFilter: "blur(20px) brightness(1.1)",
  },
  shatteredMoon: {
    background:
      "linear-gradient(to top, rgba(20, 20, 25, 0.95), rgba(50, 50, 60, 0.9))",
    borderTop: "1px double rgba(255, 255, 255, 0.5)",
    boxShadow:
      "0 -5px 25px rgba(255, 255, 255, 0.25), inset 0 0 10px rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(15px)",
  },
  cosmicVoyageMoon: {
    background:
      "linear-gradient(to top, rgba(30, 10, 60, 0.95), rgba(60, 20, 100, 0.9))",
    borderTop: "1px solid rgba(200, 100, 255, 0.7)",
    boxShadow:
      "0 -8px 35px rgba(150, 50, 255, 0.5), inset 0 0 15px rgba(200, 100, 255, 0.2)",
    backdropFilter: "blur(20px)",
  },
  nebulaDreamMoon: {
    background:
      "linear-gradient(to top, rgba(40, 20, 60, 0.95), rgba(80, 40, 100, 0.9))",
    borderTop: "1px solid rgba(255, 150, 255, 0.7)",
    boxShadow:
      "0 -8px 35px rgba(255, 100, 255, 0.5), 0 0 20px rgba(255, 100, 255, 0.2) inset",
    backdropFilter: "blur(20px)",
    animation: "nebulaSwirl 6s ease-in-out infinite",
  },
  pixelDreamMoon: {
    background: "linear-gradient(to bottom, #1e1b4b 60%, #0e7490 60%)", // Indigo Sky to Cyan Hill
    borderTop: "4px solid #3730a3", // Dark Indigo Base
    // Hard Pixel Bevel (No blur)
    boxShadow: `
      0 -4px 0 #c7d2fe,              /* Top Highlight (Light Blue) */
      0 4px 0 #312e81,               /* Bottom Shadow (Deep Indigo) */
      0 8px 0 rgba(15, 23, 42, 0.5)  /* Drop Shadow */
    `,
    imageRendering: "pixelated",

    // Stargazing Night
  },
};

export function BottomNavigation() {
  const location = useLocation();
  const [mythicTheme, setMythicTheme] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const isLowParticle =
    prefersReducedMotion ||
    (typeof window !== "undefined" && window.innerWidth <= 480);

  const arcticSnowParticles = useMemo(() => {
    if (mythicTheme !== "arcticMoon") return [];
    const count = isLowParticle ? 6 : 15;
    return Array.from({ length: count }).map(() => ({
      size: Math.random() * 2 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 3 + 2,
      opacity: Math.random() * 0.8 + 0.2,
    }));
  }, [mythicTheme, isLowParticle]);

  const arcticMeteors = useMemo(() => {
    if (mythicTheme !== "arcticMoon") return [];
    const count = isLowParticle ? 2 : 6;
    return Array.from({ length: count }).map(() => ({
      top: -Math.random() * 100 - 50,
      right: Math.random() * 100 - 20,
      width: Math.random() * 120 + 80,
      color: Math.random() > 0.5 ? "white" : "#a5f3fc",
      glow: Math.random() > 0.5 ? "white" : "cyan",
      duration: Math.random() * 5 + 3,
      delay: Math.random() * 10,
    }));
  }, [mythicTheme, isLowParticle]);

  const pixelDreamData = useMemo(() => {
    if (mythicTheme !== "pixelDreamMoon") return null;
    const staticCount = isLowParticle ? 8 : 15;
    const twinkleCount = isLowParticle ? 3 : 6;
    const milkyCount = isLowParticle ? 16 : 30;
    const grassCount = isLowParticle ? 8 : 15;
    const fireflyCount = isLowParticle ? 6 : 12;

    return {
      staticStars: Array.from({ length: staticCount }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
      })),
      twinkleStars: Array.from({ length: twinkleCount }).map(() => ({
        top: `${Math.random() * 80 + 10}%`,
        left: `${Math.random() * 90 + 5}%`,
        duration: randomBetween(1, 3),
      })),
      milkyStars: Array.from({ length: milkyCount }).map(() => ({
        top: `${Math.random() * 80}%`,
        left: `${Math.random() * 80 + 10}%`,
        duration: randomBetween(2, 5),
      })),
      embers: Array.from({ length: 3 }).map((_, i) => ({
        left: i,
        duration: randomBetween(1, 3),
        delay: i * 0.3,
      })),
      grass: Array.from({ length: grassCount }).map(() => ({
        left: `${Math.random() * 90 + 5}%`,
        duration: randomBetween(1, 3),
        delay: Math.random(),
      })),
      fireflies: Array.from({ length: fireflyCount }).map(() => ({
        bottom: `${Math.random() * 40}%`,
        left: `${Math.random() * 100}%`,
        duration: randomBetween(2, 4),
        delay: randomBetween(0, 2),
        fx1: `${randomBetween(-10, 10)}px`,
        fy1: `${-randomBetween(5, 20)}px`,
        fx2: `${randomBetween(-10, 10)}px`,
        fy2: `${-randomBetween(10, 20)}px`,
        fx3: `${randomBetween(-10, 10)}px`,
        fy3: `${-randomBetween(3, 15)}px`,
      })),
    };
  }, [mythicTheme, isLowParticle]);

  const superBlueBloodData = useMemo(() => {
    if (mythicTheme !== "superBlueBloodMoon") return null;
    const starCount = isLowParticle ? 8 : 15;
    return {
      stars: Array.from({ length: starCount }).map(() => ({
        size: randomBetween(1, 3),
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        floatDuration: randomBetween(10, 20),
        twinkleDuration: randomBetween(0.5, 1.5),
      })),
    };
  }, [mythicTheme, isLowParticle]);

  const superBloodData = useMemo(() => {
    if (mythicTheme !== "superBloodMoon") return null;
    const mistCount = isLowParticle ? 4 : 8;
    return {
      mist: Array.from({ length: mistCount }).map(() => ({
        size: randomBetween(50, 150),
        left: `${Math.random() * 100}%`,
        duration: randomBetween(10, 20),
      })),
    };
  }, [mythicTheme, isLowParticle]);

  const nebulaDreamData = useMemo(() => {
    if (mythicTheme !== "nebulaDreamMoon") return null;
    const count = isLowParticle ? 8 : 15;
    return {
      stardust: Array.from({ length: count }).map((_, i) => ({
        size: randomBetween(1, 3),
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        opacity: randomBetween(0.2, 1),
        duration: randomBetween(1, 3),
        delay: randomBetween(0, 1),
        glow: randomBetween(2, 6),
        color: i % 2 === 0 ? "#ff00ff" : "#00ffff",
      })),
    };
  }, [mythicTheme, isLowParticle]);

  const cosmicVoyageData = useMemo(() => {
    if (mythicTheme !== "cosmicVoyageMoon") return null;
    const warpCount = isLowParticle ? 8 : 15;
    const starCount = isLowParticle ? 10 : 20;
    return {
      warpStars: Array.from({ length: warpCount }).map(() => ({
        height: randomBetween(10, 40),
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        duration: randomBetween(1.5, 3.5),
        delay: randomBetween(0, 3),
      })),
      staticStars: Array.from({ length: starCount }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        duration: randomBetween(1, 3),
      })),
    };
  }, [mythicTheme, isLowParticle]);
  const { createRipple, RippleEffect } = usePixelRipple();

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
      ? { ...mythicNavStyles[mythicTheme] }
      : undefined;

  if (navStyle) {
    // Add entrance animation to any existing animation
    const existingAnim = navStyle.animation || "";
    navStyle.animation = `mythicThemeEntrance 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards${existingAnim ? `, ${existingAnim}` : ""}`;
  }

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
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255, 220, 120, 0.8) 50%, transparent)",
            animation: "goldenWave 3s ease-in-out infinite",
          }}
        />
      )}
      <PixelDreamNavEffects data={pixelDreamData} />
      <SuperBlueBloodMoonNavEffects data={superBlueBloodData} />
      <SuperBloodMoonNavEffects data={superBloodData} />
      <NebulaDreamMoonNavEffects data={nebulaDreamData} />
      <CosmicVoyageMoonNavEffects data={cosmicVoyageData} />
      {mythicTheme === "arcticMoon" && (
        <div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden rounded-t-[inherit] pointer-events-none"
          style={{ animation: "mythicThemeEntrance 2.5s ease-out forwards" }}
        >
           {/* Layer 1: Deep Midnight Sky */}
           <div className="absolute inset-0 bg-gradient-to-t from-[#0b1026] via-[#1b2735] to-[#090a0f]" />
           
           {/* Layer 2: Starfield (Slightly dimmer to let Aurora shine) */}
           <div 
             className="absolute inset-0 opacity-60"
             style={{
               backgroundImage: "radial-gradient(1px 1px at 10% 10%, white 10%, transparent 0), radial-gradient(1.5px 1.5px at 50% 40%, white 10%, transparent 0), radial-gradient(2px 2px at 80% 20%, white 10%, transparent 0), radial-gradient(1px 1px at 30% 70%, white 20%, transparent 0)",
               backgroundSize: "200px 200px",
             }}
           />

           {/* Layer 3: Aurora Core (Volumetric Fill) */}
           <div 
             className="absolute inset-0 opacity-40 mix-blend-color-dodge"
             style={{
               background: "linear-gradient(120deg, rgba(0,255,150,0.3), rgba(0,0,0,0), rgba(150,0,255,0.3))",
               backgroundSize: "200% 200%",
               animation: "auroraShift 15s ease-in-out infinite"
             }}
           />

           {/* Layer 4: Aurora Curtain 1 (Intense Green/Teal) */}
           <div 
             className="absolute inset-0 opacity-80 mix-blend-screen"
             style={{
               background: "radial-gradient(ellipse at 50% 100%, rgba(0, 255, 180, 0.5), transparent 70%), linear-gradient(90deg, transparent, rgba(50, 255, 200, 0.3), transparent)",
               filter: "blur(15px)",
               transformOrigin: "bottom center",
               animation: "auroraWave 8s ease-in-out infinite"
             }}
           />

           {/* Layer 5: Aurora Curtain 2 (Vibrant Purple/Pink) */}
           <div 
             className="absolute inset-0 opacity-70 mix-blend-screen"
             style={{
               background: "radial-gradient(ellipse at 80% 80%, rgba(220, 50, 255, 0.4), transparent 60%)",
               filter: "blur(20px)",
               transformOrigin: "bottom center",
               animation: "auroraWave 12s ease-in-out infinite reverse"
             }}
           />

           {/* Layer 6: Waving Light Ribbons (Defined) */}
           <div 
             className="absolute top-0 left-0 w-[200%] h-full opacity-50 mix-blend-overlay"
             style={{
                background: "linear-gradient(90deg, transparent, rgba(100, 255, 218, 0.8), rgba(180, 100, 255, 0.6), transparent)",
                transform: "skewX(-20deg)",
                backgroundSize: "200% 100%",
                animation: "borderFlow 6s linear infinite"
             }}
           />

           {/* Layer 6: Glittering Snow Particles */}
           {arcticSnowParticles.map((particle, i) => (
             <div
               key={i}
               className="absolute bg-white rounded-full blur-[0.5px]"
               style={{
                 width: `${particle.size}px`,
                 height: `${particle.size}px`,
                 top: particle.top,
                 left: particle.left,
                 animation: `twinkle ${particle.duration}s ease-in-out infinite`,
                 opacity: particle.opacity,
               }}
             />
           ))}

           {/* Layer 7: Magnetic Storm (Solar Flare Event) */}
           <div 
             className="absolute inset-0 z-40 mix-blend-overlay pointer-events-none"
             style={{
               background: "radial-gradient(circle at 50% -20%, rgba(200, 255, 255, 0.8), transparent 70%)",
               animation: "auroraFlare 18s ease-in-out infinite"
             }}
           />

           {/* Layer 8: Meteor Shower (Multiple Shooting Stars) */}
           {arcticMeteors.map((meteor, i) => (
             <div
               key={i}
               className="absolute z-20"
               style={{
                 top: `${meteor.top}%`,
                 right: `${meteor.right}%`,
                 width: `${meteor.width}px`,
                 height: "2px",
                 opacity: 0,
                 background: `linear-gradient(to right, transparent, ${meteor.color}, transparent)`,
                 filter: `drop-shadow(0 0 3px ${meteor.glow})`,
                 animation: `shootingStar ${meteor.duration}s linear infinite ${meteor.delay}s both`,
                 transform: "rotate(-45deg)"
               }}
             />
           ))}

           {/* Layer 9: Horizon Glow */}
           <div 
             className="absolute bottom-0 left-0 right-0 h-[40px] z-10"
             style={{
               background: "linear-gradient(to top, rgba(100, 200, 255, 0.2), transparent)"
             }}
           />

           {/* Layer 8: The Aurora Rim (Top Border) */}
           <div 
             className="absolute top-0 left-0 right-0 h-[2px] z-50 opacity-90"
             style={{
               background: "linear-gradient(90deg, transparent, #00ffcc, #bd00ff, #00ffcc, transparent)",
               backgroundSize: "200% 100%",
               animation: "borderFlow 3s linear infinite",
               boxShadow: "0 0 10px rgba(0, 255, 200, 0.6), 0 0 20px rgba(189, 0, 255, 0.4)"
             }}
           />
           {/* Inner Rim Highlight */}
           <div 
             className="absolute top-[2px] left-0 right-0 h-[1px] z-40 opacity-50 mix-blend-overlay"
             style={{ background: "white" }} 
           />
        </div>
      )}
      {mythicTheme === "echoMoon" && (
        <div className="absolute inset-0 overflow-hidden rounded-t-[inherit] pointer-events-none">
           {/* Layer 1: Deep Water Background */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(20, 10, 40, 0.6), transparent)",
            }}
          />
           
           {/* Layer 2: Water Ripples (Replacing Equalizer) */}
           <div className="absolute inset-0 flex items-center justify-center">
             {/* Central Drop Impact */}
             <div 
               className="absolute rounded-full border border-white/30"
               style={{
                 width: "100px", 
                 height: "100px",
                 animation: "waterRipple 3s infinite ease-out"
               }} 
             />
             <div 
               className="absolute rounded-full border border-white/20"
               style={{
                 width: "100px", 
                 height: "100px",
                 animation: "waterRipple 3s infinite ease-out 1s"
               }} 
             />
             <div 
               className="absolute rounded-full border border-white/10"
               style={{
                 width: "100px", 
                 height: "100px",
                 animation: "waterRipple 3s infinite ease-out 2s"
               }} 
             />
           </div>

           {/* Layer 3: Raindrops on Surface (Random positioning simulation using varied delays/scales) */}
           <div 
             className="absolute left-[20%] top-[40%] rounded-full border border-white/20"
             style={{ width: "50px", height: "50px", animation: "waterRipple 4s infinite ease-out 0.5s" }}
           />
           <div 
             className="absolute right-[20%] top-[30%] rounded-full border border-white/20"
             style={{ width: "60px", height: "60px", animation: "waterRipple 5s infinite ease-out 2.5s" }}
           />

           {/* Layer 4: Floating Echo Particles (Kept as requested ("keep it in background")) */}
           {[...Array(5)].map((_, i) => (
             <div
               key={i}
               className="absolute rounded-full bg-white blur-[1px]"
               style={{
                 width: Math.random() * 3 + 1 + "px",
                 height: Math.random() * 3 + 1 + "px",
                 top: Math.random() * 100 + "%",
                 left: Math.random() * 100 + "%",
                 animation: `echoParticle ${Math.random() * 2 + 2}s infinite ease-in-out ${Math.random()}s`,
               }}
             />
           ))}
           {/* Layer 5: Animated Top Border (Water Edge) */}
           <div 
             className="absolute top-0 left-0 right-0 h-[3px] z-20"
             style={{
               background: "linear-gradient(90deg, rgba(160, 100, 255, 0), rgba(200, 160, 255, 0.8), rgba(255, 255, 255, 1), rgba(200, 160, 255, 0.8), rgba(160, 100, 255, 0))",
               backgroundSize: "200% 100%",
               animation: "liquidBorder 3s linear infinite",
               boxShadow: "0 2px 10px rgba(180, 130, 255, 0.5)"
             }}
           />
        </div>
      )}

      {mythicTheme === "hybridEclipse" && (
        <div className="absolute inset-0 overflow-hidden rounded-t-[inherit] pointer-events-none">
           {/* Layer 1: Dark Moon Shadow Background */}
           <div className="absolute inset-0 bg-[#0a0500]/95" />

           {/* Layer 2: Golden Mist (Seamless Loop 1) */}
           <div 
             className="absolute inset-y-0 left-0 w-[200%] opacity-40 mix-blend-screen"
             style={{
               backgroundImage: "linear-gradient(90deg, transparent, rgba(255, 180, 50, 0.3), rgba(255, 220, 100, 0.5), rgba(255, 180, 50, 0.3), transparent)",
               backgroundSize: "50% 100%",
               backgroundRepeat: "repeat-x",
               animation: "mistScroll 10s linear infinite"
             }}
           />

           {/* Layer 3: Secondary Mist (Detailed Parallax) */}
           <div 
             className="absolute inset-y-0 left-0 w-[200%] opacity-30 mix-blend-screen"
             style={{
               backgroundImage: "linear-gradient(90deg, transparent, rgba(255, 140, 0, 0.2), transparent)",
               backgroundSize: "25% 100%", 
               backgroundRepeat: "repeat-x",
               animation: "mistScroll 7s linear infinite reverse" 
             }}
           />
           
           {/* Layer 4: Corona Texture (Noise/Grain) */}
           <div 
             className="absolute inset-0 opacity-20"
             style={{
               backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E\")",
               mixBlendMode: "overlay"
             }}
           />

           {/* Layer 5: Solar Flares (Floating Sparks) */}
           {[...Array(8)].map((_, i) => (
             <div
               key={i}
               className="absolute rounded-full bg-yellow-100 blur-[1px]"
               style={{
                 width: Math.random() * 2 + 1 + "px",
                 height: Math.random() * 2 + 1 + "px",
                 top: Math.random() * 100 + "%",
                 left: Math.random() * 100 + "%",
                 boxShadow: "0 0 5px rgba(255, 200, 50, 0.8)",
                 animation: `starFloat ${Math.random() * 5 + 3}s infinite ease-in-out ${Math.random()}s`,
               }}
             />
           ))}

           {/* Layer 6: The Diamond Ring Border (Pulse) */}
           <div 
             className="absolute top-0 left-0 right-0 h-[2px] z-20"
             style={{
               background: "linear-gradient(90deg, transparent, rgba(200, 120, 20, 0), rgba(255, 200, 100, 1), rgba(200, 120, 20, 0), transparent)",
               backgroundSize: "200% 100%",
               animation: "flowRight 4s linear infinite",
               boxShadow: "0 1px 15px rgba(255, 160, 50, 0.5)"
             }}
           />
        </div>
      )}

      {mythicTheme === "brokenMoon" && (
        <div className="absolute inset-0 overflow-hidden rounded-t-[inherit] pointer-events-none">
           {/* Layer 1: Abyssal Background */}
           <div className="absolute inset-0 bg-[#0c0c16]/98" />

           {/* Layer 2: Deep Cracks (Static texture with pulsing glow) */}
           <div 
             className="absolute inset-0 opacity-40 mix-blend-overlay"
             style={{
                backgroundImage: "repeating-linear-gradient(45deg, transparent 0, transparent 20px, rgba(160, 160, 200, 0.1) 21px, transparent 22px), repeating-linear-gradient(-45deg, transparent 0, transparent 35px, rgba(160, 160, 200, 0.1) 36px, transparent 37px)",
                animation: "voidCracks 5s ease-in-out infinite"
             }}
           />

           {/* Layer 3: Unstable Energy Field (Glitching Rects) */}
           <div 
             className="absolute inset-0 mix-blend-color-dodge opacity-20"
             style={{
               background: "linear-gradient(90deg, transparent, rgba(100, 100, 255, 0.2), transparent)",
               backgroundSize: "200% 100%",
               animation: "flowRight 0.2s steps(4) infinite", // High speed glitch
               clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
             }}
           />

           {/* Layer 4: Sharps/Debris (Floating Glass) */}
           {[...Array(10)].map((_, i) => (
             <div
               key={i}
               className="absolute bg-white/40"
               style={{
                 width: Math.random() * 4 + 2 + "px",
                 height: Math.random() * 4 + 2 + "px",
                 top: Math.random() * 100 + "%",
                 left: Math.random() * 100 + "%",
                 clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", // Diamond shard
                 animation: `shardFloat ${Math.random() * 4 + 2}s linear infinite ${Math.random() * 2}s`
               }}
             />
           ))}

           {/* Layer 5: Glitching Top Border */}
           <div 
             className="absolute top-0 left-0 right-0 h-[2px] z-20"
             style={{
               background: "linear-gradient(90deg, transparent, rgba(150, 150, 200, 0.5), rgba(200, 200, 255, 0.9), rgba(150, 150, 200, 0.5), transparent)",
               boxShadow: "0 0 10px rgba(180, 180, 255, 0.4)",
               animation: "glitchBorder 3s infinite"
             }}
           />
        </div>
      )}

      {mythicTheme === "crystalMoon" && (
        <div className="absolute inset-0 overflow-hidden rounded-t-[inherit] pointer-events-none">
           {/* Layer 1: Prismatic Mesh Background */}
           <div className="absolute inset-0 bg-[#0f1525]/90" />
           <div 
             className="absolute inset-0 opacity-40 mix-blend-screen"
             style={{
               background: "linear-gradient(135deg, rgba(200, 240, 255, 0.1), rgba(255, 200, 250, 0.15), rgba(200, 240, 255, 0.1), transparent)",
               backgroundSize: "200% 200%",
               animation: "prismReflect 5s ease-in-out infinite"
             }}
           />

           {/* Layer 2: Floating Crystal Shards */}
           {[...Array(6)].map((_, i) => (
             <div
               key={i}
               className="absolute bg-white/20 border border-white/40"
               style={{
                 width: Math.random() * 8 + 4 + "px",
                 height: Math.random() * 8 + 4 + "px",
                 top: Math.random() * 80 + 10 + "%",
                 left: Math.random() * 90 + 5 + "%",
                 clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", // Diamond shape
                 animation: `crystalFloat ${Math.random() * 4 + 3}s ease-in-out infinite ${Math.random() * 2}s`,
                 backdropFilter: "blur(2px)"
               }}
             />
           ))}

           {/* Layer 3: Prismatic Edge (Crystal Border) */}
           {/* Base Glass Edge */}
           <div 
             className="absolute top-0 left-0 right-0 h-[1px] z-20 bg-white/40"
           />
           {/* Flowing Spectral Light */}
           <div 
             className="absolute top-[-1px] left-0 right-0 h-[3px] z-21 mix-blend-overlay"
             style={{
               background: "linear-gradient(90deg, transparent, rgba(255, 0, 0, 0.5), rgba(255, 165, 0, 0.5), rgba(255, 255, 0, 0.5), rgba(0, 255, 0, 0.5), rgba(0, 0, 255, 0.5), rgba(238, 130, 238, 0.5), transparent)",
               backgroundSize: "200% 100%",
               animation: "prismFlow 3s linear infinite, rainbowBorder 6s linear infinite"
             }}
           />
        </div>
      )}

      {mythicTheme === "stillMoon" && (
        <div 
          className="absolute inset-0 overflow-hidden rounded-t-[inherit] pointer-events-none"
          style={{ animation: "mythicThemeEntrance 2s ease-out forwards" }}
        >
           {/* Layer 1: Permafrost Base */}
           <div className="absolute inset-0 bg-gradient-to-b from-[#b3e5fc] via-[#e1f5fe] to-[#ffffff]" />
           
           {/* Layer 2: Frost Noise Texture */}
           <div 
             className="absolute inset-0 opacity-40 mix-blend-multiply"
             style={{
               backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48ZmlsdGVyIGlkPSJnoiPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjgiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjZykiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')",
               filter: "contrast(180%)"
             }}
           />

           {/* Layer 3: Massive Ice Shards (Static & Sharp) */}
           <div 
             className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-white/20 backdrop-blur-sm z-10"
             style={{
               clipPath: "polygon(0 0, 100% 0, 80% 100%, 0 100%)",
               boxShadow: "inset 0 0 20px rgba(255,255,255,0.5)"
             }}
           />
           <div 
             className="absolute top-[-20%] right-[-10%] w-[60%] h-[150%] bg-white/10 backdrop-blur-md z-10"
             style={{
               clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0 100%)",
               borderLeft: "1px solid rgba(255,255,255,0.4)"
             }}
           />

           {/* Layer 4: Suspended Time Particles (Stasis) */}
           {[...Array(20)].map((_, i) => (
             <div
               key={i}
               className="absolute bg-white z-20"
               style={{
                 width: Math.random() < 0.2 ? "3px" : "1.5px",
                 height: Math.random() < 0.2 ? "3px" : "1.5px",
                 top: Math.random() * 100 + "%",
                 left: Math.random() * 100 + "%",
                 opacity: Math.random() * 0.6 + 0.4,
                 boxShadow: "0 0 4px rgba(255,255,255,0.9)",
                 // NO MOVEMENT TRANSLATE - Only glimmer
                 animation: `pulse ${Math.random() * 4 + 2}s ease-in-out infinite alternate`
               }}
             />
           ))}

           {/* Layer 5: The Frozen Rim (Top Glow) */}
           <div 
             className="absolute top-0 left-0 right-0 h-[2px] z-30 bg-white"
             style={{
                boxShadow: "0 0 15px rgba(200, 240, 255, 1), 0 0 30px rgba(200, 240, 255, 0.6)"
             }}
           />
        </div>
      )}

      {(mythicTheme === "brokenMoon" || mythicTheme === "shatteredMoon") && (
        <div 
          className="absolute inset-0 overflow-hidden rounded-t-[inherit] pointer-events-none"
          style={{ animation: "mythicThemeEntrance 2s ease-out forwards" }}
        >
           {/* Layer 1: Deep Vacuum Background */}
           <div className="absolute inset-0 bg-[#020205]" />
           
           {/* Layer 2: The Abyssal Fracture (Jagged Opening) */}
           <div 
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[12px] z-20"
             style={{
               background: "linear-gradient(90deg, #2e004d, #ffffff, #2e004d)", // Dark-Light-Dark core
               clipPath: "polygon(0% 45%, 10% 30%, 20% 60%, 30% 35%, 40% 65%, 50% 20%, 60% 70%, 70% 30%, 80% 60%, 90% 40%, 100% 50%, 100% 55%, 90% 45%, 80% 65%, 70% 35%, 60% 75%, 50% 25%, 40% 70%, 30% 40%, 20% 65%, 10% 35%, 0% 55%)",
               filter: "drop-shadow(0 0 10px rgba(100, 150, 255, 0.8)) drop-shadow(0 0 20px rgba(180, 50, 255, 0.6))",
               animation: "pulse 3s ease-in-out infinite alternate"
             }}
           >
             {/* Inner White Hot Core */}
             <div 
               className="absolute inset-0 bg-white opacity-80 mix-blend-overlay"
               style={{ animation: "flashPulse 0.1s infinite alternate" }}
             />
           </div>

           {/* Layer 3: Vertical Energy Leaks (Light Pillars) */}
           <div 
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[60px] z-10 opacity-30"
             style={{
               background: "radial-gradient(ellipse at 50% 50%, rgba(100, 200, 255, 0.4) 0%, transparent 70%)",
               filter: "blur(10px)",
               animation: "pulse 4s ease-in-out infinite"
             }}
           />

           {/* Layer 4: Void Dust (Sparkles) */}
           {[...Array(20)].map((_, i) => (
             <div
               key={i}
               className="absolute bg-white rounded-full z-30"
               style={{
                 width: Math.random() < 0.5 ? "1px" : "2px",
                 height: Math.random() < 0.5 ? "1px" : "2px",
                 top: Math.random() * 100 + "%",
                 left: Math.random() * 100 + "%",
                 boxShadow: "0 0 4px white",
                 opacity: Math.random() * 0.7 + 0.3,
                 animation: `twinkle ${Math.random() * 2 + 1}s infinite alternate`
               }}
             />
           ))}

           {/* Layer 5: Unstable Horizon Lines */}
           <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7] to-transparent opacity-50" />
           <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent opacity-50" />
        </div>
      )}

      {mythicTheme === "lunarTransientPhenomena" && (
        <div 
          className="absolute inset-0 overflow-hidden rounded-t-[inherit] pointer-events-none"
          style={{ animation: "mythicThemeEntrance 1.5s ease-out forwards" }}
        >
           {/* Layer 1: The Void Background */}
           <div className="absolute inset-0 bg-[#050510]/95 backdrop-blur-xl" />
           
           {/* Layer 2: Digital Noise Grid */}
           <div 
             className="absolute inset-0 opacity-20"
             style={{
               backgroundImage: "linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)",
               backgroundSize: "20px 20px",
               maskImage: "radial-gradient(circle at 50% 50%, black 40%, transparent 80%)"
             }}
           />

           {/* Layer 3: Moving Data Streams (Running) */}
           {[...Array(6)].map((_, i) => (
             <div
               key={i}
               className="absolute top-0 h-[2px] bg-gradient-to-r from-transparent via-[#00ffcc] to-transparent"
               style={{
                 width: "30%",
                 top: (i * 20) + "%",
                 opacity: 0.7,
                 animation: `dataStream ${Math.random() * 2 + 2}s linear infinite ${Math.random() * 2}s`,
                 boxShadow: "0 0 8px #00ffcc"
               }}
             />
           ))}

           {/* Layer 4: Laser Scan Border */}
           <div 
             className="absolute top-0 h-[3px] w-[50%] z-20"
             style={{
               background: "linear-gradient(90deg, transparent, #ff00ff, #00ffff, transparent)",
               animation: "laserScan 3s linear infinite",
               boxShadow: "0 0 15px rgba(255, 0, 255, 0.8)"
             }}
           />

           {/* Layer 5: Glitch Flashes */}
           <div 
             className="absolute inset-0 bg-white/10 mix-blend-overlay"
             style={{
               animation: "flashPulse 4s infinite random" 
             }}
           />
           
           {/* Layer 6: Solid Tech Border */}
           <div 
             className="absolute top-0 left-0 right-0 h-[1px] bg-white/20"
           />
        </div>
      )}

      {mythicTheme === "emptySky" && (
        <div 
          className="absolute inset-0 overflow-hidden rounded-t-[inherit] pointer-events-none"
          style={{ animation: "mythicThemeEntrance 4s ease-out forwards" }}
        >
           {/* Layer 1: True Void (Absolute Black) */}
           <div className="absolute inset-0 bg-black" />
           
           {/* Layer 2: Cosmic Dust & Nebula */}
           <div 
             className="absolute inset-0 opacity-60"
             style={{
                background: "radial-gradient(circle at 50% 50%, rgba(70, 0, 150, 0.2), transparent 60%)",
                filter: "blur(20px)",
             }}
           />
           {/* Stars */}
           <div 
             className="absolute inset-0 opacity-80"
             style={{
                backgroundImage: "radial-gradient(1px 1px at 10% 10%, white 10%, transparent 0), radial-gradient(1.5px 1.5px at 80% 40%, #b080ff 10%, transparent 0), radial-gradient(2px 2px at 40% 80%, white 10%, transparent 0)",
                backgroundSize: "300px 300px",
                animation: "accretionSpin 120s linear infinite"
             }}
           />

           {/* Layer 3: Gravitational Distortion */}
           <div 
             className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] z-10 pointer-events-none rounded-full"
             style={{
               background: "radial-gradient(circle, transparent 30%, rgba(150, 50, 255, 0.05) 40%, transparent 70%)",
               backdropFilter: "blur(2px) contrast(1.1)",
               transform: "scale(1.2)",
             }}
           />

           {/* Layer 4: Central Spinning Horizon */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none z-40 flex items-center justify-center scale-60">
              
              {/* Back Halo (Subtle nebula behind) */}
              <div 
                className="absolute w-[280px] h-[280px] rounded-full opacity-60 mix-blend-screen"
                style={{
                  background: "radial-gradient(circle at 50% 50%, transparent 60%, rgba(120, 50, 255, 0.6) 65%, transparent 70%)",
                  animation: "diskPulse 4s ease-in-out infinite",
                  filter: "blur(4px)"
                }}
              />

              {/* The Spinning Edge (Accretion Ring) */}
              <div 
                className="absolute w-[160px] h-[160px] rounded-full z-20"
                style={{
                  background: "conic-gradient(from 0deg, #4c1d95 0%, #8b5cf6 25%, #ffffff 50%, #8b5cf6 75%, #4c1d95 100%)",
                  maskImage: "radial-gradient(transparent 64%, black 66%)",
                  WebkitMaskImage: "radial-gradient(transparent 64%, black 66%)",
                  animation: "accretionSpin 0.9s linear infinite",
                  boxShadow: "0 0 30px rgba(139, 92, 246, 0.6)"
                }}
              />

              {/* The Void (Inner Black Hole) */}
              <div className="absolute w-[150px] h-[150px] rounded-full z-10 bg-black box-border border border-purple-500/30" />
           </div>

           {/* Layer 5: Themed Border (Spinning Horizon Edge) */}
           <div 
             className="absolute top-0 left-0 right-0 h-[2px] z-30 opacity-100"
             style={{
               background: "linear-gradient(90deg, transparent 0%, #4c1d95 20%, #8b5cf6 45%, #ffffff 50%, #8b5cf6 55%, #4c1d95 80%, transparent 100%)",
               backgroundSize: "200% 100%",
               animation: "borderFlow 0.4s linear infinite",
               boxShadow: "0 0 15px rgba(139, 92, 246, 0.7)"
             }}
           />
           {/* Inner Border Glow */}
           <div 
             className="absolute top-0 left-0 right-0 h-[40px] z-20 opacity-30 pointer-events-none"
             style={{
               background: "radial-gradient(ellipse at 50% 0%, rgba(150, 50, 255, 0.5), transparent 70%)",
             }}
           />

           {/* Layer 6: Floating Debris (Asteroids) */}
           {[...Array(12)].map((_, i) => (
             <div
               key={i}
               className="absolute bg-zinc-800 rounded-full z-20 opacity-80"
               style={{
                 width: Math.random() * 4 + 2 + "px",
                 height: Math.random() * 3 + 2 + "px",
                 top: Math.random() * 100 + "%",
                 left: Math.random() * 100 + "%", 
                 animation: `singularFloat ${Math.random() * 15 + 10}s linear infinite`,
                 boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.8)"
               }}
             />
           ))}
        </div>
      )}


      <div className="flex justify-around items-center h-16 max-w-md mx-auto relative z-50">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive =
            location.pathname === path ||
            (path !== "/" && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "mythic-nav-item flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors min-w-[60px] relative overflow-hidden",
                isActive
                  ? "text-primary bg-primary/10 rounded-lg mythic-nav-active"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg",
              )}
              onMouseEnter={createRipple}
              style={
                mythicTheme === "cosmicVoyageMoon" && isActive
                  ? {
                      background: "transparent",
                    }
                  : undefined
              }
            >
              <RippleEffect />
              {mythicTheme === "cosmicVoyageMoon" && isActive && (
                <div
                  className="absolute inset-0 rounded-lg -z-10"
                  style={{
                    background:
                      "linear-gradient(45deg, transparent, rgba(128, 144, 192, 0.3), transparent)",
                    boxShadow: "0 0 15px rgba(100, 100, 255, 0.4)",
                    animation: "pulse 2s ease-in-out infinite", // Subtle pulse instead of spin
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
              {/* Pixel Dream Moon - Retro Glow & Particles */}
              {mythicTheme === "pixelDreamMoon" && isActive && (
                <>
                  {/* Main Glow Box */}
                  <div
                    className="absolute inset-0 -z-10"
                    style={{
                      borderRadius: "8px",
                      border: "3px solid #818cf8",
                      background: "linear-gradient(135deg, rgba(30, 27, 75, 0.8), rgba(14, 116, 144, 0.6))",
                      boxShadow: `
                        0 0 20px rgba(129, 140, 248, 0.8),
                        inset 0 0 15px rgba(129, 140, 248, 0.3),
                        0 4px 0 rgba(49, 46, 129, 0.5)
                      `,
                      imageRendering: "pixelated",
                      animation: "pixelPulse 2s steps(4) infinite",
                    }}
                  />
                  
                  {/* Pixel Corners */}
                  {[
                    { top: "-2px", left: "-2px" },
                    { top: "-2px", right: "-2px" },
                    { bottom: "-2px", left: "-2px" },
                    { bottom: "-2px", right: "-2px" },
                  ].map((pos, idx) => (
                    <div
                      key={idx}
                      className="absolute w-[4px] h-[4px] bg-[#06b6d4] -z-10"
                      style={{
                        ...pos,
                        boxShadow: "0 0 6px #06b6d4",
                        animation: `pixelCornerBlink ${1 + idx * 0.2}s steps(2) infinite`,
                      }}
                    />
                  ))}
                  
                  {/* Floating Pixel Particles */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-[2px] h-[2px] -z-10"
                      style={{
                        left: `${20 + i * 10}%`,
                        top: `${10 + (i % 3) * 30}%`,
                        backgroundColor: i % 2 === 0 ? "#818cf8" : "#06b6d4",
                        boxShadow: `0 0 4px ${i % 2 === 0 ? "#818cf8" : "#06b6d4"}`,
                        animation: `pixelFloat ${2 + i * 0.3}s ease-in-out infinite`,
                        animationDelay: `${i * 0.1}s`,
                        imageRendering: "pixelated",
                      }}
                    />
                  ))}
                  
                  {/* Top Indicator Triangle */}
                  <div 
                    className="absolute -top-[14px] left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: "6px solid transparent",
                      borderRight: "6px solid transparent",
                      borderTop: "8px solid #818cf8",
                      filter: "drop-shadow(0 0 6px #818cf8)",
                      animation: "pixelBounce 1s steps(4) infinite",
                    }}
                  />
                </>
              )}
              <style>{`
                @keyframes pixelPulse {
                  0%, 100% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(1.05); opacity: 0.9; }
                }
                @keyframes pixelCornerBlink {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.3; }
                }
                @keyframes pixelFloat {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-4px); }
                }
                @keyframes pixelBounce {
                  0%, 100% { transform: translate(-50%, 0); }
                  50% { transform: translate(-50%, -3px); }
                }
              `}</style>
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
                                      : mythicTheme === "pixelDreamMoon"
                                        ? "drop-shadow(3px 3px 0 rgba(0,0,0,1)) drop-shadow(0 0 8px rgba(129,140,248,0.9))" 
                                        : undefined,
                        animation:
                          mythicTheme === "lunarTransientPhenomena"
                            ? "iconFlicker 0.3s steps(3) infinite"
                            : mythicTheme === "pixelDreamMoon"
                              ? "pixelIconBob 0.6s steps(2) infinite"
                              : undefined,
                        color: mythicTheme === "pixelDreamMoon" && isActive ? "#ffffff" : undefined,
                        imageRendering: mythicTheme === "pixelDreamMoon" ? "pixelated" : undefined,
                      }
                    : undefined
                }
              />
              <style>{`
                @keyframes pixelIconBob {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-2px); }
                }
              `}</style>
              <span 
                className={cn(
                  "text-[10px] font-medium transition-all duration-300",
                  mythicTheme === "pixelDreamMoon" && isActive ? "text-[#818cf8] font-['Press_Start_2P'] text-[8px] drop-shadow-[0_0_4px_rgba(129,140,248,0.8)]" : 
                  mythicTheme === "pixelDreamMoon" && !isActive ? "text-white/80 font-['Press_Start_2P'] text-[6px]" : ""
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
