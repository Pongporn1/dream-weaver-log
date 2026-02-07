import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { MoonPhenomenon } from "@/data/moonPhenomena";

interface MythicIntroOverlayProps {
  show: boolean;
  phenomenon: MoonPhenomenon | null;
  onComplete: () => void;
}

// Theme-specific configurations
const THEME_CONFIGS: Record<string, ThemeConfig> = {
  superBloodMoon: {
    title: "BLOOD",
    subtitle: "MOON",
    bgGradient: "from-[#200505] via-[#401515] to-[#200505]",
    accentColor: "#c84040",
    glowColor: "rgba(200, 64, 64, 0.6)",
    animation: "pulse",
    icon: "🌑",
  },
  superBlueBloodMoon: {
    title: "SUPER BLUE",
    subtitle: "BLOOD MOON",
    bgGradient: "from-[#1a0510] via-[#2a1a30] to-[#1a0510]",
    accentColor: "#d85080",
    glowColor: "rgba(216, 80, 128, 0.6)",
    animation: "gradient",
    icon: "🌕",
  },
  lunarTransientPhenomena: {
    title: "TRANSIENT",
    subtitle: "PHENOMENA",
    bgGradient: "from-[#0e0a1e] via-[#2e1a4e] to-[#0e0a1e]",
    accentColor: "#c8a8f8",
    glowColor: "rgba(200, 168, 248, 0.6)",
    animation: "flash",
    icon: "✨",
  },
  hybridEclipse: {
    title: "HYBRID",
    subtitle: "ECLIPSE",
    bgGradient: "from-[#1a1008] via-[#3a2818] to-[#1a1008]",
    accentColor: "#e8b870",
    glowColor: "rgba(232, 184, 112, 0.6)",
    animation: "eclipse",
    icon: "🌘",
  },
  stillMoon: {
    title: "FROZEN",
    subtitle: "TIME",
    bgGradient: "from-[#0a0a20] via-[#1a1a40] to-[#0a0a20]",
    accentColor: "#b0d0ff",
    glowColor: "rgba(176, 208, 255, 0.5)",
    animation: "frozen",
    icon: "❄️",
  },
  echoMoon: {
    title: "ECHO",
    subtitle: "MOON",
    bgGradient: "from-[#0e0e1e] via-[#2e2e4e] to-[#0e0e1e]",
    accentColor: "#9090b8",
    glowColor: "rgba(144, 144, 184, 0.5)",
    animation: "echo",
    icon: "🌙",
  },
  brokenMoon: {
    title: "BROKEN",
    subtitle: "MOON",
    bgGradient: "from-[#0a0a1c] via-[#2a2a4c] to-[#0a0a1c]",
    accentColor: "#6868a8",
    glowColor: "rgba(104, 104, 168, 0.5)",
    animation: "shatter",
    icon: "💔",
  },
  emptySky: {
    title: "EMPTY",
    subtitle: "SKY",
    bgGradient: "from-[#000000] via-[#0a0a15] to-[#000000]",
    accentColor: "#505070",
    glowColor: "rgba(80, 80, 112, 0.3)",
    animation: "void",
    icon: "🕳️",
  },
  crystalMoon: {
    title: "CRYSTAL",
    subtitle: "MOON",
    bgGradient: "from-[#0a0e30] via-[#2a2e60] to-[#0a0e30]",
    accentColor: "#b0c0e0",
    glowColor: "rgba(176, 192, 224, 0.6)",
    animation: "prism",
    icon: "💎",
  },
  shatteredMoon: {
    title: "SHATTERED",
    subtitle: "MOON",
    bgGradient: "from-[#0a0a1f] via-[#1e1e48] to-[#0a0a1f]",
    accentColor: "#9898c8",
    glowColor: "rgba(152, 152, 200, 0.5)",
    animation: "shatter",
    icon: "🔮",
  },
  arcticMoon: {
    title: "ARCTIC",
    subtitle: "AURORA",
    bgGradient: "from-[#000814] via-[#002040] to-[#000814]",
    accentColor: "#90c0d8",
    glowColor: "rgba(144, 192, 216, 0.6)",
    animation: "aurora",
    icon: "🌌",
  },
  cosmicVoyageMoon: {
    title: "COSMIC",
    subtitle: "VOYAGE",
    bgGradient: "from-[#000510] via-[#001530] to-[#000510]",
    accentColor: "#8090C0",
    glowColor: "rgba(128, 144, 192, 0.5)",
    animation: "starfield",
    icon: "🚀",
  },
  nebulaDreamMoon: {
    title: "NEBULA",
    subtitle: "DREAM",
    bgGradient: "from-[#0a0515] via-[#200f45] to-[#0a0515]",
    accentColor: "#B888D8",
    glowColor: "rgba(184, 136, 216, 0.6)",
    animation: "nebula",
    icon: "☁️",
  },
};

interface ThemeConfig {
  title: string;
  subtitle: string;
  bgGradient: string;
  accentColor: string;
  glowColor: string;
  animation: string;
  icon: string;
}

const getDefaultConfig = (phenomenon: MoonPhenomenon): ThemeConfig => ({
  title: phenomenon.nameEn.split(" ")[0].toUpperCase(),
  subtitle: phenomenon.nameEn.split(" ").slice(1).join(" ").toUpperCase() || "MOON",
  bgGradient: `from-[${phenomenon.skyPalette[0]}] via-[${phenomenon.skyPalette[1]}] to-[${phenomenon.skyPalette[0]}]`,
  accentColor: phenomenon.uiAccent,
  glowColor: `${phenomenon.uiAccent}99`,
  animation: "glow",
  icon: "🌙",
});

// Particle generators
const generateParticles = (count: number, type: string) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2,
    opacity: Math.random() * 0.5 + 0.3,
    type,
  }));
};

export function MythicIntroOverlay({ show, phenomenon, onComplete }: MythicIntroOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  // Don't show for pixelDreamMoon (handled by PixelTransitionOverlay)
  const shouldShow = show && phenomenon?.rarity === "mythic" && phenomenon?.id !== "pixelDreamMoon";

  const config = useMemo(() => {
    if (!phenomenon) return null;
    return THEME_CONFIGS[phenomenon.id] || getDefaultConfig(phenomenon);
  }, [phenomenon]);

  const particles = useMemo(() => {
    if (!config) return [];
    return generateParticles(30, config.animation);
  }, [config]);

  useEffect(() => {
    if (shouldShow) {
      setIsVisible(true);
      setIsFading(false);

      // Start fade after 3 seconds
      const fadeTimer = setTimeout(() => setIsFading(true), 3000);
      // Complete after 4 seconds
      const completeTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 4000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [shouldShow, onComplete]);

  const handleClick = () => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 500);
  };

  if (!isVisible || !phenomenon || !config) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isFading ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        onClick={handleClick}
        className={`fixed inset-0 z-[9999] bg-gradient-to-b ${config.bgGradient} flex flex-col items-center justify-center cursor-pointer overflow-hidden`}
      >
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size,
                height: particle.size,
                backgroundColor: config.accentColor,
                opacity: particle.opacity,
                boxShadow: `0 0 ${particle.size * 2}px ${config.glowColor}`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Animated background effect based on theme */}
        <AnimatedBackground animation={config.animation} accentColor={config.accentColor} glowColor={config.glowColor} />

        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />

        {/* Content */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 text-center space-y-4 px-8"
        >
          {/* Icon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-6xl mb-6"
          >
            {config.icon}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-black tracking-wider"
            style={{
              color: config.accentColor,
              textShadow: `0 0 20px ${config.glowColor}, 0 0 40px ${config.glowColor}`,
            }}
          >
            {config.title}
          </motion.h1>

          {/* Subtitle */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-6xl font-bold tracking-wide text-white/90"
            style={{
              textShadow: `0 0 15px ${config.glowColor}`,
            }}
          >
            {config.subtitle}
          </motion.h2>

          {/* Thai name */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl md:text-2xl text-white/70 mt-4"
          >
            {phenomenon.name}
          </motion.p>

          {/* Subtitle/description */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-lg text-white/50 italic"
          >
            "{phenomenon.subtitle}"
          </motion.p>

          {/* Rarity badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.1, type: "spring" }}
            className="inline-block mt-6 px-6 py-2 rounded-full border-2"
            style={{
              borderColor: config.accentColor,
              backgroundColor: `${config.accentColor}20`,
              boxShadow: `0 0 20px ${config.glowColor}`,
            }}
          >
            <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: config.accentColor }}>
              ✨ MYTHIC ✨
            </span>
          </motion.div>
        </motion.div>

        {/* Tap to continue hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/50 text-sm"
        >
          แตะเพื่อเริ่ม
        </motion.p>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// Animated background component for different theme effects
function AnimatedBackground({ animation, accentColor, glowColor }: { animation: string; accentColor: string; glowColor: string }) {
  switch (animation) {
    case "pulse":
      return (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              `radial-gradient(circle at center, ${glowColor} 0%, transparent 50%)`,
              `radial-gradient(circle at center, ${glowColor} 20%, transparent 70%)`,
              `radial-gradient(circle at center, ${glowColor} 0%, transparent 50%)`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      );

    case "aurora":
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-full h-64"
              style={{
                background: `linear-gradient(90deg, transparent, ${accentColor}40, ${glowColor}, ${accentColor}40, transparent)`,
                top: `${20 + i * 15}%`,
                filter: "blur(30px)",
              }}
              animate={{
                x: ["-100%", "100%"],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4 + i,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      );

    case "prism":
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-2 h-64"
              style={{
                background: `linear-gradient(to bottom, transparent, ${["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7"][i]}80, transparent)`,
                transformOrigin: "center top",
              }}
              animate={{
                rotate: [i * 72, i * 72 + 360],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      );

    case "void":
      return (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      );

    case "shatter":
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: "2px",
                height: "100px",
                background: `linear-gradient(to bottom, transparent, ${accentColor}, transparent)`,
                left: `${15 + i * 10}%`,
                top: "30%",
              }}
              animate={{
                scaleY: [0, 1, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
      );

    case "flash":
      return (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            opacity: [0, 0.3, 0, 0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            times: [0, 0.1, 0.3, 0.4, 1],
          }}
          style={{
            background: `radial-gradient(circle at center, ${accentColor}60 0%, transparent 70%)`,
          }}
        />
      );

    case "nebula":
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: "300px",
                height: "300px",
                background: `radial-gradient(circle, ${accentColor}30 0%, transparent 70%)`,
                left: `${20 + i * 25}%`,
                top: `${30 + i * 10}%`,
                filter: "blur(40px)",
              }}
              animate={{
                scale: [1, 1.3, 1],
                x: [0, 30, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 6 + i,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      );

    case "starfield":
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: Math.random() * 2 + 1,
                delay: Math.random() * 2,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
      );

    default:
      return (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
          style={{
            background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 60%)`,
          }}
        />
      );
  }
}
