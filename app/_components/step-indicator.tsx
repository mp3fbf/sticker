"use client"

/**
 * @description
 * Visual indicator that shows the user's progress through the sticker creation workflow.
 * Displays the three main steps (Upload, Process, Download) with appropriate styling
 * based on the current state of the application.
 *
 * Features:
 * - Highlights current and completed steps
 * - Connects steps with divider lines to show progression
 * - Animates transitions between steps
 * - Responsive design for both mobile and desktop
 *
 * @dependencies
 * - Framer Motion: For smooth animations and transitions
 * - Lucide-React: For step icons
 * - Tailwind CSS: For styling
 */

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Check, Upload, Hourglass, Download } from "lucide-react"
import { useEffect, useState } from "react"

/**
 * Application flow steps
 */
export type AppStep = "upload" | "process" | "download"

export interface StepIndicatorProps {
  /**
   * The current active step
   */
  currentStep: AppStep

  /**
   * Optional CSS class name for container styling
   */
  className?: string

  /**
   * Optional flag for compact mobile view
   * @default false
   */
  compact?: boolean
}

/**
 * Step indicator component that visualizes the process flow
 */
export default function StepIndicator({
  currentStep,
  className,
  compact = false
}: StepIndicatorProps) {
  // Track completed steps for animation and styling
  const [completedSteps, setCompletedSteps] = useState<AppStep[]>([])

  // Update completed steps based on current step
  useEffect(() => {
    const steps: AppStep[] = ["upload", "process", "download"]
    const currentIndex = steps.indexOf(currentStep)

    // Mark all steps before the current one as completed
    const completed = steps.slice(0, currentIndex)
    setCompletedSteps(completed)
  }, [currentStep])

  // Check if a step is completed
  const isCompleted = (step: AppStep) => completedSteps.includes(step)

  // Check if a step is active (current)
  const isActive = (step: AppStep) => currentStep === step

  // Get appropriate icon for a step based on state
  const getStepIcon = (step: AppStep) => {
    if (isCompleted(step)) return <Check className="size-4 sm:size-5" />

    switch (step) {
      case "upload":
        return <Upload className="size-4 sm:size-5" />
      case "process":
        return <Hourglass className="size-4 sm:size-5" />
      case "download":
        return <Download className="size-4 sm:size-5" />
    }
  }

  // Animation variants for steps
  const stepVariants = {
    inactive: { scale: 1 },
    active: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    },
    completed: { scale: 1 }
  }

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="flex items-center justify-between">
        {/* Upload Step */}
        <StepItem
          label="Upload"
          isActive={isActive("upload")}
          isCompleted={isCompleted("upload")}
          icon={getStepIcon("upload")}
          compact={compact}
          variants={stepVariants}
        />

        {/* Connecting Line */}
        <div
          className={cn(
            "h-0.5 flex-1 transition-colors duration-300",
            isCompleted("upload") ? "bg-primary" : "bg-muted"
          )}
        />

        {/* Process Step */}
        <StepItem
          label="Process"
          isActive={isActive("process")}
          isCompleted={isCompleted("process")}
          icon={getStepIcon("process")}
          compact={compact}
          variants={stepVariants}
        />

        {/* Connecting Line */}
        <div
          className={cn(
            "h-0.5 flex-1 transition-colors duration-300",
            isCompleted("process") ? "bg-primary" : "bg-muted"
          )}
        />

        {/* Download Step */}
        <StepItem
          label="Download"
          isActive={isActive("download")}
          isCompleted={isCompleted("download")}
          icon={getStepIcon("download")}
          compact={compact}
          variants={stepVariants}
        />
      </div>
    </div>
  )
}

/**
 * Individual step item within the step indicator
 */
function StepItem({
  label,
  isActive,
  isCompleted,
  icon,
  compact,
  variants
}: {
  label: string
  isActive: boolean
  isCompleted: boolean
  icon: React.ReactNode
  compact: boolean
  variants: Record<string, any>
}) {
  // Determine the animation state
  const animationState = isActive
    ? "active"
    : isCompleted
      ? "completed"
      : "inactive"

  return (
    <div className="flex flex-col items-center">
      <motion.div
        animate={animationState}
        variants={variants}
        className={cn(
          "flex size-8 items-center justify-center rounded-full transition-colors duration-300 sm:size-10",
          isActive &&
            "bg-primary text-primary-foreground ring-primary/20 ring-2",
          isCompleted && "bg-primary text-primary-foreground",
          !isActive && !isCompleted && "bg-muted text-muted-foreground"
        )}
      >
        {icon}
      </motion.div>

      {!compact && (
        <span
          className={cn(
            "mt-2 text-xs transition-colors duration-300 sm:text-sm",
            isActive && "text-primary font-medium",
            isCompleted && "text-primary",
            !isActive && !isCompleted && "text-muted-foreground"
          )}
        >
          {label}
        </span>
      )}
    </div>
  )
}
