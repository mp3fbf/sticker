/**
 * @description
 * A utility component for lazy loading elements to improve performance.
 * This component uses Intersection Observer to load content only when
 * it's about to enter the viewport, reducing initial load time and
 * improving overall application performance.
 *
 * Features:
 * - Intersection Observer for efficient detection of viewport entry
 * - Configurable threshold and root margin
 * - Customizable placeholder while content is loading
 * - Support for delayed loading even after visibility
 * - Built-in loading state visualization
 *
 * @dependencies
 * - React hooks: useState, useEffect, useRef
 * - Framer Motion: For smooth animations when content appears
 * - Intersection Observer API: For viewport detection
 */

"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export interface LazyLoadWrapperProps {
  /**
   * The content to lazy load
   */
  children: React.ReactNode

  /**
   * Custom placeholder to show while content is loading
   */
  placeholder?: React.ReactNode

  /**
   * Class name for the container
   */
  className?: string

  /**
   * Whether to show a loading indicator
   * @default false
   */
  showLoader?: boolean

  /**
   * Threshold for intersection observer (0-1)
   * 0 = element is starting to enter viewport
   * 1 = element is fully in viewport
   * @default 0.1
   */
  threshold?: number

  /**
   * Root margin for intersection observer
   * @default "200px"
   */
  rootMargin?: string

  /**
   * Delay in ms before loading content after visibility
   * @default 0
   */
  delay?: number

  /**
   * Whether to use a fade-in animation
   * @default true
   */
  animate?: boolean

  /**
   * Duration of the fade-in animation in ms
   * @default 300
   */
  animationDuration?: number

  /**
   * Whether the content should stay loaded once it's loaded
   * @default true
   */
  keepLoaded?: boolean
}

/**
 * LazyLoadWrapper component that renders children only when they come into view
 */
export default function LazyLoadWrapper({
  children,
  placeholder,
  className,
  showLoader = false,
  threshold = 0.1,
  rootMargin = "200px",
  delay = 0,
  animate = true,
  animationDuration = 300,
  keepLoaded = true
}: LazyLoadWrapperProps) {
  // States to track visibility and loading
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Reference to the container element
  const containerRef = useRef<HTMLDivElement>(null)

  // Set up intersection observer to detect when element enters viewport
  useEffect(() => {
    // Skip for server-side rendering
    if (typeof window === "undefined") return

    // Handler for intersection changes
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries

      // Set visibility based on intersection
      setIsVisible(entry.isIntersecting)

      // If keeping loaded and already loaded, don't change state
      if (keepLoaded && isLoaded) return

      // If element is intersecting, prepare to load content
      if (entry.isIntersecting) {
        setIsLoading(true)

        // Delayed loading if specified
        const timer = setTimeout(() => {
          setIsLoaded(true)
          setIsLoading(false)
        }, delay)

        return () => clearTimeout(timer)
      } else if (!keepLoaded) {
        // If not keeping loaded when out of view, unload content
        setIsLoaded(false)
      }
    }

    // Create and configure the observer
    const observer = new IntersectionObserver(handleIntersection, {
      root: null, // viewport is root
      rootMargin,
      threshold
    })

    // Start observing our element
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    // Cleanup observer on unmount
    return () => observer.disconnect()
  }, [isLoaded, keepLoaded, rootMargin, threshold, delay])

  // Animation variants for the content
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: animationDuration / 1000 }
    }
  }

  // Default loading placeholder
  const defaultPlaceholder = showLoader ? (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="text-muted-foreground size-8 animate-spin" />
    </div>
  ) : null

  return (
    <div ref={containerRef} className={cn(className)}>
      {/* Show the placeholder or loaded content */}
      <AnimatePresence mode="wait">
        {isLoaded ? (
          // Loaded content with optional animation
          animate ? (
            <motion.div
              key="content"
              initial="hidden"
              animate="visible"
              variants={contentVariants}
            >
              {children}
            </motion.div>
          ) : (
            children
          )
        ) : (
          // Placeholder with loading state
          <motion.div
            key="placeholder"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {placeholder || defaultPlaceholder}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * A simple placeholder component for use with LazyLoadWrapper
 */
export function LazyLoadPlaceholder({
  height = "200px",
  className
}: {
  height?: string
  className?: string
}) {
  return (
    <div
      className={cn("bg-muted animate-pulse rounded-md", className)}
      style={{ height }}
    />
  )
}
