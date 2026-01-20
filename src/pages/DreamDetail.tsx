import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDreamLogs, deleteDreamLog } from '@/lib/api';
import { DreamLog } from '@/types/dream';
import { toast } from '@/hooks/use-toast';

const threatColors: Record<number, string> = {
  0: 'bg-muted text-muted-foreground',
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-orange-100 text-orange-800',
  3: 'bg-orange-200 text-orange-900',
  4: 'bg-red-100 text-red-800',
  5: 'bg-red-200 text-red-900',
};

export default function DreamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dream, setDream] = useState<DreamLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDream = async () => {
      try {
        const dreams = await getDreamLogs();
        const found = dreams.find(d => d.id === id);
        setDream(found || null);
      } catch (error) {
        console.error('Error loading dream:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDream();
  }, [id]);

  const handleDelete = async () => {
    if (dream && confirm('ลบบันทึกนี้?')) {
      const success = await deleteDreamLog(dream.id);
      if (success) {
        toast({ title: "ลบเรียบร้อย" });
        navigate('/logs');
      } else {
        toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
      }
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>;
  }

  if (!dream) {
    return (
      <div className="py-4">
        <p className="text-muted-foreground">ไม่พบบันทึก</p>
        <Button asChild variant="link" className="mt-2 p-0">
          <Link to="/logs">กลับไปรายการ</Link>
        </Button>
      </div>
    );
  }

  const formattedDate = new Date(dream.date).toLocaleDateString('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-mono text-muted-foreground">{dream.id}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Info */}
      <div>
        <h1 className="text-xl mb-1">{dream.world}</h1>
        <p className="text-muted-foreground">{formattedDate} • {dream.wakeTime}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-minimal">
          <p className="text-xs text-muted-foreground mb-1">Threat Level</p>
          <span className={`threat-badge text-lg ${threatColors[dream.threatLevel]}`}>
            {dream.threatLevel}
          </span>
        </div>
        <div className="card-minimal">
          <p className="text-xs text-muted-foreground mb-1">Time System</p>
          <p className="font-medium">{dream.timeSystem}</p>
        </div>
        <div className="card-minimal">
          <p className="text-xs text-muted-foreground mb-1">Safety Override</p>
          <p className="font-medium">{dream.safetyOverride}</p>
        </div>
        <div className="card-minimal">
          <p className="text-xs text-muted-foreground mb-1">Exit</p>
          <p className="font-medium">{dream.exit}</p>
        </div>
      </div>

      {/* Environments */}
      {dream.environments.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Environments</p>
          <div className="flex flex-wrap gap-2">
            {dream.environments.map(env => (
              <span key={env} className="tag">{env}</span>
            ))}
          </div>
        </div>
      )}

      {/* Entities */}
      {dream.entities.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Entities</p>
          <div className="flex flex-wrap gap-2">
            {dream.entities.map(entity => (
              <span key={entity} className="tag-accent">{entity}</span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {dream.notes && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Notes</p>
          <p className="text-sm whitespace-pre-wrap">{dream.notes}</p>
        </div>
      )}
    </div>
  );
}
