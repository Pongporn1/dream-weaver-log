import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "@/styles/pixelTransition.css";

interface PixelTransitionOverlayProps {
  show: boolean;
  onComplete: () => void;
}

const COLORS = {
  cyan: "#22d3ee",
  pink: "#f472b6",
  sky: "#93c5fd",
  mint: "#a7f3d0",
  deep: "#1a0b2e",
  glow: "rgba(34,211,238,0.8)",
};

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export function PixelTransitionOverlay({ show, onComplete }: PixelTransitionOverlayProps) {
  const [render, setRender] = useState(false);
  const [fading, setFading] = useState(false);

  const stars = useMemo(
    () =>
      show
        ? Array.from({ length: 26 }).map(() => ({
            size: Math.random() > 0.7 ? 2 : 1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: randomBetween(0.2, 0.8),
            duration: randomBetween(3, 7),
            delay: randomBetween(0, 2),
          }))
        : [],
    [show],
  );

  const glitchBlocks = useMemo(
    () =>
      show
        ? Array.from({ length: 12 }).map(() => ({
            size: Math.random() > 0.6 ? 8 : 4,
            top: `${Math.random() * 90}%`,
            left: `${Math.random() * 90}%`,
            color: pick([COLORS.cyan, COLORS.pink]),
            duration: randomBetween(2, 5),
            delay: randomBetween(0, 1),
          }))
        : [],
    [show],
  );

  const clusters = useMemo(
    () =>
      show
        ? Array.from({ length: 6 }).map((_, i) => ({
            top: `${10 + Math.random() * 70}%`,
            left: `${10 + Math.random() * 70}%`,
            duration: 4 + i,
            delay: i * 0.2,
          }))
        : [],
    [show],
  );

  const floatingPixels = useMemo(
    () =>
      show
        ? Array.from({ length: 34 }).map(() => ({
            size: Math.random() > 0.5 ? 4 : 8,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: randomBetween(0.2, 0.7),
            duration: randomBetween(1, 3),
            delay: randomBetween(0, 1),
          }))
        : [],
    [show],
  );

  const fallingPixels = useMemo(
    () =>
      show
        ? Array.from({ length: 16 }).map(() => ({
            height: Math.random() > 0.7 ? 6 : 4,
            top: `${-10 - Math.random() * 30}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.5,
            duration: randomBetween(4, 10),
            delay: randomBetween(0, 2),
          }))
        : [],
    [show],
  );

  const dustPixels = useMemo(
    () =>
      show
        ? Array.from({ length: 12 }).map(() => ({
            bottom: `${5 + Math.random() * 20}px`,
            left: `${Math.random() * 100}%`,
            opacity: 0.4,
            duration: randomBetween(3, 6),
            delay: randomBetween(0, 1),
          }))
        : [],
    [show],
  );

  const sparkleBursts = useMemo(
    () =>
      show
        ? Array.from({ length: 8 }).map(() => ({
            top: `${Math.random() * 90}%`,
            left: `${Math.random() * 90}%`,
            duration: randomBetween(3, 6),
            delay: randomBetween(0, 2),
          }))
        : [],
    [show],
  );

  useEffect(() => {
    if (show) {
      setRender(true);
      setFading(false);

      const fadeTimer = setTimeout(() => setFading(true), 3000);
      const removeTimer = setTimeout(() => {
        setRender(false);
        onComplete();
      }, 4000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [show, onComplete]);

  if (!render) return null;

  const FrameLayer = (
    <>
      <div className="absolute inset-3 border-4 border-[#7dd3fc]/40 shadow-[0_0_20px_rgba(125,211,252,0.35),inset_0_0_20px_rgba(59,130,246,0.25)] pointer-events-none" />
      <div className="absolute inset-3 pointer-events-none" style={{ animation: "framePulse 3s ease-in-out infinite" }}>
        <div
          className="absolute -top-2 left-0 right-0 h-1"
          style={{
            background:
              `repeating-linear-gradient(90deg, ${COLORS.cyan} 0 10px, ${COLORS.pink} 10px 16px, ${COLORS.sky} 16px 24px, transparent 24px 40px)`,
            backgroundSize: "64px 100%",
            animation: "topBarScroll 2.6s steps(8) infinite",
            boxShadow: `0 0 6px ${COLORS.glow}`,
            willChange: "background-position",
          }}
        />
        <div className="absolute -top-2 left-4 h-1 w-12 bg-[#22d3ee]/70 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        <div className="absolute -top-2 right-4 h-1 w-8 bg-[#f472b6]/70 shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
        <div className="absolute -bottom-2 left-6 h-1 w-10 bg-[#a7f3d0]/60 shadow-[0_0_8px_rgba(167,243,208,0.8)]" />
        <div className="absolute -bottom-2 right-6 h-1 w-14 bg-[#93c5fd]/60 shadow-[0_0_8px_rgba(147,197,253,0.8)]" />
      </div>

      <div className="absolute inset-6 pointer-events-none opacity-60">
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#7dd3fc]" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#7dd3fc]" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#7dd3fc]" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#7dd3fc]" />
      </div>
    </>
  );

  const AtmosphereLayer = (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.35)_60%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-25 mix-blend-screen pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(244,114,182,0.2) 0 50%, transparent 50%), linear-gradient(0deg, rgba(34,211,238,0.2) 0 50%, transparent 50%)",
          backgroundSize: "16px 16px",
          animation: "nebulaStep 8s steps(6) infinite",
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(#4c1d95 1px, transparent 1px), linear-gradient(90deg, #4c1d95 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          transform: "perspective(500px) rotateX(20deg) scale(1.5)",
          animation: "gridPulse 4s ease-in-out infinite",
        }}
      />
      <div
        className="absolute inset-0 opacity-25 mix-blend-screen pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)",
          animation: "scanlineShift 6s linear infinite",
        }}
      />
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.2) 48%, rgba(56,189,248,0.45) 50%, rgba(56,189,248,0.2) 52%, transparent 100%)",
          animation: "beamSweep 5s linear infinite",
        }}
      />
    </>
  );

  const BackdropLayer = (
    <>
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-44 h-44 opacity-35 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(244,114,182,0.35) 0 6px, rgba(59,130,246,0.18) 6px 12px)",
          clipPath:
            "polygon(40% 0, 60% 0, 72% 10%, 82% 22%, 90% 40%, 90% 60%, 82% 78%, 72% 90%, 60% 100%, 40% 100%, 28% 90%, 18% 78%, 10% 60%, 10% 40%, 18% 22%, 28% 10%)",
          boxShadow:
            "0 0 0 4px rgba(244,114,182,0.2), 6px 6px 0 rgba(0,0,0,0.35)",
          animation: "pixelSunPulse 4s steps(4) infinite",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-32 opacity-35 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.8) 50%, rgba(2,6,23,0.95) 100%)",
          clipPath:
            "polygon(0 70%, 10% 55%, 20% 68%, 35% 40%, 45% 60%, 60% 35%, 72% 55%, 85% 42%, 100% 65%, 100% 100%, 0 100%)",
          animation: "mountainDrift 14s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-20 opacity-55 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(30,41,59,0) 0%, rgba(30,41,59,0.7) 50%, rgba(2,6,23,0.95) 100%)",
          clipPath:
            "polygon(0 80%, 12% 60%, 26% 78%, 40% 55%, 55% 72%, 70% 50%, 82% 70%, 100% 58%, 100% 100%, 0 100%)",
          animation: "mountainDrift 10s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-40 opacity-60 pointer-events-none"
        style={{
          background: "linear-gradient(0deg, rgba(34,211,238,0.35), rgba(34,211,238,0))",
        }}
      />
    </>
  );

  const ParticlesLayer = (
    <>
      {stars.map((star, i) => (
        <div
          key={`star-${i}`}
          className="absolute bg-white/80"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            top: star.top,
            left: star.left,
            opacity: star.opacity,
            boxShadow: "1px 1px 0 rgba(0,0,0,0.3)",
            animation: `starTwinkle ${star.duration}s steps(4) ${star.delay}s infinite`,
          }}
        />
      ))}

      {glitchBlocks.map((block, i) => (
        <div
          key={`glitch-${i}`}
          className="absolute"
          style={{
            width: `${block.size}px`,
            height: `${block.size}px`,
            top: block.top,
            left: block.left,
            background: block.color,
            opacity: 0.6,
            boxShadow: "1px 1px 0 rgba(0,0,0,0.35)",
            animation: `glitchBlock ${block.duration}s steps(2) ${block.delay}s infinite`,
          }}
        />
      ))}

      {clusters.map((cluster, i) => (
        <div
          key={`cluster-${i}`}
          className="absolute"
          style={{
            width: "2px",
            height: "2px",
            top: cluster.top,
            left: cluster.left,
            background: COLORS.sky,
            boxShadow: `6px 0 ${COLORS.sky}, 0 6px ${COLORS.sky}, 6px 6px ${COLORS.sky}`,
            opacity: 0.5,
            animation: `clusterDrift ${cluster.duration}s steps(4) ${cluster.delay}s infinite`,
          }}
        />
      ))}

      {floatingPixels.map((pixel, i) => (
        <div
          key={`float-${i}`}
          className="absolute bg-white"
          style={{
            width: `${pixel.size}px`,
            height: `${pixel.size}px`,
            top: pixel.top,
            left: pixel.left,
            opacity: pixel.opacity,
            animation: `pixelFloat ${pixel.duration}s steps(4) ${pixel.delay}s infinite`,
          }}
        />
      ))}

      {fallingPixels.map((pixel, i) => (
        <div
          key={`fall-${i}`}
          className="absolute bg-[#c7d2fe]"
          style={{
            width: "2px",
            height: `${pixel.height}px`,
            top: pixel.top,
            left: pixel.left,
            opacity: pixel.opacity,
            animation: `pixelFall ${pixel.duration}s steps(6) ${pixel.delay}s infinite`,
          }}
        />
      ))}

      {sparkleBursts.map((spark, i) => (
        <div
          key={`spark-${i}`}
          className="absolute bg-[#a7f3d0]"
          style={{
            width: "2px",
            height: "2px",
            top: spark.top,
            left: spark.left,
            boxShadow: "0 0 8px rgba(167,243,208,0.8)",
            animation: `sparklePop ${spark.duration}s steps(3) ${spark.delay}s infinite`,
          }}
        />
      ))}

      {dustPixels.map((dust, i) => (
        <div
          key={`dust-${i}`}
          className="absolute"
          style={{
            width: "2px",
            height: "2px",
            bottom: dust.bottom,
            left: dust.left,
            background: COLORS.mint,
            opacity: dust.opacity,
            animation: `dustRise ${dust.duration}s steps(3) ${dust.delay}s infinite`,
          }}
        />
      ))}
    </>
  );

  const HudLayer = (
    <>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="relative w-16 h-16 opacity-40"
          style={{ animation: "hudBlink 2.4s steps(2) infinite" }}
        >
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[2px] h-4 bg-[#7dd3fc]" />
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[2px] h-4 bg-[#7dd3fc]" />
          <div className="absolute top-1/2 left-0 -translate-y-1/2 h-[2px] w-4 bg-[#7dd3fc]" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 h-[2px] w-4 bg-[#7dd3fc]" />
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="absolute w-[320px] h-[320px] rounded-full border border-[#93c5fd]/20"
          style={{ animation: "ringSpin 18s linear infinite" }}
        />
        <div
          className="absolute w-[240px] h-[240px] rounded-full border border-[#f472b6]/20"
          style={{ animation: "ringSpin 12s linear infinite reverse" }}
        />
        <div
          className="absolute w-[320px] h-[320px]"
          style={{ animation: "ringSpin 10s linear infinite" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#22d3ee] shadow-[1px_1px_0_rgba(0,0,0,0.4)]" />
        </div>
      </div>

      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-none opacity-50">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`meter-l-${i}`}
            className="w-6 h-[3px] bg-[#7dd3fc]"
            style={{
              animation: `hudBlink ${2 + i * 0.2}s steps(2) ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-none opacity-50">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`meter-r-${i}`}
            className="w-6 h-[3px] bg-[#f472b6]"
            style={{
              animation: `hudBlink ${2.2 + i * 0.2}s steps(2) ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <div
        className="absolute top-8 left-8 text-[10px] text-white/70 pointer-events-none"
        style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}
      >
        SYS: PIXEL
      </div>
      <div
        className="absolute top-8 right-8 text-[10px] text-white/70 pointer-events-none"
        style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}
      >
        MODE: DREAM
      </div>
    </>
  );

  const ContentLayer = (
    <>
      <div
        className="relative z-10 text-center space-y-4"
        style={{ animation: "titleFloat 3s ease-in-out infinite" }}
      >
        <div className="relative inline-block">
          <h1
            className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#22d3ee] to-[#3b82f6]"
            style={{
              fontFamily: "'Press Start 2P', 'Courier New', monospace",
              filter: "drop-shadow(4px 4px 0 #d946ef)",
              animation: "glitchText 2s infinite",
            }}
          >
            PIXEL
          </h1>
          <div
            className="absolute top-0 left-0 w-full h-full bg-[#22d3ee] mix-blend-overlay opacity-40"
            style={{ animation: "glitchSlice 1.6s steps(2) infinite" }}
          />
          <div
            className="absolute -inset-1 border border-[#22d3ee]/30"
            style={{ animation: "titleBorder 2.4s ease-in-out infinite" }}
          />
        </div>

        <div className="block"></div>

        <div className="relative inline-block">
          <h1
            className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#f472b6] to-[#a855f7]"
            style={{
              fontFamily: "'Press Start 2P', 'Courier New', monospace",
              filter: "drop-shadow(4px 4px 0 #06b6d4)",
              animation: "glitchText 2s infinite reverse",
            }}
          >
            TIME
          </h1>
          <div
            className="absolute inset-0 bg-[#f472b6] mix-blend-screen opacity-20"
            style={{ animation: "glitchSlice 2s steps(2) 0.2s infinite" }}
          />
          <div
            className="absolute -inset-1 border border-[#f472b6]/25"
            style={{ animation: "titleBorder 2.8s ease-in-out infinite" }}
          />
        </div>
      </div>

      <div
        className="mt-12 w-72 h-7 border-4 border-white p-1 bg-black/50 relative"
        style={{ animation: "loadingPulse 2.8s steps(2) infinite" }}
      >
        <div
          className="h-full bg-[#5fffd2]"
          style={{
            width: "0%",
            animation: "loadBar 2.8s steps(14) forwards",
            boxShadow: "0 0 10px #5fffd2",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(0,0,0,0.25) 0 6px, transparent 6px 12px)",
          }}
        />
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-white/70 pointer-events-none"
          style={{
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            animation: "crtFlicker 2s steps(2) infinite",
          }}
        >
          LOADING...
        </div>
      </div>
    </>
  );

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] bg-[#1a0b2e] flex flex-col items-center justify-center transition-opacity duration-1000 ${fading ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      style={{ imageRendering: "pixelated" }}
    >
      {FrameLayer}
      {AtmosphereLayer}
      {BackdropLayer}
      {ParticlesLayer}
      {HudLayer}
      {ContentLayer}

      <div
        className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 2px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 3px)",
          animation: "noiseJitter 1.2s steps(2) infinite",
        }}
      />
    </div>,
    document.body,
  );
}
