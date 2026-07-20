import type {
  AnalyticsEventMap,
  AnalyticsEventName,
} from "@/lib/analytics/events";

function analyticsEnabled() {
  return process.env.ANALYTICS_ENABLED === "true";
}

export async function track<TEvent extends AnalyticsEventName>(
  event: TEvent,
  properties: AnalyticsEventMap[TEvent],
) {
  if (!analyticsEnabled() || typeof window === "undefined") {
    return;
  }

  try {
    const posthog = (await import("posthog-js")).default;
    posthog.capture(event, properties);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Analytics track failed", error);
    }
  }
}
