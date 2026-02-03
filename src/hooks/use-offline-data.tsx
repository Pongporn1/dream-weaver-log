import { useState, useEffect, useCallback } from "react";
import {
  cacheDreamLogs,
  getCachedDreamLogs,
  cacheSleepLogs,
  getCachedSleepLogs,
  isOnline,
  subscribeToOnlineStatus,
} from "@/lib/db";
import { getDreamLogs, getSleepLogs } from "@/lib/api";
import type { DreamLog, SleepLog } from "@/types/dream";

export function useOnlineStatus() {
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    return subscribeToOnlineStatus(setOnline);
  }, []);

  return online;
}

export function useOfflineDreamLogs() {
  const [data, setData] = useState<DreamLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const online = useOnlineStatus();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (online) {
        // Fetch from API
        const logs = await getDreamLogs();
        setData(logs);
        setIsFromCache(false);
        
        // Cache for offline use
        await cacheDreamLogs(logs);
      } else {
        // Load from cache
        const cached = await getCachedDreamLogs();
        setData(cached);
        setIsFromCache(true);
      }
    } catch (err) {
      console.error("Failed to fetch dream logs:", err);
      
      // Try cache as fallback
      try {
        const cached = await getCachedDreamLogs();
        if (cached.length > 0) {
          setData(cached);
          setIsFromCache(true);
        } else {
          setError(err as Error);
        }
      } catch (cacheErr) {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [online]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh when coming back online
  useEffect(() => {
    if (online && isFromCache) {
      refresh();
    }
  }, [online, isFromCache, refresh]);

  return { data, loading, error, refresh, isFromCache, online };
}

export function useOfflineSleepLogs() {
  const [data, setData] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const online = useOnlineStatus();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (online) {
        // Fetch from API
        const logs = await getSleepLogs();
        setData(logs);
        setIsFromCache(false);
        
        // Cache for offline use
        await cacheSleepLogs(logs);
      } else {
        // Load from cache
        const cached = await getCachedSleepLogs();
        setData(cached);
        setIsFromCache(true);
      }
    } catch (err) {
      console.error("Failed to fetch sleep logs:", err);
      
      // Try cache as fallback
      try {
        const cached = await getCachedSleepLogs();
        if (cached.length > 0) {
          setData(cached);
          setIsFromCache(true);
        } else {
          setError(err as Error);
        }
      } catch (cacheErr) {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [online]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh when coming back online
  useEffect(() => {
    if (online && isFromCache) {
      refresh();
    }
  }, [online, isFromCache, refresh]);

  return { data, loading, error, refresh, isFromCache, online };
}
