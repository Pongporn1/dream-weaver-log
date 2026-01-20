import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Library, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DreamCard } from '@/components/DreamCard';
import { getDreamLogs } from '@/lib/api';
import { DreamLog } from '@/types/dream';

export default function Home() {
  const [recentDreams, setRecentDreams] = useState<DreamLog[]>([]);
  const [quickNote, setQuickNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDreams = async () => {
      try {
        const dreams = await getDreamLogs();
        setRecentDreams(dreams.slice(0, 5));
      } catch (error) {
        console.error('Error loading dreams:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDreams();
  }, []);

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
          placeholder="จดบันทึกสั้นๆ ที่นี่..."
          value={quickNote}
          onChange={(e) => setQuickNote(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3">
        <Button asChild variant="default" className="w-full justify-start gap-2">
          <Link to="/logs/new">
            <Plus className="w-4 h-4" />
            บันทึกฝันใหม่
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
