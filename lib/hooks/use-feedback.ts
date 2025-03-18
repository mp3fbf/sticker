/**
 * @description
 * Custom hook for managing feedback states in the application.
 * Provides consistent feedback functionality for showing success, error, and info messages.
 *
 * Features:
 * - Manage loading, success, and error states
 * - Show toast notifications with consistent styling
 * - Provide helper functions for common feedback scenarios
 *
 * @dependencies
 * - useToast: Shadcn/UI toast hook for showing notifications
 */

"use client"

import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"

/**
 * Interface for feedback state
 */
export interface FeedbackState {
  /** Whether an operation is currently loading */
  isLoading: boolean
  /** Whether an operation completed successfully */
  isSuccess: boolean
  /** Error message if an operation failed */
  error: string | null
}

/**
 * Options for the useFeedback hook
 */
export interface UseFeedbackOptions {
  /** Initial feedback state */
  initialState?: Partial<FeedbackState>
  /** Whether to automatically show toast notifications for state changes */
  autoShowToasts?: boolean
}

/**
 * Custom hook for managing feedback states
 *
 * @param options - Configuration options
 * @returns Feedback state and helper functions
 */
export function useFeedback(options: UseFeedbackOptions = {}) {
  const { toast } = useToast()
  const { initialState = {}, autoShowToasts = true } = options

  // Initialize feedback state
  const [feedback, setFeedback] = useState<FeedbackState>({
    isLoading: false,
    isSuccess: false,
    error: null,
    ...initialState
  })

  /**
   * Set loading state
   * @param isLoading - Whether the operation is loading
   */
  const setLoading = (isLoading: boolean) => {
    setFeedback(prev => ({ ...prev, isLoading, error: null }))
  }

  /**
   * Set success state with optional message
   * @param message - Optional success message
   */
  const setSuccess = (message?: string) => {
    setFeedback(prev => ({
      ...prev,
      isLoading: false,
      isSuccess: true,
      error: null
    }))

    if (autoShowToasts && message) {
      showSuccessToast(message)
    }
  }

  /**
   * Set error state with message
   * @param error - Error message
   */
  const setError = (error: string) => {
    setFeedback(prev => ({
      ...prev,
      isLoading: false,
      isSuccess: false,
      error
    }))

    if (autoShowToasts) {
      showErrorToast(error)
    }
  }

  /**
   * Reset feedback state to initial values
   */
  const resetFeedback = () => {
    setFeedback({
      isLoading: false,
      isSuccess: false,
      error: null
    })
  }

  /**
   * Show a success toast notification
   * @param message - Success message
   * @param title - Optional toast title (defaults to "Success")
   */
  const showSuccessToast = (message: string, title: string = "Success") => {
    toast({
      title,
      description: message,
      variant: "default"
    })
  }

  /**
   * Show an error toast notification
   * @param message - Error message
   * @param title - Optional toast title (defaults to "Error")
   */
  const showErrorToast = (message: string, title: string = "Error") => {
    toast({
      title,
      description: message,
      variant: "destructive"
    })
  }

  /**
   * Show an info toast notification
   * @param message - Info message
   * @param title - Optional toast title (defaults to "Info")
   */
  const showInfoToast = (message: string, title: string = "Info") => {
    toast({
      title,
      description: message
    })
  }

  /**
   * Execute an async function with automatic feedback handling
   * @param asyncFn - Async function to execute
   * @param successMessage - Success message to show
   * @param errorPrefix - Prefix for error messages
   * @returns Promise resolving to the function result
   */
  const withFeedback = async <T>(
    asyncFn: () => Promise<T>,
    successMessage?: string,
    errorPrefix: string = "An error occurred"
  ): Promise<T | undefined> => {
    try {
      setLoading(true)
      const result = await asyncFn()
      setSuccess(successMessage)
      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? `${errorPrefix}: ${error.message}`
          : `${errorPrefix}`
      setError(errorMessage)
      return undefined
    }
  }

  return {
    ...feedback,
    setLoading,
    setSuccess,
    setError,
    resetFeedback,
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    withFeedback
  }
}
