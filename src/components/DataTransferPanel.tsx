import { useState, useRef } from "react";
import { Download, Upload, FileJson, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { exportData, importData, validateBackupFile } from "@/lib/dataTransfer";
import { toast } from "@/hooks/use-toast";

export function DataTransferPanel() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
    errors: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportData();
      toast({
        title: "✅ Export สำเร็จ",
        description: "ข้อมูลถูก export เป็นไฟล์ JSON แล้ว",
      });
    } catch (error) {
      toast({
        title: "❌ Export ล้มเหลว",
        description: error instanceof Error ? error.message : "เกิดข้อผิดพลาด",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      // Validate file first
      const validation = await validateBackupFile(file);
      if (!validation.valid) {
        toast({
          title: "❌ ไฟล์ไม่ถูกต้อง",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      // Show preview
      if (validation.data) {
        const dreamCount = validation.data.dreamLogs.length;
        const confirmImport = window.confirm(
          `พบข้อมูล:\n- ${dreamCount} ความฝัน\n\nต้องการ import ข้อมูลนี้หรือไม่?`
        );

        if (!confirmImport) {
          toast({
            title: "ยกเลิก Import",
            description: "ไม่มีการเปลี่ยนแปลงข้อมูล",
          });
          return;
        }
      }

      // Import data
      const result = await importData(file);
      setImportResult(result);

      toast({
        title: "✅ Import สำเร็จ",
        description: `นำเข้า ${result.imported} รายการ, ข้าม ${result.skipped} รายการ`,
      });
    } catch (error) {
      toast({
        title: "❌ Import ล้มเหลว",
        description: error instanceof Error ? error.message : "เกิดข้อผิดพลาด",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5" />
          Export / Import ข้อมูล
        </CardTitle>
        <CardDescription>
          สำรองหรือโอนย้ายข้อมูลระหว่างบัญชี
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Section */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Export ข้อมูล</h4>
          <p className="text-sm text-muted-foreground">
            ดาวน์โหลดข้อมูลทั้งหมดจาก IndexedDB เป็นไฟล์ JSON
          </p>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "กำลัง Export..." : "Export ข้อมูล"}
          </Button>
        </div>

        <div className="border-t pt-4 space-y-2">
          <h4 className="text-sm font-medium">Import ข้อมูล</h4>
          <p className="text-sm text-muted-foreground">
            นำเข้าข้อมูลจากไฟล์ backup (.json) เข้าบัญชีปัจจุบัน
          </p>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              ข้อมูลที่ซ้ำกัน (วันที่ + เวลา + โลก) จะถูกข้ามโดยอัตโนมัติ
            </AlertDescription>
          </Alert>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file-input"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? "กำลัง Import..." : "เลือกไฟล์ Import"}
            </Button>
          </div>
        </div>

        {/* Import Result */}
        {importResult && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="text-sm space-y-1">
                <p className="font-medium">Import สำเร็จ</p>
                <ul className="list-disc list-inside text-xs text-muted-foreground">
                  <li>นำเข้า: {importResult.imported} รายการ</li>
                  <li>ข้าม (ซ้ำ): {importResult.skipped} รายการ</li>
                  {importResult.errors > 0 && (
                    <li className="text-red-600">ข้อผิดพลาด: {importResult.errors} รายการ</li>
                  )}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p className="font-medium">วิธีใช้:</p>
          <ol className="list-decimal list-inside space-y-0.5 ml-2">
            <li>กด "Export ข้อมูล" เพื่อสำรองข้อมูลปัจจุบัน</li>
            <li>ล็อกเอาท์และสร้างบัญชีใหม่</li>
            <li>ล็อกอินเข้าบัญชีใหม่</li>
            <li>กด "เลือกไฟล์ Import" และเลือกไฟล์ที่ export ไว้</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
