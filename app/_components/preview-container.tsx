"use client"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { cn } from "@/lib/utils"
import { HTMLAttributes, forwardRef } from "react"

/**
 * @description
 * A container component for displaying sticker previews with consistent styling.
 * This component provides a square aspect ratio container with visual indicators
 * for the sticker boundaries.
 *
 * Features:
 * - Maintains a square aspect ratio for consistent display
 * - Visual indicators for sticker boundaries (border, background grid)
 * - Responsive design that works on both mobile and desktop
 * - Supports custom className and props forwarding
 *
 * @param props Component props including className and children
 * @returns A styled container for sticker previews
 */
const PreviewContainer = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative mx-auto overflow-hidden rounded-md border",
        "bg-white dark:bg-black",
        // Background grid pattern to indicate transparency
        "bg-[linear-gradient(45deg,#eee_25%,transparent_25%,transparent_75%,#eee_75%,#eee),linear-gradient(45deg,#eee_25%,transparent_25%,transparent_75%,#eee_75%,#eee)]",
        "dark:bg-[linear-gradient(45deg,#333_25%,transparent_25%,transparent_75%,#333_75%,#333),linear-gradient(45deg,#333_25%,transparent_25%,transparent_75%,#333_75%,#333)]",
        "bg-[length:16px_16px] bg-[position:0_0,8px_8px]",
        "w-full max-w-md",
        className
      )}
      {...props}
    >
      <AspectRatio ratio={1}>
        <div className="flex size-full items-center justify-center">
          {children}
        </div>
      </AspectRatio>
    </div>
  )
})

PreviewContainer.displayName = "PreviewContainer"

export default PreviewContainer
