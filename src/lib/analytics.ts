/**
 * User analytics tracking utility
 * Tracks user behavior, practice completion, feature adoption
 */

interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  timestamp: string;
  sessionId: string;
  userId?: string;
}

interface PageViewData {
  pageName: string;
  duration: number;
  properties?: Record<string, any>;
}

let sessionId = generateSessionId();
let pageStartTime = Date.now();
let previousPageTime = 0;

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  const event: AnalyticsEvent = {
    eventName,
    properties,
    timestamp: new Date().toISOString(),
    sessionId,
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log("[Analytics]", event);
  }

  // Send to analytics service in production
  if (import.meta.env.PROD) {
    // Placeholder: send to Google Analytics, Mixpanel, Amplitude, etc.
    // trackingService.track(event);
  }
};

const trackPageView = (pageName: string) => {
  const now = Date.now();
  const previousPageDuration = now - pageStartTime;

  // Track previous page duration
  if (previousPageTime > 0) {
    trackEvent("page_exit", {
      pageName,
      duration: previousPageDuration,
    });
  }

  // Start tracking new page
  pageStartTime = now;
  previousPageTime = now;

  trackEvent("page_view", {
    pageName,
    url: window.location.pathname,
  });
};

export const analytics = {
  // User session events
  sessionStart: () => trackEvent("session_start"),
  sessionEnd: () => trackEvent("session_end", { sessionId }),

  // User action events
  login: (method: "email" | "google") => trackEvent("user_login", { method }),
  signup: () => trackEvent("user_signup"),
  logout: () => trackEvent("user_logout"),

  // Practice events
  practiceStart: (category: string) =>
    trackEvent("practice_start", { category }),
  practiceComplete: (category: string, score: number, duration: number) =>
    trackEvent("practice_complete", { category, score, duration }),
  practiceAbandoned: (category: string, duration: number) =>
    trackEvent("practice_abandoned", { category, duration }),

  // Feature events
  featureUsed: (featureName: string) =>
    trackEvent("feature_used", { featureName }),
  toggleTheme: (theme: "light" | "dark") =>
    trackEvent("toggle_theme", { theme }),
  viewedFeedback: (category: string) =>
    trackEvent("viewed_feedback", { category }),
  viewedDashboard: () => trackEvent("viewed_dashboard"),

  // Error events
  errorOccurred: (errorType: string, message: string) =>
    trackEvent("error", { errorType, message }),

  // Page navigation
  pageView: trackPageView,

  // Custom event
  custom: trackEvent,

  // Session management
  getSessionId: () => sessionId,
  resetSession: () => {
    sessionId = generateSessionId();
    trackEvent("session_start");
  },
};
