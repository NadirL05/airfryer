"use client";

import { useCallback } from "react";

type EventData = Record<string, unknown>;

export function useAnalytics() {
  const track = useCallback((eventName: string, eventData?: EventData) => {
    const payload = JSON.stringify({ event_name: eventName, event_data: eventData || {} });

    // Prefer sendBeacon (non-blocking, survives page unload)
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/track", blob);
      return;
    }

    // Fallback: fetch with keepalive
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch((err) => {
      console.error("Analytics track error:", err);
    });
  }, []);

  return { track };
}
