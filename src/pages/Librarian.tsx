import { useState, useEffect, useRef } from "react";
import { Send, Bot, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDreamLogs, getWorlds, getEntities, getThreats, sendAIChat } from "@/lib/api";
import { DreamLog, World, Entity, ThreatEntry } from "@/types/dream";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";

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
        "สวัสดีครับ ผม DreamWeaver AI 🤖✨\n\nผมเป็น AI ผู้ช่วยส่วนตัวของคุณ คุยเรื่องอะไรก็ได้:\n\n💬 คุยทั่วไป: ถามอะไรก็ได้ ขอคำแนะนำ สนทนาเป็นเพื่อน\n\n🌙 เรื่องความฝัน: วิเคราะห์ความฝัน ค้นหาข้อมูลจากคลัง สรุป patterns\n\nลองคุยกับผมได้เลยครับ! 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dreamLogs, setDreamLogs] = useState<DreamLog[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [threats, setThreats] = useState<ThreatEntry[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Build context for AI
      const context = {
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

      // Build message history for AI
      const chatHistory = messages.slice(-10).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const result = await sendAIChat(
        [...chatHistory, { role: "user", content: userMessage }],
        context
      );

      if (result.error) {
        toast.error(result.error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `ขอโทษครับ เกิดข้อผิดพลาด: ${result.error}`,
          },
        ]);
      } else {
        // Build links from dreamIds
        const links: { id: string; label: string; date?: string }[] = [];

        result.dreamIds?.forEach((dreamId: string) => {
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
        [...(result.matchedWorlds || []), ...(result.matchedEntities || []), ...(result.matchedThreats || [])].forEach(
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
          }
        );

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: result.response,
            links: links.length > 0 ? links : undefined,
          },
        ]);
      }
    } catch (error) {
      console.error("AI error:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ AI");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "ขอโทษครับ ไม่สามารถเชื่อมต่อ AI ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-medium flex items-center gap-2">
            DreamWeaver AI
            <Sparkles className="w-4 h-4 text-primary" />
          </h1>
          <p className="text-xs text-muted-foreground">
            Powered by Lovable AI
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>

              {/* Dream Links */}
              {msg.links && msg.links.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs font-medium mb-2 opacity-70">
                    📎 Related Dreams:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {msg.links.slice(0, 5).map((link, i) => (
                      <Link
                        key={i}
                        to={`/logs/${link.id}`}
                        className="inline-flex items-center gap-1 text-xs bg-background/50 hover:bg-background px-2 py-1 rounded-full transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {link.label}
                      </Link>
                    ))}
                    {msg.links.length > 5 && (
                      <span className="text-xs opacity-70">
                        +{msg.links.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="pt-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์ข้อความ..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
