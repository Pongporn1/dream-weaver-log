import { DreamLog } from "@/types/dream";
import { Link } from "react-router-dom";
import { Edit2 } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface DreamCardProps {
  dream: DreamLog;
  compact?: boolean;
  showEdit?: boolean;
}

// Threat level color schemes - gradient border + subtle background tint
const threatStyles: Record<number, { border: string; bg: string; badge: string }> = {
  0: {
    border: "border-l-4 border-l-muted-foreground/30",
    bg: "bg-card",
    badge: "bg-muted text-muted-foreground",
  },
  1: {
    border: "border-l-4 border-l-emerald-500",
    bg: "bg-gradient-to-r from-emerald-500/5 to-transparent",
    badge: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  },
  2: {
    border: "border-l-4 border-l-yellow-500",
    bg: "bg-gradient-to-r from-yellow-500/5 to-transparent",
    badge: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  },
  3: {
    border: "border-l-4 border-l-orange-500",
    bg: "bg-gradient-to-r from-orange-500/8 to-transparent",
    badge: "bg-orange-500/20 text-orange-700 dark:text-orange-400",
  },
  4: {
    border: "border-l-4 border-l-red-500",
    bg: "bg-gradient-to-r from-red-500/10 to-transparent",
    badge: "bg-red-500/20 text-red-700 dark:text-red-400",
  },
  5: {
    border: "border-l-4 border-l-rose-600",
    bg: "bg-gradient-to-r from-rose-600/15 to-transparent",
    badge: "bg-rose-600/25 text-rose-700 dark:text-rose-400 font-semibold",
  },
};

// Threat level icons/indicators
const threatIndicators: Record<number, string> = {
  0: "○",
  1: "◐",
  2: "◑",
  3: "◒",
  4: "◓",
  5: "●",
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

  const style = threatStyles[dream.threatLevel] || threatStyles[0];

  return (
    <div className="relative group">
      <Link
        to={`/logs/${dream.id}`}
        className={cn(
          "block rounded-lg p-4 transition-all duration-200",
          "border border-border hover:border-primary/30",
          "hover:shadow-md hover:-translate-y-0.5",
          style.border,
          style.bg
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground font-mono">
                {dream.id}
              </span>
              {/* Threat badge with level-specific styling */}
              <span
                className={cn(
                  "inline-flex items-center justify-center gap-1 px-2 py-0.5 text-xs rounded-full",
                  style.badge
                )}
              >
                <span className="text-[10px]">{threatIndicators[dream.threatLevel]}</span>
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
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
