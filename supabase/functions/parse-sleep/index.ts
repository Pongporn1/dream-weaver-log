import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a sleep data extraction AI. Analyze the uploaded sleep tracking screenshot and extract ONLY the visible numerical data.

CRITICAL RULES:
1. Extract ONLY numbers that are clearly visible in the image
2. If a value is not visible, return null for that field
3. Do NOT guess or calculate values
4. Return data in the exact JSON format specified

Expected JSON output format:
{
  "date_th": "Thai date string if visible, e.g. '14 ม.ค. 2569'",
  "sleep_start": "HH:MM format",
  "wake_time": "HH:MM format",
  "total_sleep": {"hours": number, "minutes": number},
  "deep": {"hours": number, "minutes": number},
  "light": {"hours": number, "minutes": number},
  "rem": {"hours": number, "minutes": number},
  "nap": {"minutes": number, "start": "HH:MM", "end": "HH:MM"} or null,
  "sleep_score": number or null,
  "deep_continuity_score": number or null
}

Return ONLY valid JSON, no explanations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all sleep data from this screenshot. Return only JSON."
              },
              {
                type: "image_url",
                image_url: { url: image }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON from the response
    let parsedData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse sleep data from image" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate percentages and check consistency
    let inconsistent = false;
    if (parsedData.total_sleep && parsedData.deep && parsedData.light && parsedData.rem) {
      const totalMinutes = parsedData.total_sleep.hours * 60 + parsedData.total_sleep.minutes;
      const sumMinutes = 
        (parsedData.deep.hours * 60 + parsedData.deep.minutes) +
        (parsedData.light.hours * 60 + parsedData.light.minutes) +
        (parsedData.rem.hours * 60 + parsedData.rem.minutes);
      
      inconsistent = Math.abs(totalMinutes - sumMinutes) > 5;
      
      // Calculate percentages
      parsedData.deep_percent = totalMinutes > 0 ? Math.round((parsedData.deep.hours * 60 + parsedData.deep.minutes) / totalMinutes * 100) : 0;
      parsedData.light_percent = totalMinutes > 0 ? Math.round((parsedData.light.hours * 60 + parsedData.light.minutes) / totalMinutes * 100) : 0;
      parsedData.rem_percent = totalMinutes > 0 ? Math.round((parsedData.rem.hours * 60 + parsedData.rem.minutes) / totalMinutes * 100) : 0;
    }

    return new Response(
      JSON.stringify({
        ...parsedData,
        inconsistent
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in parse-sleep:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
