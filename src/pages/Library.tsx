import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, Search, BookOpen, Users, Cog, AlertTriangle } from 'lucide-react';
import { getWorlds, getEntities, getModules, getThreats, addWorld, addEntity, addModule, addThreat, updateWorld, updateEntity, deleteWorld, deleteEntity, deleteModule, deleteThreat } from '@/lib/api';
import { World, Entity, SystemModule, ThreatEntry } from '@/types/dream';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function Library() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [threats, setThreats] = useState<ThreatEntry[]>([]);
  const [activeTab, setActiveTab] = useState('worlds');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [showAddWorld, setShowAddWorld] = useState(false);
  const [showAddEntity, setShowAddEntity] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddThreat, setShowAddThreat] = useState(false);

  // Form states
  const [newWorld, setNewWorld] = useState<{ name: string; type: 'persistent' | 'transient'; stability: number; description: string }>({ name: '', type: 'transient', stability: 3, description: '' });
  const [newEntity, setNewEntity] = useState<{ name: string; role: 'observer' | 'protector' | 'guide' | 'intruder'; description: string }>({ name: '', role: 'observer', description: '' });
  const [newModule, setNewModule] = useState<{ name: string; type: 'time_activation' | 'safety_override' | 'distance_expansion' | 'other'; description: string }>({ name: '', type: 'other', description: '' });
  const [newThreat, setNewThreat] = useState<{ name: string; level: 0 | 1 | 2 | 3 | 4 | 5; response: string }>({ name: '', level: 1, response: '' });

  // Edit states
  const [editingWorld, setEditingWorld] = useState<string | null>(null);
  const [editingEntity, setEditingEntity] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [worldsData, entitiesData, modulesData, threatsData] = await Promise.all([
        getWorlds(),
        getEntities(),
        getModules(),
        getThreats()
      ]);
      setWorlds(worldsData);
      setEntities(entitiesData);
      setModules(modulesData);
      setThreats(threatsData);
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add handlers
  const handleAddWorld = async () => {
    if (!newWorld.name.trim()) {
      toast.error('กรุณาใส่ชื่อโลก');
      return;
    }
    const result = await addWorld(newWorld);
    if (result) {
      setWorlds(prev => [...prev, result]);
      setNewWorld({ name: '', type: 'transient', stability: 3, description: '' });
      setShowAddWorld(false);
      toast.success('เพิ่มโลกใหม่แล้ว');
    }
  };

  const handleAddEntity = async () => {
    if (!newEntity.name.trim()) {
      toast.error('กรุณาใส่ชื่อ Entity');
      return;
    }
    const result = await addEntity(newEntity);
    if (result) {
      setEntities(prev => [...prev, result]);
      setNewEntity({ name: '', role: 'observer', description: '' });
      setShowAddEntity(false);
      toast.success('เพิ่ม Entity ใหม่แล้ว');
    }
  };

  const handleAddModule = async () => {
    if (!newModule.name.trim()) {
      toast.error('กรุณาใส่ชื่อ Module');
      return;
    }
    const result = await addModule(newModule);
    if (result) {
      setModules(prev => [...prev, result]);
      setNewModule({ name: '', type: 'other', description: '' });
      setShowAddModule(false);
      toast.success('เพิ่ม Module ใหม่แล้ว');
    }
  };

  const handleAddThreat = async () => {
    if (!newThreat.name.trim()) {
      toast.error('กรุณาใส่ชื่อภัยคุกคาม');
      return;
    }
    const result = await addThreat(newThreat);
    if (result) {
      setThreats(prev => [...prev, result]);
      setNewThreat({ name: '', level: 1, response: '' });
      setShowAddThreat(false);
      toast.success('เพิ่มภัยคุกคามใหม่แล้ว');
    }
  };

  // Delete handlers
  const handleDeleteWorld = async (id: string) => {
    if (await deleteWorld(id)) {
      setWorlds(prev => prev.filter(w => w.id !== id));
      toast.success('ลบโลกแล้ว');
    }
  };

  const handleDeleteEntity = async (id: string) => {
    if (await deleteEntity(id)) {
      setEntities(prev => prev.filter(e => e.id !== id));
      toast.success('ลบ Entity แล้ว');
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (await deleteModule(id)) {
      setModules(prev => prev.filter(m => m.id !== id));
      toast.success('ลบ Module แล้ว');
    }
  };

  const handleDeleteThreat = async (id: string) => {
    if (await deleteThreat(id)) {
      setThreats(prev => prev.filter(t => t.id !== id));
      toast.success('ลบภัยคุกคามแล้ว');
    }
  };

  // Filter by search
  const filterBySearch = <T extends { name: string; description?: string }>(items: T[]) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.description?.toLowerCase().includes(q)
    );
  };

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>;
  }

  const tabCounts = {
    worlds: worlds.length,
    entities: entities.length,
    modules: modules.length,
    threats: threats.length
  };

  return (
    <div className="py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Dream Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            คลังข้อมูลโลก สิ่งมีชีวิต และระบบในความฝัน
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหา..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="worlds" className="text-xs gap-1">
            <BookOpen className="w-3 h-3" />
            <span className="hidden sm:inline">Worlds</span>
            <span className="text-muted-foreground">({tabCounts.worlds})</span>
          </TabsTrigger>
          <TabsTrigger value="entities" className="text-xs gap-1">
            <Users className="w-3 h-3" />
            <span className="hidden sm:inline">Entities</span>
            <span className="text-muted-foreground">({tabCounts.entities})</span>
          </TabsTrigger>
          <TabsTrigger value="modules" className="text-xs gap-1">
            <Cog className="w-3 h-3" />
            <span className="hidden sm:inline">Modules</span>
            <span className="text-muted-foreground">({tabCounts.modules})</span>
          </TabsTrigger>
          <TabsTrigger value="threats" className="text-xs gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span className="hidden sm:inline">Threats</span>
            <span className="text-muted-foreground">({tabCounts.threats})</span>
          </TabsTrigger>
        </TabsList>

        {/* Worlds Tab */}
        <TabsContent value="worlds" className="space-y-3 mt-4">
          <Dialog open={showAddWorld} onOpenChange={setShowAddWorld}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Plus className="w-4 h-4" /> เพิ่มโลกใหม่
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่มโลกใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="ชื่อโลก"
                  value={newWorld.name}
                  onChange={(e) => setNewWorld(prev => ({ ...prev, name: e.target.value }))}
                />
                <Select value={newWorld.type} onValueChange={(v: 'persistent' | 'transient') => setNewWorld(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="persistent">Persistent (ถาวร)</SelectItem>
                    <SelectItem value="transient">Transient (ชั่วคราว)</SelectItem>
                  </SelectContent>
                </Select>
                <div>
                  <label className="text-sm">Stability: {newWorld.stability}/5</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={newWorld.stability}
                    onChange={(e) => setNewWorld(prev => ({ ...prev, stability: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <Textarea
                  placeholder="คำอธิบาย (optional)"
                  value={newWorld.description}
                  onChange={(e) => setNewWorld(prev => ({ ...prev, description: e.target.value }))}
                />
                <Button onClick={handleAddWorld} className="w-full">บันทึก</Button>
              </div>
            </DialogContent>
          </Dialog>

          {filterBySearch(worlds).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">ไม่พบข้อมูล</p>
          ) : (
            filterBySearch(worlds).map(world => (
              <div key={world.id} className="card-minimal group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{world.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${world.type === 'persistent' ? 'bg-primary/20 text-primary' : 'bg-muted'}`}>
                        {world.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Stability: {'●'.repeat(world.stability)}{'○'.repeat(5 - world.stability)}
                    </p>
                    {world.description && (
                      <p className="text-sm text-muted-foreground mt-2">{world.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteWorld(world.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {world.dreamIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
                    {world.dreamIds.slice(0, 5).map(id => (
                      <Link key={id} to={`/logs/${id}`} className="text-xs font-mono text-primary hover:underline">
                        {id}
                      </Link>
                    ))}
                    {world.dreamIds.length > 5 && (
                      <span className="text-xs text-muted-foreground">+{world.dreamIds.length - 5} more</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>

        {/* Entities Tab */}
        <TabsContent value="entities" className="space-y-3 mt-4">
          <Dialog open={showAddEntity} onOpenChange={setShowAddEntity}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Plus className="w-4 h-4" /> เพิ่ม Entity ใหม่
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่ม Entity ใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="ชื่อ Entity"
                  value={newEntity.name}
                  onChange={(e) => setNewEntity(prev => ({ ...prev, name: e.target.value }))}
                />
                <Select value={newEntity.role} onValueChange={(v: 'observer' | 'protector' | 'guide' | 'intruder') => setNewEntity(prev => ({ ...prev, role: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="observer">Observer (ผู้สังเกต)</SelectItem>
                    <SelectItem value="protector">Protector (ผู้ปกป้อง)</SelectItem>
                    <SelectItem value="guide">Guide (ผู้นำทาง)</SelectItem>
                    <SelectItem value="intruder">Intruder (ผู้บุกรุก)</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="คำอธิบาย (optional)"
                  value={newEntity.description}
                  onChange={(e) => setNewEntity(prev => ({ ...prev, description: e.target.value }))}
                />
                <Button onClick={handleAddEntity} className="w-full">บันทึก</Button>
              </div>
            </DialogContent>
          </Dialog>

          {filterBySearch(entities).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">ไม่พบข้อมูล</p>
          ) : (
            filterBySearch(entities).map(entity => (
              <div key={entity.id} className="card-minimal group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entity.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        entity.role === 'protector' ? 'bg-green-500/20 text-green-600' :
                        entity.role === 'guide' ? 'bg-blue-500/20 text-blue-600' :
                        entity.role === 'intruder' ? 'bg-red-500/20 text-red-600' :
                        'bg-muted'
                      }`}>
                        {entity.role}
                      </span>
                    </div>
                    {entity.description && (
                      <p className="text-sm text-muted-foreground mt-2">{entity.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteEntity(entity.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {entity.dreamIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
                    {entity.dreamIds.slice(0, 5).map(id => (
                      <Link key={id} to={`/logs/${id}`} className="text-xs font-mono text-primary hover:underline">
                        {id}
                      </Link>
                    ))}
                    {entity.dreamIds.length > 5 && (
                      <span className="text-xs text-muted-foreground">+{entity.dreamIds.length - 5} more</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-3 mt-4">
          <Dialog open={showAddModule} onOpenChange={setShowAddModule}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Plus className="w-4 h-4" /> เพิ่ม Module ใหม่
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่ม System Module ใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="ชื่อ Module"
                  value={newModule.name}
                  onChange={(e) => setNewModule(prev => ({ ...prev, name: e.target.value }))}
                />
                <Select value={newModule.type} onValueChange={(v: 'time_activation' | 'safety_override' | 'distance_expansion' | 'other') => setNewModule(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time_activation">Time Activation</SelectItem>
                    <SelectItem value="safety_override">Safety Override</SelectItem>
                    <SelectItem value="distance_expansion">Distance Expansion</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="คำอธิบาย (optional)"
                  value={newModule.description}
                  onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                />
                <Button onClick={handleAddModule} className="w-full">บันทึก</Button>
              </div>
            </DialogContent>
          </Dialog>

          {filterBySearch(modules).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">ไม่พบข้อมูล</p>
          ) : (
            filterBySearch(modules).map(mod => (
              <div key={mod.id} className="card-minimal group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{mod.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                        {mod.type.replace('_', ' ')}
                      </span>
                    </div>
                    {mod.description && (
                      <p className="text-sm text-muted-foreground mt-2">{mod.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteModule(mod.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {mod.dreamIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
                    {mod.dreamIds.slice(0, 5).map(id => (
                      <Link key={id} to={`/logs/${id}`} className="text-xs font-mono text-primary hover:underline">
                        {id}
                      </Link>
                    ))}
                    {mod.dreamIds.length > 5 && (
                      <span className="text-xs text-muted-foreground">+{mod.dreamIds.length - 5} more</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>

        {/* Threats Tab */}
        <TabsContent value="threats" className="space-y-3 mt-4">
          <Dialog open={showAddThreat} onOpenChange={setShowAddThreat}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Plus className="w-4 h-4" /> เพิ่มภัยคุกคามใหม่
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่มภัยคุกคามใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="ชื่อภัยคุกคาม"
                  value={newThreat.name}
                  onChange={(e) => setNewThreat(prev => ({ ...prev, name: e.target.value }))}
                />
                <div>
                  <label className="text-sm">Level: {newThreat.level}/5</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={newThreat.level}
                    onChange={(e) => setNewThreat(prev => ({ ...prev, level: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 }))}
                    className="w-full"
                  />
                </div>
                <Textarea
                  placeholder="วิธีตอบสนอง (optional)"
                  value={newThreat.response}
                  onChange={(e) => setNewThreat(prev => ({ ...prev, response: e.target.value }))}
                />
                <Button onClick={handleAddThreat} className="w-full">บันทึก</Button>
              </div>
            </DialogContent>
          </Dialog>

          {filterBySearch(threats).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">ไม่พบข้อมูล</p>
          ) : (
            filterBySearch(threats).map(threat => (
              <div key={threat.id} className="card-minimal group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{threat.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        threat.level >= 4 ? 'bg-red-500/20 text-red-600' :
                        threat.level >= 3 ? 'bg-orange-500/20 text-orange-600' :
                        threat.level >= 2 ? 'bg-yellow-500/20 text-yellow-600' :
                        'bg-muted'
                      }`}>
                        Level {threat.level}
                      </span>
                    </div>
                    {threat.response && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <span className="font-medium">Response:</span> {threat.response}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteThreat(threat.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {threat.dreamIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
                    {threat.dreamIds.slice(0, 5).map(id => (
                      <Link key={id} to={`/logs/${id}`} className="text-xs font-mono text-primary hover:underline">
                        {id}
                      </Link>
                    ))}
                    {threat.dreamIds.length > 5 && (
                      <span className="text-xs text-muted-foreground">+{threat.dreamIds.length - 5} more</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
