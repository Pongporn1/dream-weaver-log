import { useMemo } from "react";
import { DreamLog, World } from "@/types/dream";
import { Map, MapPin, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  dreams: DreamLog[];
  worlds: World[];
}

interface WorldNode {
  world: World;
  dreamCount: number;
  connections: Record<string, number>;
  avgThreat: number;
  commonEntities: string[];
}

export function DreamUniverseMap({ dreams, worlds }: Props) {
  const worldMap = useMemo(() => {
    const nodeMap: Record<string, WorldNode> = {};

    // Initialize nodes
    worlds.forEach((world) => {
      const worldDreams = dreams.filter((d) => d.world === world.name);
      const avgThreat =
        worldDreams.length > 0
          ? worldDreams.reduce((sum, d) => sum + d.threatLevel, 0) /
            worldDreams.length
          : 0;

      // Get common entities in this world
      const entityCounts: Record<string, number> = {};
      worldDreams.forEach((d) => {
        d.entities.forEach((e) => {
          entityCounts[e] = (entityCounts[e] || 0) + 1;
        });
      });

      const commonEntities = Object.entries(entityCounts)
        .filter(([_, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .map(([entity]) => entity)
        .slice(0, 5);

      nodeMap[world.name] = {
        world,
        dreamCount: worldDreams.length,
        connections: {},
        avgThreat,
        commonEntities,
      };
    });

    // Find connections (sequential world transitions)
    const sortedDreams = [...dreams].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    for (let i = 0; i < sortedDreams.length - 1; i++) {
      const from = sortedDreams[i].world;
      const to = sortedDreams[i + 1].world;

      if (from !== to) {
        const node = nodeMap[from];
        if (node) {
          node.connections[to] = (node.connections[to] || 0) + 1;
        }
      }
    }

    return Object.values(nodeMap).sort((a, b) => b.dreamCount - a.dreamCount);
  }, [dreams, worlds]);

  if (worldMap.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Map className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>ยังไม่มีโลกในจักรวาลความฝัน</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Map className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">
          จักรวาลความฝัน ({worldMap.length} โลก)
        </h2>
      </div>

      {/* World Nodes */}
      <div className="grid md:grid-cols-2 gap-4">
        {worldMap.map((node) => (
          <div key={node.world.id} className="card-minimal space-y-3">
            {/* World Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h3 className="text-lg font-semibold">{node.world.name}</h3>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {node.world.type}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Stability: {node.world.stability}/5
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {node.dreamCount}
                </p>
                <p className="text-xs text-muted-foreground">ความฝัน</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 p-2 bg-secondary/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Avg Threat</p>
                <p
                  className={`text-sm font-semibold ${
                    node.avgThreat >= 4
                      ? "text-red-500"
                      : node.avgThreat >= 3
                        ? "text-orange-500"
                        : "text-foreground"
                  }`}
                >
                  {node.avgThreat.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Connections</p>
                <p className="text-sm font-semibold">
                  {Object.keys(node.connections).length}
                </p>
              </div>
            </div>

            {/* Common Entities */}
            {node.commonEntities.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  ตัวละครที่พบบ่อย:
                </p>
                <div className="flex flex-wrap gap-1">
                  {node.commonEntities.map((entity) => (
                    <Badge key={entity} variant="secondary" className="text-xs">
                      {entity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Connections */}
            {Object.keys(node.connections).length > 0 && (
              <div className="space-y-1 pt-2 border-t">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    เชื่อมต่อไปยัง:
                  </p>
                </div>
                <div className="space-y-1">
                  {Object.entries(node.connections)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([toWorld, count]) => (
                      <div
                        key={toWorld}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-muted-foreground">
                          → {toWorld}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {count}x
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Description */}
            {node.world.description && (
              <p className="text-xs text-muted-foreground pt-2 border-t">
                {node.world.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
