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

  // Base style - dreamy book cover illustration
  parts.push(
    "Create a beautiful fantasy book cover illustration. Dreamy, ethereal art style with soft colors and magical atmosphere."
  );
  parts.push(
    "Style: Digital painting, anime-influenced illustration, soft lighting, atmospheric depth."
  );
  parts.push("Vertical composition (2:3 aspect ratio). No text or titles.");

  // Use the dream notes as the main scene description
  if (data.notes) {
    const notesSample = data.notes.slice(0, 500);
    parts.push(`Scene to illustrate: ${notesSample}`);
  }

  // World as setting
  if (data.world) {
    parts.push(`Setting: A dreamworld called "${data.world}".`);
  }

  // Environments for atmosphere
  if (data.environments && data.environments.length > 0) {
    const envMap: Record<string, string> = {
      fog: "misty foggy atmosphere",
      sea: "ocean waves, water, beach",
      mountain: "majestic mountains, peaks",
      city: "urban cityscape, buildings",
      tunnel: "mysterious tunnel or cave",
      rain: "rain falling, wet surfaces",
      night: "night sky, stars, darkness",
      sunset: "warm sunset colors, golden hour",
    };
    const envDescriptions = data.environments
      .map((e) => envMap[e] || e)
      .join(", ");
    parts.push(`Environment: ${envDescriptions}.`);
  }

  // Include entities/characters
  if (data.entities && data.entities.length > 0) {
    const entityList = data.entities.slice(0, 5).join(", ");
    parts.push(`Characters/entities present: ${entityList}.`);
  }

  // Mood from AI analysis
  if (data.mood) {
    parts.push(`Overall mood: ${data.mood}.`);
  }

  // Threat level affects atmosphere
  if (data.threatLevel !== undefined) {
    if (data.threatLevel >= 4) {
      parts.push("Dark, dangerous atmosphere. Ominous shadows, tension.");
    } else if (data.threatLevel >= 2) {
      parts.push("Mysterious, slightly tense atmosphere.");
    } else {
      parts.push("Calm, peaceful, serene atmosphere.");
    }
  }

  // Final quality instructions
  parts.push(
    "High quality illustration, rich details, beautiful colors, professional book cover quality. Dreamy fantasy art style."
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
