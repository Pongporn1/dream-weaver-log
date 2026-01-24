import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Search,
  Globe,
  Users,
  Cog,
  AlertTriangle,
  BookOpen,
  X,
  ChevronLeft,
} from "lucide-react";
import {
  getWorlds,
  getEntities,
  getModules,
  getThreats,
  addWorld,
  addEntity,
  addModule,
  addThreat,
  deleteWorld,
  deleteEntity,
  deleteModule,
  deleteThreat,
} from "@/lib/api";
import { World, Entity, SystemModule, ThreatEntry } from "@/types/dream";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type CategoryType = "worlds" | "entities" | "modules" | "threats";

// Book spine colors based on category
const categoryStyles = {
  worlds: {
    gradient: "from-blue-600 to-indigo-700",
    accent: "bg-blue-500",
    text: "text-blue-100",
    icon: Globe,
    label: "โลก",
    labelEn: "Worlds",
  },
  entities: {
    gradient: "from-emerald-600 to-teal-700",
    accent: "bg-emerald-500",
    text: "text-emerald-100",
    icon: Users,
    label: "สิ่งมีชีวิต",
    labelEn: "Entities",
  },
  modules: {
    gradient: "from-purple-600 to-violet-700",
    accent: "bg-purple-500",
    text: "text-purple-100",
    icon: Cog,
    label: "โมดูล",
    labelEn: "Modules",
  },
  threats: {
    gradient: "from-red-600 to-rose-700",
    accent: "bg-red-500",
    text: "text-red-100",
    icon: AlertTriangle,
    label: "ภัยคุกคาม",
    labelEn: "Threats",
  },
};

// Book spine component - looks like book on a shelf
function BookSpine({
  item,
  category,
  isSelected,
  onClick,
}: {
  item: { id: string; name: string };
  category: CategoryType;
  isSelected: boolean;
  onClick: () => void;
}) {
  const style = categoryStyles[category];
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative h-32 w-10 flex-shrink-0 rounded-sm transition-all duration-200 cursor-pointer",
        "bg-gradient-to-b shadow-md hover:shadow-lg",
        style.gradient,
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background -translate-y-2",
        !isSelected && "hover:-translate-y-1"
      )}
    >
      {/* Book spine texture */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Top edge highlight */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-t-sm" />
      
      {/* Book title - vertical text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "text-[10px] font-medium writing-mode-vertical transform rotate-180 truncate max-h-24 px-1",
            style.text
          )}
          style={{ writingMode: "vertical-rl" }}
        >
          {item.name}
        </span>
      </div>
      
      {/* Bottom label strip */}
      <div className={cn("absolute bottom-1 left-1 right-1 h-1 rounded-full", style.accent, "opacity-60")} />
    </button>
  );
}

// Bookshelf section
function BookshelfSection({
  category,
  items,
  selectedId,
  onSelect,
  onAdd,
}: {
  category: CategoryType;
  items: { id: string; name: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}) {
  const style = categoryStyles[category];
  const Icon = style.icon;

  return (
    <div className="space-y-2">
      {/* Shelf label */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", `text-${category === 'worlds' ? 'blue' : category === 'entities' ? 'emerald' : category === 'modules' ? 'purple' : 'red'}-500`)} />
          <span className="text-sm font-medium">{style.label}</span>
          <span className="text-xs text-muted-foreground">({items.length})</span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onAdd}>
          <Plus className="w-3 h-3 mr-1" />
          เพิ่ม
        </Button>
      </div>
      
      {/* Shelf with books */}
      <div className="relative">
        {/* Shelf board */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-b from-amber-800 to-amber-900 rounded-sm shadow-md" />
        <div className="absolute bottom-2 left-0 right-0 h-1 bg-amber-700/50" />
        
        {/* Books container */}
        <div className="relative pb-3 px-2 flex gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent min-h-[140px]">
          {items.length === 0 ? (
            <div className="flex items-center justify-center w-full text-muted-foreground text-xs">
              ว่างเปล่า
            </div>
          ) : (
            items.map((item) => (
              <BookSpine
                key={item.id}
                item={item}
                category={category}
                isSelected={selectedId === item.id}
                onClick={() => onSelect(item.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Library() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [threats, setThreats] = useState<ThreatEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<{
    type: CategoryType;
    id: string;
  } | null>(null);

  // Dialog states
  const [showAddWorld, setShowAddWorld] = useState(false);
  const [showAddEntity, setShowAddEntity] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddThreat, setShowAddThreat] = useState(false);

  // Form states
  const [newWorld, setNewWorld] = useState<{
    name: string;
    type: "persistent" | "transient";
    stability: number;
    description: string;
  }>({ name: "", type: "transient", stability: 3, description: "" });
  const [newEntity, setNewEntity] = useState<{
    name: string;
    role: "observer" | "protector" | "guide" | "intruder";
    description: string;
  }>({ name: "", role: "observer", description: "" });
  const [newModule, setNewModule] = useState<{
    name: string;
    type: "time_activation" | "safety_override" | "distance_expansion" | "other";
    description: string;
  }>({ name: "", type: "other", description: "" });
  const [newThreat, setNewThreat] = useState<{
    name: string;
    level: 0 | 1 | 2 | 3 | 4 | 5;
    response: string;
  }>({ name: "", level: 1, response: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [worldsData, entitiesData, modulesData, threatsData] = await Promise.all([
        getWorlds(),
        getEntities(),
        getModules(),
        getThreats(),
      ]);
      setWorlds(worldsData);
      setEntities(entitiesData);
      setModules(modulesData);
      setThreats(threatsData);
    } catch (error) {
      console.error("Error loading library:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter items by search
  const filterItems = <T extends { name: string; description?: string }>(items: T[]) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  };

  // Add handlers
  const handleAddWorld = async () => {
    if (!newWorld.name.trim()) {
      toast.error("กรุณาใส่ชื่อโลก");
      return;
    }
    const result = await addWorld(newWorld);
    if (result) {
      setWorlds((prev) => [...prev, result]);
      setNewWorld({ name: "", type: "transient", stability: 3, description: "" });
      setShowAddWorld(false);
      toast.success("เพิ่มโลกใหม่แล้ว");
    }
  };

  const handleAddEntity = async () => {
    if (!newEntity.name.trim()) {
      toast.error("กรุณาใส่ชื่อ Entity");
      return;
    }
    const result = await addEntity(newEntity);
    if (result) {
      setEntities((prev) => [...prev, result]);
      setNewEntity({ name: "", role: "observer", description: "" });
      setShowAddEntity(false);
      toast.success("เพิ่ม Entity ใหม่แล้ว");
    }
  };

  const handleAddModule = async () => {
    if (!newModule.name.trim()) {
      toast.error("กรุณาใส่ชื่อ Module");
      return;
    }
    const result = await addModule(newModule);
    if (result) {
      setModules((prev) => [...prev, result]);
      setNewModule({ name: "", type: "other", description: "" });
      setShowAddModule(false);
      toast.success("เพิ่ม Module ใหม่แล้ว");
    }
  };

  const handleAddThreat = async () => {
    if (!newThreat.name.trim()) {
      toast.error("กรุณาใส่ชื่อภัยคุกคาม");
      return;
    }
    const result = await addThreat(newThreat);
    if (result) {
      setThreats((prev) => [...prev, result]);
      setNewThreat({ name: "", level: 1, response: "" });
      setShowAddThreat(false);
      toast.success("เพิ่มภัยคุกคามใหม่แล้ว");
    }
  };

  // Delete handlers
  const handleDelete = async (type: CategoryType, id: string) => {
    let success = false;
    switch (type) {
      case "worlds":
        success = await deleteWorld(id);
        if (success) setWorlds((prev) => prev.filter((w) => w.id !== id));
        break;
      case "entities":
        success = await deleteEntity(id);
        if (success) setEntities((prev) => prev.filter((e) => e.id !== id));
        break;
      case "modules":
        success = await deleteModule(id);
        if (success) setModules((prev) => prev.filter((m) => m.id !== id));
        break;
      case "threats":
        success = await deleteThreat(id);
        if (success) setThreats((prev) => prev.filter((t) => t.id !== id));
        break;
    }
    if (success) {
      toast.success("ลบแล้ว");
      setSelectedItem(null);
    }
  };

  // Get selected item details
  const getSelectedDetails = () => {
    if (!selectedItem) return null;
    switch (selectedItem.type) {
      case "worlds":
        return worlds.find((w) => w.id === selectedItem.id);
      case "entities":
        return entities.find((e) => e.id === selectedItem.id);
      case "modules":
        return modules.find((m) => m.id === selectedItem.id);
      case "threats":
        return threats.find((t) => t.id === selectedItem.id);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>
    );
  }

  const selected = getSelectedDetails();
  const selectedStyle = selectedItem ? categoryStyles[selectedItem.type] : null;

  return (
    <div className="py-4 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-xl font-semibold">Dream Library</h1>
          <p className="text-xs text-muted-foreground">ห้องสมุดความฝัน</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหาในห้องสมุด..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setSearchQuery("")}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Bookshelves - Main View or Detail View */}
      {!selected ? (
        <div className="space-y-6">
          {/* Bookcase frame */}
          <div className="relative bg-gradient-to-b from-amber-950/20 to-amber-900/30 rounded-lg p-4 border border-amber-800/30">
            {/* Bookcase sides */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-amber-800 to-amber-900 rounded-l-lg" />
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-amber-800 to-amber-900 rounded-r-lg" />
            
            <div className="space-y-6 px-2">
              <BookshelfSection
                category="worlds"
                items={filterItems(worlds)}
                selectedId={selectedItem?.type === "worlds" ? selectedItem.id : null}
                onSelect={(id) => setSelectedItem({ type: "worlds", id })}
                onAdd={() => setShowAddWorld(true)}
              />
              
              <BookshelfSection
                category="entities"
                items={filterItems(entities)}
                selectedId={selectedItem?.type === "entities" ? selectedItem.id : null}
                onSelect={(id) => setSelectedItem({ type: "entities", id })}
                onAdd={() => setShowAddEntity(true)}
              />
              
              <BookshelfSection
                category="modules"
                items={filterItems(modules)}
                selectedId={selectedItem?.type === "modules" ? selectedItem.id : null}
                onSelect={(id) => setSelectedItem({ type: "modules", id })}
                onAdd={() => setShowAddModule(true)}
              />
              
              <BookshelfSection
                category="threats"
                items={filterItems(threats)}
                selectedId={selectedItem?.type === "threats" ? selectedItem.id : null}
                onSelect={(id) => setSelectedItem({ type: "threats", id })}
                onAdd={() => setShowAddThreat(true)}
              />
            </div>
          </div>
        </div>
      ) : (
        // Detail View - Open Book
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedItem(null)}
            className="mb-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            กลับไปชั้นหนังสือ
          </Button>

          {/* Open book design */}
          <div className={cn(
            "relative rounded-lg overflow-hidden shadow-xl",
            "bg-gradient-to-br",
            selectedStyle?.gradient
          )}>
            {/* Book cover texture */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,white_1px,transparent_1px)] bg-[length:20px_20px]" />
            
            {/* Content */}
            <div className="relative p-6 text-white">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedStyle && <selectedStyle.icon className="w-5 h-5 opacity-80" />}
                    <span className="text-xs uppercase tracking-wider opacity-70">
                      {selectedStyle?.labelEn}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">{selected.name}</h2>
                  
                  {/* Type badges */}
                  {selectedItem?.type === "worlds" && (
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 rounded bg-white/20 backdrop-blur">
                        {(selected as World).type === "persistent" ? "🌟 Persistent" : "✨ Transient"}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-white/20 backdrop-blur">
                        Stability: {"●".repeat((selected as World).stability)}{"○".repeat(5 - (selected as World).stability)}
                      </span>
                    </div>
                  )}
                  
                  {selectedItem?.type === "entities" && (
                    <span className="inline-block text-xs px-2 py-1 rounded bg-white/20 backdrop-blur mt-2">
                      {(selected as Entity).role === "protector" ? "🛡️" : 
                       (selected as Entity).role === "guide" ? "🧭" :
                       (selected as Entity).role === "intruder" ? "⚠️" : "👁️"} {(selected as Entity).role}
                    </span>
                  )}
                  
                  {selectedItem?.type === "modules" && (
                    <span className="inline-block text-xs px-2 py-1 rounded bg-white/20 backdrop-blur mt-2">
                      ⚙️ {(selected as SystemModule).type.replace("_", " ")}
                    </span>
                  )}
                  
                  {selectedItem?.type === "threats" && (
                    <span className="inline-block text-xs px-2 py-1 rounded bg-white/20 backdrop-blur mt-2">
                      ⚡ Level {(selected as ThreatEntry).level}/5
                    </span>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/20"
                  onClick={() => selectedItem && handleDelete(selectedItem.type, selectedItem.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Description */}
              {selectedItem?.type !== "threats" && "description" in selected && selected.description && (
                <div className="mb-6">
                  <label className="text-xs uppercase tracking-wider opacity-70 block mb-2">
                    คำอธิบาย
                  </label>
                  <p className="text-sm leading-relaxed bg-white/10 rounded-lg p-4 backdrop-blur">
                    {selected.description}
                  </p>
                </div>
              )}

              {/* Response for threats */}
              {selectedItem?.type === "threats" && (selected as ThreatEntry).response && (
                <div className="mb-6">
                  <label className="text-xs uppercase tracking-wider opacity-70 block mb-2">
                    วิธีตอบสนอง
                  </label>
                  <p className="text-sm leading-relaxed bg-white/10 rounded-lg p-4 backdrop-blur">
                    {(selected as ThreatEntry).response}
                  </p>
                </div>
              )}

              {/* Related Dreams */}
              {selected.dreamIds && selected.dreamIds.length > 0 && (
                <div>
                  <label className="text-xs uppercase tracking-wider opacity-70 block mb-2">
                    ความฝันที่เกี่ยวข้อง ({selected.dreamIds.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selected.dreamIds.map((id) => (
                      <Link
                        key={id}
                        to={`/logs/${id}`}
                        className="text-xs font-mono bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors backdrop-blur"
                      >
                        {id}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Dialogs */}
      <Dialog open={showAddWorld} onOpenChange={setShowAddWorld}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              เพิ่มโลกใหม่
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="ชื่อโลก"
              value={newWorld.name}
              onChange={(e) => setNewWorld((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Select
              value={newWorld.type}
              onValueChange={(v: "persistent" | "transient") =>
                setNewWorld((prev) => ({ ...prev, type: v }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="persistent">🌟 Persistent (ถาวร)</SelectItem>
                <SelectItem value="transient">✨ Transient (ชั่วคราว)</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <label className="text-sm">Stability: {newWorld.stability}/5</label>
              <input
                type="range"
                min="1"
                max="5"
                value={newWorld.stability}
                onChange={(e) =>
                  setNewWorld((prev) => ({ ...prev, stability: parseInt(e.target.value) }))
                }
                className="w-full"
              />
            </div>
            <Textarea
              placeholder="คำอธิบาย (optional)"
              value={newWorld.description}
              onChange={(e) => setNewWorld((prev) => ({ ...prev, description: e.target.value }))}
            />
            <Button onClick={handleAddWorld} className="w-full">
              บันทึก
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddEntity} onOpenChange={setShowAddEntity}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              เพิ่ม Entity ใหม่
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="ชื่อ Entity"
              value={newEntity.name}
              onChange={(e) => setNewEntity((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Select
              value={newEntity.role}
              onValueChange={(v: "observer" | "protector" | "guide" | "intruder") =>
                setNewEntity((prev) => ({ ...prev, role: v }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="observer">👁️ Observer (ผู้สังเกต)</SelectItem>
                <SelectItem value="protector">🛡️ Protector (ผู้ปกป้อง)</SelectItem>
                <SelectItem value="guide">🧭 Guide (ผู้นำทาง)</SelectItem>
                <SelectItem value="intruder">⚠️ Intruder (ผู้บุกรุก)</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="คำอธิบาย (optional)"
              value={newEntity.description}
              onChange={(e) => setNewEntity((prev) => ({ ...prev, description: e.target.value }))}
            />
            <Button onClick={handleAddEntity} className="w-full">
              บันทึก
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddModule} onOpenChange={setShowAddModule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cog className="w-5 h-5 text-purple-500" />
              เพิ่ม System Module ใหม่
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="ชื่อ Module"
              value={newModule.name}
              onChange={(e) => setNewModule((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Select
              value={newModule.type}
              onValueChange={(v: "time_activation" | "safety_override" | "distance_expansion" | "other") =>
                setNewModule((prev) => ({ ...prev, type: v }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time_activation">⏰ Time Activation</SelectItem>
                <SelectItem value="safety_override">🛡️ Safety Override</SelectItem>
                <SelectItem value="distance_expansion">🌌 Distance Expansion</SelectItem>
                <SelectItem value="other">📦 Other</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="คำอธิบาย (optional)"
              value={newModule.description}
              onChange={(e) => setNewModule((prev) => ({ ...prev, description: e.target.value }))}
            />
            <Button onClick={handleAddModule} className="w-full">
              บันทึก
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddThreat} onOpenChange={setShowAddThreat}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              เพิ่มภัยคุกคามใหม่
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="ชื่อภัยคุกคาม"
              value={newThreat.name}
              onChange={(e) => setNewThreat((prev) => ({ ...prev, name: e.target.value }))}
            />
            <div>
              <label className="text-sm">Level: {newThreat.level}/5</label>
              <input
                type="range"
                min="1"
                max="5"
                value={newThreat.level}
                onChange={(e) =>
                  setNewThreat((prev) => ({
                    ...prev,
                    level: parseInt(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5,
                  }))
                }
                className="w-full"
              />
            </div>
            <Textarea
              placeholder="วิธีตอบสนอง (optional)"
              value={newThreat.response}
              onChange={(e) => setNewThreat((prev) => ({ ...prev, response: e.target.value }))}
            />
            <Button onClick={handleAddThreat} className="w-full">
              บันทึก
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
