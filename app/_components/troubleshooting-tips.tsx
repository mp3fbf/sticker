"use client"

/**
 * @description
 * Component for displaying troubleshooting tips to help users resolve errors.
 * Shows a collapsible list of tips with helpful icons and formatting.
 *
 * Features:
 * - Collapsible tips section to save space
 * - Animated transitions for better UX
 * - Accessible markup with appropriate ARIA attributes
 * - Clear visual distinction from error messages
 *
 * @dependencies
 * - Framer Motion: For animations
 * - Lucide React: For icons
 */

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface TroubleshootingTipsProps {
  /** Array of tips to show */
  tips: string[]
  /** Optional class name for styling */
  className?: string
  /** Whether to initially expand the tips */
  initiallyExpanded?: boolean
  /** Optional title for the tips section */
  title?: string
}

/**
 * Component that displays troubleshooting tips for errors
 */
export default function TroubleshootingTips({
  tips,
  className,
  initiallyExpanded = false,
  title = "Troubleshooting Tips"
}: TroubleshootingTipsProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded)

  // If no tips, don't render anything
  if (!tips || tips.length === 0) {
    return null
  }

  // Animation variants for the content
  const contentVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.2 }
    }
  }

  return (
    <div
      className={cn(
        "mt-3 rounded-md border border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-200",
        className
      )}
      aria-label="Troubleshooting suggestions"
    >
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between p-3 text-left text-sm font-medium hover:bg-blue-100/50 dark:hover:bg-blue-800/30"
      >
        <span className="flex items-center gap-2">
          <Lightbulb className="size-4" />
          {title}
        </span>
        {isExpanded ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={contentVariants}
            className="overflow-hidden"
          >
            <ul className="space-y-1 p-3 pt-0 text-sm">
              {tips.map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 rounded p-1 hover:bg-blue-100/50 dark:hover:bg-blue-800/20"
                >
                  <span className="select-none">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
