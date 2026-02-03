import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateSymbolRequest {
  dreamId: string;
  notes: string;
  world?: string;
  environments?: string[];
  threatLevel?: number;
  mood?: string;
  entities?: string[];
}

function buildCoverPrompt(data: GenerateSymbolRequest): string {
  const parts: string[] = [];

  // Art style - Cult of the Lamb / Adventure Time inspired
  parts.push(
    "Create a whimsical cartoon illustration in the style of indie video game art (like Cult of the Lamb, Hollow Knight) mixed with Adventure Time."
  );
  parts.push(
    "Art style: Bold outlines, vibrant saturated colors, cute chibi-style characters with simple expressive faces, dreamy fantasy backgrounds with soft gradients."
  );
  parts.push(
    "Aesthetic: Cozy yet mysterious, colorful pastel and neon accents, magical sparkles, floating elements, lush nature or surreal dreamscapes."
  );
  parts.push("Vertical composition (2:3 aspect ratio). No text, titles, or watermarks.");

  // Main scene from dream notes
  if (data.notes) {
    const notesSample = data.notes.slice(0, 600);
    parts.push(`The scene should depict: "${notesSample}"`);
    parts.push("Interpret this dream narrative as a whimsical cartoon scene with cute stylized characters.");
  }

  // World as the main setting
  if (data.world) {
    parts.push(`Setting: A dreamworld named "${data.world}" - make this the dominant visual theme.`);
  }

  // Environments for atmosphere and scenery
  if (data.environments && data.environments.length > 0) {
    const envMap: Record<string, string> = {
      fog: "soft misty fog swirling around, ethereal atmosphere",
      sea: "beautiful ocean waves, sandy beach, seashells, cute sea creatures",
      mountain: "majestic colorful mountains, fluffy clouds, adventure vibes",
      city: "whimsical cartoon city, cute buildings, glowing windows",
      tunnel: "mysterious glowing cave or tunnel with crystals",
      rain: "gentle rain with sparkly droplets, cozy atmosphere",
      night: "magical starry night sky, crescent moon, fireflies",
      sunset: "warm golden sunset, cotton candy clouds, orange and pink sky",
    };
    const envDescriptions = data.environments
      .map((e) => envMap[e] || e)
      .join("; ");
    parts.push(`Environment elements to include: ${envDescriptions}.`);
  }

  // Entities as cute cartoon characters
  if (data.entities && data.entities.length > 0) {
    const entityList = data.entities.slice(0, 5).join(", ");
    parts.push(
      `Feature these characters/beings as cute cartoon versions: ${entityList}. Give them simple expressive faces (dot eyes, simple smile) like Cult of the Lamb or Adventure Time style.`
    );
  }

  // Mood from AI analysis
  if (data.mood) {
    const moodMap: Record<string, string> = {
      happy: "bright cheerful colors, sunshine, smiling elements",
      sad: "soft blue tones, gentle rain, peaceful melancholy",
      scary: "cute-scary balance, spooky but adorable elements, purple and green accents",
      mysterious: "magical glowing elements, stars, mystical symbols",
      peaceful: "soft pastels, gentle lighting, cozy atmosphere",
      adventurous: "dynamic composition, exciting elements, treasure and exploration vibes",
    };
    const moodStyle = moodMap[data.mood.toLowerCase()] || data.mood;
    parts.push(`Mood/atmosphere: ${moodStyle}.`);
  }

  // Threat level affects color palette and elements
  if (data.threatLevel !== undefined) {
    if (data.threatLevel >= 4) {
      parts.push(
        "Add subtle dark fantasy elements: ominous shadows, glowing red/purple accents, but keep it cute and stylized, not scary."
      );
    } else if (data.threatLevel >= 2) {
      parts.push(
        "Slightly mysterious atmosphere with magical glowing elements, floating particles."
      );
    } else {
      parts.push(
        "Very peaceful and cozy atmosphere, soft pastel colors, gentle lighting, comfort vibes."
      );
    }
  }

  // Quality instructions
  parts.push(
    "High quality digital illustration. Rich saturated colors, clean linework, professional indie game art quality. Dreamy, magical, whimsical. Think: If Studio Ghibli made a cartoon video game. Ultra detailed backgrounds with cute foreground characters."
  );

  return parts.join(" ");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: GenerateSymbolRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
    }

    // Create Supabase client with service role for storage access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if symbol already exists in storage
    const symbolPath = `${data.dreamId}.png`;
    const { data: existingFile } = await supabase.storage
      .from("dream-symbols")
      .list("", { search: data.dreamId });

    if (existingFile && existingFile.length > 0) {
      // Return existing symbol URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("dream-symbols").getPublicUrl(symbolPath);

      return new Response(
        JSON.stringify({
          symbolUrl: publicUrl,
          cached: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prompt = buildCoverPrompt(data);
    console.log("Generating cover with prompt:", prompt);

    // Generate image using AI
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
          JSON.stringify({
            error: "Rate limit exceeded. Please try again later.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    const imageDataUrl =
      result.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageDataUrl) {
      console.error("No image in response:", JSON.stringify(result));
      throw new Error("Failed to generate image");
    }

    // Extract base64 data from data URL
    const base64Match = imageDataUrl.match(/^data:image\/\w+;base64,(.+)$/);
    if (!base64Match) {
      throw new Error("Invalid image data URL format");
    }

    const base64Data = base64Match[1];
    const imageBuffer = Uint8Array.from(atob(base64Data), (c) =>
      c.charCodeAt(0)
    );

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("dream-symbols")
      .upload(symbolPath, imageBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error(`Failed to upload symbol: ${uploadError.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("dream-symbols").getPublicUrl(symbolPath);

    return new Response(
      JSON.stringify({
        symbolUrl: publicUrl,
        cached: false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("generate-symbol error:", error);
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
