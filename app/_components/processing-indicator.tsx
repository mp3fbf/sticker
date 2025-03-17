"use client"

import { Progress } from "@/components/ui/progress"
import { Check, RotateCcw } from "lucide-react"
import { useEffect, useState } from "react"

/**
 * @description
 * A component that displays the processing status and progress
 * of video conversion with visual feedback.
 *
 * Features:
 * - Animated progress bar for smoother UX
 * - Success/error state handling
 * - Retry functionality
 * - Percentage display
 *
 * @param progress - Current progress percentage (0-100)
 * @param isProcessing - Whether processing is currently active
 * @param error - Error message if processing failed
 * @param onRetry - Optional callback for retry functionality
 */
interface ProcessingIndicatorProps {
  progress: number
  isProcessing: boolean
  error?: string | null
  onRetry?: () => void
}

export default function ProcessingIndicator({
  progress,
  isProcessing,
  error,
  onRetry
}: ProcessingIndicatorProps) {
  // Animate progress for smoother UX
  const [displayProgress, setDisplayProgress] = useState(0)

  useEffect(() => {
    // Gradually update displayed progress for smoother animation
    if (isProcessing) {
      const timeout = setTimeout(() => {
        // Don't update if we've reached 100% or if displayed progress is ahead
        if (displayProgress < 100 && displayProgress < progress) {
          setDisplayProgress(prev => Math.min(progress, prev + 1))
        }
      }, 30) // Update frequently for smooth animation

      return () => clearTimeout(timeout)
    } else if (!isProcessing && progress === 100) {
      // Reset progress after a delay when done
      const timeout = setTimeout(() => {
        setDisplayProgress(0)
      }, 2000)

      return () => clearTimeout(timeout)
    }
  }, [displayProgress, progress, isProcessing])

  // Reset display progress when processing starts/stops
  useEffect(() => {
    if (isProcessing && progress === 0) {
      setDisplayProgress(0)
    }
  }, [isProcessing, progress])

  // Display error state with retry option
  if (error) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-destructive text-sm">Processing failed: {error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
            >
              <RotateCcw className="size-3" />
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {progress === 100 && !isProcessing ? (
            <span className="flex items-center gap-1 text-green-500">
              <Check className="size-4" />
              Processing complete
            </span>
          ) : (
            "Converting video to sticker..."
          )}
        </p>
        <span className="text-muted-foreground text-xs">
          {progress < 100 ? `${Math.round(progress)}%` : ""}
        </span>
      </div>
      <Progress value={displayProgress} className="h-2" />
    </div>
  )
}
