"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect } from "react"

/**
 * A skeleton loader for the UploadComponent.
 * Displayed while the main component is loading to improve perceived performance.
 *
 * Matches the dimensions and general layout of the UploadComponent to reduce
 * layout shift when the actual component loads.
 *
 * @component
 */
export default function UploadSkeleton() {
  // Debug logging
  useEffect(() => {
    console.log("UploadSkeleton mounted")
  }, [])

  return (
    <Card>
      <CardContent className="p-6">
        <div className="border-muted-foreground/20 rounded-lg border-2 border-dashed p-12 text-center">
          <Skeleton className="mx-auto size-12 rounded-full" />
          <Skeleton className="mx-auto mt-4 h-6 w-32" />
          <Skeleton className="mx-auto mt-2 h-4 w-64" />
          <Skeleton className="mx-auto mt-1 h-3 w-48" />
          <Skeleton className="mx-auto mt-4 h-9 w-28 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}
