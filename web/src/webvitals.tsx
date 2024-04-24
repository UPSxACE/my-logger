"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (
      process.env.NODE_ENV !== "development" ||
      process.env.NEXT_PUBLIC_FORCE_ANALYTICS === "true"
    ) {
      metric["_host"] = window.location.host;
      metric["_path"] = window.location.pathname;
      const body = JSON.stringify(metric);
      const url = process.env.NEXT_PUBLIC_ANALYTICS_URL || "";

      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, body);
      } else {
        fetch(url, {
          headers: {
            "Content-Type": "application/json",
          },
          body,
          method: "POST",
          keepalive: true,
          credentials: "include",
        });
      }
    }

    return;
    const body = JSON.stringify(metric);
    const url = process.env.NEXT_PUBLIC_ANALYTICS_URL || "";

    // Use `navigator.sendBeacon()` if available, falling back to `fetch()`.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body);
    } else {
      fetch(url, { body, method: "POST", keepalive: true });
    }
  });

  return null;
}
