"use client"

/**
 * @description
 * Warning component for browsers with limited or no support for required features.
 * Displays appropriate warnings and guidance based on detected browser capabilities.
 *
 * Features:
 * - Different warning levels (critical, warning, info)
 * - Clear explanations of missing features
 * - Actionable guidance for users
 * - Dismissible warnings for non-critical issues
 * - Mobile-optimized display
 *
 * @dependencies
 * - feature-detection.ts: For detecting browser capabilities
 * - UI components from shadcn/ui
 * - Framer Motion: For smooth animations
 * - Lucide React: For icons
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import {
  checkBrowserSupport,
  getRecommendedBrowsers,
  getFallbackMode
} from "@/lib/feature-detection"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  X
} from "lucide-react"
import { useEffect, useState } from "react"

interface BrowserWarningProps {
  /**
   * Whether to show a dismissible warning (false for critical warnings)
   * @default true
   */
  dismissible?: boolean

  /**
   * Function to call when the warning is dismissed
   * Only used if dismissible is true
   */
  onDismiss?: () => void

  /**
   * CSS class for styling
   */
  className?: string

  /**
   * Whether to show details by default
   * @default false
   */
  detailsOpenByDefault?: boolean

  /**
   * Whether to check on mount (automatically set warning state)
   * @default true
   */
  checkOnMount?: boolean
}

/**
 * Component that displays browser compatibility warnings
 */
export default function BrowserWarning({
  dismissible = true,
  onDismiss,
  className,
  detailsOpenByDefault = false,
  checkOnMount = true
}: BrowserWarningProps) {
  const [browserSupport, setBrowserSupport] = useState(() =>
    checkBrowserSupport()
  )
  const [isVisible, setIsVisible] = useState(true)
  const [detailsOpen, setDetailsOpen] = useState(detailsOpenByDefault)

  // Check browser support on mount if enabled
  useEffect(() => {
    if (checkOnMount) {
      setBrowserSupport(checkBrowserSupport())
    }
  }, [checkOnMount])

  // Don't show anything if browser is fully supported
  if (browserSupport.isFullySupported) {
    return null
  }

  // Get recommended browsers
  const recommendedBrowsers = getRecommendedBrowsers()
  const fallbackMode = getFallbackMode()

  // Hide if dismissed
  if (!isVisible) {
    return null
  }

  // Handle dismiss button click
  const handleDismiss = () => {
    setIsVisible(false)
    if (onDismiss) {
      onDismiss()
    }
  }

  // Critical warning (unsupported browsers - no WebAssembly)
  if (fallbackMode === "unsupported") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn("w-full", className)}
      >
        <Card className="border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-50">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
                <CardTitle className="text-lg">Browser Not Supported</CardTitle>
              </div>
            </div>
            <CardDescription className="text-red-700 dark:text-red-300">
              Your browser doesn't support essential features required for this
              application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p>
                Unfortunately, <strong>{browserSupport.browser.name}</strong>{" "}
                doesn't support WebAssembly, which is required for processing
                videos in the browser.
              </p>

              <div className="mt-4">
                <p className="font-medium">Please try one of these browsers:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  {recommendedBrowsers.map(browser => (
                    <li key={browser}>
                      <a
                        href={getBrowserDownloadUrl(browser)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {browser} <ExternalLink className="inline size-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Warning for limited support (missing some features but can work)
  if (fallbackMode === "limited" || fallbackMode === "minimal") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn("w-full", className)}
      >
        <Alert
          variant="default"
          className="bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-1 items-start">
              <AlertTriangle className="mr-2 mt-1 size-4 text-amber-600 dark:text-amber-400" />
              <div>
                <AlertTitle className="text-amber-800 dark:text-amber-200">
                  Limited Browser Support
                </AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  <p className="mt-1">
                    Your browser ({browserSupport.browser.name}) has limited
                    support for some features. The application will work, but
                    with reduced performance.
                  </p>

                  <Collapsible
                    open={detailsOpen}
                    onOpenChange={setDetailsOpen}
                    className="mt-2"
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100 dark:hover:bg-amber-900/50"
                      >
                        {detailsOpen ? "Hide details" : "Show details"}
                        {detailsOpen ? (
                          <ChevronUp className="ml-1 size-3" />
                        ) : (
                          <ChevronDown className="ml-1 size-3" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-2">
                      <p>Missing features:</p>
                      <ul className="list-inside list-disc">
                        {browserSupport.missingFeatures.map(feature => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                      <p className="mt-2">
                        For the best experience, we recommend using{" "}
                        {recommendedBrowsers.join(" or ")}.
                      </p>
                    </CollapsibleContent>
                  </Collapsible>
                </AlertDescription>
              </div>
            </div>

            {dismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="ml-2 size-6 p-0 text-amber-700 hover:bg-amber-200 hover:text-amber-900 dark:text-amber-300 dark:hover:bg-amber-900/40 dark:hover:text-amber-100"
              >
                <span className="sr-only">Dismiss</span>
                <X className="size-4" />
              </Button>
            )}
          </div>
        </Alert>
      </motion.div>
    )
  }

  // Information about browser optimizations
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("w-full", className)}
    >
      <Alert
        variant="default"
        className="bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-200"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <Info className="mr-2 mt-0.5 size-4 text-blue-600 dark:text-blue-400" />
            <div>
              <AlertTitle className="text-blue-800 dark:text-blue-200">
                Browser Information
              </AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                <p>
                  Your browser ({browserSupport.browser.name}) supports all
                  essential features, but some optimizations may not be
                  available.
                </p>
              </AlertDescription>
            </div>
          </div>

          {dismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="ml-2 size-6 p-0 text-blue-700 hover:bg-blue-200 hover:text-blue-900 dark:text-blue-300 dark:hover:bg-blue-900/40 dark:hover:text-blue-100"
            >
              <span className="sr-only">Dismiss</span>
              <X className="size-4" />
            </Button>
          )}
        </div>
      </Alert>
    </motion.div>
  )
}

/**
 * Small, inline version of the browser warning for embedding in other components
 */
export function InlineBrowserWarning({ className }: { className?: string }) {
  const browserSupport = checkBrowserSupport()
  const fallbackMode = getFallbackMode()

  // Don't show anything if browser is fully supported
  if (browserSupport.isFullySupported) {
    return null
  }

  // Only show for unsupported or minimal mode
  if (fallbackMode !== "unsupported" && fallbackMode !== "minimal") {
    return null
  }

  const recommendedBrowsers = getRecommendedBrowsers()

  return (
    <div
      className={cn(
        "mt-2 rounded border p-2 text-xs",
        fallbackMode === "unsupported"
          ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/30 dark:bg-red-950/30 dark:text-red-200"
          : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/30 dark:text-amber-200",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        {fallbackMode === "unsupported" ? (
          <AlertCircle className="size-3 shrink-0" />
        ) : (
          <AlertTriangle className="size-3 shrink-0" />
        )}
        <span>
          {fallbackMode === "unsupported"
            ? "Your browser is not supported."
            : "Limited browser support."}{" "}
          <a
            href={getBrowserDownloadUrl(recommendedBrowsers[0])}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            Try {recommendedBrowsers[0]}
          </a>
        </span>
      </div>
    </div>
  )
}

/**
 * Get download URL for a browser
 * @param browser Browser name
 * @returns URL to download the browser
 */
function getBrowserDownloadUrl(browser: string): string {
  switch (browser) {
    case "Chrome":
      return "https://www.google.com/chrome/"
    case "Firefox":
      return "https://www.mozilla.org/firefox/new/"
    case "Edge":
      return "https://www.microsoft.com/edge"
    case "Safari":
      return "https://www.apple.com/safari/"
    case "Opera":
      return "https://www.opera.com/"
    case "Chrome for iOS":
      return "https://apps.apple.com/app/google-chrome/id535886823"
    default:
      return "https://www.google.com/chrome/"
  }
}
