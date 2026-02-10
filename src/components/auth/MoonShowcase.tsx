import { useState, useEffect, useCallback } from "react";
import { MOON_PHENOMENA, type MoonPhenomenon } from "@/data/moonPhenomena";
import { motion, AnimatePresence } from "framer-motion";

// Curated showcase moons - pick visually striking ones from each rarity
const SHOWCASE_MOONS: MoonPhenomenon[] = [
  MOON_PHENOMENA.fullMoon,
  MOON_PHENOMENA.superBloodMoon,
  MOON_PHENOMENA.harvestMoon,
  MOON_PHENOMENA.blueMoon,
  MOON_PHENOMENA.pinkMoon,
  MOON_PHENOMENA.auroraFrostMoon,
  MOON_PHENOMENA.totalEclipse,
  MOON_PHENOMENA.lunarTransientPhenomena,
  MOON_PHENOMENA.superBlueBloodMoon,
  MOON_PHENOMENA.hybridEclipse,
].filter(Boolean);

const RARITY_LABELS: Record<string, { label: string; color: string }> = {
  normal: { label: "Normal", color: "rgba(160,160,200,0.6)" },
  rare: { label: "Rare", color: "rgba(100,160,255,0.7)" },
  very_rare: { label: "Very Rare", color: "rgba(180,100,255,0.7)" },
  legendary: { label: "Legendary", color: "rgba(255,180,60,0.8)" },
  mythic: { label: "Mythic", color: "rgba(255,80,120,0.85)" },
};

function MoonOrb({ moon, isActive }: { moon: MoonPhenomenon; isActive: boolean }) {
  const size = (moon.moonSize || 1) * 120;
  const rarity = RARITY_LABELS[moon.rarity];

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={moon.id}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center gap-6"
        >
          {/* Moon glow layers */}
          <div className="relative" style={{ width: size + 80, height: size + 80 }}>
            {/* Outer glow pulse */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${moon.moonTint}30 0%, transparent 70%)`,
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Mid glow */}
            <div
              className="absolute rounded-full"
              style={{
                inset: 15,
                background: `radial-gradient(circle, ${moon.moonTint}50 0%, transparent 60%)`,
                filter: "blur(8px)",
              }}
            />

            {/* Moon body */}
            <motion.div
              className="absolute rounded-full"
              style={{
                left: "50%",
                top: "50%",
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
                background: `radial-gradient(circle at 35% 35%, ${moon.moonTint}, ${moon.uiAccent}80)`,
                boxShadow: `
                  0 0 ${size * 0.4}px ${moon.moonTint}60,
                  0 0 ${size * 0.8}px ${moon.moonTint}30,
                  inset -${size * 0.15}px -${size * 0.1}px ${size * 0.3}px rgba(0,0,0,0.3)
                `,
              }}
              animate={{
                boxShadow: [
                  `0 0 ${size * 0.4}px ${moon.moonTint}60, 0 0 ${size * 0.8}px ${moon.moonTint}30, inset -${size * 0.15}px -${size * 0.1}px ${size * 0.3}px rgba(0,0,0,0.3)`,
                  `0 0 ${size * 0.5}px ${moon.moonTint}80, 0 0 ${size * 1}px ${moon.moonTint}40, inset -${size * 0.15}px -${size * 0.1}px ${size * 0.3}px rgba(0,0,0,0.3)`,
                  `0 0 ${size * 0.4}px ${moon.moonTint}60, 0 0 ${size * 0.8}px ${moon.moonTint}30, inset -${size * 0.15}px -${size * 0.1}px ${size * 0.3}px rgba(0,0,0,0.3)`,
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Orbiting particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 3 + Math.random() * 3,
                  height: 3 + Math.random() * 3,
                  background: moon.moonTint,
                  left: "50%",
                  top: "50%",
                  boxShadow: `0 0 6px ${moon.moonTint}`,
                }}
                animate={{
                  x: [
                    Math.cos((i / 6) * Math.PI * 2) * (size * 0.55),
                    Math.cos(((i + 1) / 6) * Math.PI * 2) * (size * 0.55),
                    Math.cos(((i + 2) / 6) * Math.PI * 2) * (size * 0.55),
                    Math.cos(((i + 3) / 6) * Math.PI * 2) * (size * 0.55),
                    Math.cos(((i + 4) / 6) * Math.PI * 2) * (size * 0.55),
                    Math.cos(((i + 5) / 6) * Math.PI * 2) * (size * 0.55),
                    Math.cos(((i + 6) / 6) * Math.PI * 2) * (size * 0.55),
                  ],
                  y: [
                    Math.sin((i / 6) * Math.PI * 2) * (size * 0.55),
                    Math.sin(((i + 1) / 6) * Math.PI * 2) * (size * 0.55),
                    Math.sin(((i + 2) / 6) * Math.PI * 2) * (size * 0.55),
                    Math.sin(((i + 3) / 6) * Math.PI * 2) * (size * 0.55),
                    Math.sin(((i + 4) / 6) * Math.PI * 2) * (size * 0.55),
                    Math.sin(((i + 5) / 6) * Math.PI * 2) * (size * 0.55),
                    Math.sin(((i + 6) / 6) * Math.PI * 2) * (size * 0.55),
                  ],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 8 + i * 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          {/* Moon info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center space-y-2"
          >
            <h3
              className="text-lg font-semibold font-['Chakra_Petch']"
              style={{ color: moon.moonTint }}
            >
              {moon.name}
            </h3>
            <p className="text-xs tracking-widest uppercase opacity-60" style={{ color: moon.uiAccent }}>
              {moon.nameEn}
            </p>
            <span
              className="inline-block px-3 py-0.5 rounded-full text-[10px] font-medium tracking-wider uppercase"
              style={{
                background: rarity.color,
                color: "#fff",
                backdropFilter: "blur(4px)",
              }}
            >
              {rarity.label}
            </span>
            <p className="text-xs opacity-50 italic mt-1" style={{ color: moon.uiAccent }}>
              "{moon.subtitle}"
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Floating stars background
function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(60)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: 1 + Math.random() * 2,
            height: 1 + Math.random() * 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.1, 0.6 + Math.random() * 0.4, 0.1],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function MoonShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMoon = SHOWCASE_MOONS[activeIndex];

  const nextMoon = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SHOWCASE_MOONS.length);
  }, []);

  // Auto-cycle every 5s
  useEffect(() => {
    const timer = setInterval(nextMoon, 5000);
    return () => clearInterval(timer);
  }, [nextMoon]);

  if (!activeMoon) return null;

  return (
    <div
      className="relative flex flex-col items-center justify-center h-full w-full"
      style={{
        background: `linear-gradient(180deg, ${activeMoon.skyPalette[0]}, ${activeMoon.skyPalette[1]}, ${activeMoon.skyPalette[2]})`,
        transition: "background 1.5s ease-in-out",
      }}
    >
      <StarField />

      {/* Moon display */}
      <div className="relative z-10 flex items-center justify-center min-h-[320px]">
        {SHOWCASE_MOONS.map((moon, i) => (
          <MoonOrb key={moon.id} moon={moon} isActive={i === activeIndex} />
        ))}
      </div>

      {/* Dot indicators */}
      <div className="relative z-10 flex gap-2 mt-4">
        {SHOWCASE_MOONS.map((moon, i) => (
          <button
            key={moon.id}
            onClick={() => setActiveIndex(i)}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i === activeIndex ? activeMoon.moonTint : "rgba(255,255,255,0.2)",
              boxShadow: i === activeIndex ? `0 0 8px ${activeMoon.moonTint}80` : "none",
              transform: i === activeIndex ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
