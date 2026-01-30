import { ChevronDown, ChevronUp } from "lucide-react";
import { DreamLog } from "@/types/dream";
import { AnimatedBookCover } from "@/components/AnimatedBookCover";

interface DateSectionProps {
  title: string;
  dreams: DreamLog[];
  colorClass: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function DateSection({ title, dreams, colorClass, isExpanded, onToggle }: DateSectionProps) {
  if (dreams.length === 0) return null;

  return (
    <section className="bg-card rounded-lg border">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-1 h-8 ${colorClass} rounded-full`} />
          <div className="text-left">
            <h2 className="text-sm font-semibold">{title}</h2>
            <p className="text-xs text-muted-foreground">
              {dreams.length} ความฝัน
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {dreams.map((dream, index) => (
              <div
                key={dream.id}
                className="animate-fade-in opacity-0"
                style={{
                  animationDelay: `${index * 80}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <AnimatedBookCover dream={dream} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
