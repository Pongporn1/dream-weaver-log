import type { MoonPhenomenon } from "@/data/moonPhenomena";

interface HeaderContentProps {
  phenomenon: MoonPhenomenon | null;
}

export function HeaderContent({ phenomenon }: HeaderContentProps) {
  const getTitleFont = () => {
    if (!phenomenon) return "'Inter', sans-serif";

    if (phenomenon.rarity === "mythic") {
      const mythicFonts: Record<string, string> = {
        superBloodMoon: "'Cinzel', serif",
        superBlueBloodMoon: "'UnifrakturMaguntia', cursive",
        lunarTransientPhenomena: "'Orbitron', sans-serif",
        hybridEclipse: "'Spectral', serif",
        stillMoon: "'Abril Fatface', serif",
        echoMoon: "'Righteous', cursive",
        brokenMoon: "'Creepster', cursive",
        emptySky: "'Nosifer', cursive",
        crystalMoon: "'Poiret One', cursive",
        shatteredMoon: "'Creepster', cursive",
      };
      return mythicFonts[phenomenon.id] || "'Cinzel', serif";
    }

    if (phenomenon.rarity === "legendary") return "'Playfair Display', serif";
    if (phenomenon.rarity === "very_rare") return "'Cormorant Garamond', serif";
    if (phenomenon.rarity === "rare") {
      return phenomenon.id === "snowMoon"
        ? "'Mountains of Christmas', cursive"
        : "'Philosopher', sans-serif";
    }
    return "'Inter', sans-serif";
  };

  const getTitleSize = () => {
    if (!phenomenon) return "text-4xl";
    if (phenomenon.rarity === "mythic") return "text-6xl";
    if (phenomenon.rarity === "legendary" || phenomenon.rarity === "very_rare") return "text-5xl";
    return "text-4xl";
  };

  const getTitleShadow = () => {
    if (!phenomenon) return "0 0 10px rgba(255, 255, 255, 0.4), 0 2px 6px rgba(0, 0, 0, 0.5)";

    if (phenomenon.rarity === "mythic") {
      return `0 0 5px ${phenomenon.uiAccent}99, 0 0 12px ${phenomenon.uiAccent}55, 0 3px 8px rgba(0, 0, 0, 0.8)`;
    }
    if (phenomenon.rarity === "legendary") {
      return `0 0 12px ${phenomenon.uiAccent}, 0 0 25px ${phenomenon.uiAccent}aa, 0 4px 10px rgba(0, 0, 0, 0.8)`;
    }
    if (phenomenon.rarity === "very_rare") {
      return `0 0 20px ${phenomenon.uiAccent}aa, 0 0 40px ${phenomenon.uiAccent}66, 0 4px 8px rgba(0, 0, 0, 0.6)`;
    }
    if (phenomenon.rarity === "rare") {
      return "0 0 15px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.3), 0 4px 8px rgba(0, 0, 0, 0.5)";
    }
    return "0 0 10px rgba(255, 255, 255, 0.4), 0 2px 6px rgba(0, 0, 0, 0.5)";
  };

  const getTitleColor = () => {
    if (!phenomenon) return "#ffffff";
    if (phenomenon.rarity === "mythic" || phenomenon.rarity === "legendary") {
      if (phenomenon.id === "emptySky" || phenomenon.id === "brokenMoon") {
        return "#ffffff";
      }
      return phenomenon.uiAccent;
    }
    return "#ffffff";
  };

  const getTitleAnimation = () => {
    if (!phenomenon) return "none";
    if (phenomenon.rarity === "mythic") return "pulse 3s ease-in-out infinite";
    if (phenomenon.rarity === "legendary") return "pulse 4s ease-in-out infinite";
    return "none";
  };

  const getSubtitleFont = () => {
    if (!phenomenon) return "'Inter', sans-serif";
    if (phenomenon.rarity === "mythic" || phenomenon.rarity === "legendary") {
      return "'Cormorant Garamond', serif";
    }
    if (phenomenon.rarity === "very_rare") return "'Philosopher', sans-serif";
    return "'Inter', sans-serif";
  };

  const getSubtitleShadow = () => {
    if (!phenomenon) return "0 0 10px rgba(255, 255, 255, 0.4), 0 2px 4px rgba(0, 0, 0, 0.5)";

    if (phenomenon.rarity === "mythic") {
      return `0 0 12px ${phenomenon.uiAccent}aa, 0 0 25px ${phenomenon.uiAccent}44, 0 2px 6px rgba(0, 0, 0, 0.7)`;
    }
    if (phenomenon.rarity === "legendary") {
      return `0 0 15px ${phenomenon.uiAccent}99, 0 2px 5px rgba(0, 0, 0, 0.6)`;
    }
    if (phenomenon.rarity === "very_rare") {
      return `0 0 12px ${phenomenon.uiAccent}66, 0 2px 4px rgba(0, 0, 0, 0.5)`;
    }
    return "0 0 10px rgba(255, 255, 255, 0.4), 0 2px 4px rgba(0, 0, 0, 0.5)";
  };

  const getSubtitleColor = () => {
    if (!phenomenon) return "rgba(255, 255, 255, 0.95)";
    if (phenomenon.rarity === "mythic" || phenomenon.rarity === "legendary") {
      return phenomenon.uiAccent;
    }
    return "rgba(255, 255, 255, 0.95)";
  };

  const getSubtitleSize = () => {
    if (!phenomenon) return "text-lg";
    if (phenomenon.rarity === "mythic") return "text-xl";
    return "text-lg";
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-10">
      <h1
        className={`font-bold text-white mb-2 tracking-wide transition-all duration-500 ${getTitleSize()}`}
        style={{
          fontFamily: getTitleFont(),
          textShadow: getTitleShadow(),
          color: getTitleColor(),
          animation: getTitleAnimation(),
        }}
      >
        Dream book
      </h1>
      {phenomenon && (
        <p
          className={`italic font-light transition-all duration-500 ${getSubtitleSize()}`}
          style={{
            fontFamily: getSubtitleFont(),
            textShadow: getSubtitleShadow(),
            color: getSubtitleColor(),
          }}
        >
          {phenomenon.subtitle}
        </p>
      )}
    </div>
  );
}
