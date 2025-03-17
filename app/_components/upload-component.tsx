"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Upload, X, FileVideo } from "lucide-react"
import { useFileUpload } from "@/lib/hooks/use-file-upload"
import { formatFileSize, STICKER_REQUIREMENTS } from "@/lib/utils"
import DropZone from "./drop-zone"
import ErrorMessage from "./error-message"
import { validateVideoFile } from "@/lib/validators"

/**
 * The main upload component for the WhatsApp Sticker Maker.
 * Handles user interaction for video uploads with validation.
 *
 * Features:
 * - Drag and drop file upload with visual feedback
 * - File type and size validation
 * - Error messaging for invalid files
 * - Progress indication
 * - Clear/reset functionality
 *
 * @component
 */
export default function UploadComponent() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isValidating, setIsValidating] = useState(false)

  // Handle file validation
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

  // Custom file select handler with validation
  const handleFileSelect = async (file: File) => {
    const isValid = await validateFile(file)

    if (isValid) {
      toast({
        title: "File selected",
        description: `${file.name} (${formatFileSize(file.size)})`
      })
    } else {
      // If validation fails, no need to show toast as errors are displayed in UI
      return false
    }

    return true
  }

  // Error handler
  const handleError = (errorMessage: string) => {
    setValidationErrors([errorMessage])
  }

  // Use our custom hook for file upload management
  const {
    file,
    isDragging,
    isLoading,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearFile,
    progress
  } = useFileUpload({
    onFileSelect: handleFileSelect,
    onError: handleError
  })

  /**
   * Clears the current file and errors
   */
  const handleClearFile = () => {
    clearFile()
    setValidationErrors([])
  }

  /**
   * Triggers the hidden file input when the drop zone is clicked
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  /**
   * Handles the continue button click
   * In a real implementation, this would proceed to the next step
   */
  const handleContinue = () => {
    // In the next step, we'll implement the actual processing
    toast({
      title: "Processing initiated",
      description: "Your video will be processed into a WhatsApp sticker."
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Show validation errors if any */}
        {validationErrors.length > 0 && (
          <ErrorMessage message={validationErrors} className="mb-4" />
        )}

        {!file ? (
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-muted rounded-md p-2">
                  <FileVideo className="text-primary size-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearFile}
                aria-label="Remove file"
                disabled={isLoading}
              >
                <X className="size-4" />
              </Button>
            </div>

            {isLoading && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-muted-foreground text-center text-xs">
                  Preparing video...
                </p>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFile}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isLoading || validationErrors.length > 0}
                onClick={handleContinue}
              >
                Continue
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
