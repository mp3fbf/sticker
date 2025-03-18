"use client"

import { useRef, useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Upload, X, FileVideo, Download } from "lucide-react"
import { useFileUpload } from "@/lib/hooks/use-file-upload"
import { formatFileSize, STICKER_REQUIREMENTS } from "@/lib/utils"
import DropZone from "./drop-zone"
import ProcessingIndicator from "./processing-indicator"
import { useVideoProcessor } from "@/lib/hooks/use-video-processor"
import AnimatedContainer from "./animated-container"
import ErrorDisplay from "./error-display"
import SuccessView from "./success-view"
import StepIndicator, { AppStep } from "./step-indicator"

// Import the error handling utilities
import {
  AppError,
  ErrorType,
  ErrorSeverity,
  createFileTypeError,
  createFileSizeError,
  createFileDurationError,
  createProcessingError,
  checkWasmSupport,
  checkSharedArrayBufferSupport,
  handleUnknownError,
  logError
} from "@/lib/error-handler"

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
 * - Enhanced error handling and troubleshooting
 * - Smooth animations between states
 *
 * The component manages a multi-stage workflow:
 * 1. File selection & validation (upload)
 * 2. Processing with progress indicator (process)
 * 3. Preview and download (download)
 *
 * @component
 */
export default function UploadComponent() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentFile, setCurrentFile] = useState<File | null>(null)

  // Track the current step in the application flow
  const [currentStep, setCurrentStep] = useState<AppStep>("upload")

  // State for the error handling system
  const [appError, setAppError] = useState<AppError | null>(null)

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
      // Move to download step on success
      setCurrentStep("download")

      toast({
        title: "Processing complete",
        description: `Your sticker is ready to download.`
      })
      // Clear any existing errors on success
      setAppError(null)
    },
    onError: error => {
      // Create and log a processing error
      const appErr = createProcessingError(error)
      setAppError(appErr)
      logError(appErr)

      toast({
        title: "Processing failed",
        description: error,
        variant: "destructive"
      })
    }
  })

  // Check for browser compatibility issues on component mount
  useEffect(() => {
    // Check WebAssembly support
    const wasmError = checkWasmSupport()
    if (wasmError) {
      setAppError(wasmError)
      logError(wasmError)
      return
    }

    // Check SharedArrayBuffer support
    const sabError = checkSharedArrayBufferSupport()
    if (sabError) {
      setAppError(sabError)
      logError(sabError)
      // This is just a warning, so we don't return early
    }
  }, [])

  /**
   * Validates a file for processing
   * @param file - The file to validate
   * @returns Promise resolving to whether the file is valid
   */
  const validateFile = async (file: File) => {
    // Clear previous errors
    setAppError(null)

    try {
      // Check file type
      if (!STICKER_REQUIREMENTS.SUPPORTED_INPUT_FORMATS.includes(file.type)) {
        const error = createFileTypeError(file.type || "unknown")
        setAppError(error)
        logError(error)
        return false
      }

      // Check file size
      const maxSizeMB = STICKER_REQUIREMENTS.MAX_FILE_SIZE_MB.DESKTOP
      const maxSizeBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxSizeBytes) {
        const error = createFileSizeError(file.size)
        setAppError(error)
        logError(error)
        return false
      }

      // Check video duration (create a video element to get duration)
      const durationPromise = new Promise<number>(resolve => {
        const video = document.createElement("video")
        video.preload = "metadata"
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src)
          resolve(video.duration)
        }
        video.onerror = () => {
          URL.revokeObjectURL(video.src)
          resolve(0) // Can't determine duration
        }
        video.src = URL.createObjectURL(file)
      })

      const duration = await durationPromise
      if (duration > STICKER_REQUIREMENTS.MAX_DURATION_SECONDS) {
        // This is just a warning, not a blocking error
        const warning = createFileDurationError(duration)
        setAppError(warning)
        logError(warning)
        // We still return true because we'll auto-trim the video
        return true
      }

      return true
    } catch (error) {
      // Handle unexpected validation errors
      const appErr = handleUnknownError(error)
      setAppError(appErr)
      logError(appErr)
      return false
    }
  }

  /**
   * Starts processing a validated file
   * @param file - The file to process
   */
  const startProcessing = async (file: File) => {
    try {
      setCurrentFile(file)
      // Update the current step to processing
      setCurrentStep("process")
      await processVideoFile(file)
    } catch (error) {
      const appErr = handleUnknownError(error)
      setAppError(appErr)
      logError(appErr)
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
      // Error is already set in validateFile
      return false
    }
  }

  /**
   * Handles errors from the file upload process
   * @param errorMessage - The error message to display
   */
  const handleError = (errorMessage: string) => {
    const appErr = {
      type: ErrorType.UNKNOWN_ERROR,
      message: errorMessage,
      severity: ErrorSeverity.ERROR
    }
    setAppError(appErr)
    logError(appErr)
  }

  /**
   * Retries processing the current file
   */
  const handleRetry = () => {
    // Clear the error state
    setAppError(null)

    if (currentFile) {
      retryLastFile(currentFile)
    }
  }

  /**
   * Dismisses the current error
   */
  const handleDismissError = () => {
    setAppError(null)
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
   * Resets the entire application state to start over
   */
  const handleReset = () => {
    clearFile()
    resetProcessor()
    setAppError(null)
    setCurrentFile(null)
    setCurrentStep("upload")
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

  // Animation variants for different component states
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  }

  return (
    <AnimatedContainer animation="fadeInOut" className="w-full">
      {/* Application StepIndicator - updated based on current step */}
      <AnimatePresence mode="wait">
        <div className="mb-4 px-4 sm:px-0">
          <StepIndicator currentStep={currentStep} compact={false} />
        </div>
      </AnimatePresence>

      <Card>
        <CardContent className="p-6">
          {/* Error display component */}
          <AnimatePresence mode="wait">
            {appError && (
              <div className="mb-4">
                <ErrorDisplay
                  error={appError}
                  onDismiss={handleDismissError}
                  onRetry={
                    appError.type !== ErrorType.BROWSER_UNSUPPORTED &&
                    appError.type !== ErrorType.WASM_UNSUPPORTED
                      ? handleRetry
                      : undefined
                  }
                  showTroubleshootingTips={true}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Initial upload state */}
          <AnimatePresence mode="wait">
            {showUpload ? (
              <motion.div
                key="upload"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <DropZone
                  isDragging={isDragging}
                  icon={
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 1.5
                      }}
                    >
                      <Upload className="text-muted-foreground mx-auto size-12" />
                    </motion.div>
                  }
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
                    (max {STICKER_REQUIREMENTS.MAX_FILE_SIZE_MB.DESKTOP}MB)
                  </p>
                  <motion.div
                    className="mt-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      disabled={
                        isUploading ||
                        appError?.type === ErrorType.WASM_UNSUPPORTED
                      }
                    >
                      Select Video
                    </Button>
                  </motion.div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={STICKER_REQUIREMENTS.SUPPORTED_INPUT_FORMATS.join(
                      ","
                    )}
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={
                      isUploading ||
                      appError?.type === ErrorType.WASM_UNSUPPORTED
                    }
                  />
                </DropZone>
              </motion.div>
            ) : (
              <motion.div
                key="file-processing"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                {/* File info */}
                <motion.div
                  className="flex items-center justify-between"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="bg-muted rounded-md p-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      <FileVideo className="text-primary size-8" />
                    </motion.div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{file?.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatFileSize(file?.size || 0)}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleReset}
                      aria-label="Remove file"
                      disabled={isUploading || isProcessing}
                    >
                      <X className="size-4" />
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Upload progress indicator */}
                <AnimatePresence>
                  {isUploading && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <ProcessingIndicator
                        progress={uploadProgress}
                        isProcessing={true}
                        error={null}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Processing indicator */}
                <AnimatePresence>
                  {showProcessing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <ProcessingIndicator
                        progress={progress}
                        isProcessing={isProcessing}
                        error={processingError}
                        onRetry={handleRetry}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Success view with sticker preview */}
                <AnimatePresence>
                  {showPreview && (
                    <SuccessView
                      blob={result.blob}
                      previewUrl={result.url}
                      originalFilename={file?.name}
                      onReset={handleReset}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </AnimatedContainer>
  )
}
