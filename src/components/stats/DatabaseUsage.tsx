import { Database, HardDrive, MapPin, Users, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DatabaseUsageProps {
  totalDreams: number;
  worldsCount: number;
  entitiesCount: number;
  threatsCount: number;
}

export function DatabaseUsage({ totalDreams, worldsCount, entitiesCount, threatsCount }: DatabaseUsageProps) {
  // Database usage estimation
  const estimatedSize = {
    dreams: totalDreams * 3,
    worlds: worldsCount * 0.5,
    entities: entitiesCount * 0.5,
    threats: threatsCount * 0.3,
    relations: totalDreams * 0.5,
  };
  
  const totalUsedKB = Object.values(estimatedSize).reduce((sum, val) => sum + val, 0);
  const totalUsedMB = totalUsedKB / 1024;
  const maxStorageMB = 500;
  const usagePercent = (totalUsedMB / maxStorageMB) * 100;
  const remainingMB = maxStorageMB - totalUsedMB;
  const estimatedCapacity = Math.floor(remainingMB / (totalUsedMB / totalDreams || 3)) + totalDreams;

  return (
    <div className="card-minimal space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Database Usage</h2>
        </div>
        <Badge variant="outline" className="text-xs">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
          Live
        </Badge>
      </div>

      {/* Storage Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Storage Used</span>
          <span className="font-semibold">{totalUsedMB.toFixed(2)} MB / {maxStorageMB} MB</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all rounded-full ${
              usagePercent > 80 ? "bg-red-500" :
              usagePercent > 60 ? "bg-orange-500" :
              usagePercent > 40 ? "bg-yellow-500" : "bg-green-500"
            }`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {usagePercent.toFixed(2)}% ใช้งานแล้ว • เหลือ {remainingMB.toFixed(2)} MB
        </p>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <HardDrive className="w-3 h-3" />Dream Logs
          </p>
          <p className="text-sm font-semibold">{estimatedSize.dreams.toFixed(1)} KB</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />Worlds
          </p>
          <p className="text-sm font-semibold">{estimatedSize.worlds.toFixed(1)} KB</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />Entities
          </p>
          <p className="text-sm font-semibold">{estimatedSize.entities.toFixed(1)} KB</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />Threats
          </p>
          <p className="text-sm font-semibold">{estimatedSize.threats.toFixed(1)} KB</p>
        </div>
      </div>

      {/* Capacity Info */}
      <div className="pt-2 border-t space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">ความจุโดยประมาณ</span>
          <span className="font-semibold text-primary">~{estimatedCapacity.toLocaleString()} logs</span>
        </div>
        <p className="text-xs text-muted-foreground">
          เพิ่มอีกได้ประมาณ {(estimatedCapacity - totalDreams).toLocaleString()} logs
        </p>
      </div>
    </div>
  );
}
