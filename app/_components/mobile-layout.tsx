"use client"

/**
 * @description
 * Mobile-specific layout components for responsive design.
 * Provides containers, conditional rendering, and utilities
 * for creating a mobile-optimized experience.
 *
 * Key components:
 * - ResponsiveContainer: Container that adapts spacing based on screen size
 * - MobileView: Component that only renders on mobile devices
 * - DesktopView: Component that only renders on desktop devices
 * - MediaProvider: Context provider for screen size information
 *
 * @dependencies
 * - use-mobile hook: For detecting mobile devices
 * - React context: For providing screen size information to children
 */

import React, { createContext, useContext, useEffect, useState } from "react"
import { useIsMobile } from "@/lib/hooks/use-mobile"
import { cn } from "@/lib/utils"

/**
 * Media context interface for screen width information
 */
interface MediaContextType {
  /** Whether the current viewport is mobile-sized */
  isMobile: boolean
  /** Current viewport width */
  width: number
  /** Current viewport height */
  height: number
}

/**
 * Default context values
 */
const defaultMediaContext: MediaContextType = {
  isMobile: false,
  width: typeof window !== "undefined" ? window.innerWidth : 1200,
  height: typeof window !== "undefined" ? window.innerHeight : 800
}

const MediaContext = createContext<MediaContextType>(defaultMediaContext)

/**
 * Hook to use media context values
 * @returns Media context with screen size information
 */
export const useMedia = () => useContext(MediaContext)

/**
 * Media context provider that tracks viewport dimensions
 * and provides them to children components
 */
export function MediaProvider({ children }: { children: React.ReactNode }) {
  const isMobileDevice = useIsMobile()
  const [dimensions, setDimensions] = useState({
    width: defaultMediaContext.width,
    height: defaultMediaContext.height
  })

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    // Set initial dimensions
    handleResize()

    // Add event listener for window resize
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const value = {
    isMobile: isMobileDevice,
    width: dimensions.width,
    height: dimensions.height
  }

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
}

/**
 * Props for the ResponsiveContainer component
 */
interface ResponsiveContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to use full width on mobile */
  fullWidthOnMobile?: boolean
  /** Whether to remove horizontal padding on mobile */
  noPaddingXOnMobile?: boolean
  /** Whether to remove vertical padding on mobile */
  noPaddingYOnMobile?: boolean
  /** Custom max width */
  maxWidth?: string
  /** Whether to center the container */
  centered?: boolean
  /** Whether to make the container take full height */
  fullHeight?: boolean
}

/**
 * A responsive container that adjusts its padding and width based on screen size
 */
export function ResponsiveContainer({
  children,
  className,
  fullWidthOnMobile = false,
  noPaddingXOnMobile = false,
  noPaddingYOnMobile = false,
  maxWidth = "max-w-md",
  centered = true,
  fullHeight = false,
  ...props
}: ResponsiveContainerProps) {
  const { isMobile } = useMedia()

  return (
    <div
      className={cn(
        "w-full",
        maxWidth,
        centered && "mx-auto",
        fullHeight && "h-full",
        {
          "px-0": isMobile && noPaddingXOnMobile,
          "py-0": isMobile && noPaddingYOnMobile,
          "px-4 py-6": !isMobile && !noPaddingXOnMobile && !noPaddingYOnMobile,
          "max-w-full": isMobile && fullWidthOnMobile
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Component that only renders its children on mobile devices
 */
export function MobileView({
  children,
  fallback = null
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { isMobile } = useMedia()
  return <>{isMobile ? children : fallback}</>
}

/**
 * Component that only renders its children on desktop devices
 */
export function DesktopView({
  children,
  fallback = null
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { isMobile } = useMedia()
  return <>{!isMobile ? children : fallback}</>
}

/**
 * Responsive spacing component that applies different
 * spacing based on screen size
 */
export function ResponsiveSpacing({
  mobileSize = 4,
  desktopSize = 8,
  direction = "vertical"
}: {
  mobileSize?: number
  desktopSize?: number
  direction?: "vertical" | "horizontal"
}) {
  const { isMobile } = useMedia()
  const size = isMobile ? mobileSize : desktopSize

  return (
    <div
      className={direction === "vertical" ? `h-${size}` : `w-${size}`}
      aria-hidden="true"
    />
  )
}
