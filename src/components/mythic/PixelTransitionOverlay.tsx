import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PixelTransitionOverlayProps {
  show: boolean;
  onComplete: () => void;
}

export function PixelTransitionOverlay({ show, onComplete }: PixelTransitionOverlayProps) {
  const [render, setRender] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (show) {
      setRender(true);
      setFading(false);
      
      // Sequence
      const fadeTimer = setTimeout(() => setFading(true), 3000); // Start fading after 3s
      const removeTimer = setTimeout(() => {
        setRender(false);
        onComplete();
      }, 4000); // Fully remove after 4s
      
      return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
    }
  }, [show, onComplete]);

  if (!render) return null;

  return createPortal(
    <div 
      className={`fixed inset-0 z-[9999] bg-[#1a0b2e] flex flex-col items-center justify-center transition-opacity duration-1000 ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ imageRendering: "pixelated" }}
    >
        {/* CRT Frame */}
        <div className="absolute inset-3 border-4 border-[#7dd3fc]/40 shadow-[0_0_20px_rgba(125,211,252,0.35),inset_0_0_20px_rgba(59,130,246,0.25)] pointer-events-none" />
        <div className="absolute inset-3 pointer-events-none" style={{ animation: "framePulse 3s ease-in-out infinite" }}>
          <div className="absolute -top-2 left-4 h-1 w-12 bg-[#22d3ee]/70 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <div className="absolute -top-2 right-4 h-1 w-8 bg-[#f472b6]/70 shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
          <div className="absolute -bottom-2 left-6 h-1 w-10 bg-[#a7f3d0]/60 shadow-[0_0_8px_rgba(167,243,208,0.8)]" />
          <div className="absolute -bottom-2 right-6 h-1 w-14 bg-[#93c5fd]/60 shadow-[0_0_8px_rgba(147,197,253,0.8)]" />
        </div>

        {/* Corner Brackets */}
        <div className="absolute inset-6 pointer-events-none opacity-60">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#7dd3fc]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#7dd3fc]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#7dd3fc]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#7dd3fc]" />
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.35)_60%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />

        {/* Pixel Nebula */}
        <div
          className="absolute inset-0 opacity-25 mix-blend-screen pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(244,114,182,0.2) 0 50%, transparent 50%), linear-gradient(0deg, rgba(34,211,238,0.2) 0 50%, transparent 50%)",
            backgroundSize: "16px 16px",
            animation: "nebulaStep 8s steps(6) infinite"
          }}
        />

        {/* Animated Background Grid */}
        <div 
            className="absolute inset-0 opacity-20" 
            style={{
                backgroundImage: "linear-gradient(#4c1d95 1px, transparent 1px), linear-gradient(90deg, #4c1d95 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                transform: "perspective(500px) rotateX(20deg) scale(1.5)",
                animation: "gridPulse 4s ease-in-out infinite"
            }} 
        />

        {/* Scanlines */}
        <div
          className="absolute inset-0 opacity-25 mix-blend-screen pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)",
            animation: "scanlineShift 6s linear infinite"
          }}
        />

        {/* Vertical Scan Beam */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.2) 48%, rgba(56,189,248,0.45) 50%, rgba(56,189,248,0.2) 52%, transparent 100%)",
            animation: "beamSweep 5s linear infinite"
          }}
        />

        {/* Pixel Sun */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-44 h-44 opacity-35 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(0deg, rgba(244,114,182,0.35) 0 6px, rgba(59,130,246,0.18) 6px 12px)",
            clipPath:
              "polygon(40% 0, 60% 0, 72% 10%, 82% 22%, 90% 40%, 90% 60%, 82% 78%, 72% 90%, 60% 100%, 40% 100%, 28% 90%, 18% 78%, 10% 60%, 10% 40%, 18% 22%, 28% 10%)",
            boxShadow:
              "0 0 0 4px rgba(244,114,182,0.2), 6px 6px 0 rgba(0,0,0,0.35)",
            animation: "pixelSunPulse 4s steps(4) infinite"
          }}
        />

        {/* Mountains */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 opacity-35 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.8) 50%, rgba(2,6,23,0.95) 100%)",
            clipPath: "polygon(0 70%, 10% 55%, 20% 68%, 35% 40%, 45% 60%, 60% 35%, 72% 55%, 85% 42%, 100% 65%, 100% 100%, 0 100%)",
            animation: "mountainDrift 14s ease-in-out infinite"
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-20 opacity-55 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(30,41,59,0) 0%, rgba(30,41,59,0.7) 50%, rgba(2,6,23,0.95) 100%)",
            clipPath: "polygon(0 80%, 12% 60%, 26% 78%, 40% 55%, 55% 72%, 70% 50%, 82% 70%, 100% 58%, 100% 100%, 0 100%)",
            animation: "mountainDrift 10s ease-in-out infinite reverse"
          }}
        />

        {/* Retro Horizon Glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 opacity-60 pointer-events-none"
          style={{
            background: "linear-gradient(0deg, rgba(34,211,238,0.35), rgba(34,211,238,0))"
          }}
        />
        
        {/* Starfield */}
        {Array.from({ length: 26 }).map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute bg-white/80"
            style={{
              width: Math.random() > 0.7 ? "2px" : "1px",
              height: Math.random() > 0.7 ? "2px" : "1px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.6 + 0.2,
              boxShadow: "1px 1px 0 rgba(0,0,0,0.3)",
              animation: `starTwinkle ${3 + Math.random() * 4}s steps(4) ${Math.random() * 2}s infinite`
            }}
          />
        ))}

        {/* Glitch Blocks */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`glitch-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() > 0.6 ? 8 : 4}px`,
              height: `${Math.random() > 0.6 ? 8 : 4}px`,
              top: `${Math.random() * 90}%`,
              left: `${Math.random() * 90}%`,
              background: Math.random() > 0.5 ? "#22d3ee" : "#f472b6",
              opacity: 0.6,
              boxShadow: "1px 1px 0 rgba(0,0,0,0.35)",
              animation: `glitchBlock ${2 + Math.random() * 3}s steps(2) ${Math.random()}s infinite`,
            }}
          />
        ))}

        {/* Pixel Clusters */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`cluster-${i}`}
            className="absolute"
            style={{
              width: "2px",
              height: "2px",
              top: `${10 + Math.random() * 70}%`,
              left: `${10 + Math.random() * 70}%`,
              background: "#93c5fd",
              boxShadow:
                "6px 0 #93c5fd, 0 6px #93c5fd, 6px 6px #93c5fd",
              opacity: 0.5,
              animation: `clusterDrift ${4 + i}s steps(4) ${i * 0.2}s infinite`,
            }}
          />
        ))}

        {/* Floating Pixels */}
        {Array.from({ length: 34 }).map((_, i) => (
            <div 
                key={i}
                className="absolute bg-white"
                style={{
                    width: Math.random() > 0.5 ? "4px" : "8px",
                    height: Math.random() > 0.5 ? "4px" : "8px",
                    top: Math.random() * 100 + "%",
                    left: Math.random() * 100 + "%",
                    opacity: Math.random() * 0.5 + 0.2,
                    animation: `pixelFloat ${Math.random() * 2 + 1}s steps(4) ${Math.random()}s infinite`
                }}
            />
        ))}

        {/* Falling Pixels */}
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={`fall-${i}`}
            className="absolute bg-[#c7d2fe]"
            style={{
              width: "2px",
              height: Math.random() > 0.7 ? "6px" : "4px",
              top: `${-10 - Math.random() * 30}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.5,
              animation: `pixelFall ${4 + Math.random() * 6}s steps(6) ${Math.random() * 2}s infinite`
            }}
          />
        ))}

        {/* Pixel Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-16 h-16 opacity-40" style={{ animation: "hudBlink 2.4s steps(2) infinite" }}>
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[2px] h-4 bg-[#7dd3fc]" />
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[2px] h-4 bg-[#7dd3fc]" />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 h-[2px] w-4 bg-[#7dd3fc]" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 h-[2px] w-4 bg-[#7dd3fc]" />
          </div>
        </div>

        {/* Sparkle Bursts */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`spark-${i}`}
            className="absolute bg-[#a7f3d0]"
            style={{
              width: "2px",
              height: "2px",
              top: Math.random() * 90 + "%",
              left: Math.random() * 90 + "%",
              boxShadow: "0 0 8px rgba(167,243,208,0.8)",
              animation: `sparklePop ${3 + Math.random() * 3}s steps(3) ${Math.random() * 2}s infinite`
            }}
          />
        ))}

        {/* Pixel Dust */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`dust-${i}`}
            className="absolute"
            style={{
              width: "2px",
              height: "2px",
              bottom: `${5 + Math.random() * 20}px`,
              left: `${Math.random() * 100}%`,
              background: "#a7f3d0",
              opacity: 0.4,
              animation: `dustRise ${3 + Math.random() * 3}s steps(3) ${Math.random()}s infinite`,
            }}
          />
        ))}

        {/* Orbit Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="absolute w-[320px] h-[320px] rounded-full border border-[#93c5fd]/20"
            style={{ animation: "ringSpin 18s linear infinite" }}
          />
          <div
            className="absolute w-[240px] h-[240px] rounded-full border border-[#f472b6]/20"
            style={{ animation: "ringSpin 12s linear infinite reverse" }}
          />
          <div className="absolute w-[320px] h-[320px]" style={{ animation: "ringSpin 10s linear infinite" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#22d3ee] shadow-[1px_1px_0_rgba(0,0,0,0.4)]" />
          </div>
        </div>

        {/* Side HUD Meters */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-none opacity-50">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`meter-l-${i}`} className="w-6 h-[3px] bg-[#7dd3fc]" style={{ animation: `hudBlink ${2 + i * 0.2}s steps(2) ${i * 0.2}s infinite` }} />
          ))}
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-none opacity-50">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`meter-r-${i}`} className="w-6 h-[3px] bg-[#f472b6]" style={{ animation: `hudBlink ${2.2 + i * 0.2}s steps(2) ${i * 0.2}s infinite` }} />
          ))}
        </div>

        {/* HUD Labels */}
        <div className="absolute top-8 left-8 text-[10px] text-white/70 pointer-events-none" style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}>
          SYS: PIXEL
        </div>
        <div className="absolute top-8 right-8 text-[10px] text-white/70 pointer-events-none" style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}>
          MODE: DREAM
        </div>

        {/* Text GLITCH Effect */}
        <div className="relative z-10 text-center space-y-4" style={{ animation: "titleFloat 3s ease-in-out infinite" }}>
             <div className="relative inline-block">
                <h1 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#22d3ee] to-[#3b82f6]" 
                    style={{ 
                        fontFamily: "'Press Start 2P', 'Courier New', monospace", 
                        filter: "drop-shadow(4px 4px 0 #d946ef)",
                        animation: "glitchText 2s infinite"
                    }}>
                    PIXEL
                </h1>
                <div className="absolute top-0 left-0 w-full h-full bg-[#22d3ee] mix-blend-overlay opacity-40" style={{ animation: "glitchSlice 1.6s steps(2) infinite" }} />
                <div className="absolute -inset-1 border border-[#22d3ee]/30" style={{ animation: "titleBorder 2.4s ease-in-out infinite" }} />
             </div>
             
             <div className="block"></div>

             <div className="relative inline-block">
                <h1 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#f472b6] to-[#a855f7]" 
                    style={{ 
                        fontFamily: "'Press Start 2P', 'Courier New', monospace", 
                        filter: "drop-shadow(4px 4px 0 #06b6d4)",
                        animation: "glitchText 2s infinite reverse"
                    }}>
                    TIME
                </h1>
                <div className="absolute inset-0 bg-[#f472b6] mix-blend-screen opacity-20" style={{ animation: "glitchSlice 2s steps(2) 0.2s infinite" }} />
                <div className="absolute -inset-1 border border-[#f472b6]/25" style={{ animation: "titleBorder 2.8s ease-in-out infinite" }} />
             </div>
        </div>
        
        {/* Loading Bar */}
        <div
          className="mt-12 w-72 h-7 border-4 border-white p-1 bg-black/50 relative"
          style={{ animation: "loadingPulse 2.8s steps(2) infinite" }}
        >
             <div 
                 className="h-full bg-[#5fffd2]" 
                 style={{ 
                     width: "0%",
                     animation: "loadBar 2.8s steps(14) forwards",
                     boxShadow: "0 0 10px #5fffd2"
                 }} 
             />
             <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.25) 0 6px, transparent 6px 12px)" }} />
             <div
               className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-white/70 pointer-events-none"
               style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace", animation: "crtFlicker 2s steps(2) infinite" }}
             >
               LOADING...
             </div>
        </div>

        {/* Subtle Noise */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 2px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 3px)",
            animation: "noiseJitter 1.2s steps(2) infinite"
          }}
        />

        <style>{`
            @keyframes pixelFloat {
                0%, 100% { transform: translate(0, 0); }
                50% { transform: translate(0, -10px); }
            }
            @keyframes pixelFall {
                0% { transform: translateY(0); opacity: 0; }
                10% { opacity: 0.6; }
                100% { transform: translateY(120vh); opacity: 0; }
            }
            @keyframes sparklePop {
                0%, 100% { transform: scale(0); opacity: 0; }
                50% { transform: scale(1); opacity: 0.9; }
            }
            @keyframes starTwinkle {
                0%, 100% { opacity: 0.2; transform: scale(1); }
                50% { opacity: 0.9; transform: scale(1.4); }
            }
            @keyframes glitchBlock {
                0%, 100% { opacity: 0; transform: translate(0, 0); }
                20% { opacity: 0.8; }
                60% { opacity: 0.3; transform: translate(2px, -2px); }
            }
            @keyframes clusterDrift {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-6px); }
            }
            @keyframes dustRise {
                0% { transform: translateY(0); opacity: 0; }
                20% { opacity: 0.5; }
                100% { transform: translateY(-16px); opacity: 0; }
            }
            @keyframes loadBar {
                0% { width: 0%; }
                100% { width: 100%; }
            }
            @keyframes glitchText {
                0% { transform: translate(0); }
                20% { transform: translate(-2px, 2px); }
                40% { transform: translate(-2px, -2px); }
                60% { transform: translate(2px, 2px); }
                80% { transform: translate(2px, -2px); }
                100% { transform: translate(0); }
            }
            @keyframes glitchSlice {
                0% { clip-path: inset(0 0 0 0); }
                40% { clip-path: inset(10% 0 60% 0); }
                70% { clip-path: inset(50% 0 20% 0); }
                100% { clip-path: inset(0 0 0 0); }
            }
            @keyframes scanlineShift {
                0% { background-position: 0 0; }
                100% { background-position: 0 60px; }
            }
            @keyframes beamSweep {
                0% { transform: translateX(-120%); }
                100% { transform: translateX(120%); }
            }
            @keyframes nebulaStep {
                0%, 100% { transform: translate(0, 0); opacity: 0.2; }
                50% { transform: translate(-8px, 6px); opacity: 0.35; }
            }
            @keyframes pixelSunPulse {
                0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.3; }
                50% { transform: translateX(-50%) scale(1.06); opacity: 0.5; }
            }
            @keyframes mountainDrift {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(-12px); }
            }
            @keyframes ringSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes gridPulse {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 0.35; }
            }
            @keyframes titleFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-6px); }
            }
            @keyframes titleBorder {
                0%, 100% { opacity: 0.2; transform: translateY(0); }
                50% { opacity: 0.6; transform: translateY(-2px); }
            }
            @keyframes framePulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }
            @keyframes crtFlicker {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }
            @keyframes hudBlink {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.8; }
            }
            @keyframes loadingPulse {
                0%, 100% { box-shadow: 0 0 0 rgba(95,255,210,0.2); }
                50% { box-shadow: 0 0 12px rgba(95,255,210,0.35); }
            }
            @keyframes noiseJitter {
                0%, 100% { transform: translate(0, 0); }
                50% { transform: translate(-1px, 1px); }
            }
        `}</style>
    </div>,
    document.body
  );
}
