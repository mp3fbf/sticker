/**
 * @description
 * Core video processing utility for converting videos to WhatsApp-compatible animated stickers.
 *
 * This module uses FFMPEG WASM to process videos entirely in the browser without server uploads.
 * It handles the following transformations:
 * - Trimming videos to the required duration
 * - Resizing videos to the required dimensions
 * - Converting videos to the WebP format
 * - Setting appropriate compression and quality settings
 *
 * @dependencies
 * - @ffmpeg/ffmpeg: Core FFMPEG functionality compiled to WebAssembly
 * - @ffmpeg/util: Utilities for working with FFMPEG in the browser
 * - Constants: Sticker requirements and encoding settings
 */

import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"
import { STICKER_REQUIREMENTS, WEBP_ENCODING, PROCESSING } from "./constants"

/**
 * Represents the result of processing a video to a sticker
 */
export interface ProcessedSticker {
  /**
   * The processed sticker as a Blob
   */
  blob: Blob

  /**
   * Dimensions of the processed sticker
   */
  dimensions: {
    width: number
    height: number
  }

  /**
   * Duration of the processed sticker in seconds
   */
  duration: number

  /**
   * Size of the processed sticker in bytes
   */
  size: number
}

/**
 * Progress callback type for reporting processing progress
 */
export type ProgressCallback = (progress: number) => void

/**
 * Options for the video processing function
 */
export interface ProcessVideoOptions {
  /**
   * Optional progress callback function to report processing progress
   */
  onProgress?: ProgressCallback

  /**
   * Optional maximum duration in seconds (defaults to STICKER_REQUIREMENTS.MAX_DURATION_SECONDS)
   */
  maxDurationSeconds?: number

  /**
   * Optional dimensions (defaults to STICKER_REQUIREMENTS.DIMENSIONS)
   */
  dimensions?: {
    width: number
    height: number
  }

  /**
   * Optional WebP quality setting (defaults to WEBP_ENCODING.QUALITY)
   */
  quality?: number

  /**
   * Optional compression level (defaults to WEBP_ENCODING.COMPRESSION_LEVEL)
   */
  compressionLevel?: number
}

/**
 * Singleton instance of FFmpeg to avoid loading multiple times
 */
let ffmpegInstance: FFmpeg | null = null

/**
 * Promise representing the loading state of FFmpeg
 */
let ffmpegLoadingPromise: Promise<void> | null = null

/**
 * Load the FFmpeg instance if it hasn't been loaded yet
 * @returns Promise that resolves when FFmpeg is loaded
 */
export async function loadFFmpeg(
  onProgress?: ProgressCallback
): Promise<FFmpeg> {
  // If we already have an instance, return it
  if (ffmpegInstance) {
    return ffmpegInstance
  }

  // If we're in the process of loading, wait for that promise to resolve
  if (ffmpegLoadingPromise) {
    await ffmpegLoadingPromise
    return ffmpegInstance!
  }

  // Create a new loading promise
  ffmpegLoadingPromise = (async () => {
    try {
      // Create a new FFmpeg instance
      ffmpegInstance = new FFmpeg()

      // Configure progress reporting if a callback was provided
      if (onProgress) {
        ffmpegInstance.on("progress", progress => {
          onProgress(progress.progress)
        })
      }

      // Load FFmpeg with correct paths
      // Using CDN URLs for core files
      await ffmpegInstance.load({
        // Using UMD format which is more compatible with browsers
        coreURL: await toBlobURL(
          "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js",
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm",
          "application/wasm"
        ),
        // Also load the worker
        workerURL: await toBlobURL(
          "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.worker.js",
          "text/javascript"
        )
      })
    } catch (error) {
      // Reset instance if loading fails
      ffmpegInstance = null
      console.error("FFmpeg loading error:", error)
      throw error
    }
  })()

  // Wait for loading to complete
  await ffmpegLoadingPromise
  return ffmpegInstance!
}

/**
 * Process a video file to convert it to a WhatsApp-compatible animated sticker
 *
 * @param file The video file to process
 * @param progressCallback Optional callback for progress updates
 * @returns Promise that resolves to the processed sticker as a Blob
 */
export async function processVideo(
  file: File,
  progressCallback?: (progress: number) => void
): Promise<Blob> {
  try {
    // Load FFmpeg
    const ffmpeg = await loadFFmpeg(progressCallback)

    // Prepare input file name - create a unique name to avoid conflicts
    const inputFileName = `input-${Date.now()}.${file.name.split(".").pop() || "mp4"}`
    const outputFileName = "output.webp"

    // Write the input file to FFmpeg's virtual file system
    const inputData = await fetchFile(file)
    await ffmpeg.writeFile(inputFileName, inputData)

    // Prepare the FFmpeg command
    const ffmpegArgs = [
      "-i",
      inputFileName, // Input file
      "-t",
      "3", // Limit duration to 3 seconds (WhatsApp limit)

      // Scale and pad to square dimensions (512x512 for WhatsApp)
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
      "picture", // Optimize for still images with animation
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

    // Clean up temporary files to free memory
    await ffmpeg.deleteFile(inputFileName)
    await ffmpeg.deleteFile(outputFileName)

    // Return the processed blob
    return blob
  } catch (error) {
    console.error("Error processing video:", error)
    throw new Error(
      `Failed to process video: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Extract a frame from a video file at a specific time
 * This can be used to generate a preview thumbnail
 *
 * @param file The video file
 * @param timeInSeconds The time position to extract (in seconds)
 * @returns Promise that resolves to a Blob containing the frame as a JPEG image
 */
export async function extractVideoFrame(
  file: File,
  timeInSeconds: number = 0
): Promise<Blob> {
  try {
    // Load FFmpeg
    const ffmpeg = await loadFFmpeg()

    // Prepare file names
    const inputFileName = `input-${Date.now()}.${file.name.split(".").pop() || "mp4"}`
    const outputFileName = PROCESSING.TEMP_FILES.THUMBNAIL

    // Write the input file to FFmpeg's virtual file system
    const inputData = await fetchFile(file)
    await ffmpeg.writeFile(inputFileName, inputData)

    // Run FFmpeg command to extract a frame
    await ffmpeg.exec([
      "-i",
      inputFileName,
      "-ss",
      timeInSeconds.toString(),
      "-frames:v",
      "1",
      "-q:v",
      "2",
      outputFileName
    ])

    // Read the output file
    const outputData = await ffmpeg.readFile(outputFileName)

    // Create a blob from the output data
    const blob = new Blob([outputData], { type: "image/jpeg" })

    // Clean up temporary files
    await ffmpeg.deleteFile(inputFileName)
    await ffmpeg.deleteFile(outputFileName)

    return blob
  } catch (error) {
    console.error("Error extracting video frame:", error)
    throw new Error(
      `Failed to extract video frame: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Get video metadata such as duration, width, and height
 *
 * @param file The video file
 * @returns Promise that resolves to the video metadata
 */
export async function getVideoMetadata(file: File): Promise<{
  duration: number
  width: number
  height: number
}> {
  try {
    // Load FFmpeg
    const ffmpeg = await loadFFmpeg()

    // Prepare input file name
    const inputFileName = `input-${Date.now()}.${file.name.split(".").pop() || "mp4"}`

    // Write the input file to FFmpeg's virtual file system
    const inputData = await fetchFile(file)
    await ffmpeg.writeFile(inputFileName, inputData)

    // Use FFprobe to get video metadata
    await ffmpeg.exec([
      "-i",
      inputFileName,
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height,duration",
      "-of",
      "json",
      PROCESSING.TEMP_FILES.METADATA
    ])

    // Read the metadata
    const metadataJson = await ffmpeg.readFile(PROCESSING.TEMP_FILES.METADATA)
    const metadataText = new TextDecoder().decode(
      metadataJson as unknown as Uint8Array
    )
    const metadata = JSON.parse(metadataText)

    // Clean up temporary files
    await ffmpeg.deleteFile(inputFileName)
    await ffmpeg.deleteFile(PROCESSING.TEMP_FILES.METADATA)

    // Extract and return the video properties
    const stream = metadata.streams[0]
    return {
      duration: parseFloat(stream.duration) || 0,
      width: stream.width || 0,
      height: stream.height || 0
    }
  } catch (error) {
    console.error("Error getting video metadata:", error)

    // Fallback method using HTML5 Video element
    return new Promise((resolve, reject) => {
      try {
        const video = document.createElement("video")
        video.preload = "metadata"

        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src)
          resolve({
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight
          })
        }

        video.onerror = () => {
          window.URL.revokeObjectURL(video.src)
          reject(new Error("Failed to load video metadata"))
        }

        video.src = URL.createObjectURL(file)
      } catch (fallbackError) {
        reject(
          new Error(
            `Failed to get video metadata: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`
          )
        )
      }
    })
  }
}
