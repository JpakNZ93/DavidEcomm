"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { usePathname } from "next/navigation";

import { track } from "@/lib/analytics/track";

function analyticsEnabled() {
  return process.env.ANALYTICS_ENABLED === "true";
}

export function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (!analyticsEnabled() || !process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      return;
    }

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
      capture_pageview: false,
      persistence: "localStorage",
    });
  }, []);

  useEffect(() => {
    const queryString =
      typeof window === "undefined"
        ? ""
        : new URLSearchParams(window.location.search).toString();
    const path = queryString ? `${pathname}?${queryString}` : pathname;

    void track("page_view", {
      path,
      referrer:
        typeof document === "undefined" ? undefined : document.referrer || undefined,
    });
  }, [pathname]);

  return children;
}
