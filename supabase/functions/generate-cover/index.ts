import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateCoverRequest {
  storySummary: string;
  emotions: string[];
  atmosphereColors: string[];
  environments: string[];
  world: string;
  threatLevel: number;
  lucidityLevel: number;
}

const EMOTION_DESCRIPTIONS: Record<string, string> = {
  fear: "fearful, dark shadows, ominous",
  joy: "joyful, bright, warm light",
  sadness: "melancholic, rainy, tears",
  anxiety: "anxious, distorted, swirling",
  peace: "peaceful, serene, calm waters",
  excitement: "dynamic, energetic, vibrant",
  confusion: "surreal, impossible geometry, maze-like",
  wonder: "awe-inspiring, cosmic, magical",
};

const COLOR_DESCRIPTIONS: Record<string, string> = {
  dark: "dark tones, shadows, noir style",
  golden: "golden hour lighting, warm amber glow",
  blue: "cool blue palette, moonlit, ethereal",
  purple: "mystical purple and pink hues, twilight",
  green: "lush emerald green, nature, forest",
  red: "dramatic red tones, intense, passionate",
  white: "bright white, snow, pure light",
  rainbow: "rainbow colors, prismatic, iridescent",
};

function buildImagePrompt(data: GenerateCoverRequest): string {
  const parts: string[] = [];

  // Base style
  parts.push("Fantasy book cover art, highly detailed digital painting, vertical composition");

  // Story summary as main subject
  if (data.storySummary) {
    const summary = data.storySummary.slice(0, 300);
    parts.push(`depicting: ${summary}`);
  }

  // World/setting
  if (data.world) {
    parts.push(`set in a dreamworld called "${data.world}"`);
  }

  // Environments
  if (data.environments.length > 0) {
    parts.push(`featuring ${data.environments.join(", ")} environment`);
  }

  // Emotions as mood
  if (data.emotions.length > 0) {
    const emotionDesc = data.emotions
      .map((e) => EMOTION_DESCRIPTIONS[e] || e)
      .join(", ");
    parts.push(`mood: ${emotionDesc}`);
  }

  // Colors as palette
  if (data.atmosphereColors.length > 0) {
    const colorDesc = data.atmosphereColors
      .map((c) => COLOR_DESCRIPTIONS[c] || c)
      .join(", ");
    parts.push(`color palette: ${colorDesc}`);
  }

  // Threat level affects darkness
  if (data.threatLevel >= 4) {
    parts.push("ominous atmosphere, sense of danger, threatening shadows");
  } else if (data.threatLevel >= 2) {
    parts.push("subtle tension, mysterious atmosphere");
  }

  // Lucidity level affects clarity
  if (data.lucidityLevel >= 8) {
    parts.push("crystal clear, hyper-detailed, vivid and sharp");
  } else if (data.lucidityLevel <= 2) {
    parts.push("hazy, dreamlike blur, foggy edges, impressionistic");
  }

  // Final style touches
  parts.push("cinematic lighting, artstation trending, 8k quality");

  return parts.join(". ");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: GenerateCoverRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = buildImagePrompt(data);
    console.log("Generating cover with prompt:", prompt);

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          modalities: ["image", "text"],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(result));
      throw new Error("Failed to generate image");
    }

    return new Response(
      JSON.stringify({
        coverUrl: imageUrl,
        prompt: prompt,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("generate-cover error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
