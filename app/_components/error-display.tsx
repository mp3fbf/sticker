"use client"

/**
 * @description
 * A comprehensive error display component for showing various types of errors.
 * Renders different UI based on error severity and type, providing appropriate
 * context and visual indicators.
 *
 * Features:
 * - Different display styles based on error severity
 * - Expandable details for technical information
 * - Animated entrance/exit for better UX
 * - Accessibility support with appropriate ARIA attributes
 *
 * @dependencies
 * - error-handler.ts: For error types and severity
 * - Framer Motion: For animations
 * - Lucide React: For icons
 * - TroubleshootingTips: For showing help when available
 */

import {
  AlertCircle,
  AlertTriangle,
  Ban,
  ChevronDown,
  ChevronUp,
  Info,
  XCircle
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AppError, ErrorSeverity, ErrorType } from "@/lib/error-handler"
import TroubleshootingTips from "@/app/_components/troubleshooting-tips"

export interface ErrorDisplayProps {
  /** The error to display */
  error: AppError | null
  /** Optional class name for styling */
  className?: string
  /** Whether to show troubleshooting tips */
  showTroubleshootingTips?: boolean
  /** Optional callback for dismissing the error */
  onDismiss?: () => void
  /** Optional callback for retry action */
  onRetry?: () => void
}

/**
 * Comprehensive error display component
 */
export default function ErrorDisplay({
  error,
  className,
  showTroubleshootingTips = true,
  onDismiss,
  onRetry
}: ErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false)

  // If no error, don't render anything
  if (!error) {
    return null
  }

  // Select icon based on severity
  const getIcon = () => {
    switch (error.severity) {
      case ErrorSeverity.INFO:
        return <Info className="size-5 shrink-0" />
      case ErrorSeverity.WARNING:
        return <AlertTriangle className="size-5 shrink-0" />
      case ErrorSeverity.ERROR:
        return <AlertCircle className="size-5 shrink-0" />
      case ErrorSeverity.CRITICAL:
        return <Ban className="size-5 shrink-0" />
      default:
        return <XCircle className="size-5 shrink-0" />
    }
  }

  // Get color class based on severity
  const getSeverityClass = () => {
    switch (error.severity) {
      case ErrorSeverity.INFO:
        return "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
      case ErrorSeverity.WARNING:
        return "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
      case ErrorSeverity.ERROR:
        return "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200"
      case ErrorSeverity.CRITICAL:
        return "bg-red-100 text-red-900 dark:bg-red-900/50 dark:text-red-100"
      default:
        return "bg-gray-50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-200"
    }
  }

  // Get icon color class
  const getIconClass = () => {
    switch (error.severity) {
      case ErrorSeverity.INFO:
        return "text-blue-500"
      case ErrorSeverity.WARNING:
        return "text-yellow-500"
      case ErrorSeverity.ERROR:
        return "text-red-500"
      case ErrorSeverity.CRITICAL:
        return "text-red-600"
      default:
        return "text-gray-500"
    }
  }

  // Get border color class
  const getBorderClass = () => {
    switch (error.severity) {
      case ErrorSeverity.INFO:
        return "border-blue-200 dark:border-blue-800"
      case ErrorSeverity.WARNING:
        return "border-yellow-200 dark:border-yellow-800"
      case ErrorSeverity.ERROR:
        return "border-red-200 dark:border-red-800"
      case ErrorSeverity.CRITICAL:
        return "border-red-300 dark:border-red-900"
      default:
        return "border-gray-200 dark:border-gray-700"
    }
  }

  // Get animation variants for the error container
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  }

  // Get animation variants for details section
  const detailsVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.2 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2 } }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className={cn(
        "rounded-lg border p-4 shadow-sm",
        getSeverityClass(),
        getBorderClass(),
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className={cn("mt-0.5", getIconClass())}>{getIcon()}</div>
          <div className="ml-3">
            <h3 className="font-medium leading-tight">{error.message}</h3>
            {error.details && (
              <div className="mt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="h-auto p-0 text-xs font-normal"
                >
                  {showDetails ? "Hide details" : "Show details"}
                  {showDetails ? (
                    <ChevronUp className="ml-1 size-3" />
                  ) : (
                    <ChevronDown className="ml-1 size-3" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="size-6 p-0"
            aria-label="Dismiss"
          >
            <XCircle className="size-4" />
          </Button>
        )}
      </div>

      {/* Technical Details (expandable) */}
      <AnimatePresence>
        {showDetails && error.details && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={detailsVariants}
            className="mt-2 overflow-hidden"
          >
            <div className="rounded-md bg-white/30 p-2 font-mono text-xs dark:bg-black/20">
              {error.details}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons (retry, dismiss) */}
      {onRetry && (
        <div className="mt-3 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="text-xs"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Troubleshooting tips */}
      {showTroubleshootingTips &&
        error.troubleshootingTips &&
        error.troubleshootingTips.length > 0 && (
          <TroubleshootingTips tips={error.troubleshootingTips} />
        )}
    </motion.div>
  )
}
