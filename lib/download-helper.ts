/**
 * @description
 * Utilities for handling file downloads, particularly for WhatsApp stickers.
 * This module provides functions for:
 * - Creating and managing blob URLs
 * - Generating filenames
 * - Downloading processed files
 *
 * @dependencies None - uses only browser APIs
 */

/**
 * Creates a URL for a blob or file that can be used in src attributes
 * @param blob The blob or file to create a URL for
 * @returns Object URL string
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
 * @param prefix Prefix for the filename (defaults to "whatsapp-sticker")
 * @returns A formatted filename for the sticker
 */
export function generateStickerFilename(
  originalFilename?: string,
  prefix: string = "whatsapp-sticker"
): string {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "")
  const suffix = originalFilename ? `-${originalFilename.split(".")[0]}` : ""

  return `${prefix}${suffix}-${timestamp}.webp`
}

/**
 * Safely downloads a blob as a file
 * @param blob The blob to download
 * @param filename The filename to use
 * @param options Optional configuration
 * @returns Promise that resolves when download is initiated
 */
export function downloadBlob(
  blob: Blob,
  filename: string,
  options?: {
    /** Auto-revoke URL after download (default: true) */
    autoRevoke?: boolean
    /** Delay in ms before revoking URL (default: 100) */
    revokeDelay?: number
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Default options
      const { autoRevoke = true, revokeDelay = 100 } = options || {}

      // Create a URL for the blob
      const url = createObjectURL(blob)

      // Create a temporary anchor element
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.style.display = "none"

      // Append to the document, click, and remove
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      // Revoke the URL to free memory, after a delay to ensure download starts
      if (autoRevoke) {
        window.setTimeout(() => {
          revokeObjectURL(url)
          resolve()
        }, revokeDelay)
      } else {
        resolve()
      }
    } catch (error) {
      console.error("Download failed:", error)
      reject(error)
    }
  })
}

/**
 * Triggers a download for an existing URL
 * @param url URL of the resource to download
 * @param filename Name to give the downloaded file
 */
export function downloadFromUrl(url: string, filename: string): void {
  try {
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.style.display = "none"

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch (error) {
    console.error("Failed to download from URL:", error)
    throw error
  }
}
