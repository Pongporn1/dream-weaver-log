import { useState, useEffect } from "react";
import { Send, Bot, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDreamLogs, getWorlds, getEntities, getThreats } from "@/lib/api";
import { DreamLog, World, Entity, ThreatEntry } from "@/types/dream";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Message {
  role: "user" | "assistant";
  content: string;
  links?: { id: string; label: string; date?: string }[];
}

export default function Librarian() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "สวัสดีครับ ผม DreamWeaver AI 🤖✨\n\nผมเป็น AI ผู้ช่วยส่วนตัวของคุณ คุยเรื่องอะไรก็ได้เหมือน ChatGPT:\n\n💬 คุยทั่วไป:\n• ถามคำถามอะไรก็ได้\n• ขอคำแนะนำ\n• สนทนาเป็นเพื่อน\n• แชร์ความคิด\n\n🌙 เรื่องความฝัน:\n• วิเคราะห์ความฝันของคุณ\n• ค้นหาข้อมูลจากคลัง\n• สรุปและหา pattern\n• แสดงลิงก์ที่เกี่ยวข้อง\n\nลองคุยกับผมได้เลยครับ! 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dreamLogs, setDreamLogs] = useState<DreamLog[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [threats, setThreats] = useState<ThreatEntry[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dreamsData, worldsData, entitiesData, threatsData] =
          await Promise.all([
            getDreamLogs(),
            getWorlds(),
            getEntities(),
            getThreats(),
          ]);
        setDreamLogs(dreamsData);
        setWorlds(worldsData);
        setEntities(entitiesData);
        setThreats(threatsData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  const searchLibrary = (
    query: string,
  ): {
    response: string;
    links: { id: string; label: string; date?: string }[];
  } => {
    const lowerQuery = query.toLowerCase();
    const links: { id: string; label: string; date?: string }[] = [];

    // Search in worlds
    const matchedWorlds = worlds.filter(
      (w) =>
        w.name.toLowerCase().includes(lowerQuery) ||
        w.description?.toLowerCase().includes(lowerQuery),
    );

    // Search in entities
    const matchedEntities = entities.filter(
      (e) =>
        e.name.toLowerCase().includes(lowerQuery) ||
        e.role.toLowerCase().includes(lowerQuery),
    );

    // Search in threats
    const matchedThreats = threats.filter((t) =>
      t.name.toLowerCase().includes(lowerQuery),
    );

    // Search in dream logs
    const matchedDreams = dreamLogs.filter(
      (d) =>
        d.world.toLowerCase().includes(lowerQuery) ||
        d.notes?.toLowerCase().includes(lowerQuery) ||
        d.entities.some((e) => e.toLowerCase().includes(lowerQuery)) ||
        d.environments.some((e) => e.toLowerCase().includes(lowerQuery)),
    );

    // Compile response
    let response = "";

    if (matchedWorlds.length > 0) {
      response += `🌍 พบโลก (${matchedWorlds.length}):\n\n`;
      matchedWorlds.forEach((w) => {
        response += `• ${w.name}\n`;
        response += `  ประเภท: ${w.type} | ความมั่นคง: ${w.stability}/5\n`;
        if (w.description) {
          response += `  "${w.description}"\n`;
        }
        response += `  ปรากฏใน: ${w.dreamIds.length} ครั้ง\n`;

        // Add links for each dream
        w.dreamIds.forEach((dreamId) => {
          const dream = dreamLogs.find((d) => d.id === dreamId);
          if (dream) {
            const dateStr = format(new Date(dream.date), "d MMM yyyy", {
              locale: th,
            });
            links.push({
              id: dreamId,
              label: `${w.name} - ${dateStr}`,
              date: dateStr,
            });
          }
        });
        response += "\n";
      });
    }

    if (matchedEntities.length > 0) {
      response += `👥 พบสิ่งมีชีวิต (${matchedEntities.length}):\n\n`;
      matchedEntities.forEach((e) => {
        response += `• ${e.name}\n`;
        response += `  บทบาท: ${e.role}\n`;
        if (e.description) {
          response += `  ${e.description}\n`;
        }
        response += `  ปรากฏใน: ${e.dreamIds.length} ครั้ง\n`;

        // Add links for each dream
        e.dreamIds.forEach((dreamId) => {
          const dream = dreamLogs.find((d) => d.id === dreamId);
          if (dream) {
            const dateStr = format(new Date(dream.date), "d MMM yyyy", {
              locale: th,
            });
            links.push({
              id: dreamId,
              label: `${e.name} - ${dateStr}`,
              date: dateStr,
            });
          }
        });
        response += "\n";
      });
    }

    if (matchedThreats.length > 0) {
      response += `⚠️ พบภัยคุกคาม (${matchedThreats.length}):\n\n`;
      matchedThreats.forEach((t) => {
        response += `• ${t.name}\n`;
        response += `  ระดับ: ${t.level}/5`;
        const levelDesc =
          t.level >= 4 ? " (อันตราย!)" : t.level >= 3 ? " (ระวัง)" : "";
        response += levelDesc + "\n";
        if (t.response) {
          response += `  การตอบสนอง: ${t.response}\n`;
        }
        response += `  พบ: ${t.dreamIds.length} ครั้ง\n`;

        // Add links for each dream
        t.dreamIds.forEach((dreamId) => {
          const dream = dreamLogs.find((d) => d.id === dreamId);
          if (dream) {
            const dateStr = format(new Date(dream.date), "d MMM yyyy", {
              locale: th,
            });
            links.push({
              id: dreamId,
              label: `${t.name} - ${dateStr}`,
              date: dateStr,
            });
          }
        });
        response += "\n";
      });
    }

    if (matchedDreams.length > 0 && response === "") {
      response += `📖 พบบันทึกความฝัน (${matchedDreams.length}):\n\n`;
      matchedDreams.slice(0, 10).forEach((d) => {
        const dateStr = format(new Date(d.date), "d MMM yyyy", { locale: th });
        response += `• ${d.world}\n`;
        response += `  วันที่: ${dateStr}\n`;
        if (d.notes) {
          const preview =
            d.notes.length > 80 ? d.notes.substring(0, 80) + "..." : d.notes;
          response += `  "${preview}"\n`;
        }
        response += `  Entities: ${d.entities.join(", ")}\n`;

        links.push({
          id: d.id,
          label: `${d.world} - ${dateStr}`,
          date: dateStr,
        });
        response += "\n";
      });

      if (matchedDreams.length > 10) {
        response += `... และอีก ${matchedDreams.length - 10} รายการ\n`;
      }
    }

    if (response === "") {
      response =
        "🔍 ไม่พบข้อมูลที่ตรงกับคำค้นหา\n\nลองใช้คำค้นอื่น หรือตรวจสอบว่าได้บันทึกข้อมูลแล้ว\n\nเคล็ดลับ: ลองค้นหาด้วยคำง่ายๆ หรือคำบางส่วนของชื่อ";
    }

    return { response: response.trim(), links };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Call Gemini API directly from frontend
      const GOOGLE_AI_API_KEY =
        import.meta.env.VITE_GOOGLE_AI_API_KEY ||
        "AIzaSyB20PAkEHNwPGlpEVCL6K_qcomEJirYmU";

      console.log("API Key check:", GOOGLE_AI_API_KEY ? "Found" : "Not found");
      console.log("API Key length:", GOOGLE_AI_API_KEY?.length);

      if (
        !GOOGLE_AI_API_KEY ||
        GOOGLE_AI_API_KEY === "YOUR_GOOGLE_AI_API_KEY_HERE"
      ) {
        throw new Error(
          "API key not configured. กรุณา restart dev server (Ctrl+C แล้ว npm run dev)",
        );
      }

      // Prepare context summary
      const contextSummary = {
        totalDreams: dreamLogs.length,
        totalWorlds: worlds.length,
        totalEntities: entities.length,
        totalThreats: threats.length,
        worlds: worlds.map((w) => ({
          name: w.name,
          type: w.type,
          stability: w.stability,
          description: w.description,
          dreamIds: w.dreamIds,
        })),
        entities: entities.map((e) => ({
          name: e.name,
          role: e.role,
          description: e.description,
          dreamIds: e.dreamIds,
        })),
        threats: threats.map((t) => ({
          name: t.name,
          level: t.level,
          response: t.response,
          dreamIds: t.dreamIds,
        })),
        recentDreams: dreamLogs.slice(0, 20).map((d) => ({
          id: d.id,
          date: d.date,
          world: d.world,
          entities: d.entities,
          environments: d.environments,
          notes: d.notes?.substring(0, 200),
        })),
      };

      const systemPrompt = `คุณเป็น AI ผู้ช่วยส่วนตัวชื่อ "DreamWeaver AI" 🤖✨

บทบาทของคุณ:
- คุยเรื่องอะไรก็ได้ เหมือน ChatGPT - ตอบคำถามทั่วไป ให้คำแนะนำ พูดคุยเป็นเพื่อน
- ใช้ภาษาไทยที่เป็นมิตร สุภาพ และสนุกสนาน มีอารมณ์ขัน เข้าใจง่าย
- พูดคุยได้หลากหลายหัวข้อ: เทคโนโลยี, ชีวิต, ความรู้ทั่วไป, แนะนำอะไรก็ได้
- เมื่อผู้ใช้ถามเกี่ยวกับความฝันของเขา ให้ใช้ข้อมูลจากคลังความฝันด้านล่าง

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
6. จำบทสนทนาก่อนหน้าและอ้างอิงได้

รูปแบบการตอบ JSON:
{
  "response": "คำตอบเป็นข้อความ",
  "dreamIds": ["รายการ dream IDs ถ้ามี หรือ [] ถ้าไม่เกี่ยวกับความฝัน"],
  "matchedWorlds": ["ชื่อโลกที่พบ ถ้ามี"],
  "matchedEntities": ["ชื่อ entity ที่พบ ถ้ามี"],
  "matchedThreats": ["ชื่อภัยคุกคามที่พบ ถ้ามี"]
}

ข้อมูลความฝันในคลัง:
${contextSummary.totalDreams > 0 ? JSON.stringify(contextSummary, null, 2) : "ยังไม่มีข้อมูลความฝัน"}

Return ONLY valid JSON, no other text.`;

      // Build conversation history for context
      const conversationHistory = messages
        .slice(-10) // Last 10 messages for context
        .map((m) => `${m.role === "user" ? "ผู้ใช้" : "AI"}: ${m.content}`)
        .join("\n\n");

      const userPrompt = `${
        conversationHistory
          ? `บทสนทนาก่อนหน้า:\n${conversationHistory}\n\n`
          : ""
      }ผู้ใช้: "${userMessage}"

กรุณาตอบคำถามหรือพูดคุย:
- ถ้าเป็นคำถามทั่วไป ตอบตามปกติ (dreamIds: [])
- ถ้าเกี่ยวกับความฝันของผู้ใช้ ใช้ข้อมูลจากคลังและระบุ dreamIds
- ตอบแบบเป็นมิตร สนุกสนาน และมีประโยชน์`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: systemPrompt }, { text: userPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        throw new Error("No response from AI");
      }

      // Parse JSON from AI response
      let parsedResponse;
      try {
        const jsonMatch =
          aiResponse.match(/```json\s*([\s\S]*?)\s*```/) ||
          aiResponse.match(/```\s*([\s\S]*?)\s*```/);
        const jsonText = jsonMatch ? jsonMatch[1] : aiResponse;
        parsedResponse = JSON.parse(jsonText.trim());
      } catch (e) {
        parsedResponse = {
          response: aiResponse,
          dreamIds: [],
          matchedWorlds: [],
          matchedEntities: [],
          matchedThreats: [],
        };
      }

      const {
        response: aiText,
        dreamIds = [],
        matchedWorlds = [],
        matchedEntities = [],
        matchedThreats = [],
      } = parsedResponse;

      // Build links from dreamIds
      const links: { id: string; label: string; date?: string }[] = [];

      dreamIds.forEach((dreamId: string) => {
        const dream = dreamLogs.find((d) => d.id === dreamId);
        if (dream) {
          const dateStr = format(new Date(dream.date), "d MMM yyyy", {
            locale: th,
          });
          links.push({
            id: dreamId,
            label: `${dream.world} - ${dateStr}`,
            date: dateStr,
          });
        }
      });

      // Also add links from matched items
      [...matchedWorlds, ...matchedEntities, ...matchedThreats].forEach(
        (name: string) => {
          const world = worlds.find((w) => w.name === name);
          const entity = entities.find((e) => e.name === name);
          const threat = threats.find((t) => t.name === name);

          const item = world || entity || threat;
          if (item && item.dreamIds) {
            item.dreamIds.forEach((id: string) => {
              if (!links.find((l) => l.id === id)) {
                const dream = dreamLogs.find((d) => d.id === id);
                if (dream) {
                  const dateStr = format(new Date(dream.date), "d MMM yyyy", {
                    locale: th,
                  });
                  links.push({
                    id,
                    label: `${name} - ${dateStr}`,
                    date: dateStr,
                  });
                }
              }
            });
          }
        },
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiText,
          links: links.length > 0 ? links : undefined,
        },
      ]);
    } catch (error) {
      console.error("AI error:", error);

      // Fallback to local search
      const { response, links } = searchLibrary(userMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ AI ไม่พร้อมใช้งาน (ตรวจสอบ API key ใน .env)\n\nใช้การค้นหาแบบธรรมดาแทน:\n\n" +
            response,
          links: links.length > 0 ? links : undefined,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-4 flex flex-col h-[calc(100vh-200px)]">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-5 h-5 text-primary" />
        <h1>DreamWeaver AI</h1>
        <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>

              {/* Show links if available */}
              {message.links && message.links.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                  <div className="text-xs font-semibold mb-2 opacity-70">
                    🔗 ลิงก์ที่เกี่ยวข้อง ({message.links.length})
                  </div>
                  {message.links.map((link, idx) => (
                    <Link
                      key={idx}
                      to={`/dreams/${link.id}`}
                      className="flex items-center gap-1.5 text-xs hover:underline py-1 px-2 rounded hover:bg-background/50 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{link.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm flex items-center gap-2">
              <Sparkles className="w-3 h-3 animate-spin" />
              <span>AI กำลังคิด...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="คุยเรื่องอะไรก็ได้... 💬"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>

      <p className="text-xs text-muted-foreground mt-2 text-center"></p>
    </div>
  );
}
