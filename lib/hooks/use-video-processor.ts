"use client"

import {
  loadFFmpeg,
  prepareInputFile,
  cleanupFFmpeg,
  isWebAssemblySupported
} from "@/lib/ffmpeg"
import { createObjectURL, generateStickerFilename } from "@/lib/utils"
import { useState, useCallback, useRef, useEffect } from "react"

/**
 * @description
 * State interface for video processing.
 * Tracks processing status, progress, errors, and results.
 */
interface VideoProcessorState {
  isProcessing: boolean
  progress: number
  error: string | null
  result: {
    blob: Blob | null
    url: string | null
    filename: string | null
  }
}

/**
 * @description
 * Configuration options for the video processor hook.
 */
interface VideoProcessorOptions {
  onSuccess?: (result: { blob: Blob; url: string; filename: string }) => void
  onError?: (error: string) => void
  onProgress?: (progress: number) => void

  /**
   * Whether to cache processed results
   * @default true
   */
  enableCache?: boolean

  /**
   * Optional custom function to generate cache keys
   */
  getCacheKey?: (file: File) => string
}

// Cache for storing processed results to avoid redundant processing
const processedCache = new Map<
  string,
  {
    blob: Blob
    url: string
    filename: string
    timestamp: number
  }
>()

// Maximum cache size (in number of entries)
const MAX_CACHE_SIZE = 5

// Maximum cache age (in milliseconds) - 30 minutes
const MAX_CACHE_AGE = 30 * 60 * 1000

/**
 * @description
 * Custom hook for processing videos into WhatsApp stickers.
 * Manages the entire processing lifecycle including state management,
 * progress tracking, error handling, and result generation.
 *
 * Includes performance optimizations:
 * - Result caching to avoid redundant processing
 * - Cleanup of previous operations when starting new ones
 * - Memory management for URL objects
 * - Web Worker support when available
 * - Lazy loading of FFmpeg
 *
 * @param options - Optional configuration callbacks and settings
 * @returns Video processor state and methods
 *
 * @example
 * const {
 *   isProcessing,
 *   progress,
 *   error,
 *   result,
 *   processVideoFile,
 *   retryLastFile,
 *   reset
 * } = useVideoProcessor({
 *   onSuccess: (result) => console.log("Processing succeeded", result),
 *   onError: (error) => console.error("Processing failed", error),
 *   onProgress: (progress) => console.log("Progress:", progress)
 * });
 */
export function useVideoProcessor(options?: VideoProcessorOptions) {
  const {
    onSuccess,
    onError,
    onProgress,
    enableCache = true,
    getCacheKey = defaultGetCacheKey
  } = options || {}

  // State for tracking processing status
  const [state, setState] = useState<VideoProcessorState>({
    isProcessing: false,
    progress: 0,
    error: null,
    result: {
      blob: null,
      url: null,
      filename: null
    }
  })

  // Use refs to avoid state closures in async functions
  const stateRef = useRef(state)
  const optionsRef = useRef(options)

  // Keep refs updated with latest values
  useEffect(() => {
    stateRef.current = state
    optionsRef.current = options
  }, [state, options])

  // Track the last processed file for retries
  const lastFileRef = useRef<File | null>(null)

  // Track active abort controller for cancellation support
  const abortControllerRef = useRef<AbortController | null>(null)

  // Clean up the cache periodically
  useEffect(() => {
    // Function to clean old cache entries
    const cleanCache = () => {
      const now = Date.now()
      const oldEntries: string[] = []

      // Find old entries
      processedCache.forEach((value, key) => {
        if (now - value.timestamp > MAX_CACHE_AGE) {
          oldEntries.push(key)
        }
      })

      // Remove old entries and revoke URLs
      oldEntries.forEach(key => {
        const entry = processedCache.get(key)
        if (entry && entry.url) {
          URL.revokeObjectURL(entry.url)
        }
        processedCache.delete(key)
      })
    }

    // Clean cache on mount
    cleanCache()

    // Set up interval for periodic cleaning
    const interval = setInterval(cleanCache, MAX_CACHE_AGE / 2)

    // Clean up interval on unmount
    return () => clearInterval(interval)
  }, [])

  /**
   * Default function to generate cache keys from files
   */
  function defaultGetCacheKey(file: File): string {
    return `${file.name}-${file.size}-${file.lastModified}`
  }

  /**
   * Add a result to the cache with LRU eviction policy
   */
  const addToCache = useCallback(
    (
      key: string,
      result: {
        blob: Blob
        url: string
        filename: string
      }
    ) => {
      // Skip if caching is disabled
      if (!enableCache) return

      // Create cache entry with timestamp
      const entry = { ...result, timestamp: Date.now() }

      // If cache is at capacity, remove oldest entry
      if (processedCache.size >= MAX_CACHE_SIZE) {
        let oldestKey: string | null = null
        let oldestTime = Infinity

        processedCache.forEach((value, key) => {
          if (value.timestamp < oldestTime) {
            oldestTime = value.timestamp
            oldestKey = key
          }
        })

        if (oldestKey) {
          const oldEntry = processedCache.get(oldestKey)
          if (oldEntry && oldEntry.url) {
            URL.revokeObjectURL(oldEntry.url)
          }
          processedCache.delete(oldestKey)
        }
      }

      // Add new entry to cache
      processedCache.set(key, entry)
    },
    [enableCache]
  )

  /**
   * Process a video file into a WhatsApp sticker with caching
   * @param file - The video file to process
   * @returns Promise with the processing result
   */
  const processVideoFile = useCallback(
    async (file: File) => {
      // Store file for potential retry
      lastFileRef.current = file

      // Create abort controller for potential cancellation
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      // Check if WebAssembly is supported
      if (!isWebAssemblySupported()) {
        const error =
          "WebAssembly is not supported in this browser. Please try a different browser."
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error,
          progress: 0
        }))
        optionsRef.current?.onError?.(error)
        throw new Error(error)
      }

      // Check cache for already processed result
      if (enableCache) {
        const cacheKey = getCacheKey(file)
        const cachedResult = processedCache.get(cacheKey)

        if (cachedResult) {
          // Update cache entry timestamp (LRU pattern)
          cachedResult.timestamp = Date.now()

          // Use cached result
          setState(prev => ({
            ...prev,
            isProcessing: false,
            progress: 100,
            error: null,
            result: {
              blob: cachedResult.blob,
              url: cachedResult.url,
              filename: cachedResult.filename
            }
          }))

          optionsRef.current?.onSuccess?.({
            blob: cachedResult.blob,
            url: cachedResult.url,
            filename: cachedResult.filename
          })

          // Return cached result
          return {
            blob: cachedResult.blob,
            url: cachedResult.url,
            filename: cachedResult.filename
          }
        }
      }

      // Reset state for new processing
      setState(prev => ({
        ...prev,
        isProcessing: true,
        progress: 0,
        error: null,
        result: {
          blob: null,
          url: null,
          filename: null
        }
      }))

      try {
        // Clean up previous URL if it exists
        if (stateRef.current.result.url) {
          URL.revokeObjectURL(stateRef.current.result.url)
        }

        // Setup progress tracking
        const handleProgress = (progress: number) => {
          // Check if operation was aborted
          if (abortController.signal.aborted) {
            throw new Error("Processing was cancelled")
          }

          setState(prev => ({ ...prev, progress }))
          optionsRef.current?.onProgress?.(progress)
        }

        // Load FFmpeg
        const ffmpeg = await loadFFmpeg(handleProgress)

        // Prepare input file name - create a unique name to avoid conflicts
        const inputFileName = `input-${Date.now()}.${file.name.split(".").pop() || "mp4"}`
        const outputFileName = "output.webp"

        // Prepare input file with optimized loading
        await prepareInputFile(ffmpeg, file, inputFileName)

        // FFMPEG processing command
        const ffmpegArgs = [
          "-i",
          inputFileName, // Input file
          "-t",
          "3", // Limit duration to 3 seconds

          // Scale and pad to square dimensions (512x512)
          "-vf",
          "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2,setsar=1",

          // WebP format settings
          "-c:v",
          "libwebp", // WebP codec
          "-lossless",
          "0", // Use lossy compression
          "-compression_level",
          "6",
          "-q:v",
          "80", // Quality setting
          "-loop",
          "0", // Infinite loop
          "-preset",
          "picture", // Optimize for animation
          "-an", // Remove audio
          "-vsync",
          "0", // Frame sync method
          outputFileName // Output file
        ]

        // Execute the FFmpeg command
        await ffmpeg.exec(ffmpegArgs)

        // Read the processed file
        const outputData = await ffmpeg.readFile(outputFileName)

        // Create a blob from the output data
        const blob = new Blob([outputData], { type: "image/webp" })

        // Generate a filename and URL for the result
        const filename = generateStickerFilename(file.name)
        const url = createObjectURL(blob)

        // Update state with successful result
        setState(prev => ({
          ...prev,
          isProcessing: false,
          progress: 100,
          error: null,
          result: {
            blob,
            url,
            filename
          }
        }))

        // Call success callback if provided
        optionsRef.current?.onSuccess?.({ blob, url, filename })

        // Cache the result if caching is enabled
        if (enableCache) {
          addToCache(getCacheKey(file), { blob, url, filename })
        }

        // Clean up temporary files to free memory
        await cleanupFFmpeg(ffmpeg, [inputFileName, outputFileName])

        return { blob, url, filename }
      } catch (error) {
        // Skip error handling if operation was cancelled
        if (abortController.signal.aborted) {
          return stateRef.current.result
        }

        // Handle errors
        const errorMessage =
          error instanceof Error ? error.message : "Failed to process video"

        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: errorMessage,
          progress: 0
        }))

        optionsRef.current?.onError?.(errorMessage)
        throw error
      } finally {
        // Clear abort controller reference
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null
        }
      }
    },
    [addToCache, enableCache, getCacheKey]
  )

  /**
   * Cancel the current processing operation if active
   */
  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current && stateRef.current.isProcessing) {
      abortControllerRef.current.abort()

      setState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 0,
        error: "Processing cancelled"
      }))
    }
  }, [])

  /**
   * Retry processing the last attempted file
   * @returns Promise with the processing result or undefined if no file
   */
  const retryLastFile = useCallback(async () => {
    const file = lastFileRef.current
    if (!file) return
    return processVideoFile(file)
  }, [processVideoFile])

  /**
   * Reset the processor state and clear cached results
   * Cleans up resources and returns to initial state
   */
  const reset = useCallback(() => {
    // Cancel any active processing
    cancelProcessing()

    // Clean up any URLs to prevent memory leaks
    if (stateRef.current.result.url) {
      URL.revokeObjectURL(stateRef.current.result.url)
    }

    // Reset state
    setState({
      isProcessing: false,
      progress: 0,
      error: null,
      result: {
        blob: null,
        url: null,
        filename: null
      }
    })

    // Clear last file reference
    lastFileRef.current = null
  }, [cancelProcessing])

  // Clear resources on unmount
  useEffect(() => {
    return () => {
      // Cancel any active processing
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Clean up any URLs
      if (stateRef.current.result.url) {
        URL.revokeObjectURL(stateRef.current.result.url)
      }
    }
  }, [])

  return {
    ...state,
    processVideoFile,
    retryLastFile,
    cancelProcessing,
    reset
  }
}

/**
 * Clear the entire processing cache
 * Useful for freeing memory or for debugging
 */
export function clearProcessingCache(): void {
  // Revoke all URLs before clearing the cache
  processedCache.forEach(entry => {
    if (entry.url) {
      URL.revokeObjectURL(entry.url)
    }
  })

  // Clear the cache
  processedCache.clear()
}
