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
  ChevronRight,
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
import { cn } from "@/lib/utils";

type CategoryType = "worlds" | "entities" | "modules" | "threats";

const categoryConfig = {
  worlds: {
    icon: Globe,
    label: "โลก",
    labelEn: "Worlds",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  entities: {
    icon: Users,
    label: "สิ่งมีชีวิต",
    labelEn: "Entities",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  modules: {
    icon: Cog,
    label: "โมดูล",
    labelEn: "Modules",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
  threats: {
    icon: AlertTriangle,
    label: "ภัยคุกคาม",
    labelEn: "Threats",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
};

export default function Library() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [threats, setThreats] = useState<ThreatEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<CategoryType>("worlds");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

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
  const filterItems = <T extends { name: string; description?: string | null }>(items: T[]) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  };

  // Get current items based on active tab
  const getCurrentItems = () => {
    switch (activeTab) {
      case "worlds":
        return filterItems(worlds);
      case "entities":
        return filterItems(entities);
      case "modules":
        return filterItems(modules);
      case "threats":
        return filterItems(threats);
    }
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
  const handleDelete = async (id: string) => {
    let success = false;
    switch (activeTab) {
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

  const handleAddClick = () => {
    switch (activeTab) {
      case "worlds":
        setShowAddWorld(true);
        break;
      case "entities":
        setShowAddEntity(true);
        break;
      case "modules":
        setShowAddModule(true);
        break;
      case "threats":
        setShowAddThreat(true);
        break;
    }
  };

  // Get selected item details
  const getSelectedDetails = () => {
    if (!selectedItem) return null;
    switch (activeTab) {
      case "worlds":
        return worlds.find((w) => w.id === selectedItem);
      case "entities":
        return entities.find((e) => e.id === selectedItem);
      case "modules":
        return modules.find((m) => m.id === selectedItem);
      case "threats":
        return threats.find((t) => t.id === selectedItem);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>
    );
  }

  const currentItems = getCurrentItems();
  const config = categoryConfig[activeTab];
  const selected = getSelectedDetails();

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold">Library</h1>
        </div>
        <Button size="sm" onClick={handleAddClick}>
          <Plus className="w-4 h-4 mr-1" />
          เพิ่ม
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-muted rounded-lg">
        {(Object.keys(categoryConfig) as CategoryType[]).map((cat) => {
          const cfg = categoryConfig[cat];
          const Icon = cfg.icon;
          const count = cat === "worlds" ? worlds.length : cat === "entities" ? entities.length : cat === "modules" ? modules.length : threats.length;
          return (
            <button
              key={cat}
              onClick={() => {
                setActiveTab(cat);
                setSelectedItem(null);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-medium transition-colors",
                activeTab === cat
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{cfg.label}</span>
              <span className="text-[10px] opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหา..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9"
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

      {/* Content */}
      <div className="space-y-2">
        {currentItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            ยังไม่มีข้อมูล
          </div>
        ) : (
          currentItems.map((item) => {
            const isSelected = selectedItem === item.id;
            return (
              <div key={item.id}>
                <button
                  onClick={() => setSelectedItem(isSelected ? null : item.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors",
                    isSelected
                      ? "bg-accent border-primary/20"
                      : "bg-card hover:bg-accent/50 border-transparent"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <config.icon className={cn("w-4 h-4", config.color)} />
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform",
                        isSelected && "rotate-90"
                      )}
                    />
                  </div>
                  
                  {/* Quick info badges */}
                  <div className="flex gap-2 mt-1.5 ml-6">
                    {activeTab === "worlds" && (
                      <>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {(item as World).type === "persistent" ? "Persistent" : "Transient"}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          Stability {(item as World).stability}/5
                        </span>
                      </>
                    )}
                    {activeTab === "entities" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                        {(item as Entity).role}
                      </span>
                    )}
                    {activeTab === "modules" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {(item as SystemModule).type.replace("_", " ")}
                      </span>
                    )}
                    {activeTab === "threats" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        Level {(item as ThreatEntry).level}
                      </span>
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isSelected && selected && (
                  <div className="mt-2 p-4 rounded-lg bg-muted/50 border text-sm space-y-3">
                    {/* Description */}
                    {"description" in selected && selected.description && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">คำอธิบาย</p>
                        <p>{selected.description}</p>
                      </div>
                    )}
                    
                    {/* Response for threats */}
                    {activeTab === "threats" && (selected as ThreatEntry).response && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">การตอบสนอง</p>
                        <p>{(selected as ThreatEntry).response}</p>
                      </div>
                    )}

                    {/* Delete button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      ลบ
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add World Dialog */}
      <Dialog open={showAddWorld} onOpenChange={setShowAddWorld}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มโลกใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="ชื่อโลก"
              value={newWorld.name}
              onChange={(e) => setNewWorld({ ...newWorld, name: e.target.value })}
            />
            <Select
              value={newWorld.type}
              onValueChange={(v) => setNewWorld({ ...newWorld, type: v as "persistent" | "transient" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="ประเภท" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="persistent">Persistent</SelectItem>
                <SelectItem value="transient">Transient</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <label className="text-sm text-muted-foreground">Stability: {newWorld.stability}</label>
              <input
                type="range"
                min="1"
                max="5"
                value={newWorld.stability}
                onChange={(e) => setNewWorld({ ...newWorld, stability: Number(e.target.value) })}
                className="w-full mt-1"
              />
            </div>
            <Textarea
              placeholder="คำอธิบาย (ถ้ามี)"
              value={newWorld.description}
              onChange={(e) => setNewWorld({ ...newWorld, description: e.target.value })}
            />
            <Button onClick={handleAddWorld} className="w-full">
              เพิ่ม
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Entity Dialog */}
      <Dialog open={showAddEntity} onOpenChange={setShowAddEntity}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่ม Entity ใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="ชื่อ Entity"
              value={newEntity.name}
              onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value })}
            />
            <Select
              value={newEntity.role}
              onValueChange={(v) => setNewEntity({ ...newEntity, role: v as Entity["role"] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="บทบาท" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="observer">Observer</SelectItem>
                <SelectItem value="protector">Protector</SelectItem>
                <SelectItem value="guide">Guide</SelectItem>
                <SelectItem value="intruder">Intruder</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="คำอธิบาย (ถ้ามี)"
              value={newEntity.description}
              onChange={(e) => setNewEntity({ ...newEntity, description: e.target.value })}
            />
            <Button onClick={handleAddEntity} className="w-full">
              เพิ่ม
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Module Dialog */}
      <Dialog open={showAddModule} onOpenChange={setShowAddModule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่ม Module ใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="ชื่อ Module"
              value={newModule.name}
              onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
            />
            <Select
              value={newModule.type}
              onValueChange={(v) => setNewModule({ ...newModule, type: v as SystemModule["type"] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="ประเภท" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time_activation">Time Activation</SelectItem>
                <SelectItem value="safety_override">Safety Override</SelectItem>
                <SelectItem value="distance_expansion">Distance Expansion</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="คำอธิบาย (ถ้ามี)"
              value={newModule.description}
              onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
            />
            <Button onClick={handleAddModule} className="w-full">
              เพิ่ม
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Threat Dialog */}
      <Dialog open={showAddThreat} onOpenChange={setShowAddThreat}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มภัยคุกคามใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="ชื่อภัยคุกคาม"
              value={newThreat.name}
              onChange={(e) => setNewThreat({ ...newThreat, name: e.target.value })}
            />
            <div>
              <label className="text-sm text-muted-foreground">Level: {newThreat.level}</label>
              <input
                type="range"
                min="0"
                max="5"
                value={newThreat.level}
                onChange={(e) => setNewThreat({ ...newThreat, level: Number(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5 })}
                className="w-full mt-1"
              />
            </div>
            <Textarea
              placeholder="การตอบสนอง (ถ้ามี)"
              value={newThreat.response}
              onChange={(e) => setNewThreat({ ...newThreat, response: e.target.value })}
            />
            <Button onClick={handleAddThreat} className="w-full">
              เพิ่ม
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
