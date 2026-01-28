import { useMemo } from "react";
import { DreamLog, World } from "@/types/dream";
import { Network, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface Props {
  dreams: DreamLog[];
  worlds: World[];
}

interface Connection {
  dream1: DreamLog;
  dream2: DreamLog;
  connections: string[];
  strength: number;
}

export function ConnectedDreams({ dreams, worlds }: Props) {
  const connections = useMemo(() => {
    const result: Connection[] = [];

    for (let i = 0; i < dreams.length; i++) {
      for (let j = i + 1; j < dreams.length; j++) {
        const d1 = dreams[i];
        const d2 = dreams[j];
        const conn: string[] = [];

        // Same world
        if (d1.world === d2.world) {
          conn.push(`โลกเดียวกัน: ${d1.world}`);
        }

        // Common entities
        const commonEntities = d1.entities.filter((e) =>
          d2.entities.includes(e),
        );
        if (commonEntities.length > 0) {
          conn.push(`ตัวละครเดียวกัน: ${commonEntities.join(", ")}`);
        }

        // Common environments
        const commonEnvs = d1.environments.filter((e) =>
          d2.environments.includes(e),
        );
        if (commonEnvs.length > 0) {
          conn.push(`สภาพแวดล้อมเดียวกัน: ${commonEnvs.join(", ")}`);
        }

        // Similar threat level
        if (Math.abs(d1.threatLevel - d2.threatLevel) <= 1) {
          conn.push(
            `ระดับภัยคุกคามใกล้เคียง (${d1.threatLevel}-${d2.threatLevel})`,
          );
        }

        // Same time system
        if (d1.timeSystem === d2.timeSystem && d1.timeSystem !== "unknown") {
          conn.push(`Time System: ${d1.timeSystem}`);
        }

        if (conn.length >= 2) {
          result.push({
            dream1: d1,
            dream2: d2,
            connections: conn,
            strength: conn.length,
          });
        }
      }
    }

    return result.sort((a, b) => b.strength - a.strength).slice(0, 15);
  }, [dreams]);

  if (connections.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Network className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>ยังไม่พบความฝันที่เชื่อมโยงกัน</p>
        <p className="text-sm mt-2">
          ลองบันทึกความฝันเพิ่มเติมเพื่อค้นหาความเชื่อมโยง
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Network className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">
          พบ {connections.length} ความเชื่อมโยง
        </h2>
      </div>

      {connections.map((conn, index) => (
        <div key={index} className="card-minimal">
          {/* Connection Strength */}
          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary" className="text-xs">
              ความเชื่อมโยง: {conn.strength} จุด
            </Badge>
          </div>

          {/* Dreams */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Dream 1 */}
            <Link to={`/logs/${conn.dream1.id}`}>
              <div className="p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span className="text-sm font-semibold">
                    {conn.dream1.world}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(conn.dream1.date).toLocaleDateString("th-TH")}
                </p>
                {conn.dream1.entities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {conn.dream1.entities.slice(0, 3).map((e) => (
                      <Badge key={e} variant="outline" className="text-xs">
                        {e}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Link>

            {/* Dream 2 */}
            <Link to={`/logs/${conn.dream2.id}`}>
              <div className="p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span className="text-sm font-semibold">
                    {conn.dream2.world}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(conn.dream2.date).toLocaleDateString("th-TH")}
                </p>
                {conn.dream2.entities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {conn.dream2.entities.slice(0, 3).map((e) => (
                      <Badge key={e} variant="outline" className="text-xs">
                        {e}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Connection Details */}
          <div className="mt-3 pt-3 border-t space-y-1">
            {conn.connections.map((connection, idx) => (
              <p
                key={idx}
                className="text-xs text-muted-foreground flex items-center gap-1.5"
              >
                <span className="w-1 h-1 rounded-full bg-primary" />
                {connection}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
