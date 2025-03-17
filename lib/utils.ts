/**
 * @description
 * General utility functions for the WhatsApp Sticker Maker application.
 * Includes functions for:
 * - CSS class name management (cn)
 * - File validation and handling
 * - File size formatting
 * - URL object handling
 *
 * @dependencies
 * - clsx: For conditional class name handling
 * - tailwind-merge: For merging Tailwind CSS classes
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names with Tailwind CSS support
 * @param inputs Class names to combine
 * @returns Combined class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * WhatsApp sticker requirements constants
 */
export const STICKER_REQUIREMENTS = {
  MAX_FILE_SIZE_MB: 50,
  MAX_DURATION_SECONDS: 3,
  DIMENSIONS: {
    width: 512,
    height: 512
  },
  SUPPORTED_INPUT_FORMATS: ["video/mp4", "video/quicktime", "video/webm"],
  OUTPUT_FORMAT: "image/webp"
}

/**
 * Validates if a file is a supported video format for WhatsApp stickers
 * @param file The file to check
 * @returns True if the file is a supported video format
 */
export function isValidVideoFile(file: File): boolean {
  return STICKER_REQUIREMENTS.SUPPORTED_INPUT_FORMATS.includes(file.type)
}

/**
 * Validates if a file size is within the allowed limit for processing
 * @param file The file to check
 * @param maxSizeMB The maximum allowed size in megabytes (defaults to 50MB)
 * @returns True if the file size is within the limit
 */
export function isValidFileSize(
  file: File,
  maxSizeMB: number = STICKER_REQUIREMENTS.MAX_FILE_SIZE_MB
): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * Creates a URL for a blob or file that can be used in src attributes
 * @param blob The blob or file to create a URL for
 * @returns Object URL
 */
export function createObjectURL(blob: Blob | File): string {
  return URL.createObjectURL(blob)
}

/**
 * Revokes a URL created with createObjectURL to free memory
 * @param url The URL to revoke
 */
export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url)
}

/**
 * Generates a filename for the output sticker
 * @param originalFilename Original filename (optional)
 * @returns A filename for the sticker
 */
export function generateStickerFilename(originalFilename?: string): string {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "")
  const prefix = "whatsapp-sticker"
  const suffix = originalFilename ? `-${originalFilename.split(".")[0]}` : ""

  return `${prefix}${suffix}-${timestamp}.webp`
}

/**
 * Safely downloads a blob as a file
 * @param blob The blob to download
 * @param filename The filename to use
 */
export function downloadBlob(blob: Blob, filename: string): void {
  // Create a URL for the blob
  const url = createObjectURL(blob)

  // Create a temporary anchor element
  const a = document.createElement("a")
  a.href = url
  a.download = filename

  // Append to the document, click, and remove
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  // Revoke the URL to free memory
  window.setTimeout(() => revokeObjectURL(url), 100)
}
