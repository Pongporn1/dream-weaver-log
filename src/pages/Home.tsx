import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Library, Moon, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DreamCard } from '@/components/DreamCard';
import { getDreamLogs, getWorlds, getEntities, suggestTags, addDreamLog } from '@/lib/api';
import { DreamLog } from '@/types/dream';
import { toast } from 'sonner';

export default function Home() {
  const navigate = useNavigate();
  const [recentDreams, setRecentDreams] = useState<DreamLog[]>([]);
  const [quickNote, setQuickNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [existingWorlds, setExistingWorlds] = useState<string[]>([]);
  const [existingEntities, setExistingEntities] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dreams, worlds, entities] = await Promise.all([
          getDreamLogs(),
          getWorlds(),
          getEntities()
        ]);
        setRecentDreams(dreams.slice(0, 5));
        setExistingWorlds(worlds.map(w => w.name));
        setExistingEntities(entities.map(e => e.name));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleQuickSave = async () => {
    if (!quickNote.trim()) {
      toast.error('เขียนอะไรสักหน่อยก่อนนะ');
      return;
    }

    setAnalyzing(true);
    try {
      // Get AI suggestions
      const suggestions = await suggestTags(
        quickNote, 
        existingWorlds, 
        existingEntities,
        ['fog', 'sea', 'mountain', 'city', 'tunnel', 'rain', 'night', 'sunset', 'forest', 'building']
      );

      // Create dream log with suggested data
      const today = new Date();
      const newLog = await addDreamLog({
        date: today.toISOString().split('T')[0],
        wakeTime: today.toTimeString().slice(0, 5),
        world: suggestions.world || 'Unknown',
        timeSystem: (suggestions.timeSystem as DreamLog['timeSystem']) || 'unknown',
        environments: suggestions.environments || [],
        entities: suggestions.entities || [],
        threatLevel: (suggestions.threatLevel as DreamLog['threatLevel']) || 0,
        safetyOverride: (suggestions.safetyOverride as DreamLog['safetyOverride']) || 'unknown',
        exit: (suggestions.exit as DreamLog['exit']) || 'unknown',
        notes: quickNote
      });

      if (newLog) {
        toast.success('บันทึกความฝันแล้ว! 🌙', {
          description: `โลก: ${suggestions.world || 'Unknown'} | Threat: ${suggestions.threatLevel}`
        });
        setQuickNote('');
        // Reload dreams
        const dreams = await getDreamLogs();
        setRecentDreams(dreams.slice(0, 5));
      } else {
        toast.error('ไม่สามารถบันทึกได้');
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Greeting */}
      <div className="space-y-2">
        <h1 className="text-2xl">สวัสดีบอน</h1>
        <p className="text-muted-foreground">วันนี้อยากเล่าเรื่องอะไรหรอ</p>
      </div>

      {/* Quick Entry */}
      <div className="space-y-3">
        <Textarea
          placeholder="เล่าความฝันสั้นๆ... AI จะช่วยวิเคราะห์และใส่แท็กให้อัตโนมัติ 🤖"
          value={quickNote}
          onChange={(e) => setQuickNote(e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <Button 
          onClick={handleQuickSave} 
          disabled={analyzing || !quickNote.trim()}
          className="w-full gap-2"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังวิเคราะห์...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              บันทึกด่วน (AI วิเคราะห์อัตโนมัติ)
            </>
          )}
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3">
        <Button asChild variant="outline" className="w-full justify-start gap-2">
          <Link to="/logs/new">
            <Plus className="w-4 h-4" />
            บันทึกฝันใหม่ (กรอกเอง)
          </Link>
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="justify-start gap-2">
            <Link to="/library">
              <Library className="w-4 h-4" />
              ห้องสมุด
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start gap-2">
            <Link to="/sleep">
              <Moon className="w-4 h-4" />
              คำนวณการนอน
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Dreams */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">กำลังโหลด...</div>
      ) : recentDreams.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">บันทึกล่าสุด</h2>
            <Link to="/logs" className="text-sm text-primary hover:underline">
              ดูทั้งหมด
            </Link>
          </div>
          <div className="space-y-2">
            {recentDreams.map(dream => (
              <DreamCard key={dream.id} dream={dream} compact />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>ยังไม่มีบันทึก</p>
          <Button asChild variant="link" className="mt-2">
            <Link to="/logs/new">สร้างบันทึกแรก</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
