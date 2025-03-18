"use client"

/**
 * @description
 * Client component wrapper for dynamically importing the BrowserWarning component.
 * This isolates the dynamic import with ssr: false in a client component,
 * which is required for Next.js Server Components.
 */

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamic import of BrowserWarning with SSR disabled
const DynamicBrowserWarning = dynamic(() => import("./browser-warning"), {
  ssr: false
})

interface DynamicBrowserWarningWrapperProps {
  dismissible?: boolean
  checkOnMount?: boolean
  className?: string
}

/**
 * Wrapper component for the BrowserWarning that handles the dynamic import
 * with ssr: false in a client component context
 */
export default function DynamicBrowserWarningWrapper({
  dismissible = true,
  checkOnMount = true,
  className
}: DynamicBrowserWarningWrapperProps) {
  return (
    <Suspense fallback={null}>
      <DynamicBrowserWarning
        dismissible={dismissible}
        checkOnMount={checkOnMount}
        className={className}
      />
    </Suspense>
  )
}
