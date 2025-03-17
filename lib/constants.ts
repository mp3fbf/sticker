/**
 * @description
 * Constants for the WhatsApp Animated Sticker Maker application.
 *
 * This file extends the constants from lib/utils.ts with additional
 * encoding and processing specific constants that are not exposed to other
 * parts of the application.
 */

import { STICKER_REQUIREMENTS } from "./utils"

// Re-export the existing constants
export { STICKER_REQUIREMENTS }

/**
 * WebP encoding settings for optimal sticker generation
 */
export const WEBP_ENCODING = {
  /**
   * WebP compression quality (0-100)
   * Higher values mean better quality but larger files
   */
  QUALITY: 80,

  /**
   * WebP compression level (0-6)
   * Higher values mean better compression but slower processing
   */
  COMPRESSION_LEVEL: 6
}

/**
 * Processing settings for the video conversion process
 */
export const PROCESSING = {
  /**
   * Target maximum output file size in kilobytes
   * WhatsApp recommends keeping stickers under 500KB
   */
  TARGET_OUTPUT_SIZE_KB: 500,

  /**
   * Temporary file names used during processing
   */
  TEMP_FILES: {
    OUTPUT: "output.webp",
    METADATA: "metadata.json",
    THUMBNAIL: "thumbnail.jpg"
  }
}
