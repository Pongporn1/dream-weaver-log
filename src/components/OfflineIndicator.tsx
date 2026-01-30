import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-offline-data';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const online = useOnlineStatus();
  const [showOnline, setShowOnline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!online) {
      setWasOffline(true);
    } else if (wasOffline) {
      // Just came back online
      setShowOnline(true);
      const timer = setTimeout(() => {
        setShowOnline(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [online, wasOffline]);

  if (online && !showOnline) return null;

  return (
    <div
      className={cn(
        "fixed top-16 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-2 px-4 py-2 rounded-full",
        "text-sm font-medium shadow-lg",
        "animate-in slide-in-from-top duration-300",
        online
          ? "bg-green-500/90 text-white"
          : "bg-yellow-500/90 text-yellow-950"
      )}
    >
      {online ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>กลับมาออนไลน์แล้ว</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>กำลังใช้งานออฟไลน์</span>
        </>
      )}
    </div>
  );
}
