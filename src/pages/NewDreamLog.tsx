import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { addDreamLog, getWorlds, getEntities } from '@/lib/api';
import { ENVIRONMENTS, TIME_SYSTEMS, SAFETY_OVERRIDES, EXIT_TYPES, DreamLog } from '@/types/dream';
import { toast } from '@/hooks/use-toast';

export default function NewDreamLog() {
  const navigate = useNavigate();
  const [worlds, setWorlds] = useState<{ id: string; name: string }[]>([]);
  const [entities, setEntities] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    wakeTime: '',
    world: '',
    newWorld: '',
    timeSystem: 'unknown' as DreamLog['timeSystem'],
    environments: [] as string[],
    selectedEntities: [] as string[],
    newEntity: '',
    threatLevel: 0 as DreamLog['threatLevel'],
    safetyOverride: 'none' as DreamLog['safetyOverride'],
    exit: 'unknown' as DreamLog['exit'],
    notes: ''
  });

  useEffect(() => {
    const loadData = async () => {
      const [worldsData, entitiesData] = await Promise.all([
        getWorlds(),
        getEntities()
      ]);
      setWorlds(worldsData.map(w => ({ id: w.id, name: w.name })));
      setEntities(entitiesData.map(e => ({ id: e.id, name: e.name })));
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const worldName = form.newWorld || form.world;
      const entityNames = [...form.selectedEntities];
      if (form.newEntity) {
        entityNames.push(form.newEntity);
      }

      const result = await addDreamLog({
        date: form.date,
        wakeTime: form.wakeTime,
        world: worldName,
        timeSystem: form.timeSystem,
        environments: form.environments,
        entities: entityNames,
        threatLevel: form.threatLevel,
        safetyOverride: form.safetyOverride,
        exit: form.exit,
        notes: form.notes || undefined
      });

      if (result) {
        toast({ title: "บันทึกเรียบร้อย" });
        navigate('/logs');
      } else {
        toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error saving dream:', error);
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleEnvironment = (env: string) => {
    setForm(prev => ({
      ...prev,
      environments: prev.environments.includes(env)
        ? prev.environments.filter(e => e !== env)
        : [...prev.environments, env]
    }));
  };

  const toggleEntity = (entityName: string) => {
    setForm(prev => ({
      ...prev,
      selectedEntities: prev.selectedEntities.includes(entityName)
        ? prev.selectedEntities.filter(e => e !== entityName)
        : [...prev.selectedEntities, entityName]
    }));
  };

  return (
    <div className="py-4">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1>บันทึกฝันใหม่</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wakeTime">Wake Time</Label>
            <Input
              id="wakeTime"
              type="time"
              value={form.wakeTime}
              onChange={(e) => setForm(prev => ({ ...prev, wakeTime: e.target.value }))}
              required
            />
          </div>
        </div>

        {/* World */}
        <div className="space-y-2">
          <Label>World</Label>
          <Select value={form.world} onValueChange={(v) => setForm(prev => ({ ...prev, world: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select or create new" />
            </SelectTrigger>
            <SelectContent>
              {worlds.map(w => (
                <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="หรือสร้างโลกใหม่..."
            value={form.newWorld}
            onChange={(e) => setForm(prev => ({ ...prev, newWorld: e.target.value }))}
          />
        </div>

        {/* Time System */}
        <div className="space-y-2">
          <Label>Time System</Label>
          <Select 
            value={form.timeSystem} 
            onValueChange={(v) => setForm(prev => ({ ...prev, timeSystem: v as DreamLog['timeSystem'] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_SYSTEMS.map(ts => (
                <SelectItem key={ts} value={ts}>{ts}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Environments */}
        <div className="space-y-2">
          <Label>Environments</Label>
          <div className="flex flex-wrap gap-2">
            {ENVIRONMENTS.map(env => (
              <button
                key={env}
                type="button"
                onClick={() => toggleEnvironment(env)}
                className={`tag transition-colors ${
                  form.environments.includes(env) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-secondary'
                }`}
              >
                {env}
              </button>
            ))}
          </div>
        </div>

        {/* Entities */}
        <div className="space-y-2">
          <Label>Entities</Label>
          <div className="space-y-2">
            {entities.map(entity => (
              <div key={entity.id} className="flex items-center gap-2">
                <Checkbox
                  id={entity.id}
                  checked={form.selectedEntities.includes(entity.name)}
                  onCheckedChange={() => toggleEntity(entity.name)}
                />
                <label htmlFor={entity.id} className="text-sm">{entity.name}</label>
              </div>
            ))}
          </div>
          <Input
            placeholder="หรือเพิ่ม entity ใหม่..."
            value={form.newEntity}
            onChange={(e) => setForm(prev => ({ ...prev, newEntity: e.target.value }))}
          />
        </div>

        {/* Threat Level */}
        <div className="space-y-2">
          <Label>Threat Level: {form.threatLevel}</Label>
          <input
            type="range"
            min="0"
            max="5"
            value={form.threatLevel}
            onChange={(e) => setForm(prev => ({ ...prev, threatLevel: Number(e.target.value) as DreamLog['threatLevel'] }))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>5</span>
          </div>
        </div>

        {/* Safety Override */}
        <div className="space-y-2">
          <Label>Safety Override</Label>
          <Select 
            value={form.safetyOverride} 
            onValueChange={(v) => setForm(prev => ({ ...prev, safetyOverride: v as DreamLog['safetyOverride'] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SAFETY_OVERRIDES.map(so => (
                <SelectItem key={so} value={so}>{so}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Exit */}
        <div className="space-y-2">
          <Label>Exit</Label>
          <Select 
            value={form.exit} 
            onValueChange={(v) => setForm(prev => ({ ...prev, exit: v as DreamLog['exit'] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXIT_TYPES.map(ex => (
                <SelectItem key={ex} value={ex}>{ex}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="รายละเอียดเพิ่มเติม..."
            value={form.notes}
            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
            className="min-h-[80px]"
          />
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </Button>
      </form>
    </div>
  );
}
