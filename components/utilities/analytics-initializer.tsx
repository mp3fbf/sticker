"use client"

/**
 * @description
 * Client component that initializes analytics tracking.
 * Separated from the server layout to handle client-side functionality.
 *
 * Features:
 * - Initializes analytics on component mount
 * - Tracks page views automatically
 * - Collects performance metrics
 * - Respects user privacy settings
 *
 * @dependencies
 * - analytics.ts: For tracking functions
 * - React: For hooks and component lifecycle
 */

import { analytics } from "@/lib/analytics"
import { useEffect, useCallback } from "react"
import { usePathname, useSearchParams } from "next/navigation"

/**
 * Client component that initializes analytics and tracks page views
 */
export default function AnalyticsInitializer() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Track page views when route changes
  useEffect(() => {
    // Initialize analytics with configuration
    analytics.init({
      debug: process.env.NODE_ENV === "development",
      respectDoNotTrack: true
    })

    // Track initial page view
    if (pathname) {
      analytics.trackPageView(pathname)
    }

    // Track feature usage events for key app sections
    if (pathname === "/") {
      analytics.trackFeature("landing_page", "view")
    }
  }, [pathname])

  // Track route changes
  useEffect(() => {
    // Only track if pathname is available (client-side)
    if (pathname) {
      analytics.trackPageView(pathname)
    }
  }, [pathname, searchParams])

  // Track performance metrics
  useEffect(() => {
    // Wait for the page to fully load
    if (typeof window !== "undefined") {
      window.addEventListener("load", () => {
        // Delayed to ensure we capture all metrics
        setTimeout(() => {
          if (performance.timing) {
            const pageLoadTime =
              performance.timing.loadEventEnd -
              performance.timing.navigationStart

            if (pageLoadTime > 0) {
              analytics.trackPerformance("page_load", pageLoadTime)
            }
          }

          // Capture Web Vitals if available
          if ("getEntriesByType" in performance) {
            const paintMetrics = performance.getEntriesByType("paint")
            paintMetrics.forEach(metric => {
              analytics.trackPerformance(
                metric.name,
                Math.round(metric.startTime)
              )
            })
          }
        }, 0)
      })
    }
  }, [])

  // Track when users interact with key features
  const trackAppEvents = useCallback(() => {
    // Set up event listeners for key app interactions
    document.addEventListener("click", event => {
      const target = event.target as HTMLElement

      // Track download button clicks
      if (target.closest('[class*="download"]')) {
        analytics.trackFeature("sticker", "download")
      }

      // Track upload button clicks
      if (target.closest('[class*="upload"]')) {
        analytics.trackFeature("video", "upload")
      }
    })
  }, [])

  // Set up event tracking
  useEffect(() => {
    trackAppEvents()
  }, [trackAppEvents])

  // This component doesn't render anything
  return null
}
