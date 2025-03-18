"use client"

/**
 * @description
 * A tooltip component that provides contextual help and information.
 * Used throughout the application to offer guidance without cluttering the UI.
 *
 * Features:
 * - Accessible design with keyboard support
 * - Configurable positioning
 * - Support for both simple text and complex content
 * - Consistent styling with the application design system
 *
 * @dependencies
 * - Shadcn/UI tooltip components
 * - Lucide-React for icons
 * - Tailwind CSS for styling
 */

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { HelpCircle, Info } from "lucide-react"
import { ReactNode } from "react"

/**
 * Props for the help tooltip component
 */
export interface HelpTooltipProps {
  /**
   * The content to display in the tooltip
   */
  content: ReactNode

  /**
   * Optional children to use as the tooltip trigger (defaults to a help icon)
   */
  children?: ReactNode

  /**
   * Side of the trigger to show the tooltip on
   * @default "top"
   */
  side?: "top" | "right" | "bottom" | "left"

  /**
   * Alignment of the tooltip relative to the trigger
   * @default "center"
   */
  align?: "start" | "center" | "end"

  /**
   * Icon to use when no children are provided
   * @default "help"
   */
  icon?: "help" | "info"

  /**
   * Size of the icon when no children are provided
   * @default "default"
   */
  iconSize?: "sm" | "default" | "lg"

  /**
   * Custom class names to apply to the icon wrapper
   */
  iconClassName?: string

  /**
   * Whether to use a light color scheme for the tooltip
   * @default false
   */
  light?: boolean
}

/**
 * A tooltip component for providing contextual help
 */
export default function HelpTooltip({
  content,
  children,
  side = "top",
  align = "center",
  icon = "help",
  iconSize = "default",
  iconClassName,
  light = false
}: HelpTooltipProps) {
  // Generate size class based on the iconSize prop
  const sizeClass = {
    sm: "size-3.5",
    default: "size-4",
    lg: "size-5"
  }[iconSize]

  /**
   * Default icon based on the icon prop
   */
  const defaultIcon =
    icon === "help" ? (
      <HelpCircle
        className={cn("text-muted-foreground", sizeClass, iconClassName)}
      />
    ) : (
      <Info className={cn("text-muted-foreground", sizeClass, iconClassName)} />
    )

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger
          type="button"
          aria-label="Show help information"
          className={cn(
            "hover:text-foreground focus:ring-ring inline-flex cursor-help items-center justify-center rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
            iconClassName
          )}
        >
          {children || defaultIcon}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            "z-50 max-w-xs text-sm",
            light && "bg-background text-foreground"
          )}
          sideOffset={5}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * A text-only variant of the help tooltip with simplified props
 */
export function TextHelpTooltip({
  text,
  ...props
}: Omit<HelpTooltipProps, "content"> & { text: string }) {
  return <HelpTooltip content={text} {...props} />
}

/**
 * A bullet list variant of the help tooltip for multiple tips
 */
export function TipsHelpTooltip({
  tips,
  title,
  ...props
}: Omit<HelpTooltipProps, "content"> & { tips: string[]; title?: string }) {
  return (
    <HelpTooltip
      content={
        <div className="space-y-2">
          {title && <p className="font-medium">{title}</p>}
          <ul className="list-inside list-disc space-y-1 text-sm">
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      }
      {...props}
    />
  )
}
