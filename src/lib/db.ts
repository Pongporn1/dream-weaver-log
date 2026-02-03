import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { DreamLog, SleepLog } from "@/types/dream";

// Types for cached data
interface DreamLogCache {
  id: string;
  data: DreamLog;
  cachedAt: number;
}

interface SleepLogCache {
  id: string;
  data: SleepLog;
  cachedAt: number;
}

interface MetaCache {
  key: string;
  value: unknown;
  cachedAt: number;
}

interface DreamBookDB extends DBSchema {
  dreamLogs: {
    key: string;
    value: DreamLogCache;
    indexes: { 'by-cached': number };
  };
  sleepLogs: {
    key: string;
    value: SleepLogCache;
    indexes: { 'by-cached': number };
  };
  meta: {
    key: string;
    value: MetaCache;
  };
}

const DB_NAME = "dream-book-cache";
const DB_VERSION = 1;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

let dbInstance: IDBPDatabase<DreamBookDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<DreamBookDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<DreamBookDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Dream logs store
      if (!db.objectStoreNames.contains("dreamLogs")) {
        const dreamStore = db.createObjectStore("dreamLogs", { keyPath: "id" });
        dreamStore.createIndex("by-cached", "cachedAt");
      }

      // Sleep logs store
      if (!db.objectStoreNames.contains("sleepLogs")) {
        const sleepStore = db.createObjectStore("sleepLogs", { keyPath: "id" });
        sleepStore.createIndex("by-cached", "cachedAt");
      }

      // Meta store for misc cached data
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
      }
    },
  });

  return dbInstance;
}

// Dream logs cache operations
export async function cacheDreamLogs(logs: DreamLog[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("dreamLogs", "readwrite");
  const store = tx.objectStore("dreamLogs");
  
  // Clear old cache
  await store.clear();
  
  // Add new logs
  const now = Date.now();
  for (const log of logs) {
    await store.put({
      id: log.id,
      data: log,
      cachedAt: now,
    });
  }
  
  await tx.done;
  
  // Update meta
  await setMeta("dreamLogs_lastSync", now);
}

export async function getCachedDreamLogs(): Promise<DreamLog[]> {
  const db = await getDB();
  const cached = await db.getAll("dreamLogs");
  
  // Check if cache is still valid
  const lastSync = await getMeta("dreamLogs_lastSync");
  if (lastSync && Date.now() - lastSync > CACHE_DURATION) {
    return []; // Cache expired
  }
  
  return cached.map(item => item.data);
}

// Sleep logs cache operations
export async function cacheSleepLogs(logs: SleepLog[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("sleepLogs", "readwrite");
  const store = tx.objectStore("sleepLogs");
  
  // Clear old cache
  await store.clear();
  
  // Add new logs
  const now = Date.now();
  for (const log of logs) {
    await store.put({
      id: log.id,
      data: log,
      cachedAt: now,
    });
  }
  
  await tx.done;
  
  // Update meta
  await setMeta("sleepLogs_lastSync", now);
}

export async function getCachedSleepLogs(): Promise<SleepLog[]> {
  const db = await getDB();
  const cached = await db.getAll("sleepLogs");
  
  // Check if cache is still valid
  const lastSync = await getMeta("sleepLogs_lastSync");
  if (lastSync && Date.now() - lastSync > CACHE_DURATION) {
    return []; // Cache expired
  }
  
  return cached.map(item => item.data);
}

// Meta operations
export async function setMeta(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put("meta", {
    key,
    value,
    cachedAt: Date.now(),
  });
}

export async function getMeta(key: string): Promise<unknown | null> {
  const db = await getDB();
  const item = await db.get("meta", key);
  return item?.value ?? null;
}

// Clear all cache
export async function clearCache(): Promise<void> {
  const db = await getDB();
  await Promise.all([
    db.clear("dreamLogs"),
    db.clear("sleepLogs"),
    db.clear("meta"),
  ]);
}

// Check if online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Online status hook helper
export function subscribeToOnlineStatus(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
