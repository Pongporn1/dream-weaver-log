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
    "whimsical cartoon illustration, indie video game art style like Cult of the Lamb and Hollow Knight mixed with Adventure Time"
  );
  parts.push(
    "bold outlines, vibrant saturated colors, cute chibi characters with simple expressive faces, dreamy fantasy backgrounds"
  );
  parts.push(
    "cozy yet mysterious aesthetic, colorful pastel and neon accents, magical sparkles, floating elements"
  );

  // Main scene from dream notes
  if (data.notes) {
    const notesSample = data.notes.slice(0, 300);
    parts.push(`scene depicting: ${notesSample}`);
  }

  // World as the main setting
  if (data.world) {
    parts.push(`dreamworld named ${data.world}`);
  }

  // Environments for atmosphere
  if (data.environments && data.environments.length > 0) {
    const envMap: Record<string, string> = {
      fog: "misty ethereal fog",
      sea: "beautiful ocean waves beach",
      mountain: "majestic colorful mountains fluffy clouds",
      city: "whimsical cartoon city glowing windows",
      tunnel: "mysterious glowing cave crystals",
      rain: "gentle sparkly rain cozy atmosphere",
      night: "magical starry night sky crescent moon fireflies",
      sunset: "warm golden sunset cotton candy clouds",
    };
    const envDescriptions = data.environments
      .map((e) => envMap[e] || e)
      .join(", ");
    parts.push(envDescriptions);
  }

  // Entities as cute cartoon characters
  if (data.entities && data.entities.length > 0) {
    const entityList = data.entities.slice(0, 3).join(", ");
    parts.push(`cute cartoon ${entityList} with simple dot eyes`);
  }

  // Mood
  if (data.mood) {
    parts.push(`${data.mood} mood atmosphere`);
  }

  // Threat level affects style
  if (data.threatLevel !== undefined) {
    if (data.threatLevel >= 4) {
      parts.push("dark fantasy elements, ominous but cute, purple red accents");
    } else if (data.threatLevel >= 2) {
      parts.push("mysterious magical glowing elements");
    } else {
      parts.push("peaceful cozy soft pastel colors");
    }
  }

  // Quality
  parts.push("high quality digital art, Studio Ghibli cartoon style, vertical composition");

  return parts.join(", ");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: GenerateSymbolRequest = await req.json();
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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
    console.log("Generating cover with Pollinations:", prompt);

    // Use Pollinations.ai - FREE AI image generation (no API key needed!)
    // Pollinations returns an image directly from URL
    const encodedPrompt = encodeURIComponent(prompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=768&seed=${Date.now()}&nologo=true`;

    // Fetch the image from Pollinations
    const imageResponse = await fetch(pollinationsUrl);
    
    if (!imageResponse.ok) {
      console.error("Pollinations error:", imageResponse.status);
      throw new Error(`Pollinations API error: ${imageResponse.status}`);
    }

    const imageBuffer = new Uint8Array(await imageResponse.arrayBuffer());

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
