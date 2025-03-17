"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Upload, X, FileVideo, Download } from "lucide-react"
import { useFileUpload } from "@/lib/hooks/use-file-upload"
import { formatFileSize, STICKER_REQUIREMENTS } from "@/lib/utils"
import DropZone from "./drop-zone"
import ErrorMessage from "./error-message"
import { validateVideoFile } from "@/lib/validators"
import ProcessingIndicator from "./processing-indicator"
import { useVideoProcessor } from "@/lib/hooks/use-video-processor"

/**
 * @description
 * The main upload component for the WhatsApp Sticker Maker.
 * Handles user interaction for video uploads with validation,
 * processing, preview, and download functionality.
 *
 * Features:
 * - Drag and drop file upload with visual feedback
 * - File type and size validation
 * - Processing with progress indication
 * - Sticker preview
 * - Download functionality
 * - Error handling and retry capabilities
 *
 * The component manages a multi-stage workflow:
 * 1. File selection & validation
 * 2. Processing with progress indicator
 * 3. Preview and download
 *
 * @component
 */
export default function UploadComponent() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)

  // Initialize video processor
  const {
    isProcessing,
    progress,
    error: processingError,
    result,
    processVideoFile,
    retryLastFile,
    reset: resetProcessor
  } = useVideoProcessor({
    onSuccess: ({ blob, filename }) => {
      toast({
        title: "Processing complete",
        description: `Your sticker is ready to download.`
      })
    },
    onError: error => {
      toast({
        title: "Processing failed",
        description: error,
        variant: "destructive"
      })
    }
  })

  /**
   * Validates a file for processing
   * @param file - The file to validate
   * @returns Promise resolving to whether the file is valid
   */
  const validateFile = async (file: File) => {
    setIsValidating(true)
    setValidationErrors([])

    try {
      // Validate the file with comprehensive checks
      const validation = await validateVideoFile(file, { checkDuration: true })

      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        return false
      }

      return true
    } catch (error) {
      console.error("Validation error:", error)
      setValidationErrors([
        "An unexpected error occurred while validating the file."
      ])
      return false
    } finally {
      setIsValidating(false)
    }
  }

  /**
   * Starts processing a validated file
   * @param file - The file to process
   */
  const startProcessing = async (file: File) => {
    try {
      setCurrentFile(file)
      await processVideoFile(file)
    } catch (error) {
      console.error("Processing error:", error)
    }
  }

  /**
   * Handles file selection with validation
   * @param file - The selected file
   * @returns Promise resolving to whether the file was accepted
   */
  const handleFileSelect = async (file: File) => {
    const isValid = await validateFile(file)

    if (isValid) {
      toast({
        title: "File selected",
        description: `${file.name} (${formatFileSize(file.size)})`
      })

      // Automatically start processing if file is valid
      startProcessing(file)
      return true
    } else {
      // If validation fails, no need to show toast as errors are displayed in UI
      return false
    }
  }

  /**
   * Handles errors from the file upload process
   * @param errorMessage - The error message to display
   */
  const handleError = (errorMessage: string) => {
    setValidationErrors([errorMessage])
  }

  /**
   * Retries processing the current file
   */
  const handleRetry = () => {
    if (currentFile) {
      retryLastFile(currentFile)
    }
  }

  /**
   * Handles downloading the processed sticker
   */
  const handleDownload = () => {
    if (result.blob && result.filename) {
      const url = URL.createObjectURL(result.blob)
      const a = document.createElement("a")
      a.href = url
      a.download = result.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Sticker downloaded",
        description: "Your sticker has been downloaded successfully."
      })
    }
  }

  // Use our custom hook for file upload management
  const {
    file,
    isDragging,
    isLoading: isUploading,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearFile,
    progress: uploadProgress
  } = useFileUpload({
    onFileSelect: handleFileSelect,
    onError: handleError
  })

  /**
   * Clears the current file and resets the processor
   */
  const handleClearFile = () => {
    clearFile()
    resetProcessor()
    setValidationErrors([])
    setCurrentFile(null)
  }

  /**
   * Triggers the hidden file input when the drop zone is clicked
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Determine overall state for conditional rendering
  const showProcessing =
    file && (isProcessing || progress > 0 || processingError)
  const showPreview = file && result.url && !isProcessing && !processingError
  const showUpload = !file

  return (
    <Card>
      <CardContent className="p-6">
        {/* Show validation errors if any */}
        {validationErrors.length > 0 && (
          <ErrorMessage message={validationErrors} className="mb-4" />
        )}

        {/* Initial upload state */}
        {showUpload ? (
          <DropZone
            isDragging={isDragging}
            icon={<Upload className="text-muted-foreground mx-auto size-12" />}
            title="Upload your video"
            description="Drag and drop or click to select a video file"
            onClick={handleUploadClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p className="text-muted-foreground mt-1 text-xs">
              Supports{" "}
              {STICKER_REQUIREMENTS.SUPPORTED_INPUT_FORMATS.map(type =>
                type.replace("video/", "").toUpperCase()
              ).join(", ")}{" "}
              (max {STICKER_REQUIREMENTS.MAX_FILE_SIZE_MB}MB)
            </p>
            <div className="mt-4">
              <Button size="sm" disabled={isValidating}>
                Select Video
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={STICKER_REQUIREMENTS.SUPPORTED_INPUT_FORMATS.join(",")}
              className="hidden"
              onChange={handleFileChange}
              disabled={isValidating}
            />
          </DropZone>
        ) : (
          <div className="space-y-4">
            {/* File info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-muted rounded-md p-2">
                  <FileVideo className="text-primary size-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{file?.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatFileSize(file?.size || 0)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearFile}
                aria-label="Remove file"
                disabled={isUploading || isProcessing}
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Upload progress indicator */}
            {isUploading && (
              <div className="space-y-2">
                <ProcessingIndicator
                  progress={uploadProgress}
                  isProcessing={true}
                  error={null}
                />
              </div>
            )}

            {/* Processing indicator */}
            {showProcessing && (
              <ProcessingIndicator
                progress={progress}
                isProcessing={isProcessing}
                error={processingError}
                onRetry={handleRetry}
              />
            )}

            {/* Sticker preview */}
            {showPreview && (
              <div className="flex flex-col items-center justify-center">
                <div className="relative my-2 flex size-64 items-center justify-center overflow-hidden rounded-md border">
                  <img
                    src={result.url || ""}
                    alt="Sticker preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Action buttons for completed stickers */}
            {showPreview && (
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={handleClearFile}>
                  New Upload
                </Button>
                <Button size="sm" onClick={handleDownload}>
                  <Download className="mr-2 size-4" />
                  Download Sticker
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
