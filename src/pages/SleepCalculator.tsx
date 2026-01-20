import { useState, useEffect } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SleepCard } from '@/components/SleepCard';
import { getSleepLogs, addSleepLog } from '@/lib/store';
import { SleepLog } from '@/types/dream';
import { toast } from '@/hooks/use-toast';

interface ParsedSleepData {
  date_th: string | null;
  sleep_start: string | null;
  wake_time: string | null;
  total_sleep: { hours: number; minutes: number } | null;
  deep: { hours: number; minutes: number } | null;
  light: { hours: number; minutes: number } | null;
  rem: { hours: number; minutes: number } | null;
  nap: { minutes: number; start?: string; end?: string } | null;
  sleep_score: number | null;
  deep_continuity_score: number | null;
}

export default function SleepCalculator() {
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedSleepData | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [inconsistentFlag, setInconsistentFlag] = useState(false);

  useEffect(() => {
    setSleepLogs(getSleepLogs());
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setParsedData(null);
    setInconsistentFlag(false);
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) {
      toast({ title: "กรุณาอัปโหลดรูปก่อน", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);

    // Simulated parsing - In production, this would call the AI API
    // For now, we'll show a demo result
    setTimeout(() => {
      const mockData: ParsedSleepData = {
        date_th: "14 ม.ค. 2569",
        sleep_start: "04:48",
        wake_time: "12:23",
        total_sleep: { hours: 7, minutes: 25 },
        deep: { hours: 2, minutes: 14 },
        light: { hours: 3, minutes: 46 },
        rem: { hours: 1, minutes: 25 },
        nap: { minutes: 11, start: "12:12", end: "12:23" },
        sleep_score: 84,
        deep_continuity_score: 69
      };

      // Check consistency
      if (mockData.total_sleep && mockData.deep && mockData.light && mockData.rem) {
        const totalMinutes = mockData.total_sleep.hours * 60 + mockData.total_sleep.minutes;
        const sumMinutes = 
          (mockData.deep.hours * 60 + mockData.deep.minutes) +
          (mockData.light.hours * 60 + mockData.light.minutes) +
          (mockData.rem.hours * 60 + mockData.rem.minutes);
        
        setInconsistentFlag(Math.abs(totalMinutes - sumMinutes) > 5);
      }

      setParsedData(mockData);
      setIsAnalyzing(false);
      toast({ title: "วิเคราะห์เสร็จสิ้น" });
    }, 2000);
  };

  const handleSave = () => {
    if (!parsedData || !parsedData.total_sleep) {
      toast({ title: "ไม่มีข้อมูลให้บันทึก", variant: "destructive" });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newLog = addSleepLog({
      date: today,
      sleepStart: parsedData.sleep_start || '',
      wakeTime: parsedData.wake_time || '',
      totalSleep: parsedData.total_sleep,
      deep: parsedData.deep || { hours: 0, minutes: 0 },
      light: parsedData.light || { hours: 0, minutes: 0 },
      rem: parsedData.rem || { hours: 0, minutes: 0 },
      nap: parsedData.nap || undefined,
      sleepScore: parsedData.sleep_score || undefined,
      deepContinuityScore: parsedData.deep_continuity_score || undefined
    });

    setSleepLogs([newLog, ...sleepLogs]);
    setParsedData(null);
    setUploadedImage(null);
    setInconsistentFlag(false);
    toast({ title: "บันทึกเรียบร้อย" });
  };

  const calcPercentage = (h: number, m: number, totalH: number, totalM: number): number => {
    const partMinutes = h * 60 + m;
    const totalMinutes = totalH * 60 + totalM;
    if (totalMinutes === 0) return 0;
    return Math.round((partMinutes / totalMinutes) * 100);
  };

  return (
    <div className="py-4 space-y-6">
      <h1>Sleep Calculator</h1>

      {/* Upload Section */}
      <div className="card-minimal space-y-4">
        <p className="text-sm text-muted-foreground">
          อัปโหลดสกรีนช็อตจากแอปนอน เพื่อให้ AI ดึงข้อมูล
        </p>

        <label className="block border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          {uploadedImage ? (
            <img 
              src={uploadedImage} 
              alt="Uploaded" 
              className="max-h-48 mx-auto rounded-lg"
            />
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">คลิกเพื่ออัปโหลดรูป</p>
            </div>
          )}
        </label>

        <Button 
          onClick={handleAnalyze} 
          disabled={!uploadedImage || isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              กำลังวิเคราะห์...
            </>
          ) : (
            'Analyze'
          )}
        </Button>
      </div>

      {/* Parsed Result */}
      {parsedData && (
        <div className="card-minimal space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">ผลการวิเคราะห์</h2>
            {parsedData.sleep_score && (
              <span className="tag-accent">Score: {parsedData.sleep_score}</span>
            )}
          </div>

          {inconsistentFlag && (
            <div className="bg-destructive/10 text-destructive text-sm p-2 rounded">
              ⚠️ ผลรวม Deep+Light+REM ไม่ตรงกับ Total
            </div>
          )}

          <div className="space-y-3">
            {parsedData.date_th && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span>{parsedData.date_th}</span>
              </div>
            )}
            {parsedData.sleep_start && parsedData.wake_time && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span>{parsedData.sleep_start} - {parsedData.wake_time}</span>
              </div>
            )}
            {parsedData.total_sleep && (
              <div className="flex justify-between text-sm font-medium">
                <span>Total Sleep</span>
                <span>{parsedData.total_sleep.hours}h {parsedData.total_sleep.minutes}m</span>
              </div>
            )}
            {parsedData.deep && parsedData.total_sleep && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deep</span>
                <span>
                  {parsedData.deep.hours}h {parsedData.deep.minutes}m 
                  ({calcPercentage(parsedData.deep.hours, parsedData.deep.minutes, parsedData.total_sleep.hours, parsedData.total_sleep.minutes)}%)
                </span>
              </div>
            )}
            {parsedData.light && parsedData.total_sleep && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Light</span>
                <span>
                  {parsedData.light.hours}h {parsedData.light.minutes}m 
                  ({calcPercentage(parsedData.light.hours, parsedData.light.minutes, parsedData.total_sleep.hours, parsedData.total_sleep.minutes)}%)
                </span>
              </div>
            )}
            {parsedData.rem && parsedData.total_sleep && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">REM</span>
                <span>
                  {parsedData.rem.hours}h {parsedData.rem.minutes}m 
                  ({calcPercentage(parsedData.rem.hours, parsedData.rem.minutes, parsedData.total_sleep.hours, parsedData.total_sleep.minutes)}%)
                </span>
              </div>
            )}
            {parsedData.nap && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nap</span>
                <span>
                  {parsedData.nap.minutes} min
                  {parsedData.nap.start && ` (${parsedData.nap.start}-${parsedData.nap.end})`}
                </span>
              </div>
            )}
            {parsedData.deep_continuity_score !== null && (
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-muted-foreground">Deep Continuity</span>
                <span>{parsedData.deep_continuity_score}</span>
              </div>
            )}
          </div>

          <Button onClick={handleSave} variant="default" className="w-full">
            Save to Sleep Logs
          </Button>
        </div>
      )}

      {/* Previous Logs */}
      {sleepLogs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Previous Logs</h2>
          {sleepLogs.map(log => (
            <SleepCard key={log.id} sleep={log} />
          ))}
        </div>
      )}
    </div>
  );
}
