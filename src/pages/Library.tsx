import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, FolderOpen, Folder, ChevronRight, ChevronDown, BookOpen, Users, Cog, AlertTriangle, FileText } from 'lucide-react';
import { getWorlds, getEntities, getModules, getThreats, addWorld, addEntity, addModule, addThreat, deleteWorld, deleteEntity, deleteModule, deleteThreat } from '@/lib/api';
import { World, Entity, SystemModule, ThreatEntry } from '@/types/dream';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

type FolderType = 'worlds' | 'entities' | 'modules' | 'threats';

interface FolderState {
  worlds: boolean;
  entities: boolean;
  modules: boolean;
  threats: boolean;
}

export default function Library() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [threats, setThreats] = useState<ThreatEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<FolderState>({
    worlds: true,
    entities: false,
    modules: false,
    threats: false
  });
  const [selectedItem, setSelectedItem] = useState<{ type: FolderType; id: string } | null>(null);

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

  const toggleFolder = (folder: FolderType) => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  // Add handlers
  const handleAddWorld = async () => {
    if (!newWorld.name.trim()) { toast.error('กรุณาใส่ชื่อโลก'); return; }
    const result = await addWorld(newWorld);
    if (result) {
      setWorlds(prev => [...prev, result]);
      setNewWorld({ name: '', type: 'transient', stability: 3, description: '' });
      setShowAddWorld(false);
      toast.success('เพิ่มโลกใหม่แล้ว');
    }
  };

  const handleAddEntity = async () => {
    if (!newEntity.name.trim()) { toast.error('กรุณาใส่ชื่อ Entity'); return; }
    const result = await addEntity(newEntity);
    if (result) {
      setEntities(prev => [...prev, result]);
      setNewEntity({ name: '', role: 'observer', description: '' });
      setShowAddEntity(false);
      toast.success('เพิ่ม Entity ใหม่แล้ว');
    }
  };

  const handleAddModule = async () => {
    if (!newModule.name.trim()) { toast.error('กรุณาใส่ชื่อ Module'); return; }
    const result = await addModule(newModule);
    if (result) {
      setModules(prev => [...prev, result]);
      setNewModule({ name: '', type: 'other', description: '' });
      setShowAddModule(false);
      toast.success('เพิ่ม Module ใหม่แล้ว');
    }
  };

  const handleAddThreat = async () => {
    if (!newThreat.name.trim()) { toast.error('กรุณาใส่ชื่อภัยคุกคาม'); return; }
    const result = await addThreat(newThreat);
    if (result) {
      setThreats(prev => [...prev, result]);
      setNewThreat({ name: '', level: 1, response: '' });
      setShowAddThreat(false);
      toast.success('เพิ่มภัยคุกคามใหม่แล้ว');
    }
  };

  // Delete handlers
  const handleDelete = async (type: FolderType, id: string) => {
    let success = false;
    switch (type) {
      case 'worlds': success = await deleteWorld(id); if (success) setWorlds(prev => prev.filter(w => w.id !== id)); break;
      case 'entities': success = await deleteEntity(id); if (success) setEntities(prev => prev.filter(e => e.id !== id)); break;
      case 'modules': success = await deleteModule(id); if (success) setModules(prev => prev.filter(m => m.id !== id)); break;
      case 'threats': success = await deleteThreat(id); if (success) setThreats(prev => prev.filter(t => t.id !== id)); break;
    }
    if (success) {
      toast.success('ลบแล้ว');
      setSelectedItem(null);
    }
  };

  // Filter by search
  const filterItems = <T extends { name: string; description?: string }>(items: T[]) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item => item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q));
  };

  // Get selected item details
  const getSelectedDetails = () => {
    if (!selectedItem) return null;
    switch (selectedItem.type) {
      case 'worlds': return worlds.find(w => w.id === selectedItem.id);
      case 'entities': return entities.find(e => e.id === selectedItem.id);
      case 'modules': return modules.find(m => m.id === selectedItem.id);
      case 'threats': return threats.find(t => t.id === selectedItem.id);
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>;
  }

  const folderConfig = [
    { key: 'worlds' as const, label: 'Worlds', icon: BookOpen, items: filterItems(worlds), color: 'text-blue-500', addDialog: showAddWorld, setAddDialog: setShowAddWorld },
    { key: 'entities' as const, label: 'Entities', icon: Users, items: filterItems(entities), color: 'text-green-500', addDialog: showAddEntity, setAddDialog: setShowAddEntity },
    { key: 'modules' as const, label: 'Modules', icon: Cog, items: filterItems(modules), color: 'text-purple-500', addDialog: showAddModule, setAddDialog: setShowAddModule },
    { key: 'threats' as const, label: 'Threats', icon: AlertTriangle, items: filterItems(threats), color: 'text-red-500', addDialog: showAddThreat, setAddDialog: setShowAddThreat },
  ];

  const selected = getSelectedDetails();

  return (
    <div className="py-4 h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <FolderOpen className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-xl font-semibold">Dream Library</h1>
          <p className="text-xs text-muted-foreground">คลังข้อมูลระบบความฝัน</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหา..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-9"
        />
      </div>

      {/* File Browser Layout */}
      <div className="flex gap-4 h-[calc(100%-120px)]">
        {/* Left Panel - Folder Tree */}
        <div className="w-1/2 border rounded-lg bg-card overflow-y-auto">
          <div className="p-2 border-b bg-muted/50">
            <span className="text-xs font-medium text-muted-foreground">แฟ้มทั้งหมด</span>
          </div>
          
          <div className="p-2 space-y-1">
            {folderConfig.map(folder => (
              <div key={folder.key}>
                {/* Folder Header */}
                <div
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer select-none"
                  onClick={() => toggleFolder(folder.key)}
                >
                  {expandedFolders[folder.key] ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  {expandedFolders[folder.key] ? (
                    <FolderOpen className={`w-4 h-4 ${folder.color}`} />
                  ) : (
                    <Folder className={`w-4 h-4 ${folder.color}`} />
                  )}
                  <span className="text-sm font-medium flex-1">{folder.label}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 rounded">
                    {folder.items.length}
                  </span>
                </div>

                {/* Folder Contents */}
                {expandedFolders[folder.key] && (
                  <div className="ml-6 space-y-0.5">
                    {folder.items.length === 0 ? (
                      <div className="text-xs text-muted-foreground py-2 px-2">ว่างเปล่า</div>
                    ) : (
                      folder.items.map((item: { id: string; name: string }) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-sm ${
                            selectedItem?.id === item.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelectedItem({ type: folder.key, id: item.id })}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="truncate">{item.name}</span>
                        </div>
                      ))
                    )}
                    {/* Add Button */}
                    <button
                      className="flex items-center gap-2 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-muted hover:text-foreground w-full"
                      onClick={() => folder.setAddDialog(true)}
                    >
                      <Plus className="w-3 h-3" />
                      <span>เพิ่มใหม่...</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Details */}
        <div className="w-1/2 border rounded-lg bg-card overflow-y-auto">
          <div className="p-2 border-b bg-muted/50">
            <span className="text-xs font-medium text-muted-foreground">รายละเอียด</span>
          </div>
          
          {selected ? (
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selected.name}</h3>
                  {selectedItem?.type === 'worlds' && (
                    <div className="flex gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${(selected as World).type === 'persistent' ? 'bg-blue-500/20 text-blue-600' : 'bg-muted'}`}>
                        {(selected as World).type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Stability: {'●'.repeat((selected as World).stability)}{'○'.repeat(5 - (selected as World).stability)}
                      </span>
                    </div>
                  )}
                  {selectedItem?.type === 'entities' && (
                    <span className={`text-xs px-2 py-0.5 rounded inline-block mt-1 ${
                      (selected as Entity).role === 'protector' ? 'bg-green-500/20 text-green-600' :
                      (selected as Entity).role === 'guide' ? 'bg-blue-500/20 text-blue-600' :
                      (selected as Entity).role === 'intruder' ? 'bg-red-500/20 text-red-600' :
                      'bg-muted'
                    }`}>
                      {(selected as Entity).role}
                    </span>
                  )}
                  {selectedItem?.type === 'modules' && (
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-600 inline-block mt-1">
                      {(selected as SystemModule).type.replace('_', ' ')}
                    </span>
                  )}
                  {selectedItem?.type === 'threats' && (
                    <span className={`text-xs px-2 py-0.5 rounded inline-block mt-1 ${
                      (selected as ThreatEntry).level >= 4 ? 'bg-red-500/20 text-red-600' :
                      (selected as ThreatEntry).level >= 3 ? 'bg-orange-500/20 text-orange-600' :
                      'bg-yellow-500/20 text-yellow-600'
                    }`}>
                      Level {(selected as ThreatEntry).level}
                    </span>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => selectedItem && handleDelete(selectedItem.type, selectedItem.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Description */}
              {selectedItem?.type !== 'threats' && 'description' in selected && selected.description && (
                <div>
                  <label className="text-xs text-muted-foreground">คำอธิบาย</label>
                  <p className="text-sm mt-1">{selected.description}</p>
                </div>
              )}

              {/* Response for threats */}
              {selectedItem?.type === 'threats' && (selected as ThreatEntry).response && (
                <div>
                  <label className="text-xs text-muted-foreground">วิธีตอบสนอง</label>
                  <p className="text-sm mt-1">{(selected as ThreatEntry).response}</p>
                </div>
              )}

              {/* Related Dreams */}
              {selected.dreamIds && selected.dreamIds.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground">ความฝันที่เกี่ยวข้อง ({selected.dreamIds.length})</label>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selected.dreamIds.map(id => (
                      <Link 
                        key={id} 
                        to={`/logs/${id}`} 
                        className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors"
                      >
                        {id}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>เลือกรายการเพื่อดูรายละเอียด</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Dialogs */}
      <Dialog open={showAddWorld} onOpenChange={setShowAddWorld}>
        <DialogContent>
          <DialogHeader><DialogTitle>เพิ่มโลกใหม่</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="ชื่อโลก" value={newWorld.name} onChange={(e) => setNewWorld(prev => ({ ...prev, name: e.target.value }))} />
            <Select value={newWorld.type} onValueChange={(v: 'persistent' | 'transient') => setNewWorld(prev => ({ ...prev, type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="persistent">Persistent (ถาวร)</SelectItem>
                <SelectItem value="transient">Transient (ชั่วคราว)</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <label className="text-sm">Stability: {newWorld.stability}/5</label>
              <input type="range" min="1" max="5" value={newWorld.stability} onChange={(e) => setNewWorld(prev => ({ ...prev, stability: parseInt(e.target.value) }))} className="w-full" />
            </div>
            <Textarea placeholder="คำอธิบาย (optional)" value={newWorld.description} onChange={(e) => setNewWorld(prev => ({ ...prev, description: e.target.value }))} />
            <Button onClick={handleAddWorld} className="w-full">บันทึก</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddEntity} onOpenChange={setShowAddEntity}>
        <DialogContent>
          <DialogHeader><DialogTitle>เพิ่ม Entity ใหม่</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="ชื่อ Entity" value={newEntity.name} onChange={(e) => setNewEntity(prev => ({ ...prev, name: e.target.value }))} />
            <Select value={newEntity.role} onValueChange={(v: 'observer' | 'protector' | 'guide' | 'intruder') => setNewEntity(prev => ({ ...prev, role: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="observer">Observer (ผู้สังเกต)</SelectItem>
                <SelectItem value="protector">Protector (ผู้ปกป้อง)</SelectItem>
                <SelectItem value="guide">Guide (ผู้นำทาง)</SelectItem>
                <SelectItem value="intruder">Intruder (ผู้บุกรุก)</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="คำอธิบาย (optional)" value={newEntity.description} onChange={(e) => setNewEntity(prev => ({ ...prev, description: e.target.value }))} />
            <Button onClick={handleAddEntity} className="w-full">บันทึก</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddModule} onOpenChange={setShowAddModule}>
        <DialogContent>
          <DialogHeader><DialogTitle>เพิ่ม System Module ใหม่</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="ชื่อ Module" value={newModule.name} onChange={(e) => setNewModule(prev => ({ ...prev, name: e.target.value }))} />
            <Select value={newModule.type} onValueChange={(v: 'time_activation' | 'safety_override' | 'distance_expansion' | 'other') => setNewModule(prev => ({ ...prev, type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="time_activation">Time Activation</SelectItem>
                <SelectItem value="safety_override">Safety Override</SelectItem>
                <SelectItem value="distance_expansion">Distance Expansion</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="คำอธิบาย (optional)" value={newModule.description} onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))} />
            <Button onClick={handleAddModule} className="w-full">บันทึก</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddThreat} onOpenChange={setShowAddThreat}>
        <DialogContent>
          <DialogHeader><DialogTitle>เพิ่มภัยคุกคามใหม่</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="ชื่อภัยคุกคาม" value={newThreat.name} onChange={(e) => setNewThreat(prev => ({ ...prev, name: e.target.value }))} />
            <div>
              <label className="text-sm">Level: {newThreat.level}/5</label>
              <input type="range" min="1" max="5" value={newThreat.level} onChange={(e) => setNewThreat(prev => ({ ...prev, level: parseInt(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5 }))} className="w-full" />
            </div>
            <Textarea placeholder="วิธีตอบสนอง (optional)" value={newThreat.response} onChange={(e) => setNewThreat(prev => ({ ...prev, response: e.target.value }))} />
            <Button onClick={handleAddThreat} className="w-full">บันทึก</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
