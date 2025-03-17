/**
 * @description
 * This file provides utilities for working with FFmpeg WebAssembly in the browser.
 * It handles initialization, loading, and video processing functionality.
 *
 * Key features:
 * - Lazy loading of FFmpeg WASM
 * - Singleton pattern to prevent multiple loads
 * - Video processing for WhatsApp sticker requirements
 * - Video metadata extraction
 *
 * @dependencies
 * - @ffmpeg/ffmpeg: Core FFmpeg WebAssembly library
 * - @ffmpeg/util: Utilities for working with FFmpeg
 */

"use client"

import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile } from "@ffmpeg/util"

// Cache the FFmpeg instance to avoid loading multiple times
let ffmpegInstance: FFmpeg | null = null

/**
 * Loads and initializes the FFmpeg WebAssembly instance
 * @returns Promise resolving to FFmpeg instance
 */
export async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) {
    return ffmpegInstance
  }

  // Create and load a new instance if one doesn't exist
  ffmpegInstance = new FFmpeg()

  try {
    await ffmpegInstance.load()
    return ffmpegInstance
  } catch (error) {
    ffmpegInstance = null
    console.error("Failed to load FFmpeg:", error)
    throw new Error(
      "Failed to load video processing library. Please try again."
    )
  }
}

/**
 * Processes a video file to match WhatsApp sticker requirements
 *
 * WhatsApp sticker requirements:
 * - WebP format
 * - 512x512 pixels (square aspect ratio)
 * - Max 3 seconds duration
 * - No audio
 *
 * @param file The video file to process
 * @param onProgress Optional callback for progress updates (0-100)
 * @returns Promise resolving to a WebP blob that can be used as a WhatsApp sticker
 */
export async function processVideo(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  try {
    // Update progress to indicate we're starting
    onProgress?.(5)

    // Get FFmpeg instance
    const ffmpeg = await getFFmpeg()
    onProgress?.(15)

    // Write input file to FFmpeg's virtual file system
    const inputFileName = "input." + file.name.split(".").pop()
    const inputData = await fetchFile(file)
    await ffmpeg.writeFile(inputFileName, inputData)
    onProgress?.(30)

    // Process the video according to WhatsApp sticker specifications
    await ffmpeg.exec([
      "-i",
      inputFileName,
      "-t",
      "3", // Limit to 3 seconds
      "-vf",
      "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2,setsar=1",
      "-c:v",
      "libwebp",
      "-lossless",
      "0",
      "-compression_level",
      "6",
      "-q:v",
      "80",
      "-loop",
      "0", // Infinite loop
      "-preset",
      "picture",
      "-an", // Remove audio
      "-vsync",
      "0",
      "output.webp"
    ])
    onProgress?.(80)

    // Read the processed file
    const outputData = await ffmpeg.readFile("output.webp")
    onProgress?.(95)

    // Clean up files from FFmpeg's virtual file system
    await ffmpeg.deleteFile(inputFileName)
    await ffmpeg.deleteFile("output.webp")

    onProgress?.(100)

    // Return the WebP file as a Blob
    return new Blob([outputData], { type: "image/webp" })
  } catch (error) {
    console.error("Error processing video:", error)
    throw new Error(
      "Failed to process video. Please try a different file or refresh the page."
    )
  }
}

/**
 * Extracts metadata from a video file
 *
 * @param file The video file to analyze
 * @returns Object containing video metadata (duration, width, height)
 */
export async function getVideoMetadata(file: File): Promise<{
  duration: number
  width: number
  height: number
  hasAudio: boolean
}> {
  try {
    const ffmpeg = await getFFmpeg()

    // Create variables to store the metadata
    let duration = 0
    let width = 0
    let height = 0
    let hasAudio = false
    const logs: string[] = []

    // Set up an event listener to capture log messages
    const logListener = (logData: { message: string }) => {
      logs.push(logData.message)
    }

    // Add the log event listener
    ffmpeg.on("log", logListener)

    // Write input file to FFmpeg's virtual file system
    const inputFileName = "input." + file.name.split(".").pop()
    const inputData = await fetchFile(file)
    await ffmpeg.writeFile(inputFileName, inputData)

    // Create a temporary file to store the metadata
    await ffmpeg.exec(["-i", inputFileName, "-f", "null", "-"])

    // Clean up
    await ffmpeg.deleteFile(inputFileName)

    // Remove the log event listener
    ffmpeg.off("log", logListener)

    // Parse logs to extract metadata
    for (const line of logs) {
      // Match duration
      const durationMatch = line.match(
        /Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/
      )
      if (durationMatch) {
        const [, hours, minutes, seconds, centiseconds] = durationMatch
        duration =
          parseFloat(hours) * 3600 +
          parseFloat(minutes) * 60 +
          parseFloat(seconds) +
          parseFloat(centiseconds) / 100
      }

      // Match video dimensions
      const dimensionsMatch = line.match(/(\d{2,4})x(\d{2,4})/)
      if (dimensionsMatch && line.includes("Video:")) {
        width = parseInt(dimensionsMatch[1])
        height = parseInt(dimensionsMatch[2])
      }

      // Check for audio stream
      if (line.includes("Audio:")) {
        hasAudio = true
      }
    }

    return { duration, width, height, hasAudio }
  } catch (error) {
    console.error("Error getting video metadata:", error)
    throw new Error("Failed to analyze video file.")
  }
}

/**
 * Checks if FFmpeg is supported in the current browser
 * @returns True if FFmpeg is supported
 */
export function isFFmpegSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof SharedArrayBuffer !== "undefined" &&
    typeof WebAssembly !== "undefined"
  )
}
