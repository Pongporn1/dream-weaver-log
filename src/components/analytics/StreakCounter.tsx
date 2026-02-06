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
      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
        <div className="text-4xl mb-2">
          {getStreakEmoji(streakData.currentStreak)}
        </div>
        <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
          {streakData.currentStreak}
        </div>
        <p className="text-sm text-muted-foreground">วันติดต่อกัน</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-secondary/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Award className="w-3 h-3 text-primary" />
            <p className="text-xs text-muted-foreground">สถิติสูงสุด</p>
          </div>
          <p className="text-xl font-bold">{streakData.longestStreak}</p>
          <p className="text-xs text-muted-foreground">วัน</p>
        </div>
        <div className="text-center p-3 bg-secondary/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="w-3 h-3 text-primary" />
            <p className="text-xs text-muted-foreground">ทั้งหมด</p>
          </div>
          <p className="text-xl font-bold">{streakData.totalDays}</p>
          <p className="text-xs text-muted-foreground">วัน</p>
        </div>
      </div>

      {/* Streak Visualization */}
      {streakData.streakDays.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">ช่วงล่าสุด:</p>
          <div className="flex gap-1 justify-center">
            {streakData.streakDays.map((day, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center"
                title={format(day, "d MMM yyyy", { locale: th })}
              >
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {format(day, "d")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Encouragement */}
      {streakData.currentStreak === 0 && (
        <div className="text-center p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            เริ่มต้น streak ใหม่ได้เลย! 💪
          </p>
        </div>
      )}
      {streakData.currentStreak >= 7 && (
        <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-300">
            เยี่ยมมาก! คุณบันทึกความฝันมาแล้ว {streakData.currentStreak}{" "}
            วันติดต่อกัน! 🎉
          </p>
        </div>
      )}
    </div>
  );
}
