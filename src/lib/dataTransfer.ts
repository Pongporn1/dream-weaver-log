import { getDreamLogs, addDreamLog } from "./api";
import { getCachedDreamLogs, getCachedDreamLogsRaw } from "./db";
import type { DreamLog } from "@/types/dream";

export interface ExportData {
  version: string;
  exportedAt: string;
  dreamLogs: DreamLog[];
}

/**
 * Export all data from IndexedDB to a JSON file
 */
export async function exportData(): Promise<void> {
  try {
    // Try to get data from Supabase first (live data)
    let dreamLogs: DreamLog[] = [];

    try {
      const supabaseLogs = await getDreamLogs();
      if (supabaseLogs.length > 0) {
        dreamLogs = supabaseLogs;
        console.log("✅ Fetched from Supabase:", dreamLogs.length);
      } else {
        console.warn("⚠️ Supabase has no dream logs, trying IndexedDB cache...");
      }
    } catch (error) {
      console.warn("⚠️ Failed to fetch from Supabase, trying IndexedDB cache...");
    }

    // Fallback to IndexedDB cache
    if (dreamLogs.length === 0) {
      dreamLogs = await getCachedDreamLogs();
      if (dreamLogs.length > 0) {
        console.log("✅ Fetched from IndexedDB (fresh cache):", dreamLogs.length);
      }
    }

    // Last-resort recovery: use cached data even if cache is stale/expired
    if (dreamLogs.length === 0) {
      dreamLogs = await getCachedDreamLogsRaw();
      if (dreamLogs.length > 0) {
        console.log("✅ Fetched from IndexedDB (stale cache recovery):", dreamLogs.length);
      }
    }

    if (dreamLogs.length === 0) {
      throw new Error("ไม่พบข้อมูลที่จะ export");
    }

    const exportData: ExportData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      dreamLogs: dreamLogs,
    };

    // Convert to JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dream-weaver-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("✅ Data exported successfully:", {
      dreamLogs: dreamLogs.length,
    });
  } catch (error) {
    console.error("❌ Export failed:", error);
    throw error instanceof Error ? error : new Error("Failed to export data");
  }
}

/**
 * Import data from JSON file to Supabase
 */
export async function importData(file: File): Promise<{
  success: boolean;
  imported: number;
  skipped: number;
  errors: number;
}> {
  try {
    // Read file
    const text = await file.text();
    const data = JSON.parse(text) as ExportData;

    if (!data.version || !data.dreamLogs) {
      throw new Error("Invalid backup file format");
    }

    console.log("📦 Starting import:", {
      version: data.version,
      exportedAt: data.exportedAt,
      dreamLogs: data.dreamLogs.length,
    });

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Get existing dream logs to avoid duplicates
    const existingLogs = await getDreamLogs();
    const existingDates = new Set(
      existingLogs.map((log) => `${log.date}-${log.wakeTime}-${log.world}`)
    );

    // Import dream logs
    for (const log of data.dreamLogs) {
      const logKey = `${log.date}-${log.wakeTime}-${log.world}`;
      
      // Skip if already exists (based on date, wake time, and world)
      if (existingDates.has(logKey)) {
        skipped++;
        continue;
      }

      try {
        // Remove id and createdAt as they will be generated
        const { id, createdAt, ...logData } = log;
        const result = await addDreamLog(logData);
        
        if (result) {
          imported++;
          existingDates.add(logKey); // Prevent duplicate imports in same batch
        } else {
          errors++;
        }
      } catch (error) {
        console.error("Error importing dream log:", error);
        errors++;
      }
    }

    console.log("✅ Import completed:", { imported, skipped, errors });
    
    return {
      success: true,
      imported,
      skipped,
      errors,
    };
  } catch (error) {
    console.error("❌ Import failed:", error);
    throw error;
  }
}

/**
 * Validate backup file without importing
 */
export function validateBackupFile(file: File): Promise<{
  valid: boolean;
  data?: ExportData;
  error?: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text) as ExportData;

        if (!data.version || !data.dreamLogs) {
          resolve({
            valid: false,
            error: "Invalid backup file format",
          });
          return;
        }

        resolve({
          valid: true,
          data,
        });
      } catch (error) {
        resolve({
          valid: false,
          error: error instanceof Error ? error.message : "Failed to parse file",
        });
      }
    };

    reader.onerror = () => {
      resolve({
        valid: false,
        error: "Failed to read file",
      });
    };

    reader.readAsText(file);
  });
}
