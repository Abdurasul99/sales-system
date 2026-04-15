"use client";

import { useEffect } from "react";

const SALES_CACHE_PREFIXES = ["sales-static-", "sales-dynamic-"];

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    async function unregisterInDevelopment() {
      const registrations = await navigator.serviceWorker.getRegistrations();

      await Promise.all(
        registrations
          .filter((registration) => registration.active?.scriptURL.includes("/sw.js"))
          .map((registration) => registration.unregister()),
      );

      if ("caches" in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(
          cacheKeys
            .filter((key) => SALES_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix)))
            .map((key) => caches.delete(key)),
        );
      }
    }

    async function syncServiceWorker() {
      if (process.env.NODE_ENV !== "production") {
        await unregisterInDevelopment();
        return;
      }

      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    }

    void syncServiceWorker().catch(() => {
      // SW sync failures should never block rendering.
    });
  }, []);

  return null;
}
