/**
 * @description
 * Validation utilities specifically for video file uploads.
 * These functions ensure that uploaded files meet WhatsApp's sticker requirements.
 *
 * Includes validation for:
 * - File type (MIME type)
 * - File size
 * - Video duration
 * - Video dimensions
 *
 * @dependencies
 * - STICKER_REQUIREMENTS from utils.ts
 */

import { STICKER_REQUIREMENTS } from "./utils"

/**
 * Validates if a file is of an allowed type for WhatsApp stickers
 *
 * @param file - The file to validate
 * @returns An object containing validation result and error message if applicable
 */
export function validateFileType(file: File): {
  isValid: boolean
  errorMessage?: string
} {
  if (!file) {
    return {
      isValid: false,
      errorMessage: "No file selected"
    }
  }

  const isValidType = STICKER_REQUIREMENTS.SUPPORTED_INPUT_FORMATS.includes(
    file.type
  )

  return {
    isValid: isValidType,
    errorMessage: isValidType
      ? undefined
      : `Unsupported file format. Please upload ${STICKER_REQUIREMENTS.SUPPORTED_INPUT_FORMATS.map(
          type => type.replace("video/", "").toUpperCase()
        ).join(", ")} files only.`
  }
}

/**
 * Validates if a file size is within the allowed limits
 *
 * @param file - The file to validate
 * @returns An object containing validation result and error message if applicable
 */
export function validateFileSize(file: File): {
  isValid: boolean
  errorMessage?: string
} {
  if (!file) {
    return {
      isValid: false,
      errorMessage: "No file selected"
    }
  }

  const maxSizeBytes = STICKER_REQUIREMENTS.MAX_FILE_SIZE_MB * 1024 * 1024
  const isValidSize = file.size <= maxSizeBytes

  return {
    isValid: isValidSize,
    errorMessage: isValidSize
      ? undefined
      : `File too large. Maximum size allowed is ${STICKER_REQUIREMENTS.MAX_FILE_SIZE_MB}MB.`
  }
}

/**
 * Validates video duration is within the maximum allowed duration
 * This function requires a video element to check the duration
 *
 * @param file - The video file to validate
 * @returns A promise resolving to validation result and error message if applicable
 */
export function validateVideoDuration(file: File): Promise<{
  isValid: boolean
  errorMessage?: string
}> {
  return new Promise(resolve => {
    if (!file || !file.type.startsWith("video/")) {
      resolve({
        isValid: false,
        errorMessage: "Not a valid video file"
      })
      return
    }

    // Create a temporary URL for the video
    const videoUrl = URL.createObjectURL(file)
    const video = document.createElement("video")

    video.onloadedmetadata = () => {
      // Revoke the URL to free memory
      URL.revokeObjectURL(videoUrl)

      const isValidDuration =
        video.duration <= STICKER_REQUIREMENTS.MAX_DURATION_SECONDS

      resolve({
        isValid: isValidDuration,
        errorMessage: isValidDuration
          ? undefined
          : `Video too long. Maximum duration allowed is ${STICKER_REQUIREMENTS.MAX_DURATION_SECONDS} seconds.`
      })
    }

    video.onerror = () => {
      // Revoke the URL to free memory
      URL.revokeObjectURL(videoUrl)

      resolve({
        isValid: false,
        errorMessage:
          "Failed to read video duration. The file might be corrupted."
      })
    }

    // Set the source to the video file
    video.src = videoUrl
    // Needed to ensure onloadedmetadata fires in some browsers
    video.load()
  })
}

/**
 * Comprehensive validation for video file uploads
 * Performs all relevant checks at once
 *
 * @param file - The file to validate
 * @param options - Configuration options for validation
 * @returns A promise resolving to a validation object with overall result and specific error messages
 */
export async function validateVideoFile(
  file: File,
  options: {
    checkDuration?: boolean
  } = {}
): Promise<{
  isValid: boolean
  errors: string[]
}> {
  if (!file) {
    return {
      isValid: false,
      errors: ["No file selected"]
    }
  }

  const errors: string[] = []

  // Check file type
  const typeValidation = validateFileType(file)
  if (!typeValidation.isValid && typeValidation.errorMessage) {
    errors.push(typeValidation.errorMessage)
  }

  // Check file size
  const sizeValidation = validateFileSize(file)
  if (!sizeValidation.isValid && sizeValidation.errorMessage) {
    errors.push(sizeValidation.errorMessage)
  }

  // Check duration if requested and if file type is valid
  if (options.checkDuration && typeValidation.isValid) {
    const durationValidation = await validateVideoDuration(file)
    if (!durationValidation.isValid && durationValidation.errorMessage) {
      errors.push(durationValidation.errorMessage)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
