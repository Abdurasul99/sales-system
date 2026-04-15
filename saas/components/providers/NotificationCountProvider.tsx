"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface NotificationCountContextValue {
  count: number;
  refreshCount: () => Promise<void>;
}

const NotificationCountContext = createContext<NotificationCountContextValue>({
  count: 0,
  refreshCount: async () => {},
});

export function NotificationCountProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const refreshCount = useCallback(async () => {
    if (document.visibilityState !== "visible") {
      return;
    }

    try {
      const response = await fetch("/api/notifications?unread=true", {
        cache: "no-store",
      });
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { count?: number };
      setCount(payload.count ?? 0);
    } catch {
      // Ignore transient polling failures.
    }
  }, []);

  useEffect(() => {
    void refreshCount();

    const interval = window.setInterval(() => {
      void refreshCount();
    }, 30000);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void refreshCount();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshCount]);

  const value = useMemo(
    () => ({ count, refreshCount }),
    [count, refreshCount],
  );

  return (
    <NotificationCountContext.Provider value={value}>
      {children}
    </NotificationCountContext.Provider>
  );
}

export function useNotificationCount(): NotificationCountContextValue {
  return useContext(NotificationCountContext);
}
