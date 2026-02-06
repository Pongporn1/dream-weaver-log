import { useMemo, useState } from "react";
import { DreamLog } from "@/types/dream";
import { Link } from "react-router-dom";

interface DreamMapProps {
  dreams: DreamLog[];
}

interface WorldNode {
  id: string;
  name: string;
  count: number;
  avgThreat: number;
  dreams: DreamLog[];
  x: number;
  y: number;
}

interface WorldConnection {
  from: string;
  to: string;
  count: number;
}

export function DreamMap({ dreams }: DreamMapProps) {
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);

  // Calculate world nodes
  const worldNodes = useMemo(() => {
    const worldMap = new Map<string, WorldNode>();

    dreams.forEach((dream) => {
      const worldName = dream.world || "Unknown";

      if (!worldMap.has(worldName)) {
        worldMap.set(worldName, {
          id: worldName,
          name: worldName,
          count: 0,
          avgThreat: 0,
          dreams: [],
          x: 0,
          y: 0,
        });
      }

      const node = worldMap.get(worldName)!;
      node.count++;
      node.avgThreat += dream.threatLevel;
      node.dreams.push(dream);
    });

    // Calculate average threat
    worldMap.forEach((node) => {
      node.avgThreat = node.avgThreat / node.count;
    });

    // Position nodes in a circle
    const nodes = Array.from(worldMap.values());
    const centerX = 300;
    const centerY = 250;
    const radius = 180;

    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });

    return nodes;
  }, [dreams]);

  // Calculate connections (sequential dreams)
  const connections = useMemo(() => {
    const connMap = new Map<string, WorldConnection>();

    const sortedDreams = [...dreams].sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    for (let i = 0; i < sortedDreams.length - 1; i++) {
      const from = sortedDreams[i].world || "Unknown";
      const to = sortedDreams[i + 1].world || "Unknown";

      if (from === to) continue; // Skip same world

      const key = `${from}->${to}`;
      if (!connMap.has(key)) {
        connMap.set(key, { from, to, count: 0 });
      }
      connMap.get(key)!.count++;
    }

    return Array.from(connMap.values());
  }, [dreams]);

  const getThreatColor = (threat: number) => {
    if (threat <= 1) return "#22c55e"; // green
    if (threat <= 2) return "#eab308"; // yellow
    if (threat <= 3) return "#f97316"; // orange
    if (threat <= 4) return "#ef4444"; // red
    return "#dc2626"; // dark red
  };

  const getNodeSize = (count: number, maxCount: number) => {
    const minSize = 20;
    const maxSize = 50;
    const ratio = count / maxCount;
    return minSize + ratio * (maxSize - minSize);
  };

  const maxCount = Math.max(...worldNodes.map((n) => n.count), 1);

  const selectedNode = worldNodes.find((n) => n.id === selectedWorld);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">แผนที่โลกในฝัน</h2>
        <div className="text-sm text-muted-foreground">
          {worldNodes.length} โลก • {connections.length} เส้นทาง
        </div>
      </div>

      {/* SVG Map */}
      <div className="card-minimal p-4 sm:p-6">
        <svg
          viewBox="0 0 600 500"
          className="w-full h-auto"
          style={{ minHeight: "400px" }}
        >
          {/* Connections */}
          <g className="connections">
            {connections.map((conn, i) => {
              const fromNode = worldNodes.find((n) => n.id === conn.from);
              const toNode = worldNodes.find((n) => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              return (
                <line
                  key={i}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="currentColor"
                  strokeWidth={Math.min(conn.count * 0.5 + 1, 4)}
                  strokeOpacity={0.2}
                  className="text-muted-foreground"
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {worldNodes.map((node) => {
              const size = getNodeSize(node.count, maxCount);
              const color = getThreatColor(node.avgThreat);
              const isSelected = selectedWorld === node.id;

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedWorld(node.id)}
                  style={{ cursor: "pointer" }}
                  className="transition-all"
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={size / 2}
                    fill={color}
                    opacity={isSelected ? 1 : 0.8}
                    stroke="currentColor"
                    strokeWidth={isSelected ? 3 : 1}
                    className={isSelected ? "text-foreground" : "text-border"}
                  />
                  <text
                    x={node.x}
                    y={node.y + size / 2 + 16}
                    textAnchor="middle"
                    fontSize="12"
                    fill="currentColor"
                    className={
                      isSelected
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {node.name.length > 12
                      ? node.name.slice(0, 12) + "..."
                      : node.name}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fontSize="14"
                    fill="white"
                    fontWeight="bold"
                  >
                    {node.count}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="card-minimal p-3 sm:p-4">
        <div className="text-sm font-medium mb-2">สีตามระดับภัยคุกคาม</div>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">ปลอดภัย (0-1)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">ระวัง (2)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">อันตราย (3)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">วิกฤต (4-5)</span>
          </div>
        </div>
      </div>

      {/* Selected world details */}
      {selectedNode && (
        <div className="card-minimal p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold">{selectedNode.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedNode.count} ฝัน • ภัยคุกคามเฉลี่ย:{" "}
                {selectedNode.avgThreat.toFixed(1)}
              </p>
            </div>
            <button
              onClick={() => setSelectedWorld(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedNode.dreams.slice(0, 5).map((dream) => (
              <Link
                key={dream.id}
                to={`/dream/${dream.id}`}
                className="block text-sm border border-border rounded p-2 hover:bg-accent transition-colors"
              >
                <div className="font-medium line-clamp-1">
                  {dream.notes || "ไม่มีโน้ต"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {dream.date
                    ? new Date(dream.date).toLocaleDateString("th-TH")
                    : "ไม่ระบุวันที่"}
                </div>
              </Link>
            ))}
            {selectedNode.count > 5 && (
              <div className="text-xs text-muted-foreground text-center py-1">
                +{selectedNode.count - 5} ฝันอื่นๆ
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
