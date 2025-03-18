/**
 * @description
 * A component that displays a success state after a video has been
 * successfully processed into a WhatsApp sticker.
 *
 * Features:
 * - Animated success indication with visual feedback
 * - Sticker preview with proper styling
 * - Download button for the processed sticker
 * - Option to create another sticker
 * - Clear instructions for using the sticker in WhatsApp
 *
 * @dependencies
 * - Framer Motion: For animations
 * - Lucide React: For icons
 * - StickerPreview: For displaying the processed sticker
 * - DownloadButton: For downloading the sticker
 */

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle2, Download, Share2 } from "lucide-react"
import { useEffect } from "react"
import DownloadButton from "./download-button"
import StickerPreview from "./sticker-preview"

export interface SuccessViewProps {
  /** The blob of the processed sticker */
  blob: Blob | null
  /** URL for previewing the sticker */
  previewUrl: string | null
  /** Original filename (optional) */
  originalFilename?: string
  /** Function to reset and start over */
  onReset: () => void
  /** Additional CSS classes */
  className?: string
  /** Optional title override */
  title?: string
  /** Optional description override */
  description?: string
  /** Optional onSuccess callback */
  onSuccess?: () => void
}

/**
 * Component that displays a success state after sticker creation
 */
export default function SuccessView({
  blob,
  previewUrl,
  originalFilename,
  onReset,
  className,
  title = "Your Sticker is Ready!",
  description = "Your animated sticker has been created and is ready to use in WhatsApp.",
  onSuccess
}: SuccessViewProps) {
  // Call onSuccess callback on mount
  useEffect(() => {
    onSuccess?.()
  }, [onSuccess])

  if (!previewUrl) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("w-full", className)}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            {/* Success indicator */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.2
              }}
              className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
            >
              <CheckCircle2 className="size-8" />
            </motion.div>

            {/* Success message */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="mb-6 text-center"
            >
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {description}
              </p>
            </motion.div>

            {/* Sticker preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-6 w-full max-w-xs"
            >
              <StickerPreview src={previewUrl} alt="Your WhatsApp sticker" />
            </motion.div>

            {/* WhatsApp instructions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="text-muted-foreground mb-6 max-w-md text-center text-sm"
            >
              <p>
                Download this animated sticker and import it into WhatsApp using
                a sticker creator app or your phone's gallery.
              </p>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="flex w-full flex-col-reverse gap-3 pb-6 sm:flex-row sm:justify-between"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="items-center justify-center sm:flex"
              >
                <ArrowLeft className="mr-2 size-4" />
                Create Another
              </Button>

              <div className="flex gap-2">
                <DownloadButton
                  blob={blob}
                  originalFilename={originalFilename}
                  text="Download Sticker"
                  icon={<Download className="mr-2 size-4" />}
                  size="sm"
                  className="w-full sm:w-auto"
                  successMessage="Your sticker has been downloaded and is ready to use in WhatsApp."
                />

                {/* Share button - conditionally rendered on supported browsers */}
                {navigator.share && blob && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        // Create a file from the blob
                        const file = new File(
                          [blob],
                          originalFilename || "whatsapp-sticker.webp",
                          { type: "image/webp" }
                        )

                        // Share the file
                        await navigator.share({
                          title: "WhatsApp Sticker",
                          text: "Check out this WhatsApp sticker I created!",
                          files: [file]
                        })
                      } catch (error) {
                        console.error("Error sharing:", error)
                      }
                    }}
                  >
                    <Share2 className="mr-2 size-4" />
                    Share
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
