"use client"

/**
 * @description
 * Client component wrapper for dynamically importing the UploadComponent.
 * This isolates the dynamic import with ssr: false in a client component,
 * which is required for Next.js Server Components.
 *
 * Additionally, incorporates browser compatibility checks and fallback
 * strategies for browsers with limited or no support.
 *
 * @dependencies
 * - Next.js dynamic imports
 * - feature-detection.ts for browser capability detection
 * - BrowserWarning for unsupported browsers
 */

import { getFallbackMode } from "@/lib/feature-detection"
import dynamic from "next/dynamic"
import { Suspense, useEffect, useState } from "react"
import { InlineBrowserWarning } from "./browser-warning"
import UploadSkeleton from "./upload-skeleton"
import { AppStep } from "./step-indicator"
import Instructions from "./instructions"

// Dynamically import the UploadComponent with SSR disabled
const DynamicUploadComponent = dynamic(() => import("./upload-component"), {
  ssr: false,
  loading: () => <UploadSkeleton />
})

// Fallback upload component for browsers with limited support
// This version has simplified processing options
const FallbackUploadComponent = dynamic(
  () =>
    import("./upload-component").then(mod => {
      return {
        default: (props: any) => (
          <mod.default {...props} useFallbackMode={true} />
        )
      }
    }),
  {
    ssr: false,
    loading: () => <UploadSkeleton />
  }
)

/**
 * Wrapper component that handles dynamic imports with fallback strategies
 * based on browser capabilities
 */
export default function DynamicUploadWrapper() {
  // State to track browser support level (determined client-side)
  const [fallbackMode, setFallbackMode] = useState<string | null>(null)
  // Track the current step for instructions
  const [currentStep, setCurrentStep] = useState<AppStep>("upload")

  // Check browser support on mount
  useEffect(() => {
    setFallbackMode(getFallbackMode())
  }, [])

  // Handle step changes
  const handleStepChange = (step: AppStep) => {
    setCurrentStep(step)
  }

  // Show a loading state until we determine browser capabilities
  if (fallbackMode === null) {
    return <UploadSkeleton />
  }

  // Handle unsupported browsers (no WebAssembly)
  if (fallbackMode === "unsupported") {
    return (
      <div className="p-6 text-center">
        <h3 className="mb-4 text-lg font-semibold">Browser Not Supported</h3>
        <p className="text-muted-foreground">
          Unfortunately, your browser doesn't support WebAssembly, which is
          required for video processing. Please try a different browser.
        </p>
        <InlineBrowserWarning className="mx-auto mt-4 max-w-md" />
      </div>
    )
  }

  // For limited support, use the fallback component with simpler processing
  if (fallbackMode === "limited" || fallbackMode === "minimal") {
    return (
      <Suspense fallback={<UploadSkeleton />}>
        <FallbackUploadComponent onStepChange={handleStepChange} />
        <div className="mt-6">
          <Instructions currentStep={currentStep} initiallyExpanded={false} />
        </div>
      </Suspense>
    )
  }

  // Full support, use the standard component
  return (
    <>
      <DynamicUploadComponent onStepChange={handleStepChange} />
      <div className="mt-6">
        <Instructions currentStep={currentStep} initiallyExpanded={false} />
      </div>
    </>
  )
}
