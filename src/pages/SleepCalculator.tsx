import { useState, useEffect } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SleepCard } from '@/components/SleepCard';
import { getSleepLogs, addSleepLog, parseSleepImage } from '@/lib/api';
import { SleepLog } from '@/types/dream';
import { toast } from '@/hooks/use-toast';

interface ParsedSleepData {
  date_th?: string;
  sleep_start?: string;
  wake_time?: string;
  total_sleep?: { hours: number; minutes: number };
  deep?: { hours: number; minutes: number };
  light?: { hours: number; minutes: number };
  rem?: { hours: number; minutes: number };
  nap?: { minutes: number; start?: string; end?: string };
  sleep_score?: number;
  deep_continuity_score?: number;
  deep_percent?: number;
  light_percent?: number;
  rem_percent?: number;
  inconsistent?: boolean;
}

export default function SleepCalculator() {
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedSleepData | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const logs = await getSleepLogs();
        setSleepLogs(logs);
      } catch (error) {
        console.error('Error loading sleep logs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview and convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setParsedData(null);
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) {
      toast({ title: "กรุณาอัปโหลดรูปก่อน", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await parseSleepImage(uploadedImage);
      
      if (result.error) {
        toast({ title: result.error, variant: "destructive" });
        return;
      }

      setParsedData(result);
      toast({ title: "วิเคราะห์เสร็จสิ้น" });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({ title: "เกิดข้อผิดพลาดในการวิเคราะห์", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!parsedData || !parsedData.total_sleep) {
      toast({ title: "ไม่มีข้อมูลให้บันทึก", variant: "destructive" });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newLog = await addSleepLog({
      date: today,
      sleepStart: parsedData.sleep_start || '00:00',
      wakeTime: parsedData.wake_time || '00:00',
      totalSleep: parsedData.total_sleep,
      deep: parsedData.deep || { hours: 0, minutes: 0 },
      light: parsedData.light || { hours: 0, minutes: 0 },
      rem: parsedData.rem || { hours: 0, minutes: 0 },
      nap: parsedData.nap || undefined,
      sleepScore: parsedData.sleep_score || undefined,
      deepContinuityScore: parsedData.deep_continuity_score || undefined
    });

    if (newLog) {
      setSleepLogs([newLog, ...sleepLogs]);
      setParsedData(null);
      setUploadedImage(null);
      toast({ title: "บันทึกเรียบร้อย" });
    } else {
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
    }
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

          {parsedData.inconsistent && (
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
            {parsedData.deep && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deep</span>
                <span>
                  {parsedData.deep.hours}h {parsedData.deep.minutes}m 
                  {parsedData.deep_percent !== undefined && ` (${parsedData.deep_percent}%)`}
                </span>
              </div>
            )}
            {parsedData.light && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Light</span>
                <span>
                  {parsedData.light.hours}h {parsedData.light.minutes}m 
                  {parsedData.light_percent !== undefined && ` (${parsedData.light_percent}%)`}
                </span>
              </div>
            )}
            {parsedData.rem && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">REM</span>
                <span>
                  {parsedData.rem.hours}h {parsedData.rem.minutes}m 
                  {parsedData.rem_percent !== undefined && ` (${parsedData.rem_percent}%)`}
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
            {parsedData.deep_continuity_score !== undefined && (
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
      {loading ? (
        <div className="text-center py-4 text-muted-foreground">กำลังโหลด...</div>
      ) : sleepLogs.length > 0 && (
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
