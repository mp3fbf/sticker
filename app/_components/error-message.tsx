/**
 * @description
 * A reusable component for displaying error messages.
 *
 * Features:
 * - Visual indication of errors
 * - Support for single error message or list of errors
 * - Animation for better user experience
 * - Accessible design with aria attributes
 *
 * @dependencies
 * - lucide-react: For alert icons
 * - cn utility: For class name handling
 */

"use client"

import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

interface ErrorMessageProps {
  message?: string | string[]
  className?: string
}

/**
 * Error message component that displays validation errors
 * with proper styling and animations
 */
export default function ErrorMessage({
  message,
  className
}: ErrorMessageProps) {
  // If no message, don't render anything
  if (!message || (Array.isArray(message) && message.length === 0)) {
    return null
  }

  // Convert single message to array
  const messages = Array.isArray(message) ? message : [message]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "bg-destructive/10 text-destructive flex items-start rounded-md p-3 text-sm",
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="mr-2 mt-0.5 size-4 shrink-0" />
      <div className="flex-1">
        {messages.length === 1 ? (
          <p>{messages[0]}</p>
        ) : (
          <div>
            <p className="font-medium">Please fix the following errors:</p>
            <ul className="mt-1.5 list-inside list-disc">
              {messages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  )
}
