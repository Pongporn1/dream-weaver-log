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
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `คุณเป็น AI ผู้ช่วยส่วนตัวชื่อ "DreamWeaver AI" 🤖✨

บทบาทของคุณ:
- คุยเรื่องอะไรก็ได้ เหมือน ChatGPT - ตอบคำถามทั่วไป ให้คำแนะนำ พูดคุยเป็นเพื่อน
- ใช้ภาษาไทยที่เป็นมิตร สุภาพ และสนุกสนาน มีอารมณ์ขัน เข้าใจง่าย
- เมื่อผู้ใช้ถามเกี่ยวกับความฝันของเขา ให้ใช้ข้อมูลจากคลังความฝันที่ให้มา

ความสามารถพิเศษ - มีข้อมูลความฝันของผู้ใช้:
- เมื่อถูกถามเกี่ยวกับความฝัน โลก entity หรือภัยคุกคาม ให้ค้นหาและใช้ข้อมูลจากคลัง
- ระบุ Dream IDs ที่เกี่ยวข้องในรูปแบบ Array เสมอ
- สามารถวิเคราะห์ สรุป และให้ข้อมูล insights จากความฝันได้

IMPORTANT RULES:
1. คุยเรื่องทั่วไปได้ทุกเรื่อง - ไม่จำกัดแค่ความฝัน
2. ถ้าไม่เกี่ยวกับความฝัน ตอบตามปกติเหมือน ChatGPT (ใส่ dreamIds เป็น array ว่าง)
3. ถ้าเกี่ยวกับความฝัน ใช้ข้อมูลจากคลังและระบุ dreamIds
4. ตอบแบบเป็นกันเอง ไม่เกร็ง มีบุคลิก
5. ใช้ emoji ให้เหมาะสมกับบริบท

รูปแบบการตอบ JSON:
{
  "response": "คำตอบเป็นข้อความ",
  "dreamIds": ["รายการ dream IDs ถ้ามี หรือ [] ถ้าไม่เกี่ยวกับความฝัน"],
  "matchedWorlds": ["ชื่อโลกที่พบ ถ้ามี"],
  "matchedEntities": ["ชื่อ entity ที่พบ ถ้ามี"],
  "matchedThreats": ["ชื่อภัยคุกคามที่พบ ถ้ามี"]
}

ข้อมูลความฝันในคลัง:
${context ? JSON.stringify(context, null, 2) : "ยังไม่มีข้อมูลความฝัน"}

Return ONLY valid JSON, no other text.`;

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
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    // Parse JSON from response
    let parsed;
    try {
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                       aiContent.match(/```\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : aiContent;
      parsed = JSON.parse(jsonText.trim());
    } catch {
      parsed = {
        response: aiContent,
        dreamIds: [],
        matchedWorlds: [],
        matchedEntities: [],
        matchedThreats: []
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("AI chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
