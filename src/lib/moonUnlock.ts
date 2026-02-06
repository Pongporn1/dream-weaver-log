// Secret code system for unlocking all moons
// Uses SHA-256 hashing for security

import { MOON_PHENOMENA } from "@/data/moonPhenomena";

const STORAGE_KEY = "dream-book-unlocked-moons";
const COLLECTION_STORAGE_KEY = "mythic-moon-collection";

// Pre-computed SHA-256 hash of the secret code
// Secret code: "LUCID2026"
// This hash was generated using: await crypto.subtle.digest('SHA-256', new TextEncoder().encode('LUCID2026'))
const SECRET_CODE_HASH =
  "2b80af53f46faf01d623ac1ccd6665fac0617ef59bbbe37664646a5ebc7ecf0e";

type MoonCollectionEntry = {
  id: string;
  firstEncountered: string;
  encounterCount: number;
  lastEncountered: string;
  isFavorite: boolean;
  isLocked: boolean;
  themeDurationBoost: number;
};

export interface UnlockedMoonsData {
  isFullyUnlocked: boolean;
  unlockedAt?: string;
  expiresAt?: string; // Optional: could add expiration
}

// Hash the input code using SHA-256
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// Verify if the entered code is correct
export async function verifySecretCode(code: string): Promise<boolean> {
  try {
    const inputHash = await hashCode(code.trim().toUpperCase());
    return inputHash === SECRET_CODE_HASH;
  } catch (error) {
    console.error("Error verifying code:", error);
    return false;
  }
}

// Get current unlock status
export function getUnlockStatus(): UnlockedMoonsData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { isFullyUnlocked: false };
    }
    return JSON.parse(stored) as UnlockedMoonsData;
  } catch (error) {
    console.error("Error reading unlock status:", error);
    return { isFullyUnlocked: false };
  }
}

function createDefaultEntry(
  moonId: string,
  now: string,
): MoonCollectionEntry {
  return {
    id: moonId,
    firstEncountered: now,
    encounterCount: 1,
    lastEncountered: now,
    isFavorite: false,
    isLocked: false,
    themeDurationBoost: 0,
  };
}

function parseStoredCollection(): Record<string, MoonCollectionEntry> | null {
  const stored = localStorage.getItem(COLLECTION_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Record<string, MoonCollectionEntry>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.error("Error parsing moon collection:", error);
    return null;
  }
}

function mergeUnlockedCollection(
  existing: Record<string, MoonCollectionEntry> | null,
) {
  const now = new Date().toISOString();
  const merged: Record<string, MoonCollectionEntry> = {
    ...(existing ?? {}),
  };
  let updated = false;

  Object.keys(MOON_PHENOMENA).forEach((moonId) => {
    if (!merged[moonId]) {
      merged[moonId] = createDefaultEntry(moonId, now);
      updated = true;
    }
  });

  return { merged, updated };
}

// Unlock all moons in collection (direct localStorage write)
function unlockAllMoonsInCollection(): void {
  const existing = parseStoredCollection();
  const { merged } = mergeUnlockedCollection(existing);
  const total = Object.keys(MOON_PHENOMENA).length;

  localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(merged));
  console.log(`🌕 All ${total} moons unlocked in collection (localStorage)!`);
}

// Unlock all moons
export function unlockAllMoons(): void {
  const data: UnlockedMoonsData = {
    isFullyUnlocked: true,
    unlockedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  // Directly write to collection localStorage
  unlockAllMoonsInCollection();
}

// Sync unlocked state with collection (for legacy unlocks or missing data)
export function syncUnlockedCollection(): void {
  try {
    const status = getUnlockStatus();
    if (!status.isFullyUnlocked) return;

    const existing = parseStoredCollection();
    const { merged, updated } = mergeUnlockedCollection(existing);

    if (!existing || updated) {
      localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(merged));
    }
  } catch (error) {
    console.error("Error syncing unlocked collection:", error);
  }
}

// Reset unlock status (for testing or reset)
export function resetUnlock(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Check if moons are unlocked
export function areMoonsUnlocked(): boolean {
  const status = getUnlockStatus();
  return status.isFullyUnlocked;
}
