import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { getWorlds, getEntities, getModules, getThreats } from '@/lib/store';
import { World, Entity, SystemModule, ThreatEntry } from '@/types/dream';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Library() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [threats, setThreats] = useState<ThreatEntry[]>([]);
  const [activeTab, setActiveTab] = useState('worlds');

  useEffect(() => {
    setWorlds(getWorlds());
    setEntities(getEntities());
    setModules(getModules());
    setThreats(getThreats());
  }, []);

  return (
    <div className="py-4 space-y-4">
      <h1>Dream System Library</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="worlds" className="text-xs">Worlds</TabsTrigger>
          <TabsTrigger value="entities" className="text-xs">Entities</TabsTrigger>
          <TabsTrigger value="modules" className="text-xs">Modules</TabsTrigger>
          <TabsTrigger value="threats" className="text-xs">Threats</TabsTrigger>
        </TabsList>

        <TabsContent value="worlds" className="space-y-2 mt-4">
          {worlds.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">ไม่มีข้อมูล</p>
          ) : (
            worlds.map(world => (
              <div key={world.id} className="card-minimal">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{world.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {world.type} • Stability: {world.stability}
                    </p>
                  </div>
                  <span className="tag">{world.dreamIds.length} logs</span>
                </div>
                {world.description && (
                  <p className="text-sm text-muted-foreground mt-2">{world.description}</p>
                )}
                {world.dreamIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {world.dreamIds.map(id => (
                      <span key={id} className="text-xs font-mono text-primary">{id}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="entities" className="space-y-2 mt-4">
          {entities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">ไม่มีข้อมูล</p>
          ) : (
            entities.map(entity => (
              <div key={entity.id} className="card-minimal">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{entity.name}</p>
                    <p className="text-xs text-muted-foreground">{entity.role}</p>
                  </div>
                  <span className="tag">{entity.dreamIds.length} logs</span>
                </div>
                {entity.dreamIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entity.dreamIds.map(id => (
                      <span key={id} className="text-xs font-mono text-primary">{id}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="modules" className="space-y-2 mt-4">
          {modules.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">ไม่มีข้อมูล</p>
          ) : (
            modules.map(mod => (
              <div key={mod.id} className="card-minimal">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{mod.name}</p>
                    <p className="text-xs text-muted-foreground">{mod.type.replace('_', ' ')}</p>
                  </div>
                  <span className="tag">{mod.dreamIds.length} logs</span>
                </div>
                {mod.dreamIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {mod.dreamIds.map(id => (
                      <span key={id} className="text-xs font-mono text-primary">{id}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="threats" className="space-y-2 mt-4">
          {threats.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">ไม่มีข้อมูล</p>
          ) : (
            threats.map(threat => (
              <div key={threat.id} className="card-minimal">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{threat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Level {threat.level} {threat.response && `• ${threat.response}`}
                    </p>
                  </div>
                  <span className="tag">{threat.dreamIds.length} logs</span>
                </div>
                {threat.dreamIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {threat.dreamIds.map(id => (
                      <span key={id} className="text-xs font-mono text-primary">{id}</span>
                    ))}
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
