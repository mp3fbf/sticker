"use client"

/**
 * @description
 * Displays the results of sticker processing, including a preview
 * of the processed sticker and download options.
 *
 * @features
 * - Preview display for the processed sticker
 * - Download button for saving the sticker
 * - Option to create a new sticker
 * - Responsive design for both mobile and desktop
 *
 * @dependencies
 * - UI components from shadcn/ui
 * - Framer Motion for animations
 * - DownloadButton for download functionality
 */

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import DownloadButton from "./download-button"

export interface ResultViewProps {
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
}

/**
 * Component for displaying the sticker processing result and download options
 */
export default function ResultView({
  blob,
  previewUrl,
  originalFilename,
  onReset,
  className
}: ResultViewProps) {
  if (!previewUrl) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full", className)}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            {/* Success message */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mb-4 text-center"
            >
              <h3 className="text-xl font-semibold">Your Sticker is Ready!</h3>
              <p className="text-muted-foreground text-sm">
                Your animated sticker has been created and is ready to use in
                WhatsApp.
              </p>
            </motion.div>

            {/* Sticker preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-checkerboard relative my-4 flex size-64 items-center justify-center overflow-hidden rounded-md border"
            >
              <img
                src={previewUrl}
                alt="Sticker preview"
                className="max-h-full max-w-full object-contain"
              />
            </motion.div>

            {/* Description and instructions */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="text-muted-foreground mb-6 max-w-md text-center text-sm"
            >
              Download this animated sticker and import it into WhatsApp using
              the sticker creator app or any third-party sticker app.
            </motion.p>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-between"
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

              <DownloadButton
                blob={blob}
                originalFilename={originalFilename}
                size="sm"
                className="w-full sm:w-auto"
              />
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Additional styling for checkerboard background pattern */}
      <style jsx global>{`
        .bg-checkerboard {
          background-color: white;
          background-image:
            linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
          background-position:
            0 0,
            0 10px,
            10px -10px,
            -10px 0px;
        }
      `}</style>
    </motion.div>
  )
}
