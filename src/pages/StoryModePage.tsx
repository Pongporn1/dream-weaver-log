import { useState, useEffect } from "react";
import { getDreamLogs, getWorlds, getEntities } from "@/lib/api";
import { DreamLog, World, Entity } from "@/types/dream";
import { StoryMode } from "@/pages/StoryMode";

export default function StoryModePage() {
  const [dreams, setDreams] = useState<DreamLog[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dreamsData, worldsData, entitiesData] = await Promise.all([
          getDreamLogs(),
          getWorlds(),
          getEntities(),
        ]);
        setDreams(dreamsData);
        setWorlds(worldsData);
        setEntities(entitiesData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-muted-foreground">กำลังโหลด...</div>
      </div>
    );
  }

  return <StoryMode dreams={dreams} worlds={worlds} entities={entities} />;
}
