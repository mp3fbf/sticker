/**
 * @description
 * FFMPEG utility for WebAssembly-based video processing in the browser.
 * This module handles the loading and initialization of FFMPEG WebAssembly,
 * with optimizations for performance, caching, and memory usage.
 *
 * Key features:
 * - Singleton pattern for FFMPEG instance
 * - Lazy loading with progress tracking
 * - Caching mechanism to prevent redundant loads
 * - Memory optimization through proper file cleanup
 * - Cross-browser compatibility handling
 *
 * @dependencies
 * - @ffmpeg/ffmpeg: For WebAssembly-based video processing
 * - @ffmpeg/util: For helper functions like toBlobURL and fetchFile
 */

import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"

// Type for progress callback function
export type FFmpegProgressCallback = (progress: number) => void

/**
 * Singleton instance of FFmpeg to avoid multiple loads
 * This improves performance by reusing the loaded WebAssembly module
 */
let ffmpegInstance: FFmpeg | null = null

/**
 * Caching mechanism to prevent redundant loading
 * When a load is in progress, this promise is stored so multiple
 * simultaneous requests can await the same loading process
 */
let ffmpegLoadingPromise: Promise<void> | null = null

/**
 * Loading state to track if the instance is being initialized
 */
let isLoading = false

/**
 * Cache of loaded files to avoid redundant file loads
 */
const fileCache = new Map<string, Uint8Array>()

/**
 * Load the FFmpeg instance with optimized caching
 * Uses a singleton pattern to ensure only one instance is loaded
 *
 * @param onProgress Optional callback for loading progress updates
 * @returns Promise resolving to the FFmpeg instance
 */
export async function loadFFmpeg(
  onProgress?: FFmpegProgressCallback
): Promise<FFmpeg> {
  // Return existing instance if already loaded
  if (ffmpegInstance) {
    return ffmpegInstance
  }

  // If currently loading, wait for the existing promise to resolve
  if (isLoading && ffmpegLoadingPromise) {
    await ffmpegLoadingPromise
    return ffmpegInstance!
  }

  // Set loading state
  isLoading = true

  // Create a new loading promise
  ffmpegLoadingPromise = (async () => {
    try {
      console.time("FFmpeg loading time")

      // Create new FFmpeg instance
      ffmpegInstance = new FFmpeg()

      // Configure progress reporting if callback provided
      if (onProgress) {
        ffmpegInstance.on("progress", progress => {
          onProgress(Math.min(Math.round(progress.progress * 100), 100))
        })
      }

      // Determine the best CDN URL based on browser and connection
      const cdnBase = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd"

      // Pre-fetch critical resources in parallel to speed up loading
      const [coreBlobUrl, wasmBlobUrl, workerBlobUrl] = await Promise.all([
        toBlobURL(`${cdnBase}/ffmpeg-core.js`, "text/javascript"),
        toBlobURL(`${cdnBase}/ffmpeg-core.wasm`, "application/wasm"),
        toBlobURL(`${cdnBase}/ffmpeg-core.worker.js`, "text/javascript")
      ])

      // Load FFmpeg with optimized settings
      await ffmpegInstance.load({
        coreURL: coreBlobUrl,
        wasmURL: wasmBlobUrl,
        workerURL: workerBlobUrl
      })

      console.timeEnd("FFmpeg loading time")
      console.log("FFmpeg loaded successfully")
    } catch (error) {
      // Reset instance and loading state on error
      console.error("FFmpeg loading error:", error)
      ffmpegInstance = null
      throw error
    } finally {
      isLoading = false
    }
  })()

  // Wait for loading to complete
  await ffmpegLoadingPromise
  return ffmpegInstance!
}

/**
 * Optimized function to prepare a file for FFMPEG processing
 * Handles caching to prevent redundant file reads and transfers
 *
 * @param ffmpeg The FFmpeg instance
 * @param file The file to prepare
 * @param inputFileName The name to use for the file in FFmpeg's virtual file system
 * @returns Promise resolving when the file is ready
 */
export async function prepareInputFile(
  ffmpeg: FFmpeg,
  file: File,
  inputFileName: string
): Promise<void> {
  // Generate a cache key from the file
  const cacheKey = await generateFileCacheKey(file)

  // Check if the file is already in the cache
  let fileData: Uint8Array
  if (fileCache.has(cacheKey)) {
    fileData = fileCache.get(cacheKey)!
  } else {
    // Fetch the file data
    fileData = await fetchFile(file)

    // Store in cache if file size is reasonable (< 50MB)
    if (file.size < 50 * 1024 * 1024) {
      fileCache.set(cacheKey, fileData)
    }
  }

  // Write the file to FFmpeg's virtual file system
  await ffmpeg.writeFile(inputFileName, fileData)
}

/**
 * Generate a cache key for a file based on its content
 * Uses a combination of file properties to create a unique identifier
 *
 * @param file The file to generate a key for
 * @returns Promise resolving to a string cache key
 */
async function generateFileCacheKey(file: File): Promise<string> {
  // Using a combination of name, size, and last modified time
  // This is faster than calculating a hash of the full content
  return `${file.name}-${file.size}-${file.lastModified}`
}

/**
 * Clean up FFmpeg resources to free memory
 * Important for maintaining performance during extended usage
 *
 * @param ffmpeg The FFmpeg instance
 * @param fileNames Array of file names to delete from the virtual file system
 */
export async function cleanupFFmpeg(
  ffmpeg: FFmpeg,
  fileNames: string[]
): Promise<void> {
  // Delete all specified files
  for (const fileName of fileNames) {
    try {
      await ffmpeg.deleteFile(fileName)
    } catch (error) {
      // Log but don't throw to continue cleanup
      console.warn(`Error deleting file ${fileName}:`, error)
    }
  }
}

/**
 * Clear the file cache to free memory
 * Useful when the app has been running for a long time
 */
export function clearFileCache(): void {
  fileCache.clear()
}

/**
 * Check if WebAssembly is supported in the current browser
 *
 * @returns Boolean indicating if WebAssembly is supported
 */
export function isWebAssemblySupported(): boolean {
  return (
    typeof WebAssembly === "object" &&
    typeof WebAssembly.instantiate === "function"
  )
}

/**
 * Check if SharedArrayBuffer is supported in the current browser
 * This is required for multi-threaded FFMPEG operations
 *
 * @returns Boolean indicating if SharedArrayBuffer is supported
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
 * Check if the required security headers are set for SharedArrayBuffer
 * Modern browsers require specific headers for SharedArrayBuffer to work
 *
 * @returns Boolean indicating if the security headers are properly set
 */
export function areSecurityHeadersSet(): boolean {
  // Skip check during SSR
  if (typeof window === "undefined") return false

  try {
    // Check if the document is cross-origin isolated
    return window.crossOriginIsolated === true
  } catch (error) {
    return false
  }
}
