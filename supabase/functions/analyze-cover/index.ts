import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Mood =
  | "mysterious"
  | "peaceful"
  | "dangerous"
  | "surreal"
  | "nostalgic"
  | "adventurous"
  | "dark"
  | "ethereal";

type Brightness = "dim" | "normal" | "bright" | "glowing";
type Pattern =
  | "waves"
  | "circles"
  | "stars"
  | "lines"
  | "dots"
  | "crystals"
  | "smoke"
  | "spiral";
type ParticleStyle =
  | "floating"
  | "falling"
  | "rising"
  | "orbiting"
  | "scattered"
  | "pulsing";
type SymbolType =
  | "eye"
  | "moon"
  | "tree"
  | "gate"
  | "spiral"
  | "flame"
  | "void"
  | "crown"
  | "key"
  | "heart"
  | "skull"
  | "hourglass"
  | "compass"
  | "infinity"
  | "lotus";
type SymbolRotation = "none" | "slow" | "medium" | "pulse";

interface AnalyzeCoverRequest {
  notes?: string;
  world?: string;
  environments?: string[];
  threatLevel?: number;
  entities?: string[];
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hashToInt(input: string) {
  // Simple deterministic hash (FNV-1a-ish)
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function normalizeList(list?: string[]): string[] {
  if (!list || list.length === 0) return [];
  const out: string[] = [];
  for (const item of list) {
    if (!item) continue;
    // Some clients pass a single comma-separated string inside array
    for (const part of String(item)
      .split(/[,|]/g)
      .map((s) => s.trim())
      .filter(Boolean)) {
      out.push(part);
    }
  }
  return out;
}

function includesAny(text: string, needles: string[]) {
  const t = text.toLowerCase();
  return needles.some((n) => t.includes(n.toLowerCase()));
}

function detectMood(notes: string, threatLevel: number): Mood {
  const tl = threatLevel ?? 0;
  if (tl >= 4) return "dangerous";
  if (
    includesAny(notes, [
      "ผี",
      "ไล่",
      "หนี",
      "เลือด",
      "ฆ่า",
      "ตาย",
      "อันตราย",
      "dark",
      "scary",
      "monster",
    ])
  )
    return tl >= 3 ? "dark" : "mysterious";

  if (
    includesAny(notes, [
      "ลอย",
      "เหนือจริง",
      "ประหลาด",
      "หลอน",
      "surreal",
      "dream",
      "strange",
    ])
  )
    return "surreal";

  if (
    includesAny(notes, [
      "คิดถึง",
      "อดีต",
      "บ้านเกิด",
      "nostalgia",
      "childhood",
    ])
  )
    return "nostalgic";

  if (
    includesAny(notes, [
      "เดินทาง",
      "ผจญภัย",
      "รถไฟ",
      "เรือ",
      "ภูเขา",
      "adventure",
      "journey",
      "travel",
    ])
  )
    return "adventurous";

  if (
    includesAny(notes, [
      "สงบ",
      "ผ่อนคลาย",
      "สบาย",
      "peace",
      "calm",
      "quiet",
    ])
  )
    return "peaceful";

  if (includesAny(notes, ["ดาว", "พระจันทร์", "night", "moon", "star"]))
    return "ethereal";

  return "mysterious";
}

function pickPattern(environments: string[], notes: string): Pattern {
  const env = environments.join(" ");
  if (includesAny(env + " " + notes, ["ทะเล", "sea", "ocean", "คลื่น"]))
    return "waves";
  if (includesAny(env + " " + notes, ["หมอก", "fog", "ควัน", "smoke"]))
    return "smoke";
  if (includesAny(env + " " + notes, ["ดาว", "night", "moon", "star", "กลางคืน"]))
    return "stars";
  if (includesAny(env + " " + notes, ["อุโมงค์", "tunnel", "วงกลม", "portal"]))
    return "circles";
  if (includesAny(env + " " + notes, ["เมือง", "city", "ตึก", "อาคาร", "รถไฟ", "train"]))
    return "lines";
  if (includesAny(env + " " + notes, ["ภูเขา", "mountain", "คริสตัล", "crystal"]))
    return "crystals";
  if (includesAny(notes, ["วน", "หมุน", "spiral"])) return "spiral";
  return "dots";
}

function pickParticleStyle(environments: string[], threatLevel: number): ParticleStyle {
  const env = environments.join(" ").toLowerCase();
  if (threatLevel >= 4) return "pulsing";
  if (env.includes("rain") || env.includes("ฝน")) return "falling";
  if (env.includes("sunset") || env.includes("พระอาทิตย์ตก")) return "rising";
  if (env.includes("night") || env.includes("กลางคืน")) return "orbiting";
  return "floating";
}

function pickSymbolType(notes: string, environments: string[], threatLevel: number): SymbolType {
  const t = `${notes} ${environments.join(" ")}`;
  if (includesAny(t, ["ตา", "สังเกต", "eye", "watch", "observe"])) return "eye";
  if (includesAny(t, ["พระจันทร์", "moon", "กลางคืน", "night", "ดาว"])) return "moon";
  if (includesAny(t, ["ต้นไม้", "tree", "ป่า", "forest"])) return "tree";
  if (includesAny(t, ["ประตู", "gate", "portal", "ทางผ่าน", "ผ่านไป"])) return "gate";
  if (includesAny(t, ["วน", "หมุน", "spiral"])) return "spiral";
  if (includesAny(t, ["ไฟ", "flame", "burn", "ร้อน"])) return "flame";
  if (includesAny(t, ["ว่าง", "หลุม", "void", "black hole", "หลุมดำ"])) return "void";
  if (includesAny(t, ["มงกุฎ", "crown", "กษัตริย์", "ชัยชนะ"])) return "crown";
  if (includesAny(t, ["กุญแจ", "key", "unlock", "ปลดล็อค"])) return "key";
  if (includesAny(t, ["หัวใจ", "heart", "รัก"])) return "heart";
  if (
    threatLevel >= 3 ||
    includesAny(t, ["กะโหลก", "skull", "ตาย", "death"])
  )
    return "skull";
  if (includesAny(t, ["เวลา", "นาฬิกา", "hourglass", "time"])) return "hourglass";
  if (includesAny(t, ["เข็มทิศ", "compass", "เดินทาง", "journey"])) return "compass";
  if (includesAny(t, ["ไม่สิ้นสุด", "infinity", "forever", "endless"])) return "infinity";
  if (includesAny(t, ["ดอกบัว", "lotus", "ตื่นรู้", "สงบ"])) return "lotus";
  return "moon";
}

function brightnessFrom(threatLevel: number): Brightness {
  if (threatLevel >= 4) return "dim";
  if (threatLevel === 0) return "bright";
  if (threatLevel >= 2) return "normal";
  return "glowing";
}

function rotationFrom(threatLevel: number, mood: Mood): SymbolRotation {
  if (threatLevel >= 4) return "medium";
  if (mood === "peaceful" || mood === "nostalgic") return "slow";
  if (mood === "surreal" || mood === "mysterious") return "pulse";
  return "slow";
}

function buildHeuristicStyle(req: AnalyzeCoverRequest) {
  const notes = (req.notes || "").trim();
  const world = (req.world || "").trim();
  const environments = normalizeList(req.environments);
  const entities = normalizeList(req.entities);
  const threatLevel = clamp(Number(req.threatLevel ?? 0), 0, 5);

  const seedStr = `${world}|${environments.join(";")}|${entities.join(";")}|${threatLevel}|${notes}`;
  const seed = hashToInt(seedStr);

  const mood: Mood = detectMood(notes, threatLevel);
  const pattern: Pattern = pickPattern(environments, notes);
  const particleStyle: ParticleStyle = pickParticleStyle(environments, threatLevel);
  const symbolType: SymbolType = pickSymbolType(notes, environments, threatLevel);
  const brightness: Brightness = brightnessFrom(threatLevel);
  const symbolRotation: SymbolRotation = rotationFrom(threatLevel, mood);

  // Hue strategy: environment hints first (Thai/EN), then seeded offsets
  const envText = environments.join(" ").toLowerCase();
  let baseHue = (seed % 360) as number;
  if (envText.includes("night") || envText.includes("กลางคืน") || envText.includes("ดาว")) baseHue = 260;
  else if (envText.includes("sunset") || envText.includes("พระอาทิตย์ตก")) baseHue = 15;
  else if (envText.includes("sea") || envText.includes("ocean") || envText.includes("ทะเล")) baseHue = 200;
  else if (envText.includes("mountain") || envText.includes("ภูเขา")) baseHue = 30;
  else if (envText.includes("city") || envText.includes("เมือง") || envText.includes("ตึก")) baseHue = 45;
  else if (envText.includes("tunnel") || envText.includes("อุโมงค์")) baseHue = 280;
  else if (envText.includes("rain") || envText.includes("ฝน")) baseHue = 220;
  else if (envText.includes("fog") || envText.includes("หมอก")) baseHue = 200;

  // Adjust with threat/mood for more contrast
  const moodShiftMap: Record<Mood, number> = {
    mysterious: 10,
    peaceful: -10,
    dangerous: 25,
    surreal: 35,
    nostalgic: -25,
    adventurous: 15,
    dark: 30,
    ethereal: 20,
  };
  baseHue = (baseHue + moodShiftMap[mood] + threatLevel * 7) % 360;

  const primaryHue = clamp(baseHue, 0, 360);
  const secondaryHue = (primaryHue + 30 + (seed % 40)) % 360;
  const accentHue = (primaryHue + 160 + (seed % 30)) % 360;

  const saturationBase = 55 + ((seed >> 3) % 25);
  const saturation = clamp(saturationBase + (threatLevel >= 3 ? 5 : 0), 30, 90);
  const gradientAngle = seed % 360;

  const contentWeight = clamp(notes.length, 0, 1500) / 1500;
  const complexityRaw =
    1 +
    Math.floor(contentWeight * 3) +
    (environments.length >= 3 ? 1 : 0) +
    (entities.length >= 3 ? 1 : 0);
  const symbolComplexity = clamp(complexityRaw, 1, 5);

  const keywords: string[] = [];
  keywords.push(mood);
  if (environments[0]) keywords.push(environments[0]);
  if (entities[0]) keywords.push(entities[0]);
  const uniq = Array.from(new Set(keywords)).slice(0, 3);

  return {
    mood,
    primaryHue,
    secondaryHue,
    accentHue,
    saturation,
    brightness,
    pattern,
    particleStyle,
    gradientAngle,
    symbolType,
    symbolComplexity,
    symbolRotation,
    keywords: uniq,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: AnalyzeCoverRequest = await req.json();
    const style = buildHeuristicStyle(body);
    return new Response(JSON.stringify(style), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Analyze cover error:", e);
    return new Response(JSON.stringify(getDefaultStyle()), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getDefaultStyle() {
  return {
    mood: "mysterious",
    primaryHue: 240,
    secondaryHue: 280,
    accentHue: 200,
    saturation: 60,
    brightness: "normal",
    pattern: "dots",
    particleStyle: "floating",
    gradientAngle: 135,
    symbolType: "moon",
    symbolComplexity: 3,
    symbolRotation: "slow",
    keywords: [],
  };
}
