/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { registerSW } from "virtual:pwa-register";

type UpdateServiceWorker = ReturnType<typeof registerSW>;

interface AppUpdateState {
  updateAvailable: boolean;
  isChecking: boolean;
  isUpdating: boolean;
  lastCheckedAt: number | null;
  checkForUpdates: () => Promise<void>;
  applyUpdate: () => Promise<void>;
}

const AppUpdateContext = createContext<AppUpdateState | null>(null);

export function AppUpdateProvider({ children }: { children: ReactNode }) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const updateServiceWorkerRef = useRef<UpdateServiceWorker | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV) return;
    if (!("serviceWorker" in navigator)) return;

    updateServiceWorkerRef.current = registerSW({
      immediate: true,
      onNeedRefresh() {
        setUpdateAvailable(true);
      },
      onRegisteredSW(_swUrl, registration) {
        registrationRef.current = registration ?? null;
      },
      onRegisterError(error) {
        console.warn("Service worker registration failed:", error);
      },
    });
  }, []);

  const checkForUpdates = async () => {
    setIsChecking(true);
    setLastCheckedAt(Date.now());
    try {
      await registrationRef.current?.update();
    } finally {
      setIsChecking(false);
    }
  };

  const applyUpdate = async () => {
    if (!updateServiceWorkerRef.current) return;
    setIsUpdating(true);
    try {
      await updateServiceWorkerRef.current(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const value = useMemo(
    () => ({
      updateAvailable,
      isChecking,
      isUpdating,
      lastCheckedAt,
      checkForUpdates,
      applyUpdate,
    }),
    [updateAvailable, isChecking, isUpdating, lastCheckedAt],
  );

  return (
    <AppUpdateContext.Provider value={value}>
      {children}
    </AppUpdateContext.Provider>
  );
}

export function useAppUpdate() {
  const context = useContext(AppUpdateContext);
  if (!context) {
    throw new Error("useAppUpdate must be used within AppUpdateProvider");
  }
  return context;
}
