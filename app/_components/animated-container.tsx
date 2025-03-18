"use client"

/**
 * @description
 * A reusable animated container component using Framer Motion.
 * Wraps child components with configurable animations.
 *
 * Supports various animation types and can be customized via props.
 * Uses predefined animation variants for consistency.
 *
 * @dependencies
 * - framer-motion: For animation capabilities
 * - animation-variants.ts: For predefined animation configurations
 *
 * @example
 * ```tsx
 * <AnimatedContainer
 *   animation="fadeUp"
 *   delay={0.2}
 *   className="p-4"
 * >
 *   <p>Your content here</p>
 * </AnimatedContainer>
 * ```
 */

import { HTMLMotionProps, Variant, motion } from "framer-motion"
import * as React from "react"

import {
  bounce,
  fadeInOut,
  fadeUp,
  scale,
  slideInRight,
  staggerContainer,
  staggerItem
} from "@/lib/animation-variants"
import { cn } from "@/lib/utils"

// Animation variant dictionary
const animationVariants = {
  fadeInOut,
  fadeUp,
  scale,
  staggerContainer,
  staggerItem,
  slideInRight,
  bounce
}

type AnimationVariantKey = keyof typeof animationVariants

export interface AnimatedContainerProps
  extends Omit<
    HTMLMotionProps<"div">,
    "initial" | "animate" | "exit" | "variants"
  > {
  /**
   * The type of animation to apply
   */
  animation?: AnimationVariantKey
  /**
   * The initial animation state
   */
  initialState?: string
  /**
   * The animate animation state
   */
  animateState?: string
  /**
   * The exit animation state
   */
  exitState?: string
  /**
   * Delay before animation starts (in seconds)
   */
  delay?: number
  /**
   * Duration of the animation (in seconds)
   */
  duration?: number
  /**
   * Whether to use layout animation (for shared layout animations)
   */
  useLayoutAnimation?: boolean
  /**
   * Custom animation variants (overrides the predefined ones)
   */
  customVariants?: Record<string, Variant>
  /**
   * Whether to stagger children animations (only works with stagger variants)
   */
  staggerChildren?: boolean
  /**
   * Stagger delay between children animations (in seconds)
   */
  staggerDelay?: number
  /**
   * Whether the component is enabled and should animate
   */
  isEnabled?: boolean
  /**
   * CSS classes to apply to the container
   */
  className?: string
  /**
   * Child elements to animate
   */
  children: React.ReactNode
}

/**
 * AnimatedContainer component for wrapping elements with animations
 */
export default function AnimatedContainer({
  animation = "fadeInOut",
  initialState = "hidden",
  animateState = "visible",
  exitState = "exit",
  delay = 0,
  duration,
  useLayoutAnimation = false,
  customVariants,
  staggerChildren = false,
  staggerDelay = 0.1,
  isEnabled = true,
  className,
  children,
  ...props
}: AnimatedContainerProps) {
  // Get the animation variants based on the animation prop
  const variants = customVariants || animationVariants[animation]

  // Modify variants if duration is provided
  const modifiedVariants = React.useMemo(() => {
    if (!duration) return variants

    // Create a deep copy of the variants to avoid mutating the original
    const newVariants = JSON.parse(JSON.stringify(variants))

    // Add duration to each variant's transition
    Object.keys(newVariants).forEach(key => {
      if (newVariants[key].transition) {
        newVariants[key].transition.duration = duration
      } else {
        newVariants[key].transition = { duration }
      }
    })

    return newVariants
  }, [variants, duration])

  // Modify stagger delay if needed
  const staggerVariants = React.useMemo(() => {
    if (!staggerChildren || animation !== "staggerContainer")
      return modifiedVariants

    // Create a deep copy of the variants to avoid mutating the original
    const newVariants = JSON.parse(JSON.stringify(modifiedVariants))

    // Modify stagger delay
    if (newVariants.visible?.transition) {
      newVariants.visible.transition.staggerChildren = staggerDelay
    }

    return newVariants
  }, [modifiedVariants, staggerChildren, animation, staggerDelay])

  // Disable animations if not enabled
  if (!isEnabled) {
    return <div className={className}>{children}</div>
  }

  // Use LayoutGroup for layout animations
  const MotionComponent = useLayoutAnimation ? motion.div : motion.div

  return (
    <MotionComponent
      initial={initialState}
      animate={animateState}
      exit={exitState}
      variants={staggerVariants}
      transition={{ delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}
