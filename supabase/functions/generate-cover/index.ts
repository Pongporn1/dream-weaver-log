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

  // Base style - EXACT Cult of the Lamb comic book style like the reference image
  parts.push(
    "Comic book cover art in exact Cult of the Lamb style, THICK bold black outline illustration, 2D flat cel-shaded cartoon, cute rounded chibi characters with very simple geometric shapes, big kawaii eyes with simple dot or line details, pastel gradient backgrounds (greens, pinks, blues, yellows), FILLED with decorative flowers and plants everywhere (daisies, clovers, mushrooms), hand-drawn indie cartoon aesthetic, vertical book cover format",
  );

  // Story summary as main subject
  if (data.storySummary) {
    const summary = data.storySummary.slice(0, 200);
    parts.push(
      `main characters and scene: ${summary}. Draw as adorable chibi creatures with round simple bodies, big eyes, small limbs, surrounded by many colorful flowers, grass, and nature elements scattered throughout the composition`,
    );
  }

  // World/setting
  if (data.world) {
    parts.push(
      `include large decorative title text "${data.world}" in bold hand-lettered font at top or center, white or cream colored text with dark outline`,
    );
  }

  // Environments - convert to cute cartoon version with LOTS of nature elements
  if (data.environments.length > 0) {
    const cartoonEnvs = data.environments.map((env) => {
      const envMap: Record<string, string> = {
        fog: "soft misty air, light clouds floating, pastel sky gradient",
        sea: "gentle teal/turquoise water, tiny cute fish, seashells and coral decorations",
        mountain: "rolling green hills covered in flowers, rocks with moss",
        city: "simple rounded buildings in background, flowers growing on structures",
        tunnel: "cave entrance with crystals, mushrooms, glowing plants",
        rain: "cute raindrop shapes, puddles with ripples, rainbows, flowers getting watered",
        night:
          "dark blue/purple sky filled with stars, crescent moon with face, fireflies",
        sunset:
          "pink-orange-yellow gradient sky, sun with simple face, silhouette of plants",
      };
      return envMap[env] || `${env} with many flowers and plants`;
    });
    parts.push(
      `setting and background elements: ${cartoonEnvs.join(", ")}. Fill empty spaces with small decorative flowers, clovers, mushrooms, grass tufts, leaves, butterflies, and other nature details`,
    );
  } else {
    parts.push(
      "fill the background with abundant colorful flowers (pink, blue, orange, white), grass, clovers, mushrooms, and small plants scattered everywhere",
    );
  }

  // Emotions as cute chibi expressions
  if (data.emotions.length > 0) {
    const cartoonEmotions = data.emotions.map((e) => {
      const emotionMap: Record<string, string> = {
        fear: "wide worried eyes (big circles), small 'o' mouth, sweat drops",
        joy: "closed happy U-shaped eyes, big smile, sparkle effects around face",
        sadness: "teardrop shapes, downturned simple line mouth, blue tint",
        anxiety: "spiral swirly eyes or dizzy marks, wavy mouth",
        peace:
          "closed peaceful eyes (curved lines), gentle smile, relaxed pose",
        excitement:
          "star-shaped eye highlights, open smile, energetic bouncing pose",
        confusion: "question marks floating, swirly spiral eyes, tilted head",
        wonder: "large sparkling eyes with star reflections, amazed 'o' mouth",
      };
      return emotionMap[e] || `${e} expression`;
    });
    parts.push(`character facial expressions: ${cartoonEmotions.join(", ")}`);
  }

  // Colors as palette with pastel emphasis
  if (data.atmosphereColors.length > 0) {
    const pastelColors = data.atmosphereColors.map((c) => {
      const colorMap: Record<string, string> = {
        dark: "deep purple and teal pastels, navy blue with pink flowers",
        golden: "soft peach, light yellow, cream, warm amber gradients",
        blue: "light sky blue, cyan, turquoise, lavender with white",
        purple: "soft lilac, pink, lavender, magenta pastels",
        green:
          "mint green, sage, lime, forest green with white and pink accents",
        red: "coral pink, salmon, rose, burgundy with cream",
        white: "cream white, off-white, beige, with colorful flower accents",
        rainbow: "multi-color pastel gradient with all soft hues blended",
      };
      return colorMap[c] || `soft pastel ${c}`;
    });
    parts.push(
      `color palette: ${pastelColors.join(", ")} tones. Use gradient backgrounds blending 2-3 colors smoothly`,
    );
  }

  // Threat level affects darkness and spookiness while keeping it cute
  if (data.threatLevel >= 4) {
    parts.push(
      "include cute spooky elements: friendly skull with flowers growing from it, adorable ghost shapes, small bones decorated with daisies, dark purple/black backgrounds with bats, keep characters cute but add gothic charm",
    );
  } else if (data.threatLevel >= 2) {
    parts.push(
      "semi-dark atmosphere: twilight gradient sky (purple to pink), some shadows, mysterious mood but still colorful with flowers",
    );
  } else {
    parts.push(
      "bright cheerful scene: sunny gradient sky (yellow to blue/pink), abundance of colorful flowers everywhere, rainbow elements, happy vibes",
    );
  }

  // Lucidity level affects detail and clarity
  if (data.lucidityLevel >= 8) {
    parts.push(
      "ultra clean crisp linework with THICK bold black outlines on everything, perfectly flat cel-shaded colors with no gradients on characters, highly detailed flower patterns and nature decorations filling all space",
    );
  } else if (data.lucidityLevel <= 2) {
    parts.push(
      "slightly softer black outlines, gentle color blending in backgrounds only (keep characters flat), dreamy soft atmosphere, lighter flower details",
    );
  }

  // Final CRITICAL style enforcement - matching Cult of the Lamb exactly
  parts.push(
    "CRITICAL STYLE RULES: (1) THICK bold black outlines around EVERYTHING - characters, objects, flowers, all elements must have strong dark borders, (2) Completely FLAT cel-shaded colors - no shading or gradients on characters, solid color fills only, backgrounds can have soft gradients, (3) Super simplified chibi/kawaii character design - round blob bodies, tiny limbs, oversized heads with huge simple eyes, (4) COVER THE ENTIRE IMAGE with decorative elements - scatter flowers (daisies, tulips, clovers), mushrooms, grass, leaves, small creatures everywhere, NO empty white space, (5) Pastel color gradients in backgrounds, (6) Hand-drawn indie comic book aesthetic like official Cult of the Lamb comics, (7) ABSOLUTELY NO photorealism, NO 3D rendering, NO realistic textures, MUST be pure 2D flat cartoon illustration with thick outlines, (8) Reference the exact art style of Cult of the Lamb comic covers by Troy Little and Alex Paknadel",
  );

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
      },
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
          },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
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
      },
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
      },
    );
  }
});
