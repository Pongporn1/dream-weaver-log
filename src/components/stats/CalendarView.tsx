import { useState, useMemo } from "react";
import { DreamLog, DREAM_TYPE_LABELS } from "@/types/dream";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface CalendarViewProps {
  dreams: DreamLog[];
}

export function CalendarView({ dreams }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and total days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  // Create calendar grid
  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];

    // Add empty cells before first day
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [year, month, daysInMonth, startDayOfWeek]);

  // Group dreams by date
  const dreamsByDate = useMemo(() => {
    const map = new Map<string, DreamLog[]>();

    dreams.forEach((dream) => {
      if (dream.date) {
        const dateKey = dream.date.split("T")[0]; // YYYY-MM-DD
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(dream);
      }
    });

    return map;
  }, [dreams]);

  const formatDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getDreamTypesForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    const dreamsOnDate = dreamsByDate.get(dateKey) || [];
    const types = new Set<string>();

    dreamsOnDate.forEach((dream) => {
      dream.dreamTypes?.forEach((type) => types.add(type));
    });

    return Array.from(types);
  };

  const getDreamTypeColor = (type: string) => {
    switch (type) {
      case "lucid":
        return "bg-purple-500";
      case "nightmare":
        return "bg-red-500";
      case "recurring":
        return "bg-amber-500";
      case "prophetic":
        return "bg-cyan-500";
      default:
        return "bg-primary";
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = new Intl.DateTimeFormat("th-TH", {
    month: "long",
    year: "numeric",
  }).format(currentDate);

  const weekDays = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{monthName}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            วันนี้
          </Button>
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card-minimal p-3 sm:p-4">
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateKey = formatDateKey(date);
            const dreamsOnDate = dreamsByDate.get(dateKey) || [];
            const dreamTypes = getDreamTypesForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={dateKey}
                className={`aspect-square border rounded-md p-1 sm:p-2 relative ${
                  isToday
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent/50"
                } transition-colors`}
              >
                <div className="text-xs sm:text-sm font-medium">
                  {date.getDate()}
                </div>

                {/* Dream type indicators */}
                {dreamsOnDate.length > 0 && (
                  <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 justify-center items-center flex-wrap">
                    {dreamTypes.length > 0 ? (
                      dreamTypes
                        .slice(0, 3)
                        .map((type) => (
                          <div
                            key={type}
                            className={`w-1.5 h-1.5 rounded-full ${getDreamTypeColor(
                              type,
                            )}`}
                            title={
                              DREAM_TYPE_LABELS[
                                type as keyof typeof DREAM_TYPE_LABELS
                              ]
                            }
                          />
                        ))
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                    {dreamsOnDate.length > 1 && (
                      <span className="text-[8px] sm:text-[10px] text-muted-foreground ml-0.5">
                        {dreamsOnDate.length}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="card-minimal p-3 text-center">
          <div className="text-2xl font-bold text-primary">
            {
              dreams.filter((d) => {
                const dreamDate = d.date ? new Date(d.date) : null;
                return (
                  dreamDate &&
                  dreamDate.getMonth() === month &&
                  dreamDate.getFullYear() === year
                );
              }).length
            }
          </div>
          <div className="text-xs text-muted-foreground">ฝันทั้งหมด</div>
        </div>

        {["lucid", "nightmare", "recurring", "prophetic"].map((type) => {
          const count = dreams.filter((d) => {
            const dreamDate = d.date ? new Date(d.date) : null;
            return (
              dreamDate &&
              dreamDate.getMonth() === month &&
              dreamDate.getFullYear() === year &&
              d.dreamTypes?.includes(type)
            );
          }).length;

          if (count === 0) return null;

          return (
            <div key={type} className="card-minimal p-3 text-center">
              <div
                className={`text-2xl font-bold ${getDreamTypeColor(type).replace("bg-", "text-")}`}
              >
                {count}
              </div>
              <div className="text-xs text-muted-foreground">
                {DREAM_TYPE_LABELS[type as keyof typeof DREAM_TYPE_LABELS]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
