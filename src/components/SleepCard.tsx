import { SleepLog } from '@/types/dream';

interface SleepCardProps {
  sleep: SleepLog;
}

function formatDuration(h: number, m: number): string {
  return `${h}:${String(m).padStart(2, '0')}`;
}

function calcPercentage(partH: number, partM: number, totalH: number, totalM: number): number {
  const partMinutes = partH * 60 + partM;
  const totalMinutes = totalH * 60 + totalM;
  if (totalMinutes === 0) return 0;
  return Math.round((partMinutes / totalMinutes) * 100);
}

export function SleepCard({ sleep }: SleepCardProps) {
  const formattedDate = new Date(sleep.date).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const deepPercent = calcPercentage(sleep.deep.hours, sleep.deep.minutes, sleep.totalSleep.hours, sleep.totalSleep.minutes);
  const lightPercent = calcPercentage(sleep.light.hours, sleep.light.minutes, sleep.totalSleep.hours, sleep.totalSleep.minutes);
  const remPercent = calcPercentage(sleep.rem.hours, sleep.rem.minutes, sleep.totalSleep.hours, sleep.totalSleep.minutes);

  return (
    <div className="card-minimal">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{formattedDate}</span>
        {sleep.sleepScore && (
          <span className="tag-accent">Score: {sleep.sleepScore}</span>
        )}
      </div>

      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-3xl font-semibold">
          {formatDuration(sleep.totalSleep.hours, sleep.totalSleep.minutes)}
        </span>
        <span className="text-muted-foreground">total</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Deep</span>
          <span>{formatDuration(sleep.deep.hours, sleep.deep.minutes)} ({deepPercent}%)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Light</span>
          <span>{formatDuration(sleep.light.hours, sleep.light.minutes)} ({lightPercent}%)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">REM</span>
          <span>{formatDuration(sleep.rem.hours, sleep.rem.minutes)} ({remPercent}%)</span>
        </div>
        {sleep.nap && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nap</span>
            <span>{sleep.nap.minutes} min</span>
          </div>
        )}
        {sleep.deepContinuityScore !== undefined && (
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="text-muted-foreground">Deep Continuity</span>
            <span>{sleep.deepContinuityScore}</span>
          </div>
        )}
      </div>
    </div>
  );
}
