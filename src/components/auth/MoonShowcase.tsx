import { useState, useEffect, useCallback } from "react";
import { MOON_PHENOMENA, type MoonPhenomenon } from "@/data/moonPhenomena";
import { motion, AnimatePresence } from "framer-motion";

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

function MoonOrb({ moon, isActive }: { moon: MoonPhenomenon; isActive: boolean }) {
  const size = (moon.moonSize || 1) * 140;

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={moon.id}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
          className="absolute"
          style={{ top: "18%", right: "15%" }}
        >
          <div className="relative" style={{ width: size + 100, height: size + 100 }}>
            {/* Outer glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: `radial-gradient(circle, ${moon.moonTint}25 0%, transparent 70%)` }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Mid glow */}
            <div
              className="absolute rounded-full"
              style={{ inset: 20, background: `radial-gradient(circle, ${moon.moonTint}40 0%, transparent 60%)`, filter: "blur(12px)" }}
            />
            {/* Moon body */}
            <motion.div
              className="absolute rounded-full"
              style={{
                left: "50%", top: "50%", width: size, height: size,
                marginLeft: -size / 2, marginTop: -size / 2,
                background: `radial-gradient(circle at 35% 35%, ${moon.moonTint}, ${moon.uiAccent}80)`,
                boxShadow: `0 0 ${size * 0.5}px ${moon.moonTint}50, 0 0 ${size}px ${moon.moonTint}20, inset -${size * 0.15}px -${size * 0.1}px ${size * 0.3}px rgba(0,0,0,0.3)`,
              }}
              animate={{
                boxShadow: [
                  `0 0 ${size * 0.5}px ${moon.moonTint}50, 0 0 ${size}px ${moon.moonTint}20, inset -${size * 0.15}px -${size * 0.1}px ${size * 0.3}px rgba(0,0,0,0.3)`,
                  `0 0 ${size * 0.6}px ${moon.moonTint}70, 0 0 ${size * 1.2}px ${moon.moonTint}35, inset -${size * 0.15}px -${size * 0.1}px ${size * 0.3}px rgba(0,0,0,0.3)`,
                  `0 0 ${size * 0.5}px ${moon.moonTint}50, 0 0 ${size}px ${moon.moonTint}20, inset -${size * 0.15}px -${size * 0.1}px ${size * 0.3}px rgba(0,0,0,0.3)`,
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Orbiting particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 2 + Math.random() * 2, height: 2 + Math.random() * 2,
                  background: moon.moonTint, left: "50%", top: "50%",
                  boxShadow: `0 0 4px ${moon.moonTint}`,
                }}
                animate={{
                  x: Array.from({ length: 7 }, (_, j) => Math.cos(((i + j) / 5) * Math.PI * 2) * (size * 0.6)),
                  y: Array.from({ length: 7 }, (_, j) => Math.sin(((i + j) / 5) * Math.PI * 2) * (size * 0.6)),
                  opacity: [0.2, 0.7, 0.2],
                }}
                transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(80)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: 1 + Math.random() * 1.5, height: 1 + Math.random() * 1.5,
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          }}
          animate={{ opacity: [0.05, 0.5 + Math.random() * 0.5, 0.05], scale: [1, 1.2, 1] }}
          transition={{ duration: 2 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 4, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function ShootingStars() {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; angle: number; delay: number; duration: number }[]>([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const spawn = () => {
      const id = Date.now();
      const x = 10 + Math.random() * 60; // start from left-ish area
      const y = Math.random() * 40; // upper half
      const angle = 25 + Math.random() * 30; // diagonal angle
      const duration = 0.8 + Math.random() * 0.6;
      setStars(prev => [...prev.slice(-3), { id, x, y, angle, delay: 0, duration }]);
      setCounter(c => c + 1);
    };

    // Random interval 3-8 seconds
    const schedule = () => {
      const delay = 3000 + Math.random() * 5000;
      return setTimeout(() => { spawn(); schedule(); }, delay);
    };

    // Initial spawn
    const timer = setTimeout(() => { spawn(); }, 2000);
    const recurring = schedule();

    return () => { clearTimeout(timer); clearTimeout(recurring); };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {stars.map((star) => (
          <motion.div
            key={star.id}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], x: 200, y: 200 * Math.tan((star.angle * Math.PI) / 180) }}
            exit={{ opacity: 0 }}
            transition={{ duration: star.duration, ease: "easeIn" }}
            onAnimationComplete={() => setStars(prev => prev.filter(s => s.id !== star.id))}
            className="absolute"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              transform: `rotate(${star.angle}deg)`,
            }}
          >
            {/* Star head */}
            <div
              className="absolute w-1.5 h-1.5 rounded-full bg-white"
              style={{ boxShadow: "0 0 6px 2px rgba(255,255,255,0.8), 0 0 12px 4px rgba(200,200,255,0.4)" }}
            />
            {/* Tail */}
            <div
              className="absolute h-[1px]"
              style={{
                width: 80 + Math.random() * 40,
                right: 4,
                top: 3,
                background: "linear-gradient(to left, rgba(255,255,255,0.7), rgba(200,200,255,0.3), transparent)",
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function MoonShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMoon = SHOWCASE_MOONS[activeIndex];

  const nextMoon = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SHOWCASE_MOONS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextMoon, 15000);
    return () => clearInterval(timer);
  }, [nextMoon]);

  if (!activeMoon) return null;

  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(180deg, ${activeMoon.skyPalette[0]}, ${activeMoon.skyPalette[1]}, ${activeMoon.skyPalette[2]})`,
        transition: "background 2.5s ease-in-out",
      }}
    >
      <StarField />
      <ShootingStars />
      {SHOWCASE_MOONS.map((moon, i) => (
        <MoonOrb key={moon.id} moon={moon} isActive={i === activeIndex} />
      ))}
    </div>
  );
}
