"use client"

import { processVideo } from "@/lib/process-video"
import { createObjectURL, generateStickerFilename } from "@/lib/utils"
import { useState, useCallback } from "react"

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
}

/**
 * @description
 * Custom hook for processing videos into WhatsApp stickers.
 * Manages the entire processing lifecycle including state management,
 * progress tracking, error handling, and result generation.
 *
 * @param options - Optional configuration callbacks
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

  /**
   * Process a video file into a WhatsApp sticker
   * @param file - The video file to process
   * @returns Promise with the processing result
   */
  const processVideoFile = useCallback(
    async (file: File) => {
      // Reset state
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
        // Process the video with progress reporting
        const blob = await processVideo(file, progress => {
          setState(prev => ({ ...prev, progress }))
          options?.onProgress?.(progress)
        })

        // Generate a filename and URL for the result
        const filename = generateStickerFilename(file.name)
        const url = createObjectURL(blob)

        // Update state with successful result
        setState(prev => ({
          ...prev,
          isProcessing: false,
          progress: 100,
          result: {
            blob,
            url,
            filename
          }
        }))

        // Call success callback if provided
        options?.onSuccess?.({ blob, url, filename })

        return { blob, url, filename }
      } catch (error) {
        // Handle errors
        const errorMessage =
          error instanceof Error ? error.message : "Failed to process video"

        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: errorMessage,
          progress: 0
        }))

        options?.onError?.(errorMessage)
        throw error
      }
    },
    [options]
  )

  /**
   * Retry processing the last attempted file
   * @param file - The file to retry processing
   * @returns Promise with the processing result
   */
  const retryLastFile = useCallback(
    async (file: File) => {
      if (!file) return
      return processVideoFile(file)
    },
    [processVideoFile]
  )

  /**
   * Reset the processor state
   * Cleans up resources and returns to initial state
   */
  const reset = useCallback(() => {
    // Clean up any URLs to prevent memory leaks
    if (state.result.url) {
      URL.revokeObjectURL(state.result.url)
    }

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
  }, [state.result.url])

  return {
    ...state,
    processVideoFile,
    retryLastFile,
    reset
  }
}
