/**
 * @description
 * Simple analytics utility for tracking anonymous usage metrics.
 * Focuses on privacy-friendly analytics with no personally identifiable information.
 *
 * Features:
 * - Event tracking with optional properties
 * - Page view tracking
 * - Automatic initialization
 * - Respects Do Not Track browser setting
 * - No cookies or local storage used
 * - No personally identifiable information tracked
 *
 * @dependencies None - uses only browser APIs
 */

// Types for analytics events
export type AnalyticsEvent = {
  name: string
  properties?: Record<string, string | number | boolean>
  timestamp?: number
}

// Configuration options for analytics
export type AnalyticsConfig = {
  /** Whether analytics is enabled (default: true) */
  enabled?: boolean
  /** Whether to respect the Do Not Track setting (default: true) */
  respectDoNotTrack?: boolean
  /** Optional endpoint to send analytics data to */
  endpoint?: string
  /** Debug mode - logs analytics events to console (default: false) */
  debug?: boolean
}

// Default configuration
const defaultConfig: Required<AnalyticsConfig> = {
  enabled: true,
  respectDoNotTrack: true,
  endpoint: "",
  debug: process.env.NODE_ENV === "development"
}

// Current configuration
let config: Required<AnalyticsConfig> = { ...defaultConfig }

// Analytics state
let isInitialized = false
let queue: AnalyticsEvent[] = []

/**
 * Checks if analytics tracking is allowed based on configuration and browser settings
 * @returns Boolean indicating if tracking is allowed
 */
function isTrackingAllowed(): boolean {
  if (!config.enabled) {
    return false
  }

  // Respect Do Not Track setting if configured
  if (config.respectDoNotTrack && typeof window !== "undefined") {
    const dnt =
      navigator.doNotTrack === "1" ||
      navigator.doNotTrack === "yes" ||
      (window as any).doNotTrack === "1" ||
      ("globalPrivacyControl" in navigator &&
        (navigator as any).globalPrivacyControl === true)

    if (dnt) {
      return false
    }
  }

  return true
}

/**
 * Initializes analytics with optional configuration
 * @param options - Analytics configuration options
 */
export function initAnalytics(options: AnalyticsConfig = {}): void {
  if (isInitialized) {
    return
  }

  // Merge provided options with defaults
  config = {
    ...defaultConfig,
    ...options
  }

  // Track initial page view if tracking is allowed
  if (isTrackingAllowed()) {
    trackPageView()
  }

  // Process any queued events
  processQueue()

  isInitialized = true

  if (config.debug) {
    console.log("📊 Analytics initialized", config)
  }
}

/**
 * Processes the queue of analytics events
 */
function processQueue(): void {
  if (!isTrackingAllowed() || queue.length === 0) {
    return
  }

  // Process each queued event
  while (queue.length > 0) {
    const event = queue.shift()
    if (event) {
      sendEvent(event)
    }
  }
}

/**
 * Sends an analytics event to the configured endpoint or logs it in debug mode
 * @param event - The analytics event to send
 */
function sendEvent(event: AnalyticsEvent): void {
  if (!isTrackingAllowed()) {
    return
  }

  // In debug mode, log the event to console
  if (config.debug) {
    console.log("📊 Analytics event:", event)
  }

  // If an endpoint is configured, send the event
  if (config.endpoint) {
    try {
      const payload = {
        ...event,
        timestamp: event.timestamp || Date.now()
      }

      // Use sendBeacon for better reliability, especially during page unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon(config.endpoint, JSON.stringify(payload))
      } else {
        // Fallback to fetch API
        fetch(config.endpoint, {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json"
          },
          // Use keepalive to ensure the request completes even if the page is unloaded
          keepalive: true
        }).catch(error => {
          if (config.debug) {
            console.error("Analytics error:", error)
          }
        })
      }
    } catch (error) {
      if (config.debug) {
        console.error("Analytics error:", error)
      }
    }
  }
}

/**
 * Tracks a custom event
 * @param name - Name of the event
 * @param properties - Optional properties to include with the event
 */
export function trackEvent(
  name: string,
  properties?: Record<string, string | number | boolean>
): void {
  const event: AnalyticsEvent = {
    name,
    properties,
    timestamp: Date.now()
  }

  if (!isInitialized) {
    // Queue the event to be processed after initialization
    queue.push(event)
    return
  }

  sendEvent(event)
}

/**
 * Tracks a page view event
 * @param path - Optional path to track (defaults to current path)
 */
export function trackPageView(path?: string): void {
  if (typeof window === "undefined") {
    return
  }

  const currentPath = path || window.location.pathname

  trackEvent("page_view", {
    path: currentPath,
    title: document.title,
    referrer: document.referrer || ""
  })
}

/**
 * Tracks a feature usage event
 * @param feature - Name of the feature
 * @param action - Action performed (e.g., "click", "view", "use")
 * @param properties - Optional additional properties
 */
export function trackFeature(
  feature: string,
  action: string,
  properties?: Record<string, string | number | boolean>
): void {
  trackEvent("feature_usage", {
    feature,
    action,
    ...properties
  })
}

/**
 * Tracks an error event
 * @param errorType - Type of error
 * @param message - Error message
 * @param properties - Optional additional properties
 */
export function trackError(
  errorType: string,
  message: string,
  properties?: Record<string, string | number | boolean>
): void {
  trackEvent("error", {
    errorType,
    message,
    ...properties
  })
}

/**
 * Tracks performance metrics
 * @param metricName - Name of the metric
 * @param value - Metric value (typically in milliseconds)
 * @param properties - Optional additional properties
 */
export function trackPerformance(
  metricName: string,
  value: number,
  properties?: Record<string, string | number | boolean>
): void {
  trackEvent("performance", {
    metric: metricName,
    value,
    ...properties
  })
}

/**
 * Disables analytics tracking
 */
export function disableAnalytics(): void {
  config.enabled = false

  if (config.debug) {
    console.log("📊 Analytics disabled")
  }
}

/**
 * Enables analytics tracking
 */
export function enableAnalytics(): void {
  config.enabled = true

  if (config.debug) {
    console.log("📊 Analytics enabled")
  }
}

/**
 * Export an analytics object with all the functions
 */
export const analytics = {
  init: initAnalytics,
  trackEvent,
  trackPageView,
  trackFeature,
  trackError,
  trackPerformance,
  disable: disableAnalytics,
  enable: enableAnalytics
}

// Auto-initialize if running in browser
if (typeof window !== "undefined") {
  initAnalytics()
}
