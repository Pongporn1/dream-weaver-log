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

    const systemPrompt = `คุณคือ DreamWeaver AI ผู้ช่วยส่วนตัวที่ฉลาด เป็นกันเอง และมีความรู้รอบด้าน

## บุคลิกของคุณ
- พูดคุยเป็นธรรมชาติ เหมือนเพื่อนที่ฉลาดและน่าคบ
- ใช้ภาษาที่เข้าใจง่าย ไม่เยิ่นเย้อ แต่ให้ข้อมูลครบถ้วน
- มีอารมณ์ขัน รู้จักใช้ emoji อย่างเหมาะสม
- ตอบตรงประเด็น แต่อธิบายเพิ่มเมื่อจำเป็น
- สามารถคุยได้ทุกเรื่อง: เทคโนโลยี วิทยาศาสตร์ ชีวิต ความรู้ทั่วไป คำแนะนำ ฯลฯ

## ความสามารถพิเศษ - คลังความฝันของผู้ใช้
คุณมีข้อมูลความฝันของผู้ใช้ เมื่อถูกถามเรื่องความฝัน:
- ค้นหาและวิเคราะห์จากข้อมูลในคลัง
- ระบุ Dream IDs ที่เกี่ยวข้อง
- หา patterns และ insights ที่น่าสนใจ
- เชื่อมโยงข้อมูลระหว่างโลก entities และเหตุการณ์ต่างๆ

## วิธีตอบ
1. เข้าใจคำถามอย่างลึกซึ้งก่อนตอบ
2. ถ้าเป็นคำถามทั่วไป → ตอบอย่างละเอียดและมีประโยชน์
3. ถ้าเกี่ยวกับความฝัน → ใช้ข้อมูลจากคลังและอ้างอิง dreamIds
4. ให้คำตอบที่มีคุณค่า ไม่ใช่แค่ตอบผ่านๆ

## รูปแบบการตอบ (JSON)
{
  "response": "คำตอบที่เป็นธรรมชาติ ละเอียด และมีประโยชน์",
  "dreamIds": ["dream IDs ที่เกี่ยวข้อง หรือ [] ถ้าไม่เกี่ยวกับความฝัน"],
  "matchedWorlds": ["โลกที่เกี่ยวข้อง"],
  "matchedEntities": ["entities ที่เกี่ยวข้อง"],
  "matchedThreats": ["ภัยคุกคามที่เกี่ยวข้อง"]
}

## ข้อมูลความฝันในคลัง
${context ? JSON.stringify(context, null, 2) : "ยังไม่มีข้อมูลความฝัน"}

ตอบเป็น JSON เท่านั้น ไม่ต้องใส่ markdown code block`;

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
          ...messages,
        ],
        temperature: 0.8,
        max_tokens: 4096,
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
