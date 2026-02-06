// Secret code system for unlocking all moons
// Uses SHA-256 hashing for security

const STORAGE_KEY = "dream-book-unlocked-moons";

// Pre-computed SHA-256 hash of the secret code
// Secret code: "LUCID2026"
// This hash was generated using: await crypto.subtle.digest('SHA-256', new TextEncoder().encode('LUCID2026'))
const SECRET_CODE_HASH =
  "2b80af53f46faf01d623ac1ccd6665fac0617ef59bbbe37664646a5ebc7ecf0e";

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

// Unlock all moons
export function unlockAllMoons(collectionUnlockFn?: () => void): void {
  const data: UnlockedMoonsData = {
    isFullyUnlocked: true,
    unlockedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  // Also unlock in collection if callback provided
  if (collectionUnlockFn) {
    collectionUnlockFn();
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
