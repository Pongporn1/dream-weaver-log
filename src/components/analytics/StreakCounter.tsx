import { useMemo } from "react";
import { DreamLog } from "@/types/dream";
import { Flame, Award } from "lucide-react";
import {
  format,
  eachDayOfInterval,
} from "date-fns";
import { th } from "date-fns/locale";

interface Props {
  dreams: DreamLog[];
}

export function StreakCounter({ dreams }: Props) {
  const streakData = useMemo(() => {
    if (dreams.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalDays: 0,
        streakDays: [] as Date[],
      };
    }

    const sortedDreams = [...dreams].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Get unique dates
    const dreamDates = new Set(
      sortedDreams.map((d) => format(new Date(d.date), "yyyy-MM-dd")),
    );

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    while (dreamDates.has(format(checkDate, "yyyy-MM-dd"))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // If no dream today, check yesterday
    if (currentStreak === 0) {
      checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - 1);
      checkDate.setHours(0, 0, 0, 0);

      if (dreamDates.has(format(checkDate, "yyyy-MM-dd"))) {
        currentStreak = 1;
        checkDate.setDate(checkDate.getDate() - 1);

        while (dreamDates.has(format(checkDate, "yyyy-MM-dd"))) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }
    }

    // Calculate longest streak
    const firstDate = new Date(sortedDreams[sortedDreams.length - 1].date);
    const lastDate = new Date(sortedDreams[0].date);
    const allDays = eachDayOfInterval({ start: firstDate, end: lastDate });

    let longestStreak = 0;
    let tempStreak = 0;

    allDays.forEach((day) => {
      if (dreamDates.has(format(day, "yyyy-MM-dd"))) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    // Get recent streak days for visualization
    const streakDays: Date[] = [];
    const visualDate = new Date();
    visualDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < currentStreak && i < 7; i++) {
      streakDays.push(new Date(visualDate));
      visualDate.setDate(visualDate.getDate() - 1);
    }

    return {
      currentStreak,
      longestStreak,
      totalDays: dreamDates.size,
      streakDays: streakDays.reverse(),
    };
  }, [dreams]);

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "🏆";
    if (streak >= 14) return "🔥";
    if (streak >= 7) return "⭐";
    if (streak >= 3) return "✨";
    return "💫";
  };

  return (
    <div className="card-minimal space-y-4">
      <div className="flex items-center gap-2">
        <Flame className="w-4 h-4 text-orange-500" />
        <h2 className="text-sm font-semibold">Dream Streak</h2>
      </div>

      {/* Current Streak */}
      <div className="rounded-lg border border-border/70 bg-background/75 p-4 text-center">
        <div className="text-4xl mb-2">
          {getStreakEmoji(streakData.currentStreak)}
        </div>
        <div className="mb-1 text-3xl font-bold text-primary">
          {streakData.currentStreak}
        </div>
        <p className="text-sm text-foreground/70">วันติดต่อกัน</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border/70 bg-background/70 p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Award className="w-3 h-3 text-primary" />
            <p className="text-xs text-foreground/70">สถิติสูงสุด</p>
          </div>
          <p className="text-xl font-bold text-foreground">{streakData.longestStreak}</p>
          <p className="text-xs text-foreground/70">วัน</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/70 p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="w-3 h-3 text-primary" />
            <p className="text-xs text-foreground/70">ทั้งหมด</p>
          </div>
          <p className="text-xl font-bold text-foreground">{streakData.totalDays}</p>
          <p className="text-xs text-foreground/70">วัน</p>
        </div>
      </div>

      {/* Streak Visualization */}
      {streakData.streakDays.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-foreground/70">ช่วงล่าสุด:</p>
          <div className="flex gap-1 justify-center">
            {streakData.streakDays.map((day, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center"
                title={format(day, "d MMM yyyy", { locale: th })}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/15">
                  <Flame className="w-4 h-4 text-primary" />
                </div>
                <span className="mt-1 text-xs text-foreground/70">
                  {format(day, "d")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Encouragement */}
      {streakData.currentStreak === 0 && (
        <div className="rounded-lg border border-border/70 bg-background/65 p-3 text-center">
          <p className="text-sm text-foreground/75">
            เริ่มต้น streak ใหม่ได้เลย! 💪
          </p>
        </div>
      )}
      {streakData.currentStreak >= 7 && (
        <div className="rounded-lg border border-primary/35 bg-primary/10 p-3 text-center">
          <p className="text-sm text-primary">
            เยี่ยมมาก! คุณบันทึกความฝันมาแล้ว {streakData.currentStreak}{" "}
            วันติดต่อกัน! 🎉
          </p>
        </div>
      )}
    </div>
  );
}
