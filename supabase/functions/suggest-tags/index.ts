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
    const { text, existingWorlds, existingEntities, existingEnvironments } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!text || text.trim().length < 5) {
      return new Response(JSON.stringify({ 
        world: null, 
        environments: [], 
        entities: [],
        threatLevel: 0,
        safetyOverride: "unknown",
        exit: "unknown",
        timeSystem: "unknown"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `คุณเป็นระบบวิเคราะห์ความฝันที่ดึงข้อมูลจากข้อความบันทึกความฝัน

จากข้อความความฝันที่ให้มา ให้วิเคราะห์และส่งกลับ JSON ดังนี้:

{
  "world": "ชื่อโลก/สถานที่หลักที่ปรากฏ (string หรือ null)",
  "environments": ["สภาพแวดล้อม เช่น fog, sea, mountain, city, tunnel, rain, night, sunset, forest, building, road, sky, water, indoor, outdoor"],
  "entities": ["ชื่อสิ่งมีชีวิต/บุคคล/ตัวละครที่ปรากฏ"],
  "threatLevel": 0-5 (0=ปลอดภัย, 5=อันตรายมาก),
  "safetyOverride": "none|helper|separation|wake|unknown",
  "exit": "wake|separation|collapse|unknown",
  "timeSystem": "inactive|activated|unknown"
}

โลกที่มีอยู่แล้ว (ถ้าตรงให้ใช้ชื่อเดิม): ${JSON.stringify(existingWorlds || [])}
Entities ที่มีอยู่แล้ว: ${JSON.stringify(existingEntities || [])}
Environments ที่ใช้บ่อย: ${JSON.stringify(existingEnvironments || [])}

กฎ:
- ถ้าไม่แน่ใจ ใส่ null หรือ "unknown"
- environments ควรเป็นคำเดียวภาษาอังกฤษ
- ถ้าโลกตรงกับที่มีอยู่ ใช้ชื่อเดิมเป๊ะๆ
- threatLevel ดูจากอารมณ์/เหตุการณ์ในฝัน
- safetyOverride: helper=มีคนช่วย, separation=แยกตัว, wake=ตื่นเอง
- exit: wake=ตื่นปกติ, separation=หลุดออกจากฝัน, collapse=ฝันพัง

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
          { role: "user", content: text },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI error:", response.status);
      return new Response(JSON.stringify({ 
        world: null, 
        environments: [], 
        entities: [],
        threatLevel: 0,
        safetyOverride: "unknown",
        exit: "unknown",
        timeSystem: "unknown"
      }), {
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
    } catch {
      parsed = { 
        world: null, 
        environments: [], 
        entities: [],
        threatLevel: 0,
        safetyOverride: "unknown",
        exit: "unknown",
        timeSystem: "unknown"
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Suggest tags error:", e);
    return new Response(JSON.stringify({ 
      world: null, 
      environments: [], 
      entities: [],
      threatLevel: 0,
      safetyOverride: "unknown",
      exit: "unknown",
      timeSystem: "unknown"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
