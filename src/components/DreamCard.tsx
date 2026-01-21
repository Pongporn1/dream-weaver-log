import { DreamLog } from "@/types/dream";
import { Link } from "react-router-dom";
import { Edit2 } from "lucide-react";
import { Button } from "./ui/button";

interface DreamCardProps {
  dream: DreamLog;
  compact?: boolean;
  showEdit?: boolean;
}

const threatColors: Record<number, string> = {
  0: "bg-muted text-muted-foreground",
  1: "bg-yellow-100 text-yellow-800",
  2: "bg-orange-100 text-orange-800",
  3: "bg-orange-200 text-orange-900",
  4: "bg-red-100 text-red-800",
  5: "bg-red-200 text-red-900",
};

export function DreamCard({
  dream,
  compact,
  showEdit = false,
}: DreamCardProps) {
  const formattedDate = new Date(dream.date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="relative">
      <Link
        to={`/logs/${dream.id}`}
        className="block card-minimal hover:border-primary/30 transition-colors"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground font-mono">
                {dream.id}
              </span>
              <span
                className={`threat-badge ${threatColors[dream.threatLevel]}`}
              >
                {dream.threatLevel}
              </span>
            </div>
            <p className="font-medium truncate">{dream.world}</p>
            {!compact && dream.notes && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {dream.notes}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
            <p className="text-xs text-muted-foreground">{dream.wakeTime}</p>
          </div>
        </div>
        {!compact && dream.environments.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {dream.environments.slice(0, 4).map((env) => (
              <span key={env} className="tag">
                {env}
              </span>
            ))}
            {dream.environments.length > 4 && (
              <span className="tag">+{dream.environments.length - 4}</span>
            )}
          </div>
        )}
      </Link>
      {showEdit && (
        <Link
          to={`/logs/${dream.id}`}
          className="absolute top-2 right-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background"
          >
            <Edit2 className="w-3 h-3" />
          </Button>
        </Link>
      )}
    </div>
  );
}
