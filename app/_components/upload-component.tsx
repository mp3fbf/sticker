"use client"

import { useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
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
import AnimatedContainer from "./animated-container"

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
 * - Smooth animations between states
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

  // Animation variants for different component states
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  }

  return (
    <AnimatedContainer animation="fadeInOut" className="w-full">
      <Card>
        <CardContent className="p-6">
          {/* Show validation errors if any */}
          <AnimatePresence mode="wait">
            {validationErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <ErrorMessage message={validationErrors} />
              </motion.div>
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
                    (max {STICKER_REQUIREMENTS.MAX_FILE_SIZE_MB}MB)
                  </p>
                  <motion.div
                    className="mt-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="sm" disabled={isValidating}>
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
                    disabled={isValidating}
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
                      onClick={handleClearFile}
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

                {/* Sticker preview */}
                <AnimatePresence>
                  {showPreview && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center justify-center"
                    >
                      <motion.div
                        className="relative my-2 flex size-64 items-center justify-center overflow-hidden rounded-md border"
                        whileHover={{ scale: 1.02 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25
                        }}
                      >
                        <img
                          src={result.url || ""}
                          alt="Sticker preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons for completed stickers */}
                <AnimatePresence>
                  {showPreview && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: 0.2 }}
                      className="flex justify-between"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearFile}
                        >
                          New Upload
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ x: 10 }}
                        animate={{ x: 0 }}
                      >
                        <Button size="sm" onClick={handleDownload}>
                          <Download className="mr-2 size-4" />
                          Download Sticker
                        </Button>
                      </motion.div>
                    </motion.div>
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
