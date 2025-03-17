"use client"

import React, { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Upload } from "lucide-react"

export interface DropZoneProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Whether the drop zone is currently accepting a dragged file
   */
  isDragging?: boolean
  /**
   * Custom icon component to display
   */
  icon?: React.ReactNode
  /**
   * Primary message to display
   */
  title?: React.ReactNode
  /**
   * Secondary message to display
   */
  description?: React.ReactNode
  /**
   * Additional content to display (e.g., a button)
   */
  children?: React.ReactNode
}

/**
 * Reusable drop zone component for file uploads
 *
 * This component provides a styled area for drag-and-drop file uploads.
 * It can be customized with different icons, messages, and additional content.
 *
 * @example
 * ```tsx
 * <DropZone
 *   isDragging={isDragging}
 *   title="Upload your video"
 *   description="Drag and drop or click to select"
 *   onDragOver={handleDragOver}
 *   onDragLeave={handleDragLeave}
 *   onDrop={handleDrop}
 *   onClick={handleClick}
 * >
 *   <Button>Select File</Button>
 * </DropZone>
 * ```
 */
const DropZone = forwardRef<HTMLDivElement, DropZoneProps>(
  (
    {
      isDragging = false,
      icon = <Upload className="text-muted-foreground size-12" />,
      title = "Upload a file",
      description = "Drag and drop or click to select",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border-2 border-dashed p-12 text-center transition-colors",
          isDragging
            ? "border-primary bg-muted/50"
            : "border-muted-foreground/25",
          "hover:border-primary hover:bg-muted/25 cursor-pointer",
          className
        )}
        {...props}
      >
        <div className="mx-auto">{icon}</div>
        {title && <h3 className="mt-4 text-lg font-semibold">{title}</h3>}
        {description && (
          <p className="text-muted-foreground mt-2 text-sm">{description}</p>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>
    )
  }
)

DropZone.displayName = "DropZone"

export default DropZone
