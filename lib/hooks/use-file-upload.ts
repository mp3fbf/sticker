/**
 * @description
 * Custom hook for handling file uploads with drag-and-drop functionality.
 *
 * Features:
 * - Drag and drop support
 * - File selection handling
 * - Loading state management
 * - Progress tracking
 * - Error handling
 *
 * @dependencies
 * - useState and useCallback from React
 */

"use client"

import { useState, useCallback } from "react"

interface UseFileUploadOptions {
  /**
   * Callback triggered when a file is selected
   * Can return a boolean to indicate if the file should be accepted
   */
  onFileSelect?: (file: File) => boolean | Promise<boolean>

  /**
   * Callback triggered when an error occurs
   */
  onError?: (errorMessage: string) => void
}

/**
 * Custom hook for handling file uploads
 */
export function useFileUpload({
  onFileSelect,
  onError
}: UseFileUploadOptions = {}) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  /**
   * Handles the file change event from an input element
   */
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) {
        return
      }

      const selectedFile = e.target.files[0]
      await processFile(selectedFile)

      // Reset the input value to allow selecting the same file again
      e.target.value = ""
    },
    []
  )

  /**
   * Handles the file drop event
   */
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    setIsDragging(false)

    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) {
      return
    }

    const droppedFile = e.dataTransfer.files[0]
    await processFile(droppedFile)
  }, [])

  /**
   * Processes a file selection, performing validation and callbacks
   */
  const processFile = async (selectedFile: File) => {
    try {
      // If a file selection callback is provided, use it to validate the file
      if (onFileSelect) {
        setIsLoading(true)
        simulateProgress()

        const shouldAccept = await onFileSelect(selectedFile)

        if (!shouldAccept) {
          setIsLoading(false)
          setProgress(0)
          return
        }
      }

      setFile(selectedFile)
    } catch (error) {
      console.error("Error handling file:", error)
      onError?.("An error occurred while processing the file.")
    }
  }

  /**
   * Simulates progress for demonstration purposes
   * In a real implementation, this would be replaced with actual upload progress
   */
  const simulateProgress = () => {
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += Math.random() * 10
      if (currentProgress > 100) {
        currentProgress = 100
        clearInterval(interval)

        // Simulate completion after reaching 100%
        setTimeout(() => {
          setIsLoading(false)
          setProgress(0)
        }, 500)
      }
      setProgress(Math.min(currentProgress, 100))
    }, 300)
  }

  /**
   * Handles the drag over event
   */
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  /**
   * Handles the drag leave event
   */
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  /**
   * Clears the selected file
   */
  const clearFile = useCallback(() => {
    setFile(null)
    setIsLoading(false)
    setProgress(0)
  }, [])

  return {
    file,
    isDragging,
    isLoading,
    progress,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearFile
  }
}
