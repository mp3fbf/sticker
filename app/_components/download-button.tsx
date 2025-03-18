"use client"

/**
 * @description
 * A reusable button component for downloading files, specifically optimized
 * for WhatsApp stickers. Handles the download process, loading states, and
 * success/error feedback.
 *
 * @features
 * - Loading state visualization during download
 * - Success notification via toast
 * - Error handling with visual feedback
 * - Customizable appearance and behavior
 *
 * @dependencies
 * - UI components from shadcn/ui
 * - Lucide icons
 * - useToast for notifications
 * - download-helper for file operations
 */

import { Button, ButtonProps } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { downloadBlob, generateStickerFilename } from "@/lib/download-helper"
import { Download } from "lucide-react"
import { useState } from "react"

export interface DownloadButtonProps
  extends Omit<ButtonProps, "onClick" | "onError"> {
  /** Blob to download */
  blob: Blob | null
  /** Custom filename (optional, will generate one if not provided) */
  filename?: string
  /** Original filename to base the generated name on */
  originalFilename?: string
  /** Text to display on the button */
  text?: string
  /** Icon to show (defaults to Download icon) */
  icon?: React.ReactNode
  /** Whether to show the icon (defaults to true) */
  showIcon?: boolean
  /** Callback when download succeeds */
  onSuccess?: () => void
  /** Callback when download fails */
  onError?: (error: Error) => void
  /** Custom toast message on success */
  successMessage?: string
}

/**
 * Button component for downloading processed stickers
 */
export default function DownloadButton({
  blob,
  filename,
  originalFilename,
  text = "Download Sticker",
  icon = <Download className="mr-2 size-4" />,
  showIcon = true,
  onSuccess,
  onError,
  successMessage = "Your sticker has been downloaded successfully.",
  className,
  ...props
}: DownloadButtonProps) {
  const { toast } = useToast()
  const [isDownloading, setIsDownloading] = useState(false)

  /**
   * Handles the download process, with loading state and error handling
   */
  const handleDownload = async () => {
    if (!blob) {
      toast({
        title: "Download failed",
        description: "No file is available for download.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsDownloading(true)

      // Use provided filename or generate one
      const downloadFilename =
        filename || generateStickerFilename(originalFilename)

      // Initiate download
      await downloadBlob(blob, downloadFilename)

      // Show success message
      toast({
        title: "Sticker downloaded",
        description: successMessage
      })

      // Call success callback if provided
      onSuccess?.()
    } catch (error) {
      console.error("Download failed:", error)

      // Show error message
      toast({
        title: "Download failed",
        description:
          "There was a problem downloading your sticker. Please try again.",
        variant: "destructive"
      })

      // Call error callback if provided
      if (error instanceof Error) {
        onError?.(error)
      } else {
        onError?.(new Error("Unknown download error"))
      }
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading || !blob}
      className={className}
      {...props}
    >
      {isDownloading ? (
        <span className="flex items-center">
          <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Downloading...
        </span>
      ) : (
        <>
          {showIcon && icon}
          {text}
        </>
      )}
    </Button>
  )
}
