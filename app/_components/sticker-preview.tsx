"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { STICKER_REQUIREMENTS } from "@/lib/utils"
import { AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import PreviewContainer from "./preview-container"

/**
 * Interface for StickerPreview component props
 * @property {string} src - URL to the animated sticker image
 * @property {string} [alt] - Alt text for accessibility (defaults to "Animated sticker preview")
 * @property {() => void} [onLoad] - Optional callback when the sticker loads successfully
 * @property {() => void} [onError] - Optional callback when the sticker fails to load
 */
interface StickerPreviewProps {
  src: string
  alt?: string
  onLoad?: () => void
  onError?: () => void
}

/**
 * @description
 * Component that displays an animated sticker preview with loading and error states.
 *
 * Features:
 * - Displays animated WebP sticker in proper dimensions
 * - Shows loading state while sticker is being loaded
 * - Handles and displays error state if sticker fails to load
 * - Maintains proper sticker proportions and boundaries
 * - Provides callbacks for load and error events
 *
 * @param props The component props
 * @returns A component that displays the animated sticker with proper handling of different states
 */
export default function StickerPreview({
  src,
  alt = "Animated sticker preview",
  onLoad,
  onError
}: StickerPreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Reset states when src changes
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
  }, [src])

  /**
   * Handles successful image loading
   */
  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  /**
   * Handles image loading error
   */
  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  return (
    <PreviewContainer>
      {isLoading && (
        <Skeleton className="size-full animate-pulse rounded-none" />
      )}

      {hasError && (
        <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
          <AlertCircle className="text-destructive size-10" />
          <p className="text-destructive font-medium">Failed to load preview</p>
          <p className="text-muted-foreground text-sm">
            The sticker could not be displayed
          </p>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        className={`max-h-[${STICKER_REQUIREMENTS.DIMENSIONS.height}px] max-w-[${STICKER_REQUIREMENTS.DIMENSIONS.width}px] object-contain transition-opacity duration-300 ${
          isLoading || hasError ? "absolute opacity-0" : "opacity-100"
        }`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          maxHeight: STICKER_REQUIREMENTS.DIMENSIONS.height,
          maxWidth: STICKER_REQUIREMENTS.DIMENSIONS.width
        }}
      />
    </PreviewContainer>
  )
}
