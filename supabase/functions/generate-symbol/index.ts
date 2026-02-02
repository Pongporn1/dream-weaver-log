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
}

function buildSymbolPrompt(data: GenerateSymbolRequest): string {
  const parts: string[] = [];

  // Base style - mystical geometric symbol
  parts.push(
    "Create a mystical, futuristic geometric symbol icon. Abstract sacred geometry design."
  );
  parts.push(
    "Style: Glowing neon lines on pure black background (#000000). Minimalist single-color design."
  );
  parts.push("The symbol should be centered, symmetrical, and ethereal.");

  // Analyze notes for theme
  if (data.notes) {
    const notesSample = data.notes.slice(0, 200).toLowerCase();

    if (
      notesSample.includes("dark") ||
      notesSample.includes("shadow") ||
      notesSample.includes("fear")
    ) {
      parts.push("Theme: Dark, ominous, sharp angular shapes, void-like.");
    } else if (
      notesSample.includes("light") ||
      notesSample.includes("bright") ||
      notesSample.includes("peaceful")
    ) {
      parts.push("Theme: Luminous, radiant, soft curves, celestial.");
    } else if (
      notesSample.includes("water") ||
      notesSample.includes("sea") ||
      notesSample.includes("ocean")
    ) {
      parts.push("Theme: Flowing, wave-like patterns, liquid geometry.");
    } else if (
      notesSample.includes("fire") ||
      notesSample.includes("flame") ||
      notesSample.includes("burn")
    ) {
      parts.push("Theme: Dynamic flames, ascending energy, phoenix-like.");
    } else if (
      notesSample.includes("nature") ||
      notesSample.includes("tree") ||
      notesSample.includes("forest")
    ) {
      parts.push("Theme: Organic patterns, tree of life, natural fractals.");
    } else if (
      notesSample.includes("space") ||
      notesSample.includes("star") ||
      notesSample.includes("cosmic")
    ) {
      parts.push("Theme: Cosmic, stellar, constellation patterns, nebula.");
    } else if (
      notesSample.includes("time") ||
      notesSample.includes("clock") ||
      notesSample.includes("past")
    ) {
      parts.push("Theme: Temporal, hourglass motifs, spiral time loops.");
    } else if (
      notesSample.includes("eye") ||
      notesSample.includes("see") ||
      notesSample.includes("vision")
    ) {
      parts.push("Theme: All-seeing eye, vision portals, mystical sight.");
    } else {
      parts.push("Theme: Mysterious, abstract sacred geometry, dream-like.");
    }
  }

  // World influence
  if (data.world) {
    parts.push(`Inspired by a dreamworld called "${data.world}".`);
  }

  // Environment influence
  if (data.environments && data.environments.length > 0) {
    const envMap: Record<string, string> = {
      fog: "misty, hazy edges",
      sea: "wave patterns",
      mountain: "triangular, peak shapes",
      city: "circuit-like, tech patterns",
      tunnel: "portal, vortex",
      rain: "droplet patterns",
      night: "star-like, crescent",
      sunset: "radiating sun rays",
    };
    const envDescriptions = data.environments
      .map((e) => envMap[e] || e)
      .join(", ");
    parts.push(`Incorporate: ${envDescriptions}.`);
  }

  // Mood/threat level
  if (data.mood) {
    parts.push(`Overall mood: ${data.mood}.`);
  }

  if (data.threatLevel !== undefined) {
    if (data.threatLevel >= 4) {
      parts.push("Intense, dangerous energy. Sharp edges, warning symbols.");
    } else if (data.threatLevel >= 2) {
      parts.push("Subtle tension, mysterious aura.");
    } else {
      parts.push("Calm, protective, serene energy.");
    }
  }

  // Final instructions
  parts.push(
    "Square format 512x512. Single glowing symbol. No text. Pure black background. Ethereal glow effect."
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

    const prompt = buildSymbolPrompt(data);
    console.log("Generating symbol with prompt:", prompt);

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
