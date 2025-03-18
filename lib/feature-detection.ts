/**
 * @description
 * Utility functions for detecting browser capabilities and features
 * required for video processing with FFMPEG WASM.
 *
 * This module provides functions to:
 * - Detect WebAssembly support
 * - Detect SharedArrayBuffer support
 * - Detect Web Workers support
 * - Check if CORS headers are properly set
 * - Identify browser and device information
 * - Get comprehensive feature support information
 *
 * @dependencies
 * - Error handling utilities for standardized error messages
 * - Browser detection utilities from utils.ts
 */

import {
  AppError,
  ErrorSeverity,
  ErrorType,
  createError
} from "@/lib/error-handler"
import {
  isMobileDevice,
  isSafariBrowser,
  isIOSDevice,
  isFirefoxBrowser,
  isChromeBrowser,
  isEdgeBrowser
} from "@/lib/utils"

/**
 * Feature support result with details about specific features
 */
export interface FeatureSupportResult {
  /**
   * Whether the browser supports all required features
   */
  isFullySupported: boolean

  /**
   * Whether the browser has at least basic support for essential features
   */
  hasBasicSupport: boolean

  /**
   * Browser information
   */
  browser: {
    name: string
    version?: string
    isMobile: boolean
    isIOS: boolean
    isDesktop: boolean
  }

  /**
   * Detailed support information for specific features
   */
  features: {
    webAssembly: boolean
    sharedArrayBuffer: boolean
    webWorkers: boolean
    proper_cors_headers: boolean
    fileSystem: boolean
  }

  /**
   * List of missing features preventing full functionality
   */
  missingFeatures: string[]

  /**
   * Appropriate error object if critical features are missing
   */
  error?: AppError
}

/**
 * Detects if WebAssembly is supported
 * @returns Boolean indicating WebAssembly support
 */
export function isWebAssemblySupported(): boolean {
  return (
    typeof WebAssembly === "object" &&
    typeof WebAssembly.compile === "function" &&
    typeof WebAssembly.instantiate === "function"
  )
}

/**
 * Detects if SharedArrayBuffer is supported
 * This is required for multi-threaded FFMPEG operations
 * @returns Boolean indicating SharedArrayBuffer support
 */
export function isSharedArrayBufferSupported(): boolean {
  try {
    // Test creating a SharedArrayBuffer
    new SharedArrayBuffer(1)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Detects if Web Workers are supported
 * Required for background processing of video
 * @returns Boolean indicating Web Workers support
 */
export function isWebWorkersSupported(): boolean {
  return typeof Worker === "function"
}

/**
 * Checks if the browser has appropriate CORS headers set
 * These headers are required for SharedArrayBuffer and cross-origin isolation
 * @returns Boolean indicating if CORS headers are properly set
 */
export function hasProperCORSHeaders(): boolean {
  // Check if crossOriginIsolated is true, which indicates
  // that the page is loaded with the required CORS headers
  if (typeof crossOriginIsolated !== "undefined") {
    return crossOriginIsolated === true
  }

  // Fallback for browsers that don't support crossOriginIsolated
  return false
}

/**
 * Checks if the File System Access API is supported
 * This is used for enhanced file handling in modern browsers
 * @returns Boolean indicating File System Access API support
 */
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && "showOpenFilePicker" in window
}

/**
 * Gets a standardized browser name
 * @returns String with the browser name
 */
export function getBrowserName(): string {
  if (isChromeBrowser()) return "Chrome"
  if (isFirefoxBrowser()) return "Firefox"
  if (isEdgeBrowser()) return "Edge"
  if (isSafariBrowser()) return "Safari"

  // Try to extract browser name from user agent
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : ""
  if (ua.indexOf("Opera") !== -1 || ua.indexOf("OPR") !== -1) return "Opera"
  if (ua.indexOf("Trident") !== -1) return "Internet Explorer"
  if (ua.indexOf("Brave") !== -1) return "Brave"
  if (ua.indexOf("Vivaldi") !== -1) return "Vivaldi"

  return "Unknown Browser"
}

/**
 * Attempts to extract browser version
 * @returns String with the browser version or undefined
 */
export function getBrowserVersion(): string | undefined {
  if (typeof navigator === "undefined") return undefined

  const ua = navigator.userAgent
  let match

  // Chrome
  match = ua.match(/(chrome|chromium|crios)\/([\d.]+)/i)
  if (match) return match[2]

  // Firefox
  match = ua.match(/(firefox|fxios)\/([\d.]+)/i)
  if (match) return match[2]

  // Safari
  match = ua.match(/version\/([\d.]+).*safari/i)
  if (match) return match[1]

  // Edge
  match = ua.match(/edge\/([\d.]+)/i)
  if (match) return match[1]

  // IE
  match = ua.match(/(msie |rv:)([\d.]+)/i)
  if (match) return match[2]

  return undefined
}

/**
 * Creates a descriptive error message based on missing features
 * @param missingFeatures Array of missing feature names
 * @returns AppError object with appropriate error message
 */
export function createFeatureSupportError(
  missingFeatures: string[]
): AppError | undefined {
  if (missingFeatures.length === 0) {
    return undefined
  }

  const browserName = getBrowserName()
  const isMobile = isMobileDevice()

  // Critical error if WebAssembly is missing
  if (missingFeatures.includes("WebAssembly")) {
    return createError(
      ErrorType.WASM_UNSUPPORTED,
      `Your browser (${browserName}) doesn't support WebAssembly, which is required for video processing`,
      ErrorSeverity.CRITICAL,
      "WebAssembly is essential for processing videos in the browser.",
      undefined,
      [
        "Try using a modern browser like Chrome, Firefox, or Edge.",
        "Update your current browser to the latest version.",
        isMobile
          ? "If possible, try using a desktop browser instead."
          : "Make sure your browser is not in a restricted mode."
      ]
    )
  }

  // Warning for less critical missing features
  const missingSummary = missingFeatures.join(", ")
  return createError(
    ErrorType.BROWSER_UNSUPPORTED,
    `Limited functionality in ${browserName}: Missing ${missingSummary}`,
    ErrorSeverity.WARNING,
    `Some features required for optimal performance are not available in your browser.`,
    undefined,
    [
      `Try using a modern browser like Chrome or Firefox for full functionality.`,
      `Update your ${browserName} browser to the latest version.`,
      `Some features may still work but with limited functionality.`
    ]
  )
}

/**
 * Comprehensive check of browser support for all required features
 * @returns FeatureSupportResult with detailed information
 */
export function checkBrowserSupport(): FeatureSupportResult {
  // Check individual features
  const hasWebAssembly = isWebAssemblySupported()
  const hasSharedArrayBuffer = isSharedArrayBufferSupported()
  const hasWebWorkers = isWebWorkersSupported()
  const hasCORSHeaders = hasProperCORSHeaders()
  const hasFileSystem = isFileSystemAccessSupported()

  // Collect missing features
  const missingFeatures: string[] = []
  if (!hasWebAssembly) missingFeatures.push("WebAssembly")
  if (!hasSharedArrayBuffer) missingFeatures.push("SharedArrayBuffer")
  if (!hasWebWorkers) missingFeatures.push("Web Workers")
  if (!hasCORSHeaders) missingFeatures.push("CORS Headers")

  // Determine support levels
  // Full support means all features are available
  const isFullySupported = missingFeatures.length === 0

  // Basic support means essential features (WebAssembly and Web Workers) are available
  const hasBasicSupport = hasWebAssembly && hasWebWorkers

  // Create appropriate error if necessary
  const error = createFeatureSupportError(missingFeatures)

  // Collect browser information
  const browser = {
    name: getBrowserName(),
    version: getBrowserVersion(),
    isMobile: isMobileDevice(),
    isIOS: isIOSDevice(),
    isDesktop: !isMobileDevice()
  }

  return {
    isFullySupported,
    hasBasicSupport,
    browser,
    features: {
      webAssembly: hasWebAssembly,
      sharedArrayBuffer: hasSharedArrayBuffer,
      webWorkers: hasWebWorkers,
      proper_cors_headers: hasCORSHeaders,
      fileSystem: hasFileSystem
    },
    missingFeatures,
    error
  }
}

/**
 * Gets recommended alternative browsers based on current browser and platform
 * @returns Array of recommended browser names
 */
export function getRecommendedBrowsers(): string[] {
  const currentBrowser = getBrowserName()
  const isIOS = isIOSDevice()

  // On iOS, options are limited due to Apple's restrictions
  if (isIOS) {
    if (currentBrowser === "Safari") {
      return ["Chrome for iOS"]
    }
    return ["Safari"]
  }

  // For other platforms, recommend the major browsers except the current one
  const allBrowsers = ["Chrome", "Firefox", "Edge"]
  return allBrowsers.filter(browser => browser !== currentBrowser)
}

/**
 * Gets fallback mode based on browser capability
 * @returns String indicating the appropriate fallback mode
 */
export function getFallbackMode():
  | "full"
  | "limited"
  | "minimal"
  | "unsupported" {
  const support = checkBrowserSupport()

  if (support.isFullySupported) {
    return "full"
  }

  if (support.hasBasicSupport) {
    // Has essential features but missing some optimizations
    return "limited"
  }

  if (support.features.webAssembly) {
    // Has WebAssembly but missing other critical features
    return "minimal"
  }

  // Missing essential features
  return "unsupported"
}
