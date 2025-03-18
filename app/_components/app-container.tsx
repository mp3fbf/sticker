"use client"

/**
 * @description
 * A container component that wraps the main application content.
 * Provides consistent layout, spacing, animations, and responsive behavior.
 *
 * This component serves as the main wrapper for the WhatsApp Sticker Maker app,
 * handling layout consistency across device sizes and providing motion effects.
 *
 * @dependencies
 * - AnimatedContainer: For smooth animations and transitions
 * - Card: For styled container with proper borders and shadows
 * - ResponsiveContainer: For mobile-optimized layout
 */

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import AnimatedContainer from "./animated-container"
import { ResponsiveContainer } from "./mobile-layout"

export interface AppContainerProps {
  /**
   * The content to be displayed inside the container
   */
  children: ReactNode

  /**
   * Optional CSS class names to apply to the container
   */
  className?: string

  /**
   * Optional animation to apply to the container
   * @default "fadeInOut"
   */
  animation?: "fadeInOut" | "fadeUp" | "scale" | "staggerContainer"

  /**
   * Whether to show a card border around the container
   * @default true
   */
  withCard?: boolean

  /**
   * Whether the container should take the full height of its parent
   * @default false
   */
  fullHeight?: boolean

  /**
   * Whether to use a larger max width on larger screens
   * @default false
   */
  wide?: boolean
}

/**
 * The main application container that provides consistent layout and styling
 * for the WhatsApp Sticker Maker application.
 */
export default function AppContainer({
  children,
  className,
  animation = "fadeInOut",
  withCard = true,
  fullHeight = false,
  wide = false
}: AppContainerProps) {
  // Content to be displayed inside the container
  const content = (
    <AnimatedContainer animation={animation} className="w-full">
      {withCard ? (
        <Card
          className={cn(
            "border-border/50 shadow-sm",
            fullHeight && "min-h-[calc(100vh-8rem)]",
            className
          )}
        >
          {children}
        </Card>
      ) : (
        <div className={cn(className)}>{children}</div>
      )}
    </AnimatedContainer>
  )

  return (
    <ResponsiveContainer
      maxWidth={wide ? "max-w-2xl" : "max-w-md"}
      fullWidthOnMobile={true}
      fullHeight={fullHeight}
    >
      {content}
    </ResponsiveContainer>
  )
}
