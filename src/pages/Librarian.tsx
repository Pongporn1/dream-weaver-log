import { useState, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getDreamLogs, getWorlds, getEntities, getThreats } from '@/lib/api';
import { DreamLog, World, Entity, ThreatEntry } from '@/types/dream';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Librarian() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'สวัสดีครับ ผมเป็นบรรณารักษ์ของ Dream System Library ถามได้เลยครับว่าต้องการค้นหาอะไร ผมจะตอบโดยอ้างอิง Dream IDs เท่านั้น'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dreamLogs, setDreamLogs] = useState<DreamLog[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [threats, setThreats] = useState<ThreatEntry[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dreamsData, worldsData, entitiesData, threatsData] = await Promise.all([
          getDreamLogs(),
          getWorlds(),
          getEntities(),
          getThreats()
        ]);
        setDreamLogs(dreamsData);
        setWorlds(worldsData);
        setEntities(entitiesData);
        setThreats(threatsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const searchLibrary = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    // Search in worlds
    const matchedWorlds = worlds.filter(w => 
      w.name.toLowerCase().includes(lowerQuery) ||
      w.description?.toLowerCase().includes(lowerQuery)
    );

    // Search in entities
    const matchedEntities = entities.filter(e =>
      e.name.toLowerCase().includes(lowerQuery) ||
      e.role.toLowerCase().includes(lowerQuery)
    );

    // Search in threats
    const matchedThreats = threats.filter(t =>
      t.name.toLowerCase().includes(lowerQuery)
    );

    // Search in dream logs
    const matchedDreams = dreamLogs.filter(d =>
      d.world.toLowerCase().includes(lowerQuery) ||
      d.notes?.toLowerCase().includes(lowerQuery) ||
      d.entities.some(e => e.toLowerCase().includes(lowerQuery)) ||
      d.environments.some(e => e.toLowerCase().includes(lowerQuery))
    );

    // Compile response
    let response = '';

    if (matchedWorlds.length > 0) {
      response += `พบโลก:\n`;
      matchedWorlds.forEach(w => {
        response += `• ${w.name} (${w.type}, stability ${w.stability})\n`;
        response += `  อ้างอิง: ${w.dreamIds.length > 0 ? w.dreamIds.join(', ') : 'ไม่มี'}\n`;
      });
      response += '\n';
    }

    if (matchedEntities.length > 0) {
      response += `พบสิ่งมีชีวิต:\n`;
      matchedEntities.forEach(e => {
        response += `• ${e.name} (${e.role})\n`;
        response += `  อ้างอิง: ${e.dreamIds.length > 0 ? e.dreamIds.join(', ') : 'ไม่มี'}\n`;
      });
      response += '\n';
    }

    if (matchedThreats.length > 0) {
      response += `พบภัยคุกคาม:\n`;
      matchedThreats.forEach(t => {
        response += `• ${t.name} (level ${t.level})\n`;
        response += `  อ้างอิง: ${t.dreamIds.length > 0 ? t.dreamIds.join(', ') : 'ไม่มี'}\n`;
      });
      response += '\n';
    }

    if (matchedDreams.length > 0 && response === '') {
      response += `พบบันทึกที่เกี่ยวข้อง:\n`;
      matchedDreams.slice(0, 5).forEach(d => {
        response += `• ${d.id}: ${d.world}\n`;
      });
    }

    if (response === '') {
      response = 'ไม่พบในคลัง กรุณาลองคำค้นอื่น หรือตรวจสอบว่าได้บันทึกข้อมูลแล้ว';
    }

    return response.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Process search
    setTimeout(() => {
      const response = searchLibrary(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="py-4 flex flex-col h-[calc(100vh-200px)]">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-5 h-5 text-primary" />
        <h1>AI Librarian</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm">
              กำลังค้นหา...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ถามบรรณารักษ์..."
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        บรรณารักษ์จะอ้างอิง Dream IDs เสมอ • ไม่ทำนาย ไม่ตีความ
      </p>
    </div>
  );
}
