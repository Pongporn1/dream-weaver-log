import type { CSSProperties } from "react";

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

type PixelDreamData = {
  staticStars: { top: string; left: string }[];
  twinkleStars: { top: string; left: string; duration: number }[];
  milkyStars: { top: string; left: string; duration: number }[];
  embers: { left: number; duration: number; delay: number }[];
  grass: { left: string; duration: number; delay: number }[];
  fireflies: {
    bottom: string;
    left: string;
    duration: number;
    delay: number;
    fx1: string;
    fy1: string;
    fx2: string;
    fy2: string;
    fx3: string;
    fy3: string;
  }[];
};

type SuperBlueBloodData = {
  stars: {
    size: number;
    top: string;
    left: string;
    floatDuration: number;
    twinkleDuration: number;
  }[];
};

type SuperBloodData = {
  mist: { size: number; left: string; duration: number }[];
};

type NebulaDreamData = {
  stardust: {
    size: number;
    top: string;
    left: string;
    opacity: number;
    duration: number;
    delay: number;
    glow: number;
    color: string;
  }[];
};

type CosmicVoyageData = {
  warpStars: {
    height: number;
    top: string;
    left: string;
    duration: number;
    delay: number;
  }[];
  staticStars: { top: string; left: string; duration: number }[];
};

export function PixelDreamNavEffects({ data }: { data: PixelDreamData | null }) {
  if (!data) return null;
  return (
    <div aria-hidden="true" className="contents">
      {/* Pixel Wave Border - Water Wave Style */}
      <div
        className="absolute left-0 right-0 h-[12px] z-50 pointer-events-none overflow-hidden"
        style={{ top: "-12px" }}
      >
        {/* Wide wave pattern for seamless scrolling */}
        <div
          className="absolute bottom-0 left-0"
          style={{
            width: "200%", // Double width for seamless loop
            height: "100%",
            display: "flex",
            animation: "pixelWaveScroll 12s linear infinite",
          }}
        >
          {/* Create 120 blocks (double the original 60) for seamless loop */}
          {[...Array(120)].map((_, i) => {
            // Create sine wave pattern that repeats every 60 blocks
            const wavePhase = (i * 0.5) % 8;
            const sineValue = Math.sin((wavePhase * Math.PI) / 4);
            const height = Math.floor((sineValue + 1) * 3.5) + 2; // 2-9 pixels height

            // Color based on height
            let color;
            if (height <= 3) color = "#1e3a8a";
            else if (height <= 5) color = "#3b82f6";
            else if (height <= 7) color = "#06b6d4";
            else if (height <= 8) color = "#22d3ee";
            else color = "#ffffff";

            return (
              <div
                key={i}
                className="absolute bottom-0"
                style={{
                  left: `${i * 0.8333}%`, // 100% / 120 blocks
                  width: "0.9%",
                  height: `${height}px`,
                  backgroundColor: color,
                  imageRendering: "pixelated",
                  boxShadow: height > 6 ? `0 0 6px ${color}` : "none",
                }}
              />
            );
          })}
        </div>

        {/* Animated glow overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.3) 25%, rgba(255,255,255,0.5) 50%, rgba(6,182,212,0.3) 75%, transparent 100%)",
            animation: "pixelWaveGlow 2.5s linear infinite",
          }}
        />
      </div>

      {/* Animated Pixel Stars on Border */}
      <div
        className="absolute left-0 right-0 h-[8px] z-40 pointer-events-none"
        style={{ top: "-8px" }}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[3px] h-[3px]"
            style={{
              left: `${15 + i * 15}%`,
              top: "2px",
              backgroundColor: "#ffffff",
              boxShadow: "0 0 6px #06b6d4",
              animation: `pixelTwinkle ${1 + i * 0.3}s steps(2) infinite`,
              imageRendering: "pixelated",
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes pixelTwinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.7); }
        }
        @keyframes pixelWaveFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes pixelWaveGlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pixelWaveScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden rounded-t-[inherit] pointer-events-none">
        {/* Animated Pixel Beam (Top Border) */}
        <div
          className="absolute left-0 right-0 h-[4px] z-50"
          style={{
            top: "-4px", // Sit correctly on the border
            background:
              "linear-gradient(90deg, transparent 0%, transparent 20%, #ffffff 40%, #ffffff 60%, transparent 80%, transparent 100%)", // Hard block beam
            backgroundSize: "200% 100%", // Larger size for travel
            opacity: 1, // Full brightness
            animation: "pixelBeam 2s linear infinite", // Faster
            boxShadow: "0 0 4px #ffffff", // Glow
          }}
        />
        <style>{`
          @keyframes pixelBeam { 
            0% { background-position: 200% 0; } 
            100% { background-position: -200% 0; } 
          }
        `}</style>
        {/* Layer 1: Stargazing Sky (Dense Stars & Shooting Star) */}
        <div className="absolute inset-x-0 top-0 h-[60%] overflow-hidden">
          {/* Static Stars */}
          {data.staticStars.map((star, i) => (
            <div
              key={`star-static-${i}`}
              className="absolute bg-white opacity-60"
              style={{
                width: "2px",
                height: "2px",
                top: star.top,
                left: star.left,
                boxShadow: "0 0 1px white",
              }}
            />
          ))}
          {/* Twinkling Stars */}
          {data.twinkleStars.map((star, i) => (
            <div
              key={`star-twinkle-${i}`}
              className="absolute bg-[#a5b4fc]" // Indigo-200
              style={{
                width: "3px",
                height: "3px",
                top: star.top,
                left: star.left,
                animation: `pulse ${star.duration}s infinite alternate`,
              }}
            />
          ))}
          {/* Shooting Star */}
          <div
            className="absolute top-0 left-[20%]"
            style={{
              width: "4px",
              height: "4px",
              background: "#ffffff",
              boxShadow:
                "2px 2px 0 #c7d2fe, 4px 4px 0 #818cf8, 6px 6px 0 #4338ca", // Trail
              animation: "shootingStar 4s ease-in-out infinite",
            }}
          >
            <style>{`
              @keyframes shootingStar {
                0% { transform: translate(-100px, -100px); opacity: 0; }
                10% { opacity: 1; }
                20% { transform: translate(200px, 200px); opacity: 0; }
                100% { transform: translate(200px, 200px); opacity: 0; }
              }
            `}</style>
          </div>
        </div>

        {/* Layer 2: Scene Container (Mountains, Hills, Camp) */}
        <div className="absolute inset-x-0 bottom-0 h-[60%]">
          {/* Layer 0.2: Milky Way (Galaxy Band) */}
          <div
            className="absolute inset-0 opacity-30 transform -rotate-12 scale-150"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />
          {/* Extra Dense Stars for Milky Way */}
          {data.milkyStars.map((star, i) => (
            <div
              key={`star-milky-${i}`}
              className="absolute bg-white opacity-40"
              style={{
                width: "1px",
                height: "1px",
                top: star.top,
                left: star.left,
                animation: `twinkle ${star.duration}s infinite`,
              }}
            />
          ))}

          {/* Layer 0.5: Shooting Stars (Dual) */}
          <div
            className="absolute top-[10%] left-[20%] w-[2px] h-[2px] bg-white rounded-full z-0 opacity-0"
            style={{
              boxShadow: "0 0 4px white, 2px 2px 0 rgba(255,255,255,0.5)",
              animation: "shootingStar 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute top-[30%] left-[50%] w-[1px] h-[1px] bg-cyan-200 rounded-full z-0 opacity-0"
            style={{
              boxShadow: "0 0 2px cyan",
              animation: "shootingStar 9s ease-in-out infinite 3s",
            }}
          />

          {/* Layer 0.8: Drifting Pixel Clouds */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`cloud-${i}`}
              className="absolute opacity-20"
              style={{
                top: `${20 + i * 15}%`,
                left: `${i * 30}%`,
                animation: `cloudDrift ${15 + i * 5}s linear ${i * 3}s infinite`,
              }}
            >
              <div className="w-[8px] h-[3px] bg-white rounded-sm" />
              <div className="absolute top-[-2px] left-[2px] w-[4px] h-[3px] bg-white rounded-sm" />
              <div className="absolute top-[-2px] right-[1px] w-[3px] h-[2px] bg-white rounded-sm" />
            </div>
          ))}
          <style>{`@keyframes cloudDrift { 0% { transform: translateX(0); } 100% { transform: translateX(100vw); } }`}</style>

          {/* Layer 1.5: Constellation (Big Dipper) */}
          <div className="absolute top-[15%] left-[5%] opacity-70">
            <div
              className="absolute w-[2px] h-[2px] bg-white shadow-[0_0_2px_white]"
              style={{ top: 0, left: 0 }}
            />
            <div
              className="absolute w-[2px] h-[2px] bg-white shadow-[0_0_2px_white]"
              style={{ top: "10px", left: "20px" }}
            />
            <div
              className="absolute w-[2px] h-[2px] bg-white shadow-[0_0_2px_white]"
              style={{ top: "25px", left: "35px" }}
            />
            <div
              className="absolute w-[2px] h-[2px] bg-white shadow-[0_0_2px_white]"
              style={{ top: "35px", left: "55px" }}
            />
            <div
              className="absolute w-[2px] h-[2px] bg-white shadow-[0_0_2px_white]"
              style={{ top: "45px", left: "55px" }}
            />
            <div
              className="absolute w-[2px] h-[2px] bg-white shadow-[0_0_2px_white]"
              style={{ top: "45px", left: "80px" }}
            />
            <div
              className="absolute w-[2px] h-[2px] bg-white shadow-[0_0_2px_white]"
              style={{ top: "35px", left: "80px" }}
            />
            <svg className="absolute top-0 left-0 w-[100px] h-[60px] opacity-20 pointer-events-none">
              <polyline
                points="1,1 21,11 36,26 56,36 56,46 81,46 81,36 56,36"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </svg>
          </div>

          {/* Layer 2: Trees (Detailed) */}
          {[10, 20, 70, 85].map((pos, i) => (
            <div
              key={`tree-detailed-${i}`}
              className="absolute bottom-[35%]"
              style={{ left: `${pos}%` }}
            >
              <div
                style={{
                  width: "0",
                  height: "0",
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: "16px solid #164e63",
                  transform: `scale(${1 + i * 0.1})`,
                  transformOrigin: "bottom center",
                  animation: `treeSway ${4 + i}s ease-in-out infinite alternate`,
                }}
              >
                {/* Snow/Light Highlight on Trees */}
                <div className="absolute top-[4px] left-[-2px] w-[1px] h-[1px] bg-[#0eaaaf] opacity-50" />
                <div className="absolute top-[8px] right-[-2px] w-[1px] h-[1px] bg-[#0eaaaf] opacity-50" />
              </div>
              {/* Lantern on 2nd Tree */}
              {i === 1 && (
                <div
                  className="absolute top-[6px] right-[-4px] animate-pulse"
                  style={{
                    animation: `treeSway ${4 + i}s ease-in-out infinite alternate`,
                  }}
                >
                  <div className="w-[2px] h-[3px] bg-[#fbbf24] shadow-[0_0_4px_#fbbf24]" />
                  <div className="absolute -top-[1px] left-0 w-[2px] h-[1px] bg-[#78350f]" />
                </div>
              )}
            </div>
          ))}

          {/* Layer 2.5: Foreground Hill (Darker for Depth) */}
          <div
            className="absolute inset-0 w-[150%] -left-[20%] rounded-[100%] bg-[#155e75] shadow-[inset_0_2px_0_#164e63]"
            style={{ transform: "scaleY(0.5) translateY(40%)", opacity: 0.8 }}
          />

          {/* Layer 3: Camp Scene Details */}
          {/* Tent */}
          <div
            className="absolute bottom-6 left-[45%] z-10"
            style={{
              width: "0",
              height: "0",
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderBottom: "12px solid #ef4444",
              filter: "drop-shadow(2px 0 0 #7f1d1d)",
            }}
          >
            <div className="absolute top-[2px] left-[-2px] w-0 h-0 border-l-[2px] border-r-[2px] border-b-[8px] border-b-[#1e293b] border-l-transparent border-r-transparent" />
          </div>

          {/* Sleeping Fox (Breathing) */}
          <div
            className="absolute bottom-4 left-[42%] z-10"
            style={{ animation: "foxBreathe 2s ease-in-out infinite" }}
          >
            <div className="w-[6px] h-[4px] bg-[#f97316] rounded-t-lg rounded-bl-lg" /> {/* Body */}
            <div className="absolute -top-[2px] left-0 w-[2px] h-[2px] bg-[#f97316]" /> {/* Ear */}
            <div className="absolute top-[1px] -right-[2px] w-[3px] h-[3px] bg-[#fff7ed] rounded-full" /> {/* Tail tip */}
            {/* Zzz */}
            <div
              className="absolute -top-[6px] -right-[4px] text-[6px] text-white opacity-60"
              style={{ animation: "zzz 3s ease-in-out infinite" }}
            >
              z
            </div>
          </div>
          <style>{`
            @keyframes foxBreathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            @keyframes zzz { 0%, 100% { transform: translateY(0); opacity: 0; } 50% { transform: translateY(-8px); opacity: 0.6; } }
          `}</style>

          {/* Campfire (Enhanced with Embers) */}
          <div
            className="absolute bottom-5 left-[50%] w-1 h-1 bg-orange-500 rounded-full z-10"
            style={{
              boxShadow:
                "0 0 6px orange, 0 -2px 8px rgba(255, 69, 0, 0.8)",
              animation: "flicker 0.2s infinite alternate",
            }}
          >
            <div className="absolute -bottom-[2px] -left-[2px] w-2 h-[2px] bg-[#78350f]" />
            {/* Rising Embers */}
            {data.embers.map((ember, i) => (
              <div
                key={`ember-${i}`}
                className="absolute w-[1px] h-[1px] bg-orange-400 rounded-full"
                style={{
                  bottom: "2px",
                  left: `${ember.left}px`,
                  animation: `emberRise ${ember.duration}s ease-out ${ember.delay}s infinite`,
                }}
              />
            ))}
          </div>
          <style>{`@keyframes emberRise { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-20px) scale(0.3); opacity: 0; } }`}</style>

          {/* Guitar (Vibrating) */}
          <div
            className="absolute bottom-5 left-[52%] z-10"
            style={{ animation: "guitarVibrate 0.5s ease-in-out infinite alternate" }}
          >
            <div className="w-[3px] h-[8px] bg-[#92400e] rounded-[1px] shadow-[1px_1px_0_#000] rotate-12" />
            {/* Strings */}
            <div className="absolute top-[2px] left-[1px] w-[1px] h-[4px] bg-[#fbbf24] opacity-30" />
          </div>
          <style>{`@keyframes guitarVibrate { from { transform: rotate(-1deg); } to { transform: rotate(1deg); } }`}</style>

          {/* Mushrooms (Red/White) */}
          {[15, 25, 60, 75, 80].map((pos, i) => (
            <div
              key={`mushroom-${i}`}
              className="absolute bottom-4 z-10"
              style={{ left: `${pos}%` }}
            >
              <div className="w-[4px] h-[3px] bg-[#ef4444] rounded-t-sm" /> {/* Cap */}
              <div className="absolute top-[1px] left-[1px] w-[1px] h-[1px] bg-white" /> {/* Spot */}
              <div className="absolute bottom-[-2px] left-[1px] w-[2px] h-[2px] bg-[#fcd34d]" /> {/* Stem */}
            </div>
          ))}

          {/* Tall Grass (Swaying) */}
          {data.grass.map((blade, i) => (
            <div
              key={`grass-${i}`}
              className="absolute bottom-3 w-[1px] h-[3px] bg-[#4ade80]"
              style={{
                left: blade.left,
                opacity: 0.6,
                animation: `grassSway ${blade.duration}s ease-in-out ${blade.delay}s infinite alternate`,
                transformOrigin: "bottom",
              }}
            />
          ))}
          <style>{`@keyframes grassSway { from { transform: rotate(-5deg); } to { transform: rotate(5deg); } }`}</style>

          {/* Fireflies (Enhanced Swarm) */}
          {data.fireflies.map((firefly, i) => (
            <div
              key={`firefly-${i}`}
              className="absolute w-[1px] h-[1px] bg-[#fcd34d] rounded-full"
              style={
                {
                  bottom: firefly.bottom,
                  left: firefly.left,
                  boxShadow: "0 0 3px #fcd34d",
                  animation: `fireflyBounce ${firefly.duration}s ease-in-out ${firefly.delay}s infinite`,
                  "--fx1": firefly.fx1,
                  "--fy1": firefly.fy1,
                  "--fx2": firefly.fx2,
                  "--fy2": firefly.fy2,
                  "--fx3": firefly.fx3,
                  "--fy3": firefly.fy3,
                } as CSSVars
              }
            />
          ))}
          <style>{`
            @keyframes fireflyBounce { 
              0%, 100% { transform: translate(0, 0); opacity: 0.3; } 
              25% { transform: translate(var(--fx1), var(--fy1)); opacity: 1; }
              50% { transform: translate(var(--fx2), var(--fy2)); opacity: 0.8; }
              75% { transform: translate(var(--fx3), var(--fy3)); opacity: 1; }
            }
          `}</style>

          {/* Layer 2.5: Drifting Low Fog (Mist) */}
          <div
            className="absolute bottom-0 left-0 w-[200%] h-12 pointer-events-none opacity-30"
            style={{
              background: "linear-gradient(to top, rgba(255,255,255,0.4), transparent)",
              maskImage: "linear-gradient(90deg, transparent, black 50%, transparent)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent, black 50%, transparent)",
              animation: "fogDrift 20s linear infinite",
            }}
          >
            <style>{`@keyframes fogDrift { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
          </div>
        </div>

        {/* Layer 3: Secret Easter Egg (Tiny UFO) */}
        <div
          className="absolute top-[15%] right-[-20px] pointer-events-none opacity-80"
          style={{
            width: "6px",
            height: "2px",
            background: "#ec4899", // Pink disk
            boxShadow:
              "2px -2px 0 #22d3ee, -2px -2px 0 #22d3ee, 0 -4px 0 #e879f9", // Dome & lights
            animation: "ufoFly 30s linear 5s infinite",
          }}
        >
          <style>{`@keyframes ufoFly { 0% { transform: translateX(0) translateY(0); } 25% { transform: translateX(-150px) translateY(10px); } 50% { transform: translateX(-300px) translateY(-5px); } 100% { transform: translateX(-120vw) translateY(20px); } }`}</style>
        </div>
      </div>
    </div>
  );
}

export function SuperBlueBloodMoonNavEffects({
  data,
}: {
  data: SuperBlueBloodData | null;
}) {
  if (!data) return null;
  return (
    <div aria-hidden="true" className="contents">
      <div className="absolute inset-0 overflow-hidden rounded-t-[inherit] pointer-events-none">
        {/* Layer 1: Deep Cosmos Background */}
        <div className="absolute inset-0 bg-black/80" />

        {/* Layer 2: Red Blood Nebula (Slow Swirl) */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(circle at 40% 60%, rgba(180, 0, 50, 0.5), transparent 50%)",
            filter: "blur(20px)",
            animation: "plasmaFlow 10s ease-in-out infinite alternate",
          }}
        />

        {/* Layer 3: Blue/Purple Plasma (Interference) */}
        <div
          className="absolute inset-0 opacity-60 mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle at 60% 40%, rgba(50, 60, 200, 0.6), transparent 50%)",
            filter: "blur(15px)",
            animation: "plasmaFlow 8s ease-in-out infinite alternate-reverse",
          }}
        />

        {/* Layer 4: Stars/Particles - Moving & Twinkling */}
        {data.stars.map((star, i) => (
          <div
            key={`super-blue-star-${i}`}
            className="absolute rounded-full bg-white blur-[0.5px]"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: star.top,
              left: star.left,
              animation: `starFloat ${star.floatDuration}s infinite linear, starTwinkle ${star.twinkleDuration}s infinite ease-in-out alternate`,
            }}
          />
        ))}

        {/* Layer 5: Royal Gold/Purple Border Beam - Flowing Right */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] z-20"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255, 50, 50, 0.8), rgba(200, 100, 255, 1), rgba(50, 100, 255, 0.8), transparent)",
            backgroundSize: "200% 100%",
            animation: "flowRight 3s linear infinite",
            boxShadow: "0 0 15px rgba(200, 50, 200, 0.6)",
          }}
        />
      </div>

      <div className="absolute inset-0 overflow-hidden rounded-t-[inherit] pointer-events-none">
        {/* Layer 1: Mystic Void Background */}
        <div className="absolute inset-0 bg-[#050510]" />
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 50% 100%, rgba(80, 0, 100, 0.4), transparent 80%)",
          }}
        />

        {/* Layer 2: Hybrid Starfield (Red & Blue) */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(1.5px 1.5px at 20% 20%, #aaddff 10%, transparent 0), radial-gradient(1.5px 1.5px at 80% 80%, #ffaaaa 10%, transparent 0)",
            backgroundSize: "250px 250px",
            animation: "pulse 5s ease-in-out infinite",
          }}
        />

        {/* Layer 3: The Super Blue Blood Moon (Dual Tone) */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[35%] w-[320px] h-[320px] rounded-full z-10"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #1e1b4b 0%, #4c0519 60%, #000000 100%)",
            boxShadow:
              "0 0 60px rgba(100, 50, 255, 0.4), inset -10px -10px 50px rgba(100, 0, 50, 0.8)",
            filter: "contrast(1.3) brightness(1.1)",
          }}
        >
          {/* Moon Texture */}
          <div
            className="absolute inset-0 rounded-full opacity-50 mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, rgba(50,50,100,0.5) 5%, transparent 15%), radial-gradient(circle at 70% 60%, rgba(100,50,50,0.5) 8%, transparent 20%)",
            }}
          />
          {/* Sharp Rim Light (Blue Top, Red Bottom glow hint) */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow:
                "inset 10px 10px 30px rgba(100, 150, 255, 0.6), inset -10px -10px 30px rgba(255, 50, 100, 0.4)",
              mixBlendMode: "screen",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function SuperBloodMoonNavEffects({ data }: { data: SuperBloodData | null }) {
  if (!data) return null;
  return (
    <div aria-hidden="true" className="contents">
      <div
        className="absolute inset-0 overflow-hidden rounded-t-[inherit] pointer-events-none"
        style={{ animation: "mythicThemeEntrance 3s ease-out forwards" }}
      >
        {/* Layer 1: Blood Void Background */}
        <div className="absolute inset-0 bg-black" />
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 50% 100%, rgba(50, 0, 0, 0.8), transparent 80%)",
          }}
        />

        {/* Layer 2: Red Starfield */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 20% 20%, #ffaaaa 10%, transparent 0), radial-gradient(1.5px 1.5px at 60% 80%, #ff4444 10%, transparent 0)",
            backgroundSize: "200px 200px",
            animation: "pulse 4s ease-in-out infinite",
          }}
        />

        {/* Layer 3: The Giant Blood Moon (Enhanced Definition) */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[35%] w-[320px] h-[320px] rounded-full z-10"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #800000 0%, #500000 40%, #2a0a0a 100%)",
            boxShadow:
              "0 0 60px rgba(255, 30, 30, 0.6), inset -10px -10px 40px rgba(0,0,0,0.9)",
            filter: "contrast(1.2) brightness(1.2)",
          }}
        >
          {/* Detailed Surface Texture */}
          <div
            className="absolute inset-0 rounded-full opacity-60 mix-blend-multiply"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 40%, rgba(0,0,0,0.7) 4%, transparent 12%), radial-gradient(circle at 65% 60%, rgba(0,0,0,0.6) 8%, transparent 20%), radial-gradient(circle at 45% 75%, rgba(0,0,0,0.5) 5%, transparent 15%), radial-gradient(circle at 80% 30%, rgba(0,0,0,0.6) 3%, transparent 10%)",
            }}
          />
          {/* Sharp Rim Light */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow:
                "inset 0 0 20px rgba(255, 100, 100, 0.8), 0 0 10px rgba(255, 50, 50, 0.5)",
              mixBlendMode: "screen",
            }}
          />
          {/* Beating Heart Glow */}
          <div
            className="absolute inset-0 rounded-full opacity-40 mix-blend-overlay"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(255, 0, 0, 0.6), transparent 70%)",
              animation: "flashPulse 4s ease-in-out infinite",
            }}
          />
        </div>

        {/* Layer 4: Rising Blood Mist */}
        <div
          className="absolute inset-0 z-20"
          style={{
            background: "linear-gradient(to top, rgba(50, 0, 0, 0.6), transparent)",
            maskImage: "linear-gradient(to top, black, transparent)",
            WebkitMaskImage: "linear-gradient(to top, black, transparent)",
          }}
        >
          {data.mist.map((mist, i) => (
            <div
              key={`blood-mist-${i}`}
              className="absolute rounded-full bg-red-600/20 blur-xl"
              style={{
                width: `${mist.size}px`,
                height: `${mist.size}px`,
                bottom: "-50px",
                left: mist.left,
                animation: `singularFloat ${mist.duration}s linear infinite reverse`,
              }}
            />
          ))}
        </div>

        {/* Layer 5: Crimson Horizon Border */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] z-30"
          style={{
            background:
              "linear-gradient(90deg, transparent, #ff0000, #ff4444, #ff0000, transparent)",
            backgroundSize: "200% 100%",
            animation: "borderFlow 3s linear infinite",
            boxShadow: "0 0 20px rgba(255, 0, 0, 0.6)",
          }}
        />
      </div>
    </div>
  );
}

export function NebulaDreamMoonNavEffects({
  data,
}: {
  data: NebulaDreamData | null;
}) {
  if (!data) return null;
  return (
    <div aria-hidden="true" className="contents">
      <div
        className="absolute inset-0 overflow-hidden rounded-t-[inherit] pointer-events-none"
        style={{ animation: "mythicThemeEntrance 2.5s ease-out forwards" }}
      >
        {/* Layer 1: Deep Cosmic Background */}
        <div className="absolute inset-0 bg-[#1a0b2e]/95 backdrop-blur-md" />

        {/* Layer 2: Nebula Clouds */}
        <div
          className="absolute inset-0 opacity-60 mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle at 30% 50%, rgba(255, 0, 150, 0.3), transparent 60%), radial-gradient(circle at 70% 50%, rgba(0, 200, 255, 0.3), transparent 60%)",
            filter: "blur(10px)",
            animation: "nebulaPulse 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute inset-0 opacity-40 mix-blend-color-dodge"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48ZmlsdGVyIGlkPSJnoiPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjAyIiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2cpIiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=')",
            animation: "mistFlow 10s linear infinite",
          }}
        />

        {/* Layer 3: Stardust Particles */}
        {data.stardust.map((dust, i) => (
          <div
            key={`nebula-dust-${i}`}
            className="absolute bg-white rounded-full"
            style={{
              width: `${dust.size}px`,
              height: `${dust.size}px`,
              top: dust.top,
              left: dust.left,
              opacity: dust.opacity,
              animation: `stardustTwinkle ${dust.duration}s ease-in-out infinite ${dust.delay}s`,
              boxShadow: `0 0 ${dust.glow}px ${dust.color}`,
            }}
          />
        ))}

        {/* Layer 4: Cosmic Horizon Border */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] z-20"
          style={{
            background: "linear-gradient(90deg, transparent, #ff00ff, #00ffff, transparent)",
            boxShadow:
              "0 0 15px rgba(255, 0, 255, 0.5), 0 0 30px rgba(0, 255, 255, 0.3)",
          }}
        />
      </div>
    </div>
  );
}

export function CosmicVoyageMoonNavEffects({
  data,
}: {
  data: CosmicVoyageData | null;
}) {
  if (!data) return null;
  return (
    <div aria-hidden="true" className="contents">
      <div className="absolute inset-0 overflow-hidden rounded-t-[inherit] pointer-events-none">
        {/* Layer 1: Deep Space Background */}
        <div className="absolute inset-0 bg-[#0b0515]/95" />

        {/* Layer 2: Nebula Highway (Moving Texture) */}
        <div
          className="absolute inset-y-0 left-0 w-[200%] opacity-50 mix-blend-screen"
          style={{
            backgroundImage:
              "linear-gradient(90deg, transparent, rgba(100, 20, 200, 0.3), rgba(60, 20, 150, 0.5), rgba(100, 20, 200, 0.3), transparent)",
            backgroundSize: "50% 100%",
            backgroundRepeat: "repeat-x",
            animation: "mistScroll 5s linear infinite",
          }}
        />

        {/* Layer 3: Warp Stars (Vertical Ascent) */}
        {data.warpStars.map((star, i) => (
          <div
            key={`warp-star-${i}`}
            className="absolute w-[2px] bg-white rounded-full mix-blend-screen opacity-40"
            style={{
              height: `${star.height}px`, // Vertical streaks
              top: star.top,
              left: star.left,
              animation: `warpSpeed ${star.duration}s linear infinite ${star.delay}s`,
              boxShadow: "0 0 2px rgba(200, 200, 255, 0.5)",
            }}
          />
        ))}

        {/* Layer 4: Distant Static Stars */}
        {data.staticStars.map((star, i) => (
          <div
            key={`cosmic-static-${i}`}
            className="absolute w-[1px] h-[1px] bg-white rounded-full opacity-60"
            style={{
              top: star.top,
              left: star.left,
              animation: `pulse ${star.duration}s ease-in-out infinite`,
            }}
          />
        ))}

        {/* Layer 5: Propulsion Border (Glowing Edge) */}
        {/* Static Base Rail */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] z-20 opacity-40"
          style={{
            background: "linear-gradient(90deg, transparent, #8a2be2, transparent)",
          }}
        />
        {/* Moving Photon Energy Beam */}
        <div
          className="absolute top-[-1px] left-0 right-0 h-[3px] z-21 mix-blend-screen"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(150, 50, 255, 0), rgba(255, 200, 255, 1) 50%, rgba(150, 50, 255, 0), transparent)",
            backgroundSize: "200% 100%",
            boxShadow:
              "0 0 20px rgba(220, 150, 255, 0.8), 0 0 40px rgba(150, 50, 255, 0.5)",
            animation: "mistFlow 1.5s linear infinite",
          }}
        />
      </div>
    </div>
  );
}
