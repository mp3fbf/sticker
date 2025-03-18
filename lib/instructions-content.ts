/**
 * @description
 * Content for instructions and help text throughout the application.
 * Centralizes all instruction text to make updates easier and ensure
 * consistent messaging across the application.
 *
 * Includes:
 * - Step-by-step instructions
 * - Tips and best practices
 * - WhatsApp sticker requirements information
 * - Troubleshooting guidance
 */

import { STICKER_REQUIREMENTS } from "./utils"

/**
 * Instruction for a specific step in the process
 */
export interface StepInstruction {
  /** Step title - short and descriptive */
  title: string
  /** Detailed step description */
  description: string
  /** Optional additional tips for this step */
  tips?: string[]
}

/**
 * Main application steps instructions
 */
export const STEP_INSTRUCTIONS: Record<string, StepInstruction> = {
  upload: {
    title: "Upload a Video",
    description:
      "Select a video file from your device to convert into a WhatsApp sticker. Drag and drop a file or click to browse.",
    tips: [
      "Videos up to 3 seconds work best for stickers",
      "Try using videos with clear subjects and simple backgrounds",
      `Supported formats: ${STICKER_REQUIREMENTS.SUPPORTED_INPUT_FORMATS.map(format => format.replace("video/", "").toUpperCase()).join(", ")}`
    ]
  },
  process: {
    title: "Processing",
    description:
      "Your video is being converted to a WhatsApp-compatible animated sticker format. This happens entirely in your browser without uploading to any server.",
    tips: [
      "Processing time depends on your device and the video size",
      "Larger videos may take longer to process",
      "Keep this tab open during processing"
    ]
  },
  download: {
    title: "Download Sticker",
    description:
      "Your animated sticker is ready! Download it to your device so you can add it to WhatsApp.",
    tips: [
      "The sticker is downloaded as a WebP file, which WhatsApp recognizes",
      "Add it to WhatsApp using the WhatsApp sticker creator or a third-party sticker app",
      "Create another sticker to build your collection"
    ]
  }
}

/**
 * General instructions for the application
 */
export const GENERAL_INSTRUCTIONS = {
  title: "How to Create WhatsApp Stickers",
  description:
    "Creating animated stickers for WhatsApp is easy. Simply upload a video, wait for it to process, and download your sticker.",
  steps: [
    "Select a video from your device (up to 3 seconds long)",
    "Wait for automatic processing to complete",
    "Download your animated sticker",
    "Add to WhatsApp using the WhatsApp sticker creator or a third-party sticker app"
  ]
}

/**
 * Tips for creating great stickers
 */
export const STICKER_TIPS = [
  "Choose videos with clear subjects and simple backgrounds",
  "Short, expressive animations work best as stickers",
  "Videos with clear emotions or reactions make great stickers",
  "Square aspect ratio videos work best for stickers",
  "Make sure the important content is in the center of the frame"
]

/**
 * WhatsApp sticker requirements information
 */
export const WHATSAPP_REQUIREMENTS = {
  title: "WhatsApp Sticker Requirements",
  description:
    "WhatsApp has specific requirements for animated stickers. Our app automatically ensures your stickers meet these requirements.",
  requirements: [
    `Format: Animated WebP`,
    `File Size: Under ${STICKER_REQUIREMENTS.MAX_FILE_SIZE_MB.DESKTOP}MB (optimized automatically)`,
    `Dimensions: ${STICKER_REQUIREMENTS.DIMENSIONS.width}×${STICKER_REQUIREMENTS.DIMENSIONS.height} pixels (adjusted automatically)`,
    `Duration: Maximum ${STICKER_REQUIREMENTS.MAX_DURATION_SECONDS} seconds (trimmed automatically)`
  ]
}

/**
 * Troubleshooting tips for common issues
 */
export const TROUBLESHOOTING_TIPS = {
  processingFailed: [
    "Try using a smaller or shorter video",
    "Make sure your video isn't corrupted",
    "Close other browser tabs to free up memory",
    "Try a different browser like Chrome or Firefox"
  ],
  browser: [
    "This app works best in modern browsers like Chrome, Firefox, or Edge",
    "If you're using Safari, some features might have limited functionality",
    "Make sure your browser is up to date"
  ],
  download: [
    "If download doesn't start, try right-clicking the download button and select 'Save link as...'",
    "On iOS devices, you may need to manually save the sticker to your photos",
    "Clear your browser cache if you encounter issues"
  ]
}

/**
 * Information about uploading to WhatsApp
 */
export const WHATSAPP_IMPORT_HELP = {
  title: "Adding Stickers to WhatsApp",
  description:
    "After downloading your sticker, you can add it to WhatsApp using these methods:",
  methods: [
    {
      title: "WhatsApp Sticker Creator",
      steps: [
        "Open WhatsApp and go to a chat",
        "Tap the emoji icon > Stickers > '+' icon",
        "Select 'Create' and follow the instructions to import your sticker"
      ]
    },
    {
      title: "Third-Party Sticker Apps",
      steps: [
        "Download a sticker maker app from your app store",
        "Import your downloaded sticker into the app",
        "Follow the app's instructions to add it to WhatsApp"
      ]
    }
  ]
}

/**
 * FAQ items for common questions
 */
export const FAQ_ITEMS = [
  {
    question: "Is my data secure?",
    answer:
      "Yes! All processing happens directly in your browser. Your videos are never uploaded to any server or stored anywhere outside your device."
  },
  {
    question: "What video formats are supported?",
    answer: `This app supports ${STICKER_REQUIREMENTS.SUPPORTED_INPUT_FORMATS.map(format => format.replace("video/", "").toUpperCase()).join(", ")} video formats. If your video is in another format, you may need to convert it first.`
  },
  {
    question: "How long can my sticker be?",
    answer: `WhatsApp limits animated stickers to ${STICKER_REQUIREMENTS.MAX_DURATION_SECONDS} seconds. Longer videos will be automatically trimmed.`
  },
  {
    question: "Why is processing taking so long?",
    answer:
      "Processing happens entirely in your browser, so the time depends on your device's capabilities and the video file size. Larger videos take longer to process."
  },
  {
    question: "Can I edit my sticker?",
    answer:
      "This app currently focuses on simple conversion. For more editing options, you can use a video editor before uploading or a sticker editor after downloading."
  },
  {
    question: "How do I add my sticker to WhatsApp?",
    answer:
      "After downloading, you can add your sticker to WhatsApp using the WhatsApp sticker creator or third-party sticker apps. Check the 'Adding Stickers to WhatsApp' section for more details."
  }
]
