import { useMemo } from "react";
import { DreamLog } from "@/types/dream";
import { Network, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { findCommonValues, isLikelySame } from "@/lib/storyMatching";

interface Props {
  dreams: DreamLog[];
}

interface Connection {
  dream1: DreamLog;
  dream2: DreamLog;
  connections: string[];
  score: number;
}

export function ConnectedDreams({ dreams }: Props) {
  const connections = useMemo(() => {
    const result: Connection[] = [];
    const scoreWeights = {
      world: 3,
      entity: 2,
      environment: 1,
      threat: 1,
      timeSystem: 0.75,
      safety: 0.75,
      exit: 0.75,
    };
    const minimumScore = 3;

    for (let i = 0; i < dreams.length; i++) {
      for (let j = i + 1; j < dreams.length; j++) {
        const d1 = dreams[i];
        const d2 = dreams[j];
        const conn: string[] = [];
        let score = 0;

        // Same world
        const sameWorld = isLikelySame(d1.world, d2.world);
        if (sameWorld) {
          const worldLabel = d1.world || d2.world || "Unknown";
          conn.push(`โลกเดียวกัน: ${worldLabel}`);
          score += scoreWeights.world;
        }

        // Common entities
        const commonEntities = findCommonValues(d1.entities || [], d2.entities || []);
        if (commonEntities.length > 0) {
          conn.push(`ตัวละครเดียวกัน: ${commonEntities.join(", ")}`);
          score += Math.min(commonEntities.length, 3) * scoreWeights.entity;
        }

        // Common environments
        const commonEnvs = findCommonValues(
          d1.environments || [],
          d2.environments || [],
        );
        if (commonEnvs.length > 0) {
          conn.push(`สภาพแวดล้อมเดียวกัน: ${commonEnvs.join(", ")}`);
          score += Math.min(commonEnvs.length, 3) * scoreWeights.environment;
        }

        // Similar threat level
        if (Math.abs(d1.threatLevel - d2.threatLevel) <= 1) {
          conn.push(
            `ระดับภัยคุกคามใกล้เคียง (${d1.threatLevel}-${d2.threatLevel})`,
          );
          score += scoreWeights.threat;
        }

        // Same time system
        if (d1.timeSystem === d2.timeSystem && d1.timeSystem !== "unknown") {
          conn.push(`Time System: ${d1.timeSystem}`);
          score += scoreWeights.timeSystem;
        }

        // Same safety override
        if (
          d1.safetyOverride === d2.safetyOverride &&
          d1.safetyOverride !== "unknown" &&
          d1.safetyOverride !== "none"
        ) {
          conn.push(`Safety Override: ${d1.safetyOverride}`);
          score += scoreWeights.safety;
        }

        // Same exit type
        if (d1.exit === d2.exit && d1.exit !== "unknown") {
          conn.push(`Exit: ${d1.exit}`);
          score += scoreWeights.exit;
        }

        const hasStrongLink =
          sameWorld || commonEntities.length > 0 || commonEnvs.length > 0;

        if (hasStrongLink && score >= minimumScore) {
          result.push({
            dream1: d1,
            dream2: d2,
            connections: conn,
            score,
          });
        }
      }
    }

    return result.sort((a, b) => b.score - a.score).slice(0, 15);
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
        <div
          key={index}
          className="card-minimal border border-border/70 bg-card/90 backdrop-blur-sm"
        >
          {/* Connection Strength */}
          <div className="flex items-center justify-between mb-3">
            <Badge
              variant="secondary"
              className="border border-border/70 bg-background/80 text-xs text-foreground"
            >
              คะแนนเชื่อมโยง: {conn.score.toFixed(1)}
            </Badge>
          </div>

          {/* Dreams */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Dream 1 */}
            <Link to={`/logs/${conn.dream1.id}`}>
              <div className="rounded-lg border border-border/70 bg-card/75 p-3 text-foreground shadow-sm transition-colors hover:bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span className="text-sm font-semibold">
                    {conn.dream1.world}
                  </span>
                </div>
                <p className="text-xs text-foreground/70">
                  {new Date(conn.dream1.date).toLocaleDateString("th-TH")}
                </p>
                {conn.dream1.entities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {conn.dream1.entities.slice(0, 3).map((e) => (
                      <Badge
                        key={e}
                        variant="outline"
                        className="border-border/80 bg-background/70 text-xs text-foreground/90"
                      >
                        {e}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Link>

            {/* Dream 2 */}
            <Link to={`/logs/${conn.dream2.id}`}>
              <div className="rounded-lg border border-border/70 bg-card/75 p-3 text-foreground shadow-sm transition-colors hover:bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span className="text-sm font-semibold">
                    {conn.dream2.world}
                  </span>
                </div>
                <p className="text-xs text-foreground/70">
                  {new Date(conn.dream2.date).toLocaleDateString("th-TH")}
                </p>
                {conn.dream2.entities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {conn.dream2.entities.slice(0, 3).map((e) => (
                      <Badge
                        key={e}
                        variant="outline"
                        className="border-border/80 bg-background/70 text-xs text-foreground/90"
                      >
                        {e}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Connection Details */}
          <div className="mt-3 space-y-1 border-t border-border/70 pt-3">
            {conn.connections.map((connection, idx) => (
              <p
                key={idx}
                className="flex items-center gap-1.5 text-xs text-foreground/80"
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
