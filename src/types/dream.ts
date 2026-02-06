export interface DreamLog {
  id: string;
  date: string;
  wakeTime: string;
  world: string;
  timeSystem: "inactive" | "activated" | "unknown";
  environments: string[];
  entities: string[];
  dreamTypes?: string[];
  threatLevel: 0 | 1 | 2 | 3 | 4 | 5;
  safetyOverride: "none" | "helper" | "separation" | "wake" | "unknown";
  exit: "wake" | "separation" | "collapse" | "unknown";
  notes?: string;
  createdAt: string;
}

export interface World {
  id: string;
  name: string;
  type: "persistent" | "transient";
  stability: number;
  dreamIds: string[];
  description?: string;
}

export interface Entity {
  id: string;
  name: string;
  role: "observer" | "protector" | "guide" | "intruder";
  dreamIds: string[];
  description?: string;
}

export interface SystemModule {
  id: string;
  name: string;
  type: "time_activation" | "safety_override" | "distance_expansion" | "other";
  dreamIds: string[];
  description?: string;
}

export interface ThreatEntry {
  id: string;
  name: string;
  level: 0 | 1 | 2 | 3 | 4 | 5;
  response?: string;
  dreamIds: string[];
}

export interface SleepLog {
  id: string;
  date: string;
  sleepStart: string;
  wakeTime: string;
  totalSleep: { hours: number; minutes: number };
  deep: { hours: number; minutes: number };
  light: { hours: number; minutes: number };
  rem: { hours: number; minutes: number };
  nap?: { minutes: number; start?: string; end?: string };
  sleepScore?: number;
  deepContinuityScore?: number;
  createdAt: string;
}

export const ENVIRONMENTS = [
  "fog",
  "sea",
  "mountain",
  "city",
  "tunnel",
  "rain",
  "night",
  "sunset",
] as const;

export const DREAM_TYPES = [
  "lucid", // Lucid Dream - รู้ตัวว่ากำลังฝัน
  "nightmare", // ฝันร้าย
  "recurring", // ฝันซ้ำ
  "prophetic", // ฝันทำนาย
] as const;

export const DREAM_TYPE_LABELS: Record<(typeof DREAM_TYPES)[number], string> = {
  lucid: "Lucid Dream",
  nightmare: "ฝันร้าย",
  recurring: "ฝันซ้ำ",
  prophetic: "ฝันทำนาย",
};

export const TIME_SYSTEMS = ["inactive", "activated", "unknown"] as const;
export const SAFETY_OVERRIDES = [
  "none",
  "helper",
  "separation",
  "wake",
  "unknown",
] as const;
export const EXIT_TYPES = [
  "wake",
  "separation",
  "collapse",
  "unknown",
] as const;
export const ENTITY_ROLES = [
  "observer",
  "protector",
  "guide",
  "intruder",
] as const;
