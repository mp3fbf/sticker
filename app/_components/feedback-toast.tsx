/**
 * @description
 * A specialized toast notification component with predefined styles
 * for different types of feedback (success, error, info, warning).
 *
 * This component wraps the UI toast system to provide consistent styling
 * and behavior for feedback messages throughout the application.
 *
 * @features
 * - Predefined toast styles for different types of feedback
 * - Automatic icons based on toast type
 * - Accessible design with appropriate ARIA attributes
 * - Customizable duration and positioning
 *
 * @dependencies
 * - useToast from shadcn/ui
 * - Lucide icons for visual indicators
 */

"use client"

import { useToast } from "@/components/ui/use-toast"
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { ReactNode } from "react"

/**
 * Toast variant types
 */
export type ToastVariant = "success" | "error" | "warning" | "info"

/**
 * Props for feedback toast
 */
export interface FeedbackToastProps {
  /**
   * Main message to display
   */
  message: string

  /**
   * Optional title for the toast
   */
  title?: string

  /**
   * Type of toast to display
   * @default "info"
   */
  variant?: ToastVariant

  /**
   * How long to show the toast (in milliseconds)
   * @default 5000
   */
  duration?: number

  /**
   * Optional action element to display in the toast
   */
  action?: ReactNode
}

/**
 * Feedback toast component for showing consistent toast notifications
 */
export default function FeedbackToast({
  message,
  title,
  variant = "info",
  duration = 5000,
  action
}: FeedbackToastProps) {
  const { toast } = useToast()

  /**
   * Get title based on variant if not provided
   */
  const getDefaultTitle = (): string => {
    switch (variant) {
      case "success":
        return "Success"
      case "error":
        return "Error"
      case "warning":
        return "Warning"
      case "info":
      default:
        return "Information"
    }
  }

  /**
   * Get icon based on variant
   */
  const getIcon = (): ReactNode => {
    const iconProps = { className: "size-4 mr-2" }

    switch (variant) {
      case "success":
        return <CheckCircle2 {...iconProps} />
      case "error":
        return <AlertCircle {...iconProps} />
      case "warning":
        return <AlertTriangle {...iconProps} />
      case "info":
      default:
        return <Info {...iconProps} />
    }
  }

  /**
   * Show the toast with appropriate styling
   */
  const showToast = () => {
    toast({
      title: (
        <div className="flex items-center">
          {getIcon()}
          <span>{title || getDefaultTitle()}</span>
        </div>
      ) as any,
      description: message,
      variant: variant === "error" ? "destructive" : "default",
      duration,
      action: action as any
    })
  }

  // Return the function to show the toast
  return showToast
}

/**
 * Helper functions for showing different types of toasts
 */

/**
 * Show a success toast
 */
export function useSuccessToast() {
  const { toast } = useToast()

  return (
    message: string,
    title: string = "Success",
    duration: number = 5000
  ) => {
    toast({
      title: (
        <div className="flex items-center">
          <CheckCircle2 className="mr-2 size-4" />
          <span>{title}</span>
        </div>
      ) as any,
      description: message,
      duration
    })
  }
}

/**
 * Show an error toast
 */
export function useErrorToast() {
  const { toast } = useToast()

  return (
    message: string,
    title: string = "Error",
    duration: number = 5000
  ) => {
    toast({
      title: (
        <div className="flex items-center">
          <AlertCircle className="mr-2 size-4" />
          <span>{title}</span>
        </div>
      ) as any,
      description: message,
      variant: "destructive",
      duration
    })
  }
}

/**
 * Show a warning toast
 */
export function useWarningToast() {
  const { toast } = useToast()

  return (
    message: string,
    title: string = "Warning",
    duration: number = 5000
  ) => {
    toast({
      title: (
        <div className="flex items-center">
          <AlertTriangle className="mr-2 size-4" />
          <span>{title}</span>
        </div>
      ) as any,
      description: message,
      duration
    })
  }
}

/**
 * Show an info toast
 */
export function useInfoToast() {
  const { toast } = useToast()

  return (
    message: string,
    title: string = "Information",
    duration: number = 5000
  ) => {
    toast({
      title: (
        <div className="flex items-center">
          <Info className="mr-2 size-4" />
          <span>{title}</span>
        </div>
      ) as any,
      description: message,
      duration
    })
  }
}
