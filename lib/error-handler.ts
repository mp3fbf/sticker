/**
 * @description
 * Error handling utilities for the WhatsApp Sticker Maker application.
 * Provides error categorization, message formatting, and logging.
 *
 * Key features:
 * - Error categorization by type
 * - User-friendly error messages
 * - Error logging with severity levels
 * - Browser compatibility checking
 *
 * @dependencies
 * - Constants and utilities from lib/utils.ts
 */

import {
  STICKER_REQUIREMENTS,
  isMobileDevice,
  isSafariBrowser,
  isIOSDevice
} from "./utils"

/**
 * Types of errors that can occur in the application
 */
export enum ErrorType {
  // File validation errors
  FILE_TYPE = "file_type",
  FILE_SIZE = "file_size",
  FILE_DURATION = "file_duration",
  FILE_DIMENSIONS = "file_dimensions",
  FILE_CORRUPTED = "file_corrupted",

  // Processing errors
  PROCESSING_FAILED = "processing_failed",
  MEMORY_LIMIT = "memory_limit",
  OPERATION_TIMEOUT = "operation_timeout",

  // Browser compatibility errors
  BROWSER_UNSUPPORTED = "browser_unsupported",
  WASM_UNSUPPORTED = "wasm_unsupported",
  MOBILE_LIMITATIONS = "mobile_limitations",

  // General errors
  NETWORK_ERROR = "network_error",
  UNKNOWN_ERROR = "unknown_error"
}

/**
 * Error severity levels for logging and handling
 */
export enum ErrorSeverity {
  INFO = "info", // Informational messages
  WARNING = "warning", // Warnings that don't prevent operation
  ERROR = "error", // Errors that prevent a specific operation
  CRITICAL = "critical" // Critical errors that prevent app usage
}

/**
 * Interface for application errors
 */
export interface AppError {
  type: ErrorType
  message: string
  severity: ErrorSeverity
  details?: string
  originalError?: Error
  troubleshootingTips?: string[]
}

/**
 * Creates a standardized application error object
 *
 * @param type - Type of error
 * @param message - User-friendly error message
 * @param severity - Error severity level
 * @param details - Optional technical details
 * @param originalError - Optional original error object
 * @param troubleshootingTips - Optional troubleshooting tips
 * @returns AppError object
 */
export function createError(
  type: ErrorType,
  message: string,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  details?: string,
  originalError?: Error,
  troubleshootingTips?: string[]
): AppError {
  return {
    type,
    message,
    severity,
    details,
    originalError,
    troubleshootingTips
  }
}

/**
 * Logs an error with appropriate severity level
 *
 * @param error - The error to log
 */
export function logError(error: AppError): void {
  const { type, message, severity, details, originalError } = error

  // Log to console with appropriate level
  switch (severity) {
    case ErrorSeverity.INFO:
      console.info(`[${type}] ${message}`, details, originalError)
      break
    case ErrorSeverity.WARNING:
      console.warn(`[${type}] ${message}`, details, originalError)
      break
    case ErrorSeverity.ERROR:
      console.error(`[${type}] ${message}`, details, originalError)
      break
    case ErrorSeverity.CRITICAL:
      console.error(
        `⚠️ CRITICAL ERROR [${type}] ${message}`,
        details,
        originalError
      )
      break
  }

  // Here you could also send errors to an external service
  // if implemented in the future
}

/**
 * Creates a file type error
 *
 * @param fileType - The invalid file type
 * @returns AppError for file type issues
 */
export function createFileTypeError(fileType: string): AppError {
  const supportedFormats = STICKER_REQUIREMENTS.SUPPORTED_INPUT_FORMATS.map(
    format => format.replace("video/", "").toUpperCase()
  ).join(", ")

  return createError(
    ErrorType.FILE_TYPE,
    `Unsupported file format: ${fileType}`,
    ErrorSeverity.ERROR,
    `The application only supports ${supportedFormats} formats.`,
    undefined,
    [
      `Try converting your video to one of the supported formats: ${supportedFormats}.`,
      "You can use online video converters to change the format.",
      "Make sure the file extension matches the actual format of the video."
    ]
  )
}

/**
 * Creates a file size error
 *
 * @param fileSize - The size of the file in bytes
 * @returns AppError for file size issues
 */
export function createFileSizeError(fileSize: number): AppError {
  const maxSize = isMobileDevice()
    ? STICKER_REQUIREMENTS.MAX_FILE_SIZE_MB.MOBILE
    : STICKER_REQUIREMENTS.MAX_FILE_SIZE_MB.DESKTOP

  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2)

  return createError(
    ErrorType.FILE_SIZE,
    `File too large: ${fileSizeMB}MB (max ${maxSize}MB)`,
    ErrorSeverity.ERROR,
    `The maximum allowed file size is ${maxSize}MB for ${isMobileDevice() ? "mobile" : "desktop"} devices.`,
    undefined,
    [
      `Try compressing your video to reduce its size below ${maxSize}MB.`,
      "Shorter videos or lower resolution videos will have smaller file sizes.",
      "Try trimming unnecessary parts of the video before uploading."
    ]
  )
}

/**
 * Creates a file duration error
 *
 * @param duration - The duration of the video in seconds
 * @returns AppError for duration issues
 */
export function createFileDurationError(duration: number): AppError {
  const maxDuration = STICKER_REQUIREMENTS.MAX_DURATION_SECONDS

  return createError(
    ErrorType.FILE_DURATION,
    `Video too long: ${duration.toFixed(1)} seconds (max ${maxDuration} seconds)`,
    ErrorSeverity.WARNING,
    `WhatsApp stickers can be maximum ${maxDuration} seconds long.`,
    undefined,
    [
      `The video will be automatically trimmed to ${maxDuration} seconds.`,
      "If you want to control which part is used, trim the video yourself before uploading.",
      "For better quality, consider uploading a video that's already the right length."
    ]
  )
}

/**
 * Creates a processing error based on the specific error message or type
 *
 * @param error - The original error
 * @returns AppError for processing issues
 */
export function createProcessingError(error: Error | string): AppError {
  const errorMsg = typeof error === "string" ? error : error.message

  // Check for common error patterns
  if (errorMsg.includes("memory") || errorMsg.includes("allocation failed")) {
    return createError(
      ErrorType.MEMORY_LIMIT,
      "Not enough memory to process the video",
      ErrorSeverity.ERROR,
      errorMsg,
      typeof error === "string" ? undefined : error,
      [
        "Try uploading a smaller or shorter video.",
        "Close other browser tabs to free up memory.",
        "If on mobile, try again on a desktop device."
      ]
    )
  }

  if (errorMsg.includes("timeout") || errorMsg.includes("took too long")) {
    return createError(
      ErrorType.OPERATION_TIMEOUT,
      "Processing took too long and timed out",
      ErrorSeverity.ERROR,
      errorMsg,
      typeof error === "string" ? undefined : error,
      [
        "Try with a smaller or shorter video.",
        "Check your internet connection.",
        "If on mobile, try on a desktop device for better performance."
      ]
    )
  }

  // Default processing error
  return createError(
    ErrorType.PROCESSING_FAILED,
    "Failed to process the video",
    ErrorSeverity.ERROR,
    errorMsg,
    typeof error === "string" ? undefined : error,
    [
      "Try uploading a different video.",
      "Make sure the video isn't corrupted.",
      "Try refreshing the page and attempting again."
    ]
  )
}

/**
 * Creates an error for browser compatibility issues
 *
 * @returns AppError for browser compatibility issues
 */
export function createBrowserCompatibilityError(): AppError {
  let message = "Your browser may not fully support all features"
  let details =
    "This application works best in modern browsers like Chrome, Firefox, or Edge."
  let tips = [
    "Try using a different browser like Google Chrome or Mozilla Firefox."
  ]

  if (isSafariBrowser()) {
    message = "Some features may not work correctly in Safari"
    details =
      "Safari has limited support for the video processing features we use."
    tips = [
      "For best results, try using Chrome or Firefox instead.",
      "Make sure you're using the latest version of Safari.",
      "Some features might work with limited functionality."
    ]
  }

  if (isIOSDevice()) {
    message = "Limited functionality on iOS devices"
    details =
      "iOS devices have restrictions that may affect video processing and downloading."
    tips.push(
      "Downloaded stickers may need to be manually saved to your photo library.",
      "Processing larger videos may not work on iOS devices."
    )
  }

  return createError(
    ErrorType.BROWSER_UNSUPPORTED,
    message,
    ErrorSeverity.WARNING,
    details,
    undefined,
    tips
  )
}

/**
 * Checks if WebAssembly is supported in the current browser
 *
 * @returns AppError if WebAssembly is not supported, undefined otherwise
 */
export function checkWasmSupport(): AppError | undefined {
  if (typeof WebAssembly === "undefined") {
    return createError(
      ErrorType.WASM_UNSUPPORTED,
      "Your browser doesn't support WebAssembly",
      ErrorSeverity.CRITICAL,
      "WebAssembly is required for video processing in the browser.",
      undefined,
      [
        "Try using a modern browser like Chrome, Firefox, or Edge.",
        "Update your current browser to the latest version.",
        "If on mobile, try using a desktop browser instead."
      ]
    )
  }

  return undefined
}

/**
 * Checks for SharedArrayBuffer support, which is needed for some FFMPEG operations
 *
 * @returns AppError if SharedArrayBuffer is not supported, undefined otherwise
 */
export function checkSharedArrayBufferSupport(): AppError | undefined {
  try {
    // Try to create a SharedArrayBuffer to test support
    new SharedArrayBuffer(1)
    return undefined
  } catch (error) {
    return createError(
      ErrorType.BROWSER_UNSUPPORTED,
      "Your browser doesn't support required features",
      ErrorSeverity.WARNING,
      "SharedArrayBuffer is not available, which may affect some processing features.",
      error instanceof Error ? error : undefined,
      [
        "Try using Chrome or Firefox browsers.",
        "Make sure your browser is up to date.",
        "Some features may still work but with limited functionality."
      ]
    )
  }
}

/**
 * Creates an appropriate error message from an unknown error
 *
 * @param error - The original error
 * @returns AppError with appropriate categorization and message
 */
export function handleUnknownError(error: unknown): AppError {
  if (error instanceof Error) {
    // Try to categorize known errors
    if (
      error.message.includes("network") ||
      error.message.includes("fetch") ||
      error.message.includes("connection")
    ) {
      return createError(
        ErrorType.NETWORK_ERROR,
        "Network error encountered",
        ErrorSeverity.ERROR,
        error.message,
        error,
        [
          "Check your internet connection.",
          "Try refreshing the page.",
          "If the problem persists, try again later."
        ]
      )
    }

    // Generic error with the original error details
    return createError(
      ErrorType.UNKNOWN_ERROR,
      "An unexpected error occurred",
      ErrorSeverity.ERROR,
      error.message,
      error,
      [
        "Try refreshing the page.",
        "Check if your browser is up to date.",
        "Try again with a different video file."
      ]
    )
  }

  // When it's not even an Error object
  return createError(
    ErrorType.UNKNOWN_ERROR,
    "An unexpected error occurred",
    ErrorSeverity.ERROR,
    String(error),
    undefined,
    ["Try refreshing the page.", "Try again with a different file."]
  )
}
