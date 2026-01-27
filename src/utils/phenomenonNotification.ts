import { toast } from "sonner";
import type { MoonPhenomenon, MoonRarity } from "@/data/moonPhenomena";

/**
 * Show notification when a moon phenomenon is discovered
 */
export const notifyPhenomenon = (phenomenon: MoonPhenomenon) => {
  const rarityConfig = getRarityConfig(phenomenon.rarity);

  toast(phenomenon.name, {
    description: phenomenon.subtitle,
    icon: rarityConfig.icon,
    duration: rarityConfig.duration,
    className: rarityConfig.className,
    style: {
      borderLeft: `4px solid ${phenomenon.uiAccent}`,
    },
  });
};

/**
 * Get configuration based on rarity
 */
const getRarityConfig = (rarity: MoonRarity) => {
  switch (rarity) {
    case "mythic":
      return {
        icon: "✨",
        duration: 8000,
        className: "mythic-phenomenon-toast",
      };
    case "legendary":
      return {
        icon: "🌟",
        duration: 6000,
        className: "legendary-phenomenon-toast",
      };
    case "very_rare":
      return {
        icon: "⭐",
        duration: 5000,
        className: "very-rare-phenomenon-toast",
      };
    case "rare":
      return {
        icon: "🌙",
        duration: 4000,
        className: "rare-phenomenon-toast",
      };
    case "normal":
      return {
        icon: "🌕",
        duration: 3000,
        className: "normal-phenomenon-toast",
      };
  }
};
