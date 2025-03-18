"use client"

import dynamic from "next/dynamic"
import UploadSkeleton from "./upload-skeleton"

/**
 * Client component wrapper for dynamically importing the UploadComponent.
 * This isolates the dynamic import with ssr: false in a client component,
 * which is required for Next.js Server Components.
 */
const DynamicUploadComponent = dynamic(() => import("./upload-component"), {
  ssr: false,
  loading: () => <UploadSkeleton />
})

export default function DynamicUploadWrapper() {
  return <DynamicUploadComponent />
}
