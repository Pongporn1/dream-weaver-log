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
    const { notes, world, environments, threatLevel, entities } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from dream data
    const context = `
โลก: ${world || "ไม่ทราบ"}
สภาพแวดล้อม: ${(environments || []).join(", ") || "ไม่มี"}
ระดับภัย: ${threatLevel || 0}
สิ่งมีชีวิต: ${(entities || []).join(", ") || "ไม่มี"}
รายละเอียด: ${notes || "ไม่มีบันทึก"}
`.trim();

    const systemPrompt = `คุณเป็นผู้เชี่ยวชาญในการออกแบบปกหนังสือและ visual art จากเนื้อหาความฝัน

จากข้อมูลความฝันที่ให้มา ให้วิเคราะห์อารมณ์ บรรยากาศ และธีมหลัก แล้วสร้าง visual style สำหรับปกหนังสือ

Return JSON format:
{
  "mood": "mysterious|peaceful|dangerous|surreal|nostalgic|adventurous|dark|ethereal",
  "primaryHue": 0-360 (HSL hue ที่เหมาะกับอารมณ์),
  "secondaryHue": 0-360 (HSL hue เสริม),
  "accentHue": 0-360 (HSL hue สำหรับ accent),
  "saturation": 30-90 (ความสดของสี),
  "brightness": "dim|normal|bright|glowing",
  "pattern": "waves|circles|stars|lines|dots|crystals|smoke|spiral",
  "particleStyle": "floating|falling|rising|orbiting|scattered|pulsing",
  "gradientAngle": 0-360,
  "symbolEmoji": "emoji 1 ตัวที่แทนธีมหลัก",
  "keywords": ["คำสำคัญ 3 คำที่อธิบายบรรยากาศ"]
}

กฎ:
- วิเคราะห์จากเนื้อหา notes เป็นหลัก
- สีควรสะท้อนอารมณ์ของความฝัน
- pattern ควรเข้ากับสภาพแวดล้อม
- ถ้าฝันน่ากลัว ใช้สีเข้ม/แดง ถ้าสงบใช้สีเย็น
- symbolEmoji ต้องเป็น emoji เดียวที่สื่อถึงฝันนั้น

Return ONLY valid JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: context },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI error:", response.status);
      return new Response(JSON.stringify(getDefaultStyle()), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    let parsed;
    try {
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                       aiContent.match(/```\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : aiContent;
      parsed = JSON.parse(jsonText.trim());
      
      // Validate and sanitize
      parsed = {
        mood: parsed.mood || "mysterious",
        primaryHue: Math.max(0, Math.min(360, parsed.primaryHue || 240)),
        secondaryHue: Math.max(0, Math.min(360, parsed.secondaryHue || 280)),
        accentHue: Math.max(0, Math.min(360, parsed.accentHue || 200)),
        saturation: Math.max(30, Math.min(90, parsed.saturation || 60)),
        brightness: parsed.brightness || "normal",
        pattern: parsed.pattern || "dots",
        particleStyle: parsed.particleStyle || "floating",
        gradientAngle: Math.max(0, Math.min(360, parsed.gradientAngle || 135)),
        symbolEmoji: parsed.symbolEmoji || "✨",
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 3) : [],
      };
    } catch {
      parsed = getDefaultStyle();
    }

    return new Response(JSON.stringify(parsed), {
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
    symbolEmoji: "✨",
    keywords: [],
  };
}
